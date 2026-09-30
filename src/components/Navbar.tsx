import React, { useState } from 'react';
import { 
  Shield, 
  ShieldCheck, 
  FileSpreadsheet, 
  RefreshCw, 
  Lock, 
  LogOut, 
  FileText, 
  BarChart3, 
  Coins, 
  ShoppingBag, 
  Shirt, 
  Layers, 
  History,
  Menu,
  X,
  ExternalLink
} from 'lucide-react';
import { CategoryKey } from '../types/transparency';
import { GoogleSheetsConfig } from '../types/transparency';

interface NavbarProps {
  isAdmin: boolean;
  onOpenLogin: () => void;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sheetsConfig: GoogleSheetsConfig;
  onOpenSheetsModal: () => void;
  onOpenReportsModal: () => void;
  onQuickSync: () => void;
  isSyncing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  isAdmin,
  onOpenLogin,
  onLogout,
  activeTab,
  setActiveTab,
  sheetsConfig,
  onOpenSheetsModal,
  onOpenReportsModal,
  onQuickSync,
  isSyncing,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'main', label: 'Main Dashboard', icon: BarChart3 },
    { id: 'general', label: 'General Batch Funds', icon: Coins },
    { id: 'selling', label: 'Selling Activities', icon: ShoppingBag },
    { id: 'batch_jersey', label: 'Batch Jersey', icon: Shirt },
    { id: 'mol_blue', label: 'MOL Blue Jersey', icon: Shirt },
    { id: 'mmc_white', label: 'MMC White Jersey', icon: Shirt },
    { id: 'audit_log', label: 'Audit Log', icon: History },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      {/* Top Banner / Access Status */}
      <div className="bg-slate-900 text-white text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px]">
              BATCH 2026 OFFICIAL
            </span>
            <span className="hidden sm:inline text-slate-300">
              Morphonoveons Centralized Financial Transparency System
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Google Sheets Status Pill */}
            <button
              onClick={onOpenSheetsModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600"
              title="Google Sheets Auto-Sync Settings"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {sheetsConfig.spreadsheetId 
                  ? sheetsConfig.lastSyncStatus === 'success' 
                    ? 'Sheets: Connected' 
                    : 'Sheets: Attention'
                  : 'Sheets: Setup Sync'}
              </span>
            </button>

            {/* Access Level Badge */}
            <div className="flex items-center gap-1.5">
              {isAdmin ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  ADMINISTRATOR MODE
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium text-[11px] bg-slate-800 text-slate-300 border border-slate-700">
                  <Shield className="w-3 h-3 text-slate-400" />
                  BATCH MEMBER (VIEW-ONLY)
                </span>
              )}
            </div>

            {isAdmin ? (
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-1 text-slate-300 hover:text-rose-300 transition-colors text-[11px] font-medium ml-1"
                title="Log out of admin session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Logout</span>
              </button>
            ) : (
              <button
                onClick={onOpenLogin}
                className="inline-flex items-center gap-1 text-slate-300 hover:text-amber-300 transition-colors text-[11px] font-medium ml-1"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Admin Login</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex items-center justify-between">
          {/* Logo & Portal Title */}
          <div 
            onClick={() => setActiveTab('main')}
            className="cursor-pointer flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 font-bold tracking-wider text-lg ring-2 ring-emerald-500/20">
              MN
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Morphonoveons Transparency Website
                </h1>
              </div>
              <p className="text-xs font-semibold tracking-wider uppercase text-emerald-600 dark:text-emerald-400">
                Batch 2026 Transparency Portal
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="hidden lg:flex items-center gap-2.5">
            <button
              onClick={onQuickSync}
              disabled={isSyncing}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                isSyncing 
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700' 
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 shadow-sm'
              }`}
              title="Fetch latest data from Google Sheet"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-500 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Sheet'}</span>
            </button>

            <button
              onClick={onOpenReportsModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Financial Reports</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={onQuickSync}
              disabled={isSyncing}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Sync with Google Sheet"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-emerald-500' : ''}`} />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-left transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}

          <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenReportsModal();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800"
            >
              <FileText className="w-4 h-4" />
              Generate Financial Reports
            </button>

            <button
              onClick={() => {
                onOpenSheetsModal();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-lg"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              Configure Google Sheets Sync
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
