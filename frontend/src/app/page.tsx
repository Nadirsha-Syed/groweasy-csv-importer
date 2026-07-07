'use client';

import React, { useState } from 'react';
import { Layers, Import, ShieldCheck } from 'lucide-react';
import CSVImporter from '@/components/CSVImporter';
import { ParseSummary } from '@/types/crm';

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [importSummary, setImportSummary] = useState<ParseSummary | null>(null);

  const styles = {
    layoutContainer: "min-h-screen bg-slate-50 flex",
    
    sidebarWrapper: "w-64 bg-slate-900 text-white flex flex-col p-4 shadow-xl hidden md:flex",
    sidebarBranding: "flex items-center gap-2 px-2 py-3 border-b border-slate-800 mb-6",
    sidebarBrandText: "font-bold text-lg tracking-tight",
    sidebarNavigation: "space-y-1",
    sidebarLinkActive: "flex items-center gap-3 px-3 py-2.5 bg-slate-800 rounded-lg text-sm font-medium text-white transition-all",
    
    mainWorkspace: "flex-1 flex flex-col",
    topHeaderBar: "h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-xs",
    headerHeading: "font-semibold text-gray-800 text-base",
    triggerButton: "flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-4 py-2 rounded-lg transition-all shadow-sm",
    scrollBody: "p-8 flex-1 overflow-y-auto",
    
    emptyLandingContainer: "flex flex-col items-center justify-center border border-dashed border-gray-200 bg-white rounded-2xl p-16 text-center max-w-xl mx-auto mt-12 shadow-xs",
    emptyDescription: "text-xs text-gray-400 mt-1 max-w-xs leading-relaxed",
    
    statsGrid: "grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6",
    metricCardBase: "bg-white p-5 border border-gray-100 rounded-xl shadow-xs",
    metricCardSuccess: "bg-white p-5 border border-gray-100 rounded-xl shadow-xs border-l-4 border-l-emerald-500",
    metricCardSkipped: "bg-white p-5 border border-gray-100 rounded-xl shadow-xs border-l-4 border-l-amber-500",
    metricLabel: "text-xs font-semibold text-gray-400 uppercase tracking-wider",
    metricValue: "text-2xl font-bold text-gray-800 mt-1",
    
    resultsCard: "bg-white border border-gray-100 rounded-xl shadow-xs overflow-hidden",
    resultsCardHeader: "px-6 py-4 border-b border-gray-100 bg-gray-50/50",
    resultsCardTitle: "font-bold text-gray-800 text-sm",
    tableScrollWrapper: "overflow-x-auto",
    tableRoot: "w-full text-left border-collapse text-xs",
    tableHeaderRow: "bg-gray-100 text-gray-700 border-b border-gray-200",
    tableHeaderCell: "px-4 py-3 font-semibold",
    tableBodyCell: "px-4 py-3 text-gray-600 border-b border-gray-100"
  };

  return (
    <main className={styles.layoutContainer}>
      
      {/* Mock Left Navigation Sidebar */}
      <div className={styles.sidebarWrapper}>
        <div className={styles.sidebarBranding}>
          <ShieldCheck className="w-6 h-6 text-orange-500" />
          <span className={styles.sidebarBrandText}>GrowEasy AI</span>
        </div>
        <nav className={styles.sidebarNavigation}>
          <a href="#" className={styles.sidebarLinkActive}>
            <Layers className="w-4 h-4 text-orange-400" /> Lead Sources
          </a>
        </nav>
      </div>

      <div className={styles.mainWorkspace}>
        <header className={styles.topHeaderBar}>
          <h2 className={styles.headerHeading}>Lead Management</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className={styles.triggerButton}
          >
            <Import className="w-3.5 h-3.5" /> Bulk Import
          </button>
        </header>

        <div className={styles.scrollBody}>
          {importSummary ? (
            
            <div className="space-y-6">
              
              <div className={styles.statsGrid}>
                <div className={styles.metricCardBase}>
                  <p className={styles.metricLabel}>Total Rows Evaluated</p>
                  <p className={styles.metricValue}>
                    {importSummary.totalImported + importSummary.totalSkipped}
                  </p>
                </div>
                <div className={styles.metricCardSuccess}>
                  <p className={styles.metricLabel}>Successfully Imported</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">
                    {importSummary.totalImported}
                  </p>
                </div>
                <div className={styles.metricCardSkipped}>
                  <p className={styles.metricLabel}>Skipped Records</p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">
                    {importSummary.totalSkipped}
                  </p>
                </div>
              </div>

              <div className={styles.resultsCard}>
                <div className={styles.resultsCardHeader}>
                  <h4 className={styles.resultsCardTitle}>AI Mapped CRM Records Output</h4>
                </div>
                <div className={styles.tableScrollWrapper}>
                  <table className={styles.tableRoot}>
                    <thead>
                      <tr className={styles.tableHeaderRow}>
                        <th className={styles.tableHeaderCell}>Name</th>
                        <th className={styles.tableHeaderCell}>Email</th>
                        <th className={styles.tableHeaderCell}>Phone Target</th>
                        <th className={styles.tableHeaderCell}>Company</th>
                        <th className={styles.tableHeaderCell}>CRM Status</th>
                        <th className={styles.tableHeaderCell}>Data Source</th>
                        <th className={styles.tableHeaderCell}>Notes Overflow</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {importSummary.successfullyParsed.map((lead, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-3 font-medium text-gray-900">{lead.name || '—'}</td>
                          <td className={styles.tableBodyCell}>{lead.email || '—'}</td>
                          <td className={styles.tableBodyCell}>
                            {lead.country_code ? `${lead.country_code} ` : ''}
                            {lead.mobile_without_country_code || '—'}
                          </td>
                          <td className={styles.tableBodyCell}>{lead.company || '—'}</td>
                          <td className={styles.tableBodyCell}>
                            {lead.crm_status ? (
                              <span className="px-2 py-0.5 rounded-sm font-semibold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {lead.crm_status}
                              </span>
                            ) : '—'}
                          </td>
                          <td className={styles.tableBodyCell}>{lead.data_source || '—'}</td>
                          <td className="px-4 py-3 text-gray-400 truncate max-w-[220px]" title={lead.crm_note}>
                            {lead.crm_note || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          ) : (
            
            <div className={styles.emptyLandingContainer}>
              <Import className="w-10 h-10 text-gray-300 mb-4" />
              <h3 className="font-bold text-gray-800 text-base">No Data Imported Yet</h3>
              <p className={styles.emptyDescription}>
                Click the "Bulk Import" action button in the top right header to map custom CSV columns to GrowEasy targets via AI models.
              </p>
            </div>

          )}
        </div>
      </div>

      <CSVImporter 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onImportComplete={setImportSummary} 
      />
    </main>
  );
}