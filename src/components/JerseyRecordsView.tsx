import React, { useState, useMemo } from 'react';
import { 
  Shirt, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Edit3, 
  Trash2, 
  Wallet, 
  Building2, 
  Users,
  DollarSign
} from 'lucide-react';
import { 
  JerseyRecord, 
  FinancialRecord, 
  FinancialStatus, 
  DocumentAttachment 
} from '../types/transparency';

interface JerseyRecordsViewProps {
  jerseyType: 'batch_jersey' | 'mol_blue' | 'mmc_white';
  title: string;
  subtitle: string;
  themeColor: string;
  isAdmin: boolean;
  jerseyRecords: JerseyRecord[];
  financialRecords: FinancialRecord[];
  onOpenAddOrder: () => void;
  onOpenAddFinancial: (type: 'collection' | 'expense') => void;
  onEditJersey: (record: JerseyRecord) => void;
  onDeleteJersey: (id: string, record: JerseyRecord) => void;
  onQuickUpdateStatus: (id: string, newStatus: 'Paid' | 'Partially Paid' | 'Unpaid') => void;
  onQuickUpdateSupplier: (id: string, newStatus: 'Completed' | 'Pending') => void;
  onEditFinancial: (record: FinancialRecord) => void;
  onDeleteFinancial: (id: string, record: FinancialRecord) => void;
  onViewDocument: (doc: DocumentAttachment, title: string) => void;
}

export const JerseyRecordsView: React.FC<JerseyRecordsViewProps> = ({
  jerseyType,
  title,
  subtitle,
  themeColor,
  isAdmin,
  jerseyRecords,
  financialRecords,
  onOpenAddOrder,
  onOpenAddFinancial,
  onEditJersey,
  onDeleteJersey,
  onQuickUpdateStatus,
  onQuickUpdateSupplier,
  onEditFinancial,
  onDeleteFinancial,
  onViewDocument,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sizeFilter, setSizeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');

    // Filter jersey records for this type
  const currentJerseyOrders = useMemo(() => {
    return jerseyRecords.filter((r) =>
      jerseyType === 'mol_blue'
        ? r.jerseyType === 'mol_blue' || r.jerseyType === 'mmc_white'
        : r.jerseyType === jerseyType
    );
  }, [jerseyRecords, jerseyType]);

  // Filter financial records for this jersey category
  const currentFinRecords = useMemo(() => {
    return financialRecords.filter((r) =>
      jerseyType === 'mol_blue'
        ? r.category === 'mol_blue' || r.category === 'mmc_white'
        : r.category === jerseyType
    );
  }, [financialRecords, jerseyType]);

  // Overall financial calculations
  const totalCollections = useMemo(() => {
    return currentFinRecords
      .filter((r) => r.type === 'collection')
      .reduce((sum, r) => sum + r.amount, 0);
  }, [currentFinRecords]);

  const totalSupplierDisbursed = useMemo(() => {
    return currentFinRecords
      .filter((r) => r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0);
  }, [currentFinRecords]);

  const availableFundBalance = totalCollections - totalSupplierDisbursed;

  // Individual order metrics
  const totalOrdersCount = currentJerseyOrders.length;
  const totalOutstandingMemberBalances = useMemo(() => {
    return currentJerseyOrders.reduce((sum, r) => sum + r.balance, 0);
  }, [currentJerseyOrders]);

  const filteredOrders = useMemo(() => {
    return currentJerseyOrders.filter((r) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesRef = r.memberRef.toLowerCase().includes(q);
        const matchesNum = r.jerseyNumber?.toLowerCase().includes(q);
        const matchesSupp = r.supplierName?.toLowerCase().includes(q);
        if (!matchesRef && !matchesNum && !matchesSupp) return false;
      }
      if (sizeFilter !== 'all' && r.jerseySize !== sizeFilter) return false;
      if (statusFilter !== 'all' && r.paymentStatus !== statusFilter) return false;
      if (supplierFilter !== 'all' && r.supplierPaymentStatus !== supplierFilter) return false;
      return true;
    });
  }, [currentJerseyOrders, searchTerm, sizeFilter, statusFilter, supplierFilter]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300">
              JERSEY FUND DASHBOARD
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-0.5">
            {title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAddFinancial('collection')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Batch Payment</span>
            </button>
            <button
              onClick={() => onOpenAddFinancial('expense')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Disburse to Supplier</span>
            </button>
            <button
              onClick={onOpenAddOrder}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Order Item</span>
            </button>
          </div>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Total Collections */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
            Total Jersey Collections
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
            ₱{totalCollections.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Total payments received</div>
        </div>

        {/* Supplier Disbursements */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
            Supplier Disbursements
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 font-mono">
            ₱{totalSupplierDisbursed.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Paid to manufacturer</div>
        </div>

        {/* Available Fund Balance */}
        <div className="p-5 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 shadow-sm">
          <div className="text-xs font-semibold uppercase text-emerald-800 dark:text-emerald-300">
            Available Fund Balance
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
            ₱{availableFundBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-1">
            Collections minus expenses
          </div>
        </div>

        {/* Orders & Receivables */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
            Orders / Pending Receivables
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {totalOrdersCount} Units
          </div>
          <div className="text-[11px] font-mono text-amber-600 dark:text-amber-400 mt-1">
            Pending dues: ₱{totalOutstandingMemberBalances.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Jersey Order Roster Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/20">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search member ref, jersey number, or supplier..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sizeFilter}
              onChange={(e) => setSizeFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200"
            >
              <option value="all">All Sizes</option>
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="2XL">2XL</option>
              <option value="3XL">3XL</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200"
            >
              <option value="all">All Payment Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>

            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200"
            >
              <option value="all">All Supplier Statuses</option>
              <option value="Completed">Supplier: Completed</option>
              <option value="Pending">Supplier: Pending</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/75 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Member / Unit Code</th>
                <th className="py-3 px-4 text-center">Jersey #</th>
                <th className="py-3 px-4 text-center">Size</th>
                <th className="py-3 px-4 text-right">Price</th>
                <th className="py-3 px-4 text-right">Paid</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Payment Status</th>
                <th className="py-3 px-4 text-center">Supplier Status</th>
                <th className="py-3 px-4">Manufacturer</th>
                {isAdmin && <th className="py-3 px-4 text-right">Admin Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {order.memberRef}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {order.jerseyNumber || '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {order.jerseySize}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono">₱{order.unitPrice.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                      ₱{order.amountPaid.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      <span className={order.balance > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}>
                        ₱{order.balance.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {isAdmin ? (
                        <select
                          value={order.paymentStatus}
                          onChange={(e) => onQuickUpdateStatus(order.id, e.target.value as any)}
                          className="px-2 py-0.5 text-[11px] font-semibold rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
                        >
                          <option value="Paid">Paid</option>
                          <option value="Partially Paid">Partially Paid</option>
                          <option value="Unpaid">Unpaid</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          order.paymentStatus === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : order.paymentStatus === 'Partially Paid'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {isAdmin ? (
                        <select
                          value={order.supplierPaymentStatus}
                          onChange={(e) => onQuickUpdateSupplier(order.id, e.target.value as any)}
                          className="px-2 py-0.5 text-[11px] font-semibold rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
                        >
                          <option value="Completed">Completed</option>
                          <option value="Pending">Pending</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          order.supplierPaymentStatus === 'Completed'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {order.supplierPaymentStatus}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {order.supplierName || 'Apex Sportswear'}
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEditJersey(order)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteJersey(order.id, order)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isAdmin ? 10 : 9} className="py-8 text-center text-slate-500 text-xs">
                    No jersey records found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
   
      {/* Payment & Disbursement Records */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Batch Payments & Supplier Disbursements</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Records that feed the totals above</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/75 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Source / Payee</th>
                <th className="py-3 px-4 text-right">Amount</th>
                {isAdmin && <th className="py-3 px-4 text-right">Admin Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {currentFinRecords.length > 0 ? (
                currentFinRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400">{rec.date}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={rec.type === 'collection' ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
                        {rec.type === 'collection' ? 'Payment received' : 'Supplier disbursement'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{rec.title}</td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{rec.sourceOrPayee}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      <span className={rec.type === 'collection' ? 'text-emerald-600' : 'text-rose-600'}>
                        {rec.type === 'collection' ? '+' : '-'}₱{rec.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEditFinancial(rec)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Delete this record?')) onDeleteFinancial(rec.id, rec);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} className="py-8 text-center text-slate-500 text-xs">
                    No payment or disbursement records yet.
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
