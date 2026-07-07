'use client';

import React, { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { Upload, X, FileSpreadsheet, Loader2, CheckCircle2 } from 'lucide-react';
import { ParseSummary, CRMRecord } from '@/types/crm';

interface CSVImporterProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (summary: ParseSummary) => void;
}

export default function CSVImporter({ isOpen, onClose, onImportComplete }: CSVImporterProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [rawJsonData, setRawJsonData] = useState<Record<string, string>[]>([]);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0);
  const [totalBatchesCount, setTotalBatchesCount] = useState(0);

  const handleDragOverState = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const processFileStream = (file: File) => {
    setFileName(file.name);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          const rows = results.data as Record<string, string>[];
          setRawJsonData(rows);
          
          const headers = Object.keys(rows[0]);
          const dataMatrix = rows.map(row => headers.map(header => String(row[header] || '')));
          
          setPreviewHeaders(headers);
          setPreviewRows(dataMatrix);
        }
      },
      error: (err) => {
        alert(`Failed to parse your CSV file: ${err.message}`);
      }
    });
  };

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer?.files?.[0];
    if (droppedFile) {
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        processFileStream(droppedFile);
      } else {
        alert('Unsupported file type. Please drop a valid .csv file.');
      }
    }
  }, []);

  const handleManualFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFileStream(selectedFile);
    }
  };

  const handleConfirmImport = async () => {
    if (rawJsonData.length === 0) return;
    
    setIsProcessing(true);
    const backendEndpoint = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    const rowsPerBatch = 20;
    const totalRows = rawJsonData.length;
    const computedTotalBatches = Math.ceil(totalRows / rowsPerBatch);
    
    setTotalBatchesCount(computedTotalBatches);
    setCurrentBatchIndex(0);

    const fullParsedRecords: CRMRecord[] = [];
    let cumulativeSkippedCount = 0;

    try {
      for (let i = 0; i < computedTotalBatches; i++) {
        setCurrentBatchIndex(i + 1);
        
        const startIdx = i * rowsPerBatch;
        const endIdx = Math.min(startIdx + rowsPerBatch, totalRows);
        const chunkSlice = rawJsonData.slice(startIdx, endIdx);

        const response = await fetch(`${backendEndpoint}/api/import`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ records: chunkSlice }),
        });

        if (!response.ok) {
          throw new Error(`The mapping server encountered an issue processing batch ${i + 1}.`);
        }

        const batchResult: ParseSummary = await response.json();
        fullParsedRecords.push(...batchResult.successfullyParsed);
        cumulativeSkippedCount += batchResult.totalSkipped;
      }

      onImportComplete({
        successfullyParsed: fullParsedRecords,
        skippedRecords: [],
        totalImported: fullParsedRecords.length,
        totalSkipped: cumulativeSkippedCount
      });
      
      clearFormState();
      onClose();
    } catch (error: any) {
      alert(`Import Pipeline Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
      setCurrentBatchIndex(0);
      setTotalBatchesCount(0);
    }
  };

  const clearFormState = () => {
    setFileName('');
    setPreviewHeaders([]);
    setPreviewRows([]);
    setRawJsonData([]);
  };

  if (!isOpen) return null;

  const styles = {
    modalOverlay: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4",
    modalWindow: "bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden",
    headerSection: "flex items-center justify-between px-6 py-4 border-b border-gray-100",
    headerTitle: "text-xl font-bold text-gray-900",
    headerSubtitle: "text-xs text-gray-500 mt-0.5",
    closeButton: "text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50 transition-colors",
    contentArea: "p-6 overflow-y-auto flex-1 flex flex-col justify-center",
    
    dropZoneBase: "flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 cursor-pointer min-h-[300px] transition-all",
    dropZoneIdle: "border-gray-200 hover:border-gray-300 bg-white",
    dropZoneActive: "border-orange-500 bg-orange-50/40",
    uploadIconWrapper: "bg-gray-50 p-4 rounded-full mb-4 text-gray-400",
    
    infoBar: "flex items-center justify-between mb-4 bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5",
    tableScrollContainer: "flex-1 border border-gray-100 rounded-lg overflow-auto max-h-[350px] shadow-xs relative",
    tableRoot: "w-full text-left border-collapse bg-white text-xs",
    tableHeaderRow: "sticky top-0 bg-slate-900 text-white z-10 shadow-sm",
    tableHeaderCell: "px-4 py-3 font-semibold uppercase tracking-wider whitespace-nowrap min-w-[140px]",
    tableBodyCell: "px-4 py-3.5 text-gray-600 truncate max-w-[200px]",
    
    progressWrapper: "flex flex-col items-center justify-center py-12 max-w-md mx-auto text-center w-full",
    progressBarTrack: "w-full h-2 bg-slate-100 rounded-full mt-4 overflow-hidden border border-slate-200/40 relative",
    progressBarFill: "h-full bg-orange-500 rounded-full transition-all duration-300 ease-out",
    progressStatusHeadline: "text-sm font-semibold text-gray-800 mt-3",
    progressStatusSubtext: "text-xs text-gray-400 mt-1",
    
    footerActionsBar: "px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3",
    cancelButton: "px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50",
    submitButton: "px-5 py-2 text-sm font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600 active:bg-orange-700 shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
  };

  const progressPercentage = totalBatchesCount > 0 ? Math.round((currentBatchIndex / totalBatchesCount) * 100) : 0;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalWindow}>
        
        <div className={styles.headerSection}>
          <div>
            <h3 className={styles.headerTitle}>Import Leads via CSV</h3>
            <p className={styles.headerSubtitle}>Upload a CSV file to bulk import leads into your system.</p>
          </div>
          <button onClick={onClose} disabled={isProcessing} className={styles.closeButton}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className={styles.contentArea}>
          {isProcessing ? (
            
            <div className={styles.progressWrapper}>
              <div className="bg-orange-50 text-orange-500 p-4 rounded-full animate-bounce mb-2">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
              <div className={styles.progressBarTrack}>
                <div className={styles.progressBarFill} style={{ width: `${progressPercentage}%` }} />
              </div>
              <p className={styles.progressStatusHeadline}>
                Mapping Batch {currentBatchIndex} of {totalBatchesCount}
              </p>
              <p className={styles.progressStatusSubtext}>
                Intelligently transforming unmapped entries via Gemini ({progressPercentage}% Complete)
              </p>
            </div>

          ) : previewRows.length === 0 ? (
            
            <div
              onDragEnter={handleDragOverState}
              onDragOver={handleDragOverState}
              onDragLeave={handleDragOverState}
              onDrop={handleFileDrop}
              className={`${styles.dropZoneBase} ${isDragging ? styles.dropZoneActive : styles.dropZoneIdle}`}
              onClick={() => document.getElementById('csv-file-picker')?.click()}
            >
              <input 
                id="csv-file-picker" 
                type="file" 
                accept=".csv" 
                className="hidden" 
                onChange={handleManualFileSelect} 
              />
              <div className={styles.uploadIconWrapper}>
                <Upload className="w-8 h-8" />
              </div>
              <p className="text-base font-medium text-gray-700">Drop your CSV file here</p>
              <p className="text-xs text-gray-400 mt-1">or click to browse files (max 5MB)</p>
            </div>

          ) : (

            <div className="flex-1 flex flex-col overflow-hidden justify-start">
              <div className={styles.infoBar}>
                <div className="flex items-center gap-2 text-sm text-gray-700 font-medium truncate">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="truncate">{fileName}</span>
                </div>
                <button onClick={clearFormState} className="text-xs text-red-600 hover:underline font-medium">
                  Remove File
                </button>
              </div>

              <div className={styles.tableScrollContainer}>
                <table className={styles.tableRoot}>
                  <thead className={styles.tableHeaderRow}>
                    <tr>
                      {previewHeaders.map((header, index) => (
                        <th key={index} className={styles.tableHeaderCell}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {previewRows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-gray-50/80 transition-colors">
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className={styles.tableBodyCell}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          )}
        </div>

        <div className={styles.footerActionsBar}>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className={styles.cancelButton}
          >
            Cancel
          </button>
          {previewRows.length > 0 && !isProcessing && (
            <button
              onClick={handleConfirmImport}
              className={styles.submitButton}
            >
              Confirm Import
            </button>
          )}
        </div>

      </div>
    </div>
  );
}