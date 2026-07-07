import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const aiProvider = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface CRMRecordOutput {
  created_at?: string;
  name?: string;
  email?: string;
  country_code?: string;
  mobile_without_country_code?: string;
  company?: string;
  city?: string;
  state?: string;
  country?: string;
  lead_owner?: string;
  crm_status?: string;
  crm_note?: string;
  data_source?: string;
  possession_time?: string;
  description?: string;
}

export class AIMappingService {
  public static async mapBatchToCRM(rawRows: Record<string, string>[]): Promise<{
    successfullyParsed: CRMRecordOutput[];
    skippedCount: number;
  }> {
    const batchSize = 25; 
    const successfullyParsed: CRMRecordOutput[] = [];
    let skippedCount = 0;

    for (let i = 0; i < rawRows.length; i += batchSize) {
      const currentBatch = rawRows.slice(i, i + batchSize);
      
      try {
        const batchResult = await this.executeLLMQuery(currentBatch);
        if (batchResult && Array.isArray(batchResult.parsed)) {
          successfullyParsed.push(...batchResult.parsed);
          skippedCount += typeof batchResult.skipped === 'number' ? batchResult.skipped : 0;
        }
      } catch (error) {
        console.error(`Execution failure processing index sequence range ${i} -> ${i + batchSize}:`, error);
        // Fallback: If a batch fails entirely due to an upstream rate error, count them as skipped records
        skippedCount += currentBatch.length;
      }
    }

    return { successfullyParsed, skippedCount };
  }


  private static async executeLLMQuery(rows: Record<string, string>[]) {
    // Relying on the rapid gemini-2.5-flash engine for low latency mapping
    const model = aiProvider.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            parsed: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  created_at: { type: 'string' },
                  name: { type: 'string' },
                  email: { type: 'string' },
                  country_code: { type: 'string' },
                  mobile_without_country_code: { type: 'string' },
                  company: { type: 'string' },
                  city: { type: 'string' },
                  state: { type: 'string' },
                  country: { type: 'string' },
                  lead_owner: { type: 'string' },
                  crm_status: { type: 'string' },
                  crm_note: { type: 'string' },
                  data_source: { type: 'string' },
                  possession_time: { type: 'string' },
                  description: { type: 'string' }
                }
              }
            },
            skipped: { type: 'integer' }
          },
          required: ['parsed', 'skipped']
        }
      }
    });

    const promptMessage = `
      You are an expert CRM data ingestion agent. Your task is to process an array of raw unmapped objects and convert them into standard schema rows.

      ### Input Data to Process:
      ${JSON.stringify(rows, null, 2)}

      ### Critical Instruction on Fields:
      Look closely at the keys of the input objects. Even if headers are named "Email Address", "Contact Number", "Full Name", or "Phone", map them intelligently to the target CRM fields.

      ### Transformation Logic Rules:
      1. crm_status: Must map confidently to exactly one of: ["GOOD_LEAD_FOLLOW_UP", "DID_NOT_CONNECT", "BAD_LEAD", "SALE_DONE"]. If the input status is unclear or "interested", map it to "GOOD_LEAD_FOLLOW_UP".
      2. data_source: Must map confidently to exactly one of: ["leads_on_demand", "meridian_tower", "eden_park", "varah_swamy", "sarjapur_plots"]. If unsure, map it to a blank string "".
      3. Overflow Handling: If a record has multiple emails or phone numbers, map the first one and append the rest into "crm_note".
      4. Exclusion Rules: Skip a record ONLY if it completely lacks any recognizable name, email, or phone information. If it contains a name and either an email or phone number, DO NOT skip it.
    `;

    const responseWrapper = await model.generateContent(promptMessage);
    const parsedJsonText = responseWrapper.response.text();
    
    console.log("🤖 RAW AI RESPONSE BATCH:", parsedJsonText);
    return JSON.parse(parsedJsonText);
  }
}