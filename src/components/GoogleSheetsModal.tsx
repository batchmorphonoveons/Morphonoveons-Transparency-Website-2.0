import React, { useState } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  Download,
  Info,
  Clock
} from 'lucide-react';
import { GoogleSheetsConfig } from '../types/transparency';
import { 
  extractSpreadsheetId, 
  syncFromGoogleSheet, 
  generateSheetTemplateCSV 
} from '../services/googleSheets';
import { saveSheetsConfig } from '../services/storage';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GoogleSheetsConfig;
  onConfigUpdated: (config: GoogleSheetsConfig) => void;
  onDataRefreshed: () => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigUpdated,
  onDataRefreshed,
}) => {
  const [sheetInput, setSheetInput] = useState(config.sheetUrl || config.spreadsheetId || '');
  const [autoSync, setAutoSync] = useState(config.autoSyncEnabled);
  const [interval, setInterval] = useState(config.syncIntervalMinutes || 2);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  if (!isOpen) return null;

  const handleSaveAndSync = async () => {
    const extractedId = extractSpreadsheetId(sheetInput);
    const updated: GoogleSheetsConfig = {
      ...config,
      spreadsheetId: extractedId,
      sheetUrl: sheetInput,
      autoSyncEnabled: autoSync,
      syncIntervalMinutes: interval,
    };
    saveSheetsConfig(updated);
    onConfigUpdated(updated);

    if (extractedId) {
      setIsSyncing(true);
      setSyncStatus(null);
      const res = await syncFromGoogleSheet(extractedId);
      setIsSyncing(false);
      setSyncStatus({
        success: res.success,
        message: res.message,
      });
      if (res.success) {
        onDataRefreshed();
      }
    } else {
      setSyncStatus({
        success: false,
        message: 'Please provide a valid Google Spreadsheet Link or Spreadsheet ID.',
      });
    }
  };

  const handleCopyTemplate = () => {
    const csv = generateSheetTemplateCSV();
    navigator.clipboard.writeText(csv);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2500);
  };

  const handleDownloadTemplate = () => {
    const csv = generateSheetTemplateCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Morphonoveons_Batch2026_Transparency_Template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">Google Sheets Live Sync</h2>
              <p className="text-xs text-emerald-150 text-slate-200 mt-1">
                Synchronize transparency logs directly from your public or shared Google Sheet without redeploying.
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Status Alert */}
          {syncStatus && (
            <div className={`p-4 rounded-xl text-xs flex items-start gap-3 border ${
              syncStatus.success 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' 
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-900'
            }`}>
              {syncStatus.success ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-semibold">{syncStatus.success ? 'Sync Completed' : 'Sync Error'}</div>
                <div className="mt-0.5">{syncStatus.message}</div>
              </div>
            </div>
          )}

          {/* Current Sync Info */}
          {config.lastSyncedAt && !syncStatus && (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Clock className="w-4 h-4 text-emerald-500" />
                <span>Last Synced: <strong>{new Date(config.lastSyncedAt).toLocaleString()}</strong></span>
              </div>
              <span className={`px-2 py-0.5 rounded font-medium text-[11px] ${
                config.lastSyncStatus === 'success' 
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' 
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
              }`}>
                {config.lastSyncStatus === 'success' ? 'Active & Up to Date' : 'Pending Verification'}
              </span>
            </div>
          )}

          {/* Spreadsheet Input */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Google Sheet URL or Spreadsheet ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={sheetInput}
                onChange={(e) => setSheetInput(e.target.value)}
                placeholder="e.g., https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFM.../edit"
                className="flex-1 px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 dark:text-white outline-none font-mono text-xs"
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Accepts full Google Sheets share links or raw spreadsheet IDs. Make sure the document is set to <strong>"Anyone with the link can view"</strong>.
            </p>
          </div>

          {/* Auto-Sync Settings */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Background Auto-Refresh
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Automatically pulls new transparency updates while batch members view the portal.
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {autoSync && (
              <div className="flex items-center gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                <span className="text-slate-600 dark:text-slate-300">Sync Interval:</span>
                <select
                  value={interval}
                  onChange={(e) => setInterval(Number(e.target.value))}
                  className="px-2.5 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                >
                  <option value={1}>Every 1 minute</option>
                  <option value={2}>Every 2 minutes</option>
                  <option value={5}>Every 5 minutes</option>
                  <option value={10}>Every 10 minutes</option>
                </select>
              </div>
            )}
          </div>

          {/* Quick Template Download & Columns Guide */}
          <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">
                  Recommended Spreadsheet Format
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyTemplate}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {copiedTemplate ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTemplate ? 'Copied CSV' : 'Copy CSV'}</span>
                </button>
                <button
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .CSV</span>
                </button>
              </div>
            </div>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-400 leading-relaxed">
              Your Google Sheet should include these columns in Row 1: <br />
              <code className="font-mono text-[10px] bg-white/80 dark:bg-slate-900/80 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                Category | Type | Title | Source / Payee | Amount | Date | Status | Reference Code | Notes
              </code>
            </p>
          </div>

          {/* Setup Instructions */}
          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="font-semibold text-slate-800 dark:text-slate-200">How to share your Google Sheet:</div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] pl-1">
              <li>Open your spreadsheet in Google Drive.</li>
              <li>Click the green <strong>Share</strong> button in the upper-right corner.</li>
              <li>Under <em>General Access</em>, change <strong>Restricted</strong> to <strong>Anyone with the link</strong>.</li>
              <li>Keep the role as <strong>Viewer</strong> and click <strong>Copy link</strong>.</li>
              <li>Paste the link above and click <strong>Save & Sync Now</strong>.</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAndSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronizing Sheet...' : 'Save & Sync Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
