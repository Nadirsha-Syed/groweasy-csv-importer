import { Request, Response } from 'express';
import { AIMappingService } from '../services/aiMapping.js';

export async function handleCSVImportData(req: Request, res: Response): Promise<void> {
  try {
    const { records } = req.body;

    if (!records || !Array.isArray(records)) {
      res.status(400).json({ error: 'Invalid payload structure. Expected an array of records.' });
      return;
    }

    const validRowsToMap: Record<string, string>[] = [];
    let mandatorySkipsCount = 0;

    // --- Strict Engineering Guardrail Check ---
    for (const row of records) {
      // Extract keys and lowercase them dynamically to search for ambiguous headings
      const rowKeys = Object.keys(row);
      
      const hasEmailHandle = rowKeys.some(key => {
        const normalizedKey = key.toLowerCase();
        return (normalizedKey.includes('email') || normalizedKey.includes('mail')) && String(row[key] || '').trim().length > 0;
      });

      const hasPhoneHandle = rowKeys.some(key => {
        const normalizedKey = key.toLowerCase();
        return (normalizedKey.includes('phone') || normalizedKey.includes('mobile') || normalizedKey.includes('contact') || normalizedKey.includes('num')) && String(row[key] || '').trim().length > 0;
      });

      // Strict Rule: Must possess either email OR contact number to be valid for AI mapping
      if (hasEmailHandle || hasPhoneHandle) {
        validRowsToMap.push(row);
      } else {
        mandatorySkipsCount++;
      }
    }

    // Pass only valid candidates to our Gemini batching pipeline
    const outputSummary = await AIMappingService.mapBatchToCRM(validRowsToMap);

    res.status(200).json({
      successfullyParsed: outputSummary.successfullyParsed,
      skippedRecords: [], 
      totalImported: outputSummary.successfullyParsed.length,
      totalSkipped: outputSummary.skippedCount + mandatorySkipsCount
    });

  } catch (err: any) {
    console.error('Controller Error:', err);
    res.status(500).json({ error: 'Internal pipeline fault executing mapping engines.' });
  }
}