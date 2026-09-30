import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Coins, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Paperclip, 
  Edit3, 
  Trash2,
  FileText
} from 'lucide-react';
import { 
  FinancialRecord, 
  CategoryKey, 
  CATEGORIES, 
  FinancialStatus, 
  DocumentAttachment 
} from '../types/transparency';

interface CategoryDashboardProps {
  categoryKey: CategoryKey;
  isAdmin: boolean;
  financialRecords: FinancialRecord[];
  onBack: () => void;
  onOpenAddRecord: (category: CategoryKey, type: 'collection' | 'expense') => void;
  onEditRecord: (record: FinancialRecord) => void;
  onDeleteRecord: (id: string, record: FinancialRecord) => void;
  onViewDocument: (doc: DocumentAttachment, title: string) => void;
}

export const CategoryDashboard: React.FC<CategoryDashboardProps> = ({
  categoryKey,
  isAdmin,
  financialRecords,
  onBack,
  onOpenAddRecord,
  onEditRecord,
  onDeleteRecord,
  onViewDocument,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'collection' | 'expense'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const meta = CATEGORIES[categoryKey] || CATEGORIES.general;

  // Filter records for this category
  const categoryRecords = useMemo(() => {
    return financialRecords.filter((r) => r.category === categoryKey);
  }, [financialRecords, categoryKey]);

  // Calculations
  const totalCollections = useMemo(() => {
    return categoryRecords
      .filter((r) => r.type === 'collection')
      .reduce((sum, r) => sum + r.amount, 0);
  }, [categoryRecords]);

  const totalExpenses = useMemo(() => {
    return categoryRecords
      .filter((r) => r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0);
  }, [categoryRecords]);

  const availableBalance = totalCollections - totalExpenses;

  // Filtered
  const filteredRecords = useMemo(() => {
    return categoryRecords.filter((r) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = r.title.toLowerCase().includes(q);
        const matchesSource = r.sourceOrPayee.toLowerCase().includes(q);
        const matchesRef = r.referenceCode?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSource && !matchesRef) return false;
      }
      if (typeFilter !== 'all' && r.type !== typeFilter) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      return true;
    });
  }, [categoryRecords, searchTerm, typeFilter, statusFilter]);

  const getStatusBadge = (status: FinancialStatus) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3" /> Paid
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case 'Partially Paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            <Clock className="w-3 h-3" /> Partially Paid
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case 'Unpaid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
            <AlertCircle className="w-3 h-3" /> Unpaid
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Back button & Category Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${meta.bgLight}`}>
                CATEGORY DASHBOARD
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-0.5">
              {meta.label}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {meta.description}
            </p>
          </div>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAddRecord(categoryKey, 'collection')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Collection</span>
            </button>
            <button
              onClick={() => onOpenAddRecord(categoryKey, 'expense')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Expense</span>
            </button>
          </div>
        )}
      </div>

      {/* Category Metric Cards: Collections, Expenses, Available Balance */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Collections */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Inflows
            </span>
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
            Total Category Collections
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
            ₱{totalCollections.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Expenses */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Disbursements
            </span>
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
            Total Category Expenses
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 font-mono">
            ₱{totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Available Balance */}
        <div className="p-5 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl shadow-lg border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center">
              <Wallet className="w-5 h-5 text-emerald-300" />
            </div>
            <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">
              Remaining
            </span>
          </div>
          <div className="text-xs font-semibold text-slate-300 uppercase">
            Category Available Balance
          </div>
          <div className="text-2xl font-black text-white mt-1 font-mono">
            ₱{availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Category Transactions Ledger */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Table Filters */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/20">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search category transactions..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200"
            >
              <option value="all">All Types</option>
              <option value="collection">Collections (+)</option>
              <option value="expense">Expenses (-)</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200"
            >
              <option value="all">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/75 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Title / Description</th>
                <th className="py-3 px-4">Source / Payee</th>
                <th className="py-3 px-4 text-right">Amount (PHP)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Docs</th>
                {isAdmin && <th className="py-3 px-4 text-right">Admin Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">{rec.date}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">{rec.referenceCode || '—'}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{rec.title}</div>
                      {rec.notes && <div className="text-[11px] text-slate-500 line-clamp-1">{rec.notes}</div>}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">{rec.sourceOrPayee}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                      <span className={rec.type === 'collection' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                        {rec.type === 'collection' ? '+' : '-'}₱{rec.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">{getStatusBadge(rec.status)}</td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {rec.documents && rec.documents.length > 0 ? (
                        <button
                          onClick={() => onViewDocument(rec.documents[0], rec.title)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-slate-700 dark:text-slate-300 hover:text-emerald-600 text-[11px] border border-slate-200 dark:border-slate-700"
                        >
                          <Paperclip className="w-3 h-3 text-emerald-500" />
                          <span>{rec.documents.length}</span>
                        </button>
                      ) : <span className="text-slate-400">—</span>}
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEditRecord(rec)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteRecord(rec.id, rec)}
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
                  <td colSpan={isAdmin ? 8 : 7} className="py-10 text-center text-slate-500 text-xs">
                    No transactions recorded for this filter.
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
