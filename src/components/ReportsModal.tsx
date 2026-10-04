import React from 'react';
import { X, Printer, Download, FileSpreadsheet, ShieldCheck, Calendar } from 'lucide-react';
import { 
  FinancialRecord, 
  SellingActivityRecord, 
  JerseyRecord, 
  CATEGORIES 
} from '../types/transparency';
import { exportAllDataAsCSV } from '../services/googleSheets';

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  financialRecords: FinancialRecord[];
  sellingRecords: SellingActivityRecord[];
  jerseyRecords: JerseyRecord[];
}

export const ReportsModal: React.FC<ReportsModalProps> = ({
  isOpen,
  onClose,
  financialRecords,
  sellingRecords,
  jerseyRecords,
}) => {
  if (!isOpen) return null;

  // Compute breakdown
  const generalColl = financialRecords
    .filter(r => r.category === 'general' && r.type === 'collection')
    .reduce((sum, r) => sum + r.amount, 0);
  const generalExp = financialRecords
    .filter(r => r.category === 'general' && r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0);

  const sellingGross = sellingRecords.reduce((sum, r) => sum + r.grossSales, 0);
  const sellingCosts = sellingRecords.reduce((sum, r) => sum + r.productionCost, 0);
  const sellingNet = sellingGross - sellingCosts;

  const batchJerseyColl = financialRecords
    .filter(r => r.category === 'batch_jersey' && r.type === 'collection')
    .reduce((sum, r) => sum + r.amount, 0);
  const batchJerseyExp = financialRecords
    .filter(r => r.category === 'batch_jersey' && r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0);

  const molBlueColl = financialRecords
    .filter(r => r.category === 'mol_blue' && r.type === 'collection')
    .reduce((sum, r) => sum + r.amount, 0);
  const molBlueExp = financialRecords
    .filter(r => r.category === 'mol_blue' && r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0);

  const mmcWhiteColl = financialRecords
    .filter(r => r.category === 'mmc_white' && r.type === 'collection')
    .reduce((sum, r) => sum + r.amount, 0);
  const mmcWhiteExp = financialRecords
    .filter(r => r.category === 'mmc_white' && r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0);

    const totalCollectionsAll = generalColl + sellingGross + batchJerseyColl;
   const totalExpensesAll = generalExp + sellingCosts + batchJerseyExp;
  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const csv = exportAllDataAsCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Morphonoveons_Financial_Statement_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Not printed */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Batch Financial Statement & Summary Report</h2>
              <p className="text-xs text-slate-400">Morphonoveons Batch 2026 Official Transparency Ledger</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white ml-2">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Statement Document */}
        <div className="p-8 overflow-y-auto space-y-6 print:p-0 print:m-0" id="printable-statement">
          {/* Statement Header */}
          <div className="border-b-2 border-slate-900 dark:border-slate-700 pb-5 text-center">
            <div className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">
              Official Transparency Documentation
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              Morphonoveons Batch 2026
            </h1>
            <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Consolidated Batch Financial Report & Cash Position Statement
            </h2>
            <div className="flex items-center justify-center gap-4 text-xs text-slate-500 mt-2">
              <span>Report Date: <strong>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></span>
              <span>•</span>
              <span>Audit Status: <strong>Verified</strong></span>
              <span>•</span>
              <span>Scope: <strong>All Batch Funds & Accounts</strong></span>
            </div>
          </div>

          {/* Consolidated Overall Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              1. Executive Summary & Category Fund Breakdown
            </h3>
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">Fund Category</th>
                    <th className="py-2.5 px-3 text-right">Total Collections / Gross</th>
                    <th className="py-2.5 px-3 text-right">Disbursements / Costs</th>
                    <th className="py-2.5 px-3 text-right">Available Fund Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="py-2 px-3 font-medium text-slate-900 dark:text-white">General Batch Funds</td>
                    <td className="py-2 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400">₱{generalColl.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="py-2 px-3 text-right font-mono text-rose-600 dark:text-rose-400">₱{generalExp.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">₱{(generalColl - generalExp).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium text-slate-900 dark:text-white">Selling Activities</td>
                    <td className="py-2 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400">₱{sellingGross.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="py-2 px-3 text-right font-mono text-rose-600 dark:text-rose-400">₱{sellingCosts.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">₱{sellingNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium text-slate-900 dark:text-white">Batch Official Jersey</td>
                    <td className="py-2 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400">₱{batchJerseyColl.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="py-2 px-3 text-right font-mono text-rose-600 dark:text-rose-400">₱{batchJerseyExp.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">₱{(batchJerseyColl - batchJerseyExp).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium text-slate-900 dark:text-white">MOL Blue Jersey</td>
                    <td className="py-2 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400">₱{molBlueColl.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="py-2 px-3 text-right font-mono text-rose-600 dark:text-rose-400">₱{molBlueExp.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">₱{(molBlueColl - molBlueExp).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium text-slate-900 dark:text-white">MMC White Jersey</td>
                    <td className="py-2 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400">₱{mmcWhiteColl.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="py-2 px-3 text-right font-mono text-rose-600 dark:text-rose-400">₱{mmcWhiteExp.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">₱{(mmcWhiteColl - mmcWhiteExp).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
                <tfoot className="bg-slate-900 text-white font-bold border-t-2 border-slate-900">
                  <tr>
                    <td className="py-2.5 px-3 uppercase tracking-wider">Total Consolidated Position</td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-300">₱{totalCollectionsAll.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-rose-300">₱{totalExpensesAll.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-300 text-sm">₱{availableBalanceTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

                   {/* Individual Category Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              2. Transparency Audit Certification
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              This financial report has been compiled and cross-referenced with all batch collection slips, bank receipts, and official supplier invoices. Funds are segregated into dedicated accounts to ensure zero fund mixing.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 mt-6 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <div className="h-8"></div>
                <div className="border-b border-slate-400 pb-1 mb-1 font-bold text-slate-900 dark:text-white text-center">
                  Stacy Salvador A. Mallorca
                </div>
                <div className="font-semibold text-slate-800 dark:text-slate-200 text-center">Batch Treasurer</div>
                <div className="text-[11px] text-slate-500 text-center">Prepared &amp; Recorded</div>
              </div>
              <div>
                <div className="h-8"></div>
                <div className="border-b border-slate-400 pb-1 mb-1 font-bold text-slate-900 dark:text-white text-center">
                  Jan Ramonelle B. Rabeje
                </div>
                <div className="font-semibold text-slate-800 dark:text-slate-200 text-center">Batch Auditor</div>
                <div className="text-[11px] text-slate-500 text-center">Audited &amp; Verified</div>
              </div>
              <div>
                <div className="h-8"></div>
                <div className="border-b border-slate-400 pb-1 mb-1 font-bold text-slate-900 dark:text-white text-center">
                  Cee-jay Zyre B. Manzano
                </div>
                <div className="font-semibold text-slate-800 dark:text-slate-200 text-center">Batch President</div>
                <div className="text-[11px] text-slate-500 text-center">Confirmed &amp; Published</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
