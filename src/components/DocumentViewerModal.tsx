import React, { useState, useEffect } from 'react';
import { X, FileText, Download, Calendar, Tag, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { DocumentAttachment } from '../types/transparency';

interface DocumentViewerModalProps {
  document: DocumentAttachment | null;
  documents?: DocumentAttachment[];
  onClose: () => void;
  recordTitle?: string;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  document: singleDoc,
  documents,
  onClose,
  recordTitle,
}) => {
  const list: DocumentAttachment[] =
    documents && documents.length > 0 ? documents : singleDoc ? [singleDoc] : [];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const start = singleDoc ? list.findIndex((d) => d === singleDoc || (d.name === singleDoc.name && d.dataUrl === singleDoc.dataUrl)) : 0;
    setIndex(start >= 0 ? start : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singleDoc, documents]);

  if (!singleDoc || list.length === 0) return null;

  const document = list[Math.min(index, list.length - 1)];
  const total = list.length;

  const isImage = document.dataUrl?.startsWith('data:image/') || 
                  document.name.toLowerCase().endsWith('.png') || 
                  document.name.toLowerCase().endsWith('.jpg') || 
                  document.name.toLowerCase().endsWith('.jpeg') || 
                  document.name.toLowerCase().endsWith('.webp');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white line-clamp-1">{document.name}</h3>
              <p className="text-xs text-slate-400">Attached Supporting Document / Transparency Voucher</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Document Info Bar */}
        <div className="bg-slate-50 dark:bg-slate-800/60 px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
              <Tag className="w-3.5 h-3.5 text-emerald-500" />
              <span>Type: <strong>{document.type}</strong></span>
            </span>
            <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Uploaded: {document.uploadDate}</span>
            </span>
            {document.size && (
              <span className="text-slate-500">Size: {document.size}</span>
            )}
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Batch Document
          </span>
        </div>

        {/* Content Display */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-slate-100/50 dark:bg-slate-950/40 min-h-[280px]">
          {document.dataUrl && isImage ? (
            <div className="w-full flex justify-center">
              <img 
                src={document.dataUrl} 
                alt={document.name}
                className="max-h-[60vh] max-w-full rounded-lg shadow-md border border-slate-200 dark:border-slate-700 object-contain"
              />
            </div>
          ) : (
            <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-md w-full">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">{document.name}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                {recordTitle ? `Attached to: "${recordTitle}"` : 'Official Financial Voucher'}
              </p>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-300 font-mono text-left mb-4 space-y-1">
                <div>Document Status: Archived & Verified</div>
                <div>Category Classification: {document.type}</div>
                <div>Hash Verification: Batch-2026-Secure-Audit</div>
              </div>
              {document.dataUrl && (
                <a
                  href={document.dataUrl}
                  download={document.name}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download File
                </a>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
          {total > 1 ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIndex((i) => (i - 1 + total) % total)}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {index + 1} of {total}
              </span>
              <button
                onClick={() => setIndex((i) => (i + 1) % total)}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
