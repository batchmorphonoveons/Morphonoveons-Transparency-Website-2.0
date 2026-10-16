import React, { useState, useEffect } from 'react';
import { X, Shirt, Paperclip, Trash2 } from 'lucide-react';
import { JerseyRecord, DocumentAttachment } from '../types/transparency';

interface JerseyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordToEdit: JerseyRecord | null;
  defaultJerseyType?: 'batch_jersey' | 'mol_blue' | 'mmc_white';
  onSave: (record: JerseyRecord, isNew: boolean, prevSnapshot?: JerseyRecord) => void;
  onDelete?: (recordId: string, recordSnapshot: JerseyRecord) => void;
}

const DOC_TYPES = ['Proof of Payment', 'Receipt', 'Supplier Invoice', 'Collection Sheet', 'Other'];
const MAX_TOTAL_CHARS = 700000; // keeps each order well under the 1 MB database limit
const MAX_PDF_BYTES = 350000;

const readAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });

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

export const JerseyFormModal: React.FC<JerseyFormModalProps> = ({
  isOpen,
  onClose,
  recordToEdit,
  defaultJerseyType = 'batch_jersey',
  onSave,
  onDelete,
}) => {
  const [jerseyType, setJerseyType] = useState<'batch_jersey' | 'mol_blue' | 'mmc_white'>(defaultJerseyType);
  const [memberRef, setMemberRef] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState('');
  const [jerseySize, setJerseySize] = useState<JerseyRecord['jerseySize']>('L');
  const [unitPrice, setUnitPrice] = useState<string>('');
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<JerseyRecord['paymentStatus']>('Unpaid');
  const [supplierStatus, setSupplierStatus] = useState<JerseyRecord['supplierPaymentStatus']>('Pending');
  const [supplierName, setSupplierName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [documents, setDocuments] = useState<DocumentAttachment[]>([]);
  const [docType, setDocType] = useState('Proof of Payment');
  const [docError, setDocError] = useState('');
  const [docBusy, setDocBusy] = useState(false);

  useEffect(() => {
    if (recordToEdit) {
      setJerseyType(recordToEdit.jerseyType);
      setMemberRef(recordToEdit.memberRef);
      setJerseyNumber(recordToEdit.jerseyNumber || '');
      setJerseySize(recordToEdit.jerseySize);
      setUnitPrice(recordToEdit.unitPrice.toString());
      setAmountPaid(recordToEdit.amountPaid.toString());
      setPaymentStatus(recordToEdit.paymentStatus);
      setSupplierStatus(recordToEdit.supplierPaymentStatus);
      setSupplierName(recordToEdit.supplierName || '');
      setDate(recordToEdit.date);
      setDocuments(recordToEdit.documents || []);
    } else {
      setJerseyType(defaultJerseyType);
      setMemberRef('');
      setJerseyNumber('');
      setJerseySize('L');
      setUnitPrice('');
      setAmountPaid('');
      setPaymentStatus('Unpaid');
      setSupplierStatus('Pending');
      setSupplierName('');
      setDate(new Date().toISOString().split('T')[0]);
      setDocuments([]);
    }
    setDocType('Proof of Payment');
    setDocError('');
    setShowDeleteConfirm(false);
  }, [recordToEdit, defaultJerseyType, isOpen]);

  if (!isOpen) return null;

  const parsedPrice = parseFloat(unitPrice) || 0;
  const parsedPaid = parseFloat(amountPaid) || 0;
  const calculatedBalance = Math.max(0, parsedPrice - parsedPaid);

  const handlePaidChange = (val: string) => {
    setAmountPaid(val);
    const paid = parseFloat(val) || 0;
    if (paid >= parsedPrice && parsedPrice > 0) {
      setPaymentStatus('Paid');
    } else if (paid > 0) {
      setPaymentStatus('Partially Paid');
    } else {
      setPaymentStatus('Unpaid');
    }
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
        let dataUrl = '';
        if (file.type.startsWith('image/')) {
          dataUrl = await compressImage(file);
        } else if (file.type === 'application/pdf') {
          if (file.size > MAX_PDF_BYTES) {
            setDocError(`"${file.name}" is too large. PDFs must be under 350 KB. Please attach a photo or screenshot instead.`);
            continue;
          }
          dataUrl = await readAsDataUrl(file);
        } else {
          setDocError(`"${file.name}" is not supported. Attach a photo, screenshot, or small PDF.`);
          continue;
        }

        const total = current.reduce((sum, d) => sum + (d.dataUrl?.length || 0), 0) + dataUrl.length;
        if (total > MAX_TOTAL_CHARS) {
          setDocError('Too many attachments for one order. Remove one before adding another.');
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
        setDocError(err?.message || 'Could not attach that file.');
      }
    }
    setDocuments(current);
    setDocBusy(false);
  };

  const removeDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberRef.trim() || docBusy) return;

    const isNew = !recordToEdit;
    const record: JerseyRecord = {
      id: recordToEdit?.id || `jrs-${Date.now()}`,
      jerseyType,
      memberRef: memberRef.trim(),
      jerseyNumber: jerseyNumber.trim() || undefined,
      jerseySize,
      unitPrice: parsedPrice,
      amountPaid: parsedPaid,
      balance: calculatedBalance,
      paymentStatus,
      supplierPaymentStatus: supplierStatus,
      supplierName: supplierName.trim() || undefined,
      date,
      documents,
      createdAt: recordToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(record, isNew, recordToEdit || undefined);
    onClose();
  };

  const handleDelete = () => {
    if (recordToEdit && onDelete) {
      onDelete(recordToEdit.id, recordToEdit);
      onClose();
    }
  };

  const fieldClass =
    'w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200';
  const labelClass =
    'block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Shirt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {recordToEdit ? 'Edit Jersey Order Record' : 'Add Jersey Order Record'}
              </h2>
              <p className="text-xs text-slate-400">Track individual order payment and supplier status</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Jersey Division</label>
              <select
                value={jerseyType}
                onChange={(e) => setJerseyType(e.target.value as any)}
                className={fieldClass}
              >
                <option value="batch_jersey">Batch Official Jersey</option>
                <option value="mol_blue">MOL Blue & MMC White Jersey</option>
                {jerseyType === 'mmc_white' && <option value="mmc_white">MMC White Jersey</option>}
              </select>
            </div>

            <div>
              <label className={labelClass}>Member / Unit Reference Code</label>
              <input
                type="text"
                required
                value={memberRef}
                onChange={(e) => setMemberRef(e.target.value)}
                placeholder="Enter code or member reference"
                className={`${fieldClass} font-mono`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Jersey Size</label>
              <select
                value={jerseySize}
                onChange={(e) => setJerseySize(e.target.value as any)}
                className={`${fieldClass} font-bold`}
              >
                <option value="XS">XS (Extra Small)</option>
                <option value="S">S (Small)</option>
                <option value="M">M (Medium)</option>
                <option value="L">L (Large)</option>
                <option value="XL">XL (Extra Large)</option>
                <option value="2XL">2XL (Double XL)</option>
                <option value="3XL">3XL (Triple XL)</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Printed Number</label>
              <input
                type="text"
                value={jerseyNumber}
                onChange={(e) => setJerseyNumber(e.target.value)}
                placeholder="Optional"
                className={`${fieldClass} font-mono font-bold`}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Unit Price</label>
              <input
                type="number"
                step="0.01"
                required
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className={`${fieldClass} font-mono`}
              />
            </div>

            <div>
              <label className={labelClass}>Amount Paid</label>
              <input
                type="number"
                step="0.01"
                required
                value={amountPaid}
                onChange={(e) => handlePaidChange(e.target.value)}
                className={`${fieldClass} font-mono`}
              />
            </div>

            <div>
              <label className={labelClass}>Balance Due</label>
              <div className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold flex items-center">
                ₱{calculatedBalance.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Member Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as any)}
                className={fieldClass}
              >
                <option value="Paid">Paid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Supplier Payment Status</label>
              <select
                value={supplierStatus}
                onChange={(e) => setSupplierStatus(e.target.value as any)}
                className={fieldClass}
              >
                <option value="Completed">Completed (Disbursed)</option>
                <option value="Pending">Pending (Unpaid)</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Apparel Manufacturer / Supplier</label>
            <input
              type="text"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              placeholder="Enter supplier name"
              className={fieldClass}
            />
          </div>

          {/* Supporting documents */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <Paperclip className="w-3.5 h-3.5" />
              Supporting Documents
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
                {docBusy ? 'Processing...' : 'Choose file'}
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  multiple
                  onChange={handleFiles}
                  disabled={docBusy}
                  className="hidden"
                />
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
                      onClick={() => removeDocument(d.id)}
                      className="text-rose-500 hover:text-rose-600 flex-shrink-0"
                      title="Remove attachment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400">No documents attached yet.</p>
            )}
            <p className="text-[11px] text-slate-400">
              Photos are shrunk automatically. Attachments are saved when you click Save.
            </p>
          </div>

          {/* Delete prompt */}
          {showDeleteConfirm && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900 text-xs space-y-2">
              <div className="text-rose-700 dark:text-rose-300 font-semibold">Confirm Deletion</div>
              <p className="text-rose-600 dark:text-rose-400">Permanently delete jersey record {memberRef}?</p>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowDeleteConfirm(false)} className="px-2.5 py-1 bg-white dark:bg-slate-800 rounded border">
                  Cancel
                </button>
                <button type="button" onClick={handleDelete} className="px-2.5 py-1 bg-rose-600 text-white rounded">
                  Delete
                </button>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            {recordToEdit && onDelete && !showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-rose-600 hover:text-rose-700 text-xs font-medium"
              >
                Delete Order
              </button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-xs text-slate-600">
                Cancel
              </button>
              <button
                type="submit"
                disabled={docBusy}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl"
              >
                {recordToEdit ? 'Save Changes' : 'Create Jersey Order'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
};
