export type CategoryKey = 
  | 'general' 
  | 'selling' 
  | 'batch_jersey' 
  | 'mol_blue' 
  | 'mmc_white';

export interface CategoryMeta {
  key: CategoryKey;
  label: string;
  shortLabel: string;
  description: string;
  color: string;
  bgLight: string;
  borderColor: string;
}

export const CATEGORIES: Record<CategoryKey, CategoryMeta> = {
  general: {
    key: 'general',
    label: 'General Batch Funds',
    shortLabel: 'General Funds',
    description: 'Quarterly batch dues, solidarity contributions, and general operational funds.',
    color: 'emerald',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300',
    borderColor: 'border-emerald-500',
  },
  selling: {
    key: 'selling',
    label: 'Selling Activities',
    shortLabel: 'Selling Activities',
    description: 'Merchandise sales, fundraisers, snack drives, and project revenue.',
    color: 'amber',
    bgLight: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300',
    borderColor: 'border-amber-500',
  },
  batch_jersey: {
    key: 'batch_jersey',
    label: 'Batch Jersey',
    shortLabel: 'Batch Jersey',
    description: 'Official Morphonoveons Batch 2026 Jersey orders, collections, and vendor disbursements.',
    color: 'indigo',
    bgLight: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300',
    borderColor: 'border-indigo-500',
  },
  mol_blue: {
    key: 'mol_blue',
        label: 'MOL Blue & MMC White Jersey',
    shortLabel: 'MOL Blue & MMC White',
    description: 'Combined MOL Blue and MMC White sports jersey orders and fabrication costs.',
    color: 'blue',
    bgLight: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-500',
  },
  mmc_white: {
    key: 'mmc_white',
    label: 'MMC White Jersey',
    shortLabel: 'MMC White Jersey',
    description: 'MMC White Department sports jersey orders and fabrication costs.',
    color: 'teal',
    bgLight: 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300',
    borderColor: 'border-teal-500',
  },
};

export type FinancialStatus = 'Paid' | 'Partially Paid' | 'Unpaid' | 'Completed' | 'Pending';

export interface DocumentAttachment {
  id: string;
  name: string;
  type: string; // 'Receipt' | 'Proof of Payment' | 'Supplier Invoice' | 'Collection Sheet' | 'Other'
  dataUrl?: string; // base64 or external url
  uploadDate: string;
  size?: string;
}

export interface FinancialRecord {
  id: string;
  category: CategoryKey;
  type: 'collection' | 'expense';
  title: string;
  sourceOrPayee: string; // E.g., 'Section A Representative', 'Apex Sportswear Inc.' - NO IMAGINARY NAMES
  amount: number;
  date: string;
  status: FinancialStatus;
  notes?: string;
  documents: DocumentAttachment[];
  referenceCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SellingActivityRecord {
  id: string;
  title: string;
  description: string;
  unitsSold: number;
  unitPrice: number;
  grossSales: number; // unitsSold * unitPrice
  productionCost: number; // total cost
  netProceeds: number; // grossSales - productionCost
  status: FinancialStatus;
  date: string;
  documents: DocumentAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface JerseyRecord {
  id: string;
  jerseyType: 'batch_jersey' | 'mol_blue' | 'mmc_white';
  memberRef: string; // E.g. "BM-2026-012" or "Section B #14" - NO IMAGINARY NAMES
  jerseyNumber?: string;
  jerseySize: 'XS' | 'S' | 'M' | 'L' | 'XL' | '2XL' | '3XL';
  unitPrice: number;
  amountPaid: number;
  balance: number;
  paymentStatus: 'Paid' | 'Partially Paid' | 'Unpaid';
  supplierPaymentStatus: 'Completed' | 'Pending';
  supplierName?: string; // e.g. "Apex Sublimation Apparel"
  date: string;
  documents: DocumentAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: 'Created' | 'Updated' | 'Deleted' | 'Status Changed' | 'Document Attached' | 'Google Sheets Synced';
  recordCategory: string;
  recordTitle: string;
  previousInfo?: string;
  updatedInfo: string;
  adminActor: string; // e.g. "Authorized Officer"
}

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  sheetUrl: string;
  apiKey?: string;
  autoSyncEnabled: boolean;
  syncIntervalMinutes: number;
  lastSyncedAt?: string;
  lastSyncStatus?: 'success' | 'error' | 'idle';
  lastSyncMessage?: string;
}
