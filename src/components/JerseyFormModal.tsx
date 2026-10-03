import React, { useState, useEffect } from 'react';
import { X, Shirt, CheckCircle2 } from 'lucide-react';
import { JerseyRecord } from '../types/transparency';

interface JerseyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordToEdit: JerseyRecord | null;
  defaultJerseyType?: 'batch_jersey' | 'mol_blue' | 'mmc_white';
  onSave: (record: JerseyRecord, isNew: boolean, prevSnapshot?: JerseyRecord) => void;
  onDelete?: (recordId: string, recordSnapshot: JerseyRecord) => void;
}

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
  const [unitPrice, setUnitPrice] = useState<string>('750');
  const [amountPaid, setAmountPaid] = useState<string>('750');
  const [paymentStatus, setPaymentStatus] = useState<JerseyRecord['paymentStatus']>('Paid');
  const [supplierStatus, setSupplierStatus] = useState<JerseyRecord['supplierPaymentStatus']>('Completed');
  const [supplierName, setSupplierName] = useState('Apex Sportswear Apparel Inc.');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
      setSupplierName(recordToEdit.supplierName || 'Apex Sportswear Apparel Inc.');
      setDate(recordToEdit.date);
    } else {
      setJerseyType(defaultJerseyType);
      setMemberRef(
        defaultJerseyType === 'batch_jersey' 
          ? `BM-2026-${Math.floor(100 + Math.random() * 900)}` 
          : defaultJerseyType === 'mol_blue'
          ? `MOL-BLUE-${Math.floor(10 + Math.random() * 90)}`
          : `MMC-WHT-${Math.floor(10 + Math.random() * 90)}`
      );
      setJerseyNumber('10');
      setJerseySize('L');
      setUnitPrice('750');
      setAmountPaid('750');
      setPaymentStatus('Paid');
      setSupplierStatus('Completed');
      setSupplierName('Apex Sportswear Apparel Inc.');
      setDate(new Date().toISOString().split('T')[0]);
    }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberRef.trim()) return;

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
      supplierName: supplierName.trim(),
      date,
      documents: recordToEdit?.documents || [],
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Jersey Division
              </label>
              <select
                value={jerseyType}
                onChange={(e) => setJerseyType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
              >
                <option value="batch_jersey">Batch Official Jersey</option>
                <option value="batch_jersey">Batch Official Jersey</option>
                <option value="mol_blue">MOL Blue & MMC White Jersey</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Member / Unit Reference Code
              </label>
              <input
                type="text"
                required
                value={memberRef}
                onChange={(e) => setMemberRef(e.target.value)}
                placeholder="e.g. BM-2026-021"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Jersey Size
              </label>
              <select
                value={jerseySize}
                onChange={(e) => setJerseySize(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-bold"
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Printed Number
              </label>
              <input
                type="text"
                value={jerseyNumber}
                onChange={(e) => setJerseyNumber(e.target.value)}
                placeholder="e.g. 07"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Unit Price
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Amount Paid
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={amountPaid}
                onChange={(e) => handlePaidChange(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Balance Due
              </label>
              <div className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-bold flex items-center">
                ₱{calculatedBalance.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Member Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
              >
                <option value="Paid">Paid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Supplier Payment Status
              </label>
              <select
                value={supplierStatus}
                onChange={(e) => setSupplierStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
              >
                <option value="Completed">Completed (Disbursed)</option>
                <option value="Pending">Pending (Unpaid)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Apparel Manufacturer / Supplier
            </label>
            <input
              type="text"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* Delete prompt */}
          {showDeleteConfirm && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900 text-xs space-y-2">
              <div className="text-rose-700 dark:text-rose-300 font-semibold">Confirm Deletion</div>
              <p className="text-rose-600 dark:text-rose-400">Permanently delete jersey record {memberRef}?</p>
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
                Delete Order
              </button>
            ) : <div />}

            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-xs text-slate-600">Cancel</button>
              <button type="submit" className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl">
                {recordToEdit ? 'Save Changes' : 'Create Jersey Order'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
