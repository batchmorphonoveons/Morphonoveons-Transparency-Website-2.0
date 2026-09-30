import React, { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  Download, 
  ShieldCheck, 
  Clock, 
  Tag, 
  User, 
  FileText,
  Filter
} from 'lucide-react';
import { AuditLog } from '../types/transparency';

interface AuditLogViewProps {
  logs: AuditLog[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = log.recordTitle.toLowerCase().includes(q);
        const matchesCat = log.recordCategory.toLowerCase().includes(q);
        const matchesInfo = log.updatedInfo.toLowerCase().includes(q) || (log.previousInfo && log.previousInfo.toLowerCase().includes(q));
        if (!matchesTitle && !matchesCat && !matchesInfo) return false;
      }
      if (actionFilter !== 'all' && log.action !== actionFilter) return false;
      return true;
    });
  }, [logs, searchTerm, actionFilter]);

  const handleExportLogs = () => {
    const headers = ['Timestamp', 'Action', 'Category', 'Record Title', 'Previous Information', 'Updated Information', 'Performed By'];
    const escapeCSV = (field: string) => `"${String(field || '').replace(/"/g, '""')}"`;
    const rows = logs.map(l => [
      l.timestamp,
      l.action,
      l.recordCategory,
      l.recordTitle,
      l.previousInfo || 'None',
      l.updatedInfo,
      l.adminActor
    ]);
    const csvContent = [headers.map(escapeCSV).join(','), ...rows.map(r => r.map(escapeCSV).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Morphonoveons_Audit_Log_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getActionBadge = (action: AuditLog['action']) => {
    switch (action) {
      case 'Created':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Created</span>;
      case 'Updated':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">Updated</span>;
      case 'Deleted':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">Deleted</span>;
      case 'Status Changed':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Status Changed</span>;
      case 'Document Attached':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">Document Attached</span>;
      case 'Google Sheets Synced':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">Google Sheets Synced</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800">{action}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              IMMUTABLE AUDIT TRAIL
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-0.5">
            Edit History & Transparency Audit Log
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Every administrative modification, spreadsheet synchronization, record insertion, or status change is automatically logged with timestamps to guarantee accountability.
          </p>
        </div>

        <button
          onClick={handleExportLogs}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-emerald-500" />
          <span>Export Audit Trail (CSV)</span>
        </button>
      </div>

      {/* Log Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Search & Filter */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/20">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search audit trail by title, category, or modification notes..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200"
            >
              <option value="all">All Actions</option>
              <option value="Created">Created</option>
              <option value="Updated">Updated</option>
              <option value="Deleted">Deleted</option>
              <option value="Status Changed">Status Changed</option>
              <option value="Document Attached">Document Attached</option>
              <option value="Google Sheets Synced">Google Sheets Synced</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/75 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Action Performed</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Record Changed</th>
                <th className="py-3 px-4">Previous Information</th>
                <th className="py-3 px-4">Updated Information</th>
                <th className="py-3 px-4">Officer In Charge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {log.recordCategory}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {log.recordTitle}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px] max-w-xs truncate">
                      {log.previousInfo || 'None'}
                    </td>
                    <td className="py-3 px-4 text-emerald-700 dark:text-emerald-400 font-mono text-[11px] max-w-xs">
                      {log.updatedInfo}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-700 dark:text-slate-300">
                      <span className="inline-flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        {log.adminActor}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500 text-xs">
                    No audit records match your search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
