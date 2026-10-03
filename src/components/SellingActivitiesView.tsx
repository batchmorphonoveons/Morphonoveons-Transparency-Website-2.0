import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Search, 
  TrendingUp, 
  Tag, 
  Paperclip, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  DollarSign,
  Package
} from 'lucide-react';
import { SellingActivityRecord, DocumentAttachment, FinancialStatus } from '../types/transparency';

interface SellingActivitiesViewProps {
  isAdmin: boolean;
  sellingRecords: SellingActivityRecord[];
  onOpenAdd: () => void;
  onEdit: (record: SellingActivityRecord) => void;
  onDelete: (id: string, record: SellingActivityRecord) => void;
      onViewDocument: (doc: DocumentAttachment, title: string, docs?: DocumentAttachment[]) => void;
}

export const SellingActivitiesView: React.FC<SellingActivitiesViewProps> = ({
  isAdmin,
  sellingRecords,
  onOpenAdd,
  onEdit,
  onDelete,
  onViewDocument,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Overall selling calculations
  const totalGrossSales = useMemo(() => {
    return sellingRecords.reduce((sum, r) => sum + r.grossSales, 0);
  }, [sellingRecords]);

  const totalProductionCosts = useMemo(() => {
    return sellingRecords.reduce((sum, r) => sum + r.productionCost, 0);
  }, [sellingRecords]);

  const totalNetProceeds = totalGrossSales - totalProductionCosts;

  const totalUnitsSold = useMemo(() => {
    return sellingRecords.reduce((sum, r) => sum + r.unitsSold, 0);
  }, [sellingRecords]);

  const filteredRecords = useMemo(() => {
    return sellingRecords.filter((r) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = r.title.toLowerCase().includes(q);
        const matchesDesc = r.description.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) return false;
      }
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      return true;
    });
  }, [sellingRecords, searchTerm, statusFilter]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
              SELLING ACTIVITIES & FUNDRAISERS
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-0.5">
            Merchandise Sales & Fundraisers
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Dedicated accounting for batch lanyards, sticker packs, tote bags, and activity food booths.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={onOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Selling Activity</span>
          </button>
        )}
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Gross Sales */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
            Total Gross Sales
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
            ₱{totalGrossSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Across all items & projects</div>
        </div>

        {/* Production Costs */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
            Production & Capital Costs
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 font-mono">
            ₱{totalProductionCosts.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Direct supplier & raw material costs</div>
        </div>

        {/* Net Proceeds */}
        <div className="p-5 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 shadow-sm">
          <div className="text-xs font-semibold uppercase text-emerald-800 dark:text-emerald-300">
            Total Net Proceeds (Profit)
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
            ₱{totalNetProceeds.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-1">
            Surplus added to Batch Treasury
          </div>
        </div>

        {/* Units Sold */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
            Total Units Released
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
            {totalUnitsSold.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Lanyards, stickers, food & bags</div>
        </div>
      </div>

      {/* Selling Activities Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/20">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search selling activity or merchandise item..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200"
          >
            <option value="all">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/75 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Merchandise / Activity</th>
                <th className="py-3 px-4 text-center">Units Sold</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-right">Gross Sales</th>
                <th className="py-3 px-4 text-right">Production Cost</th>
                <th className="py-3 px-4 text-right">Net Proceeds</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Docs</th>
                {isAdmin && <th className="py-3 px-4 text-right">Admin Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">{r.date}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{r.title}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{r.description}</div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-medium">{r.unitsSold}</td>
                    <td className="py-3 px-4 text-right font-mono">₱{r.unitPrice.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900 dark:text-white">
                      ₱{r.grossSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-rose-600 dark:text-rose-400">
                      ₱{r.productionCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ₱{r.netProceeds.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        r.status === 'Completed' 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                      }`}>
                        {r.status === 'Completed' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {r.documents && r.documents.length > 0 ? (
                        <button
                          onClick={() => onViewDocument(r.documents[0], r.title)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 text-slate-700 dark:text-slate-300 hover:text-amber-600 text-[11px] border border-slate-200 dark:border-slate-700"
                        >
                          <Paperclip className="w-3 h-3 text-amber-500" />
                          <span>{r.documents.length}</span>
                        </button>
                      ) : <span className="text-slate-400">—</span>}
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEdit(r)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDelete(r.id, r)}
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
                    No selling activities match the current filter.
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
