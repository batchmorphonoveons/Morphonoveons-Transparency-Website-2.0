import React, { useEffect, useState } from 'react';
import { Check, Paperclip, Pencil, Trash2, X } from 'lucide-react';
import { DocumentAttachment } from '../types/transparency';
import {
  getProgressRecords,
  saveProgressRecords,
  addAuditLog,
  subscribeToData,
} from '../services/storage';

export type StageStatus = 'Pending' | 'In Progress' | 'Done';

export interface ProgressStageRecord {
  id: string;
  fund: 'batch_jersey' | 'mol_blue';
  order: number;
  label: string;
  status: StageStatus;
  date: string;
  note: string;
  documents: DocumentAttachment[];
  createdAt: string;
  updatedAt: string;
}

const STAGES = [
  'Down payment given',
  'Order processed',
  'In production',
  'Ready for release',
  'Distributed',
];

const FUND_LABELS: Record<string, string> = {
  batch_jersey: 'Batch Jersey',
  mol_blue: 'MOL Blue & MMC White Jersey',
};

const DOC_TYPES = ['Photo', 'Proof of Payment', 'Receipt', 'Supplier Invoice', 'Other'];
const MAX_TOTAL_CHARS = 700000;

// Shrinks a photo so it stays small enough to save
const compressImage = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const attempt = (maxSide: number, quality: number) => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) return '';
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', quality);
      };
      let out = attempt(1200, 0.7);
      if (out.length > 250000) out = attempt(900, 0.55);
      URL.revokeObjectURL(url);
      out ? resolve(out) : reject(new Error('Could not process image'));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not open image'));
    };
    img.src = url;
  });

interface Props {
  fund: 'batch_jersey' | 'mol_blue';
  isAdmin: boolean;
  onViewDocument: (doc: DocumentAttachment, title: string, docs?: DocumentAttachment[]) => void;
}

export const JerseyProgressTracker: React.FC<Props> = ({ fund, isAdmin, onViewDocument }) => {
  const [records, setRecords] = useState<ProgressStageRecord[]>(() => getProgressRecords());
  const [editing, setEditing] = useState<ProgressStageRecord | null>(null);

  // editor fields
  const [label, setLabel] = useState('');
  const [status, setStatus] = useState<StageStatus>('Pending');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [documents, setDocuments] = useState<DocumentAttachment[]>([]);
  const [docType, setDocType] = useState('Photo');
  const [docError, setDocError] = useState('');
  const [docBusy, setDocBusy] = useState(false);

  useEffect(() => {
    setRecords(getProgressRecords());
    return subscribeToData(() => setRecords(getProgressRecords()));
  }, []);

  const stages: ProgressStageRecord[] = STAGES.map((defaultLabel, i) => {
    const id = `${fund}-${i + 1}`;
    const found = records.find((r) => r.id === id);
    return (
      found || {
        id,
        fund,
        order: i + 1,
        label: defaultLabel,
        status: 'Pending',
        date: '',
        note: '',
        documents: [],
        createdAt: '',
        updatedAt: '',
      }
    );
  });

  const openEditor = (stage: ProgressStageRecord) => {
    setEditing(stage);
    setLabel(stage.label);
    setStatus(stage.status);
    setDate(stage.date);
    setNote(stage.note);
    setDocuments(stage.documents || []);
    setDocType('Photo');
    setDocError('');
  };

  const handleStatus = (value: StageStatus) => {
    setStatus(value);
    if (value === 'Done' && !date) setDate(new Date().toISOString().split('T')[0]);
  };

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;
    setDocError('');
    setDocBusy(true);
    let current = [...documents];
    for (const file of files) {
      try {
        if (!file.type.startsWith('image/')) {
          setDocError(`"${file.name}" is not a photo. Please attach a photo or screenshot.`);
          continue;
        }
        const dataUrl = await compressImage(file);
        const total = current.reduce((sum, d) => sum + (d.dataUrl?.length || 0), 0) + dataUrl.length;
        if (total > MAX_TOTAL_CHARS) {
          setDocError('Too many photos for this step. Remove one before adding another.');
          continue;
        }
        current = [
          ...current,
          {
            id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            name: file.name,
            type: docType,
            dataUrl,
            uploadDate: new Date().toISOString().split('T')[0],
            size: `${Math.max(1, Math.round((dataUrl.length * 0.75) / 1024))} KB`,
          },
        ];
      } catch (err: any) {
        setDocError(err?.message || 'Could not attach that photo.');
      }
    }
    setDocuments(current);
    setDocBusy(false);
  };

  const handleSave = () => {
    if (!editing || docBusy) return;
    const now = new Date().toISOString();
    const record: ProgressStageRecord = {
      ...editing,
      label: label.trim() || editing.label,
      status,
      date,
      note: note.trim(),
      documents,
      createdAt: editing.createdAt || now,
      updatedAt: now,
    };
    const others = getProgressRecords().filter((r: ProgressStageRecord) => r.id !== record.id);
    saveProgressRecords([record, ...others]);
    addAuditLog(
      'Updated',
      FUND_LABELS[fund].toUpperCase(),
      `Order progress: ${record.label}`,
      `Status: ${record.status} | Date: ${record.date || 'not set'} | Photos: ${record.documents.length}`,
      `Status: ${editing.status} | Date: ${editing.date || 'not set'}`
    );
    setRecords(getProgressRecords());
    setEditing(null);
  };

  const doneCount = stages.filter((s) => s.status === 'Done').length;
  const fieldClass =
    'w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Order Progress</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {doneCount} of {stages.length} steps completed
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 sm:gap-0">
        {stages.map((stage, i) => {
          const done = stage.status === 'Done';
          const active = stage.status === 'In Progress';
          return (
            <div key={stage.id} className="flex-1 flex sm:flex-col items-start sm:items-center gap-3 sm:gap-2 relative">
              {/* connector line */}
              {i < stages.length - 1 && (
                <div
                  className={`hidden sm:block absolute top-4 left-1/2 w-full h-0.5 ${
                    done ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                />
              )}

              <div
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 flex-shrink-0 ${
                  done
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : active
                    ? 'bg-amber-100 dark:bg-amber-950 border-amber-500 text-amber-700 dark:text-amber-300'
                    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-400'
                }`}
              >
                {done ? <Check className="w-4 h-4" /> : i + 1}
              </div>

              <div className="sm:text-center sm:px-2 min-w-0">
                <div className="text-xs font-semibold text-slate-900 dark:text-white">{stage.label}</div>
                <div
                  className={`text-[11px] font-medium ${
                    done
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : active
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-slate-400'
                  }`}
                >
                  {stage.status}
                </div>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  {stage.date || '—'}
                </div>
                {stage.note && (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 break-words">
                    {stage.note}
                  </div>
                )}
                <div className="flex sm:justify-center items-center gap-1.5 mt-1.5">
                  {stage.documents && stage.documents.length > 0 && (
                    <button
                      onClick={() =>
                        onViewDocument(stage.documents[0], `${FUND_LABELS[fund]} - ${stage.label}`, stage.documents)
                      }
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100"
                      title="View photos"
                    >
                      <Paperclip className="w-3 h-3" />
                      {stage.documents.length}
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => openEditor(stage)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:border-indigo-400"
                    >
                      <Pencil className="w-3 h-3" />
                      Update
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Editor */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Update step: {editing.label}</h4>
              <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Step name</label>
                <input value={label} onChange={(e) => setLabel(e.target.value)} className={fieldClass} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Status</label>
                  <select value={status} onChange={(e) => handleStatus(e.target.value as StageStatus)} className={fieldClass}>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={fieldClass} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Note (optional)</label>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. waiting for final sizes"
                  className={fieldClass}
                />
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <Paperclip className="w-3.5 h-3.5" />
                  Pictures
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select value={docType} onChange={(e) => setDocType(e.target.value)} className={fieldClass}>
                    {DOC_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <label className="px-3 py-2 text-xs text-center font-medium rounded-xl border border-dashed border-indigo-400 text-indigo-600 dark:text-indigo-300 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950/30">
                    {docBusy ? 'Processing...' : 'Choose photo'}
                    <input type="file" accept="image/*" multiple onChange={handleFiles} disabled={docBusy} className="hidden" />
                  </label>
                </div>
                {docError && <p className="text-xs text-rose-500">{docError}</p>}
                {documents.length > 0 ? (
                  <ul className="space-y-1.5">
                    {documents.map((d) => (
                      <li
                        key={d.id}
                        className="flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      >
                        <span className="truncate text-slate-700 dark:text-slate-200">
                          {d.name} <span className="text-slate-400">· {d.type} · {d.size}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setDocuments((prev) => prev.filter((x) => x.id !== d.id))}
                          className="text-rose-500 hover:text-rose-600 flex-shrink-0"
                          title="Remove photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400">No pictures attached yet.</p>
                )}
                <p className="text-[11px] text-slate-400">Photos are shrunk automatically and saved when you click Save.</p>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-xs text-slate-600 dark:text-slate-300">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={docBusy}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
