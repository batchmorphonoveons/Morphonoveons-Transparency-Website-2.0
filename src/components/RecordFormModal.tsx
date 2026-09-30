import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Trash2, 
  Plus, 
  FileText, 
  CheckCircle2, 
  Paperclip, 
  AlertCircle 
} from 'lucide-react';
import { 
  FinancialRecord, 
  CategoryKey, 
  FinancialStatus, 
  DocumentAttachment, 
  CATEGORIES 
} from '../types/transparency';

interface RecordFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordToEdit: FinancialRecord | null;
  defaultCategory?: CategoryKey;
  defaultType?: 'collection' | 'expense';
  onSave: (record: FinancialRecord, isNew: boolean, previousSnapshot?: FinancialRecord) => void;
  onDelete?: (recordId: string, recordSnapshot: FinancialRecord) => void;
}

export const RecordFormModal: React.FC<RecordFormModalProps> = ({
  isOpen,
  onClose,
  recordToEdit,
  defaultCategory = 'general',
  defaultType = 'collection',
  onSave,
  onDelete,
}) => {
  const [category, setCategory] = useState<CategoryKey>(defaultCategory);
  const [type, setType] = useState<'collection' | 'expense'>(defaultType);
  const [title, setTitle] = useState('');
  const [sourceOrPayee, setSourceOrPayee] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<FinancialStatus>('Paid');
  const [referenceCode, setReferenceCode] = useState('');
  const [notes, setNotes] = useState('');
  const [documents, setDocuments] = useState<DocumentAttachment[]>([]);
  const [docType, setDocType] = useState('Receipt');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (recordToEdit) {
      setCategory(recordToEdit.category);
      setType(recordToEdit.type);
      setTitle(recordToEdit.title);
      setSourceOrPayee(recordToEdit.sourceOrPayee);
      setAmount(recordToEdit.amount.toString());
      setDate(recordToEdit.date);
      setStatus(recordToEdit.status);
      setReferenceCode(recordToEdit.referenceCode || '');
      setNotes(recordToEdit.notes || '');
      setDocuments(recordToEdit.documents || []);
    } else {
      setCategory(defaultCategory);
      setType(defaultType);
      setTitle('');
      setSourceOrPayee(defaultType === 'collection' ? 'Section Representative' : 'Official Supplier');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setStatus('Paid');
      setReferenceCode('');
      setNotes('');
      setDocuments([]);
    }
    setShowDeleteConfirm(false);
  }, [recordToEdit, defaultCategory, defaultType, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const newDoc: DocumentAttachment = {
          id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          type: docType,
          dataUrl,
          uploadDate: new Date().toISOString().split('T')[0],
          size: `${Math.round(file.size / 1024)} KB`,
        };
        setDocuments((prev) => [...prev, newDoc]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveDoc = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const isNew = !recordToEdit;
    const record: FinancialRecord = {
      id: recordToEdit?.id || `rec-${Date.now()}`,
      category,
      type,
      title: title.trim(),
      sourceOrPayee: sourceOrPayee.trim(),
      amount: parsedAmount,
      date,
      status,
      referenceCode: referenceCode.trim() || undefined,
      notes: notes.trim() || undefined,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white">
              {recordToEdit ? 'Edit Financial Record' : 'Add Financial Record'}
            </h2>
            <p className="text-xs text-slate-400">
              {recordToEdit ? 'Modify details or upload verified supporting documents' : 'Record a new batch collection or authorized expenditure'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* Category & Type Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Fund Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryKey)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {Object.values(CATEGORIES).map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Transaction Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('collection')}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                    type === 'collection'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  Collection (+)
                </button>
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                    type === 'expense'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  Expense (-)
                </button>
              </div>
            </div>
          </div>

          {/* Record Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Title / Activity Description
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Batch Dues Collection - Section A (30 Members)"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Source / Payee & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                {type === 'collection' ? 'Source / Representative' : 'Payee / Vendor'}
              </label>
              <input
                type="text"
                required
                value={sourceOrPayee}
                onChange={(e) => setSourceOrPayee(e.target.value)}
                placeholder="e.g. Section Representative, Official Supplier"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Amount (PHP ₱)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Date, Status, Reference Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Financial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as FinancialStatus)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Paid">Paid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Reference Code
              </label>
              <input
                type="text"
                value={referenceCode}
                onChange={(e) => setReferenceCode(e.target.value)}
                placeholder="e.g. COLL-001, OR-9842"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Auditor Remarks / Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide breakdown, remarks, or remittance details..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Document Attachments */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
              <span>Supporting Documents & Proof of Payment</span>
              <span className="text-[11px] text-slate-400 font-normal">{documents.length} attached</span>
            </label>

            {/* Document List */}
            {documents.length > 0 && (
              <div className="space-y-2 mb-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Paperclip className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{doc.name}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                        {doc.type}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(doc.id)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Control */}
            <div className="flex items-center gap-2">
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              >
                <option value="Receipt">Official Receipt</option>
                <option value="Proof of Payment">Proof of Payment</option>
                <option value="Supplier Invoice">Supplier Invoice</option>
                <option value="Collection Sheet">Collection Sheet</option>
                <option value="Expense Document">Expense Document</option>
              </select>

              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 transition-colors">
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Choose Document/Image</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.xlsx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Delete Confirmation Box */}
          {showDeleteConfirm && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900 space-y-3">
              <div className="flex items-start gap-2.5 text-rose-800 dark:text-rose-300 text-xs">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
                <div>
                  <div className="font-semibold">Confirm Deletion</div>
                  <div className="mt-0.5">
                    Are you sure you want to permanently delete this financial record ("{recordToEdit?.title}")? This action will be logged in the audit trail.
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            {recordToEdit && onDelete && !showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400 hover:text-rose-700 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Record</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{recordToEdit ? 'Save Changes' : 'Create Record'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
