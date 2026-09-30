import React, { useState, useEffect } from 'react';
import { X, Upload, Trash2, CheckCircle2, Paperclip, AlertCircle, ShoppingBag } from 'lucide-react';
import { SellingActivityRecord, FinancialStatus, DocumentAttachment } from '../types/transparency';

interface SellingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordToEdit: SellingActivityRecord | null;
  onSave: (record: SellingActivityRecord, isNew: boolean, prevSnapshot?: SellingActivityRecord) => void;
  onDelete?: (recordId: string, recordSnapshot: SellingActivityRecord) => void;
}

export const SellingFormModal: React.FC<SellingFormModalProps> = ({
  isOpen,
  onClose,
  recordToEdit,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [unitsSold, setUnitsSold] = useState<string>('0');
  const [unitPrice, setUnitPrice] = useState<string>('0');
  const [productionCost, setProductionCost] = useState<string>('0');
  const [status, setStatus] = useState<FinancialStatus>('Completed');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [documents, setDocuments] = useState<DocumentAttachment[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (recordToEdit) {
      setTitle(recordToEdit.title);
      setDescription(recordToEdit.description);
      setUnitsSold(recordToEdit.unitsSold.toString());
      setUnitPrice(recordToEdit.unitPrice.toString());
      setProductionCost(recordToEdit.productionCost.toString());
      setStatus(recordToEdit.status);
      setDate(recordToEdit.date);
      setDocuments(recordToEdit.documents || []);
    } else {
      setTitle('');
      setDescription('');
      setUnitsSold('100');
      setUnitPrice('50');
      setProductionCost('2500');
      setStatus('Completed');
      setDate(new Date().toISOString().split('T')[0]);
      setDocuments([]);
    }
    setShowDeleteConfirm(false);
  }, [recordToEdit, isOpen]);

  if (!isOpen) return null;

  const parsedUnits = parseInt(unitsSold) || 0;
  const parsedPrice = parseFloat(unitPrice) || 0;
  const parsedCost = parseFloat(productionCost) || 0;
  const calculatedSales = parsedUnits * parsedPrice;
  const calculatedNet = calculatedSales - parsedCost;

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
          type: 'Supplier Invoice',
          dataUrl,
          uploadDate: new Date().toISOString().split('T')[0],
          size: `${Math.round(file.size / 1024)} KB`,
        };
        setDocuments((prev) => [...prev, newDoc]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const isNew = !recordToEdit;
    const record: SellingActivityRecord = {
      id: recordToEdit?.id || `sell-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      unitsSold: parsedUnits,
      unitPrice: parsedPrice,
      grossSales: calculatedSales,
      productionCost: parsedCost,
      netProceeds: calculatedNet,
      status,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {recordToEdit ? 'Edit Selling Activity' : 'Add Selling Activity'}
              </h2>
              <p className="text-xs text-slate-400">Batch merchandise, fundraisers, and snack booth proceeds</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Activity / Merchandise Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Morphonoveons 2026 Signature Lanyards"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Description / Specifications
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Double-sided satin lanyards with metal swivel hook..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Units Sold / Released
              </label>
              <input
                type="number"
                min="0"
                required
                value={unitsSold}
                onChange={(e) => setUnitsSold(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Unit Price (PHP ₱)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Total Production Cost (PHP ₱)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={productionCost}
                onChange={(e) => setProductionCost(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as FinancialStatus)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
              >
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          </div>

          {/* Financial Calculation Summary Card */}
          <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 rounded-xl grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <div className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold uppercase">Gross Sales</div>
              <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                ₱{calculatedSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold uppercase">Total Costs</div>
              <div className="font-mono font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                ₱{parsedCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold uppercase">Net Proceeds</div>
              <div className={`font-mono font-bold mt-0.5 ${calculatedNet >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                ₱{calculatedNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Activity Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* Documents */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Cost Invoices & Receipts
              </span>
              <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200">
                <Upload className="w-3 h-3 text-slate-500" />
                <span>Upload</span>
                <input type="file" multiple accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {documents.length > 0 && (
              <div className="space-y-1.5">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs">
                    <span className="truncate text-slate-700 dark:text-slate-300">{doc.name}</span>
                    <button type="button" onClick={() => setDocuments(documents.filter(d => d.id !== doc.id))} className="text-slate-400 hover:text-rose-500 p-1">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delete prompt */}
          {showDeleteConfirm && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900 text-xs space-y-2">
              <div className="text-rose-700 dark:text-rose-300 font-semibold">Confirm Deletion</div>
              <p className="text-rose-600 dark:text-rose-400">Permanently delete this selling activity record?</p>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowDeleteConfirm(false)} className="px-2.5 py-1 bg-white dark:bg-slate-800 rounded border">Cancel</button>
                <button type="button" onClick={handleDelete} className="px-2.5 py-1 bg-rose-600 text-white rounded">Delete</button>
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
                Delete Activity
              </button>
            ) : <div />}

            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-xs text-slate-600">Cancel</button>
              <button type="submit" className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl">
                {recordToEdit ? 'Save Changes' : 'Create Activity'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
