import React, { useState, useMemo } from 'react';
import { 
  Coins, 
  ShoppingBag, 
  Shirt, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Search, 
  Filter, 
  Plus, 
  FileText, 
  Calendar, 
  Tag, 
  Eye, 
  Edit3, 
  Trash2, 
  Paperclip,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  BarChart3,
  Building,
  RefreshCw
} from 'lucide-react';
import { 
  FinancialRecord, 
  SellingActivityRecord, 
  JerseyRecord, 
  CategoryKey, 
  CATEGORIES, 
  FinancialStatus, 
  DocumentAttachment 
} from '../types/transparency';

interface MainDashboardProps {
  isAdmin: boolean;
  financialRecords: FinancialRecord[];
  sellingRecords: SellingActivityRecord[];
  jerseyRecords: JerseyRecord[];
  onSelectCategory: (categoryKey: string) => void;
  onOpenAddRecord: (category?: CategoryKey, type?: 'collection' | 'expense') => void;
  onEditRecord: (record: FinancialRecord) => void;
  onDeleteRecord: (id: string, record: FinancialRecord) => void;
  onViewDocument: (doc: DocumentAttachment, title: string) => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({
  isAdmin,
  financialRecords,
  sellingRecords,
  jerseyRecords,
  onSelectCategory,
  onOpenAddRecord,
  onEditRecord,
  onDeleteRecord,
  onViewDocument,
}) => {
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 1. Total General Batch Collections
  const totalGeneralCollections = useMemo(() => {
    return financialRecords
      .filter((r) => r.category === 'general' && r.type === 'collection')
      .reduce((sum, r) => sum + r.amount, 0);
  }, [financialRecords]);

  // 2. Total Selling Activities Revenue
  const totalSellingRevenue = useMemo(() => {
    return sellingRecords.reduce((sum, r) => sum + r.grossSales, 0);
  }, [sellingRecords]);

  // 3. Total Batch Jersey Collections
  const totalBatchJerseyCollections = useMemo(() => {
    return financialRecords
      .filter((r) => r.category === 'batch_jersey' && r.type === 'collection')
      .reduce((sum, r) => sum + r.amount, 0);
  }, [financialRecords]);

  // 4. Total MOL Blue Jersey Collections
  const totalMolBlueCollections = useMemo(() => {
    return financialRecords
      .filter((r) => r.category === 'mol_blue' && r.type === 'collection')
      .reduce((sum, r) => sum + r.amount, 0);
  }, [financialRecords]);

  // 5. Total MMC White Jersey Collections
  const totalMmcWhiteCollections = useMemo(() => {
    return financialRecords
      .filter((r) => r.category === 'mmc_white' && r.type === 'collection')
      .reduce((sum, r) => sum + r.amount, 0);
  }, [financialRecords]);

  // Total Expenses across all funds
  const totalGeneralExpenses = useMemo(() => {
    return financialRecords
      .filter((r) => r.category === 'general' && r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0);
  }, [financialRecords]);

  const totalSellingCosts = useMemo(() => {
    return sellingRecords.reduce((sum, r) => sum + r.productionCost, 0);
  }, [sellingRecords]);

  const totalBatchJerseyExpenses = useMemo(() => {
    return financialRecords
      .filter((r) => r.category === 'batch_jersey' && r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0);
  }, [financialRecords]);

  const totalMolBlueExpenses = useMemo(() => {
    return financialRecords
      .filter((r) => r.category === 'mol_blue' && r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0);
  }, [financialRecords]);

  const totalMmcWhiteExpenses = useMemo(() => {
    return financialRecords
      .filter((r) => r.category === 'mmc_white' && r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0);
  }, [financialRecords]);

  const totalExpenses = 
    totalGeneralExpenses + 
    totalSellingCosts + 
    totalBatchJerseyExpenses + 
    totalMolBlueExpenses + 
    totalMmcWhiteExpenses;

  // Total Inflows
  const totalInflows = 
    totalGeneralCollections + 
    totalSellingRevenue + 
    totalBatchJerseyCollections + 
    totalMolBlueCollections + 
    totalMmcWhiteCollections;

  // Available Balance
  const totalAvailableBalance = totalInflows - totalExpenses;

  // Filtered Financial Records
  const filteredRecords = useMemo(() => {
    return financialRecords.filter((rec) => {
      // Search term
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = rec.title.toLowerCase().includes(query);
        const matchesSource = rec.sourceOrPayee.toLowerCase().includes(query);
        const matchesRef = rec.referenceCode?.toLowerCase().includes(query);
        const matchesNotes = rec.notes?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesSource && !matchesRef && !matchesNotes) return false;
      }

      // Category filter
      if (selectedCategoryFilter !== 'all' && rec.category !== selectedCategoryFilter) {
        return false;
      }

      // Type filter
      if (selectedTypeFilter !== 'all' && rec.type !== selectedTypeFilter) {
        return false;
      }

      // Status filter
      if (selectedStatusFilter !== 'all' && rec.status !== selectedStatusFilter) {
        return false;
      }

      // Date range filter
      if (startDate && rec.date < startDate) return false;
      if (endDate && rec.date > endDate) return false;

      return true;
    });
  }, [financialRecords, searchTerm, selectedCategoryFilter, selectedTypeFilter, selectedStatusFilter, startDate, endDate]);

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
    <div className="space-y-8 animate-fadeIn">
      {/* About the Portal Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Building className="w-3.5 h-3.5" />
            <span>Official Batch 2026 Portal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Morphonoveons Transparency Portal
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
            The Batch 2026 Transparency Portal is a centralized platform created to provide accessible and organized information regarding all batch-related financial activities. It aims to promote transparency, accountability, and proper financial management among batch members.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Dedicated Segregated Fund Cards</span>
            </div>
            <span>•</span>
            <div>Zero Fund Mixing Policy</div>
            <span>•</span>
            <div>Real-Time Public Ledger</div>
          </div>
        </div>
      </div>

      {/* DASHBOARD SUGGESTIONS: Main Dashboard
          Provide an overall summary showing:
          - Total General Batch Collections
          - Total Selling Activities Revenue
          - Total Batch Jersey Collections
          - Total MOL Blue Jersey Collections
          - Total MMC White Jersey Collections
          - Total Expenses
          - Available Balance
          "Use separate financial cards for each category so funds are not mixed."
      */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Consolidated Financial Summary</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Individual balances calculated per fund to guarantee distinct financial separation.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => onOpenAddRecord('general', 'collection')}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Financial Record</span>
            </button>
          )}
        </div>

        {/* 7 Separate Financial Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Total General Batch Collections */}
          <div 
            onClick={() => onSelectCategory('general')}
            className="cursor-pointer group p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Coins className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                View Fund <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total General Batch Collections
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
              ₱{totalGeneralCollections.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
              Expenses: ₱{totalGeneralExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* 2. Total Selling Activities Revenue */}
          <div 
            onClick={() => onSelectCategory('selling')}
            className="cursor-pointer group p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                View Sales <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Selling Activities Revenue
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
              ₱{totalSellingRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
              Net Profit: ₱{(totalSellingRevenue - totalSellingCosts).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* 3. Total Batch Jersey Collections */}
          <div 
            onClick={() => onSelectCategory('batch_jersey')}
            className="cursor-pointer group p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Shirt className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                View Jersey <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Batch Jersey Collections
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
              ₱{totalBatchJerseyCollections.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
              Disbursed: ₱{totalBatchJerseyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* 4. Total MOL Blue Jersey Collections */}
          <div 
            onClick={() => onSelectCategory('mol_blue')}
            className="cursor-pointer group p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Shirt className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                View MOL Blue <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total MOL Blue Collections
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
              ₱{totalMolBlueCollections.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
              Disbursed: ₱{totalMolBlueExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* 5. Total MMC White Jersey Collections */}
          <div 
            onClick={() => onSelectCategory('mmc_white')}
            className="cursor-pointer group p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-teal-500/50 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Shirt className="w-5 h-5 text-teal-600" />
              </div>
              <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                View MMC White <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total MMC White Collections
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
              ₱{totalMmcWhiteCollections.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
              Disbursed: ₱{totalMmcWhiteExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* 6. Total Expenses */}
          <div className="p-5 bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl border border-rose-200 dark:border-rose-900/50 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <ArrowDownRight className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                Total Disbursements
              </span>
            </div>
            <div className="text-xs font-semibold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
              Total Expenses
            </div>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 font-mono">
              ₱{totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-rose-700/80 dark:text-rose-400/80 mt-2">
              Includes logistics, hall, printing & supplier fees
            </div>
          </div>

          {/* 7. Available Balance */}
          <div className="sm:col-span-2 p-5 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white rounded-2xl shadow-lg shadow-emerald-700/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 bg-white/20 rounded-full">
                  Net Available Cash
                </span>
              </div>
              <div className="text-xs uppercase font-semibold text-emerald-100 tracking-wider">
                Total Available Balance
              </div>
              <div className="text-3xl font-black mt-1 font-mono text-white tracking-tight">
                ₱{totalAvailableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="text-[11px] text-emerald-100 pt-3 border-t border-white/20 flex items-center justify-between">
              <span>Total Batch Revenue Inflow: ₱{totalInflows.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              <span className="font-semibold text-emerald-200">100% Balanced</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Individual Category Portals
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
             {Object.values(CATEGORIES).filter((c) => c.key !== 'mmc_white').map((c) => (
            <button
              key={cat.key}
              onClick={() => onSelectCategory(cat.key)}
              className="p-4 rounded-xl text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-sm transition-all group"
            >
              <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                <span>{cat.shortLabel}</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {cat.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Search, Filter & Transparency Ledger */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-800/20">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search transactions, reference codes, receipts, notes..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Quick Count Badge */}
            <div className="text-xs text-slate-500 dark:text-slate-400 self-center">
              Showing <strong>{filteredRecords.length}</strong> of {financialRecords.length} records
            </div>
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {/* Category Filter */}
            <div>
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
              >
                <option value="all">All Categories</option>
                {Object.values(CATEGORIES).map((c) => (
                  <option key={c.key} value={c.key}>{c.shortLabel}</option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
              >
                <option value="all">All Types (Collections & Expenses)</option>
                <option value="collection">Collections Only (+)</option>
                <option value="expense">Expenses Only (-)</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 outline-none"
              >
                <option value="all">All Financial Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            {/* Date Filters */}
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-1/2 px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200"
                title="Start Date"
              />
              <span className="text-slate-400 text-xs">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-1/2 px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200"
                title="End Date"
              />
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/75 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Fund Category</th>
                <th className="py-3 px-4">Description / Activity</th>
                <th className="py-3 px-4">Source / Payee</th>
                <th className="py-3 px-4 text-right">Amount (PHP)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Docs</th>
                {isAdmin && <th className="py-3 px-4 text-right">Admin Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((rec) => {
                  const catMeta = CATEGORIES[rec.category] || CATEGORIES.general;
                  return (
                    <tr 
                      key={rec.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                        {rec.date}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {rec.referenceCode || '—'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${catMeta.bgLight}`}>
                          {catMeta.shortLabel}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {rec.title}
                        </div>
                        {rec.notes && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                            {rec.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-700 dark:text-slate-300">
                        {rec.sourceOrPayee}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-right font-mono font-bold">
                        <span className={rec.type === 'collection' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                          {rec.type === 'collection' ? '+' : '-'}₱{rec.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        {getStatusBadge(rec.status)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        {rec.documents && rec.documents.length > 0 ? (
                          <button
                            onClick={() => onViewDocument(rec.documents[0], rec.title)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-slate-700 dark:text-slate-300 hover:text-emerald-600 text-[11px] border border-slate-200 dark:border-slate-700 transition-colors"
                            title="Click to view attached document"
                          >
                            <Paperclip className="w-3 h-3 text-emerald-500" />
                            <span>{rec.documents.length}</span>
                          </button>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="py-3 px-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onEditRecord(rec)}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Edit record"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteRecord(rec.id, rec)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Delete record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <HelpCircle className="w-8 h-8 mx-auto text-slate-400" />
                      <div className="font-semibold text-sm text-slate-700 dark:text-slate-300">No records found</div>
                      <p className="text-xs">Try adjusting your search query, status filters, or date range.</p>
                    </div>
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
