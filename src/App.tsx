/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { MainDashboard } from './components/MainDashboard';
import { CategoryDashboard } from './components/CategoryDashboard';
import { SellingActivitiesView } from './components/SellingActivitiesView';
import { JerseyRecordsView } from './components/JerseyRecordsView';
import { AuditLogView } from './components/AuditLogView';
import { AdminLoginModal } from './components/AdminLoginModal';
import { ReportsModal } from './components/ReportsModal';
import { RecordFormModal } from './components/RecordFormModal';
import { SellingFormModal } from './components/SellingFormModal';
import { JerseyFormModal } from './components/JerseyFormModal';
import { DocumentViewerModal } from './components/DocumentViewerModal';

import { 
  FinancialRecord, 
  SellingActivityRecord, 
  JerseyRecord, 
  AuditLog, 
  CategoryKey, 
  DocumentAttachment 
} from './types/transparency';
import { 
  getFinancialRecords, 
  saveFinancialRecords, 
  getSellingRecords, 
  saveSellingRecords, 
  getJerseyRecords, 
  saveJerseyRecords, 
  getAuditLogs, 
  addAuditLog, 
  subscribeToData
} from './services/storage';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  // Session & Auth state
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // App dataset state
  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>(() => getFinancialRecords());
  const [sellingRecords, setSellingRecords] = useState<SellingActivityRecord[]>(() => getSellingRecords());
  const [jerseyRecords, setJerseyRecords] = useState<JerseyRecord[]>(() => getJerseyRecords());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => getAuditLogs());

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<string>('main');

  // Modals
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);

  // Record Form Modal state
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<FinancialRecord | null>(null);
  const [defaultCategory, setDefaultCategory] = useState<CategoryKey>('general');
  const [defaultType, setDefaultType] = useState<'collection' | 'expense'>('collection');

  // Selling Activity Form Modal state
  const [isSellingModalOpen, setIsSellingModalOpen] = useState(false);
  const [sellingToEdit, setSellingToEdit] = useState<SellingActivityRecord | null>(null);

  // Jersey Record Form Modal state
  const [isJerseyModalOpen, setIsJerseyModalOpen] = useState(false);
  const [jerseyToEdit, setJerseyToEdit] = useState<JerseyRecord | null>(null);
  const [defaultJerseyType, setDefaultJerseyType] = useState<'batch_jersey' | 'mol_blue' | 'mmc_white'>('batch_jersey');

  // Document Viewer Modal state
  const [viewingDoc, setViewingDoc] = useState<DocumentAttachment | null>(null);
  const [viewingDocTitle, setViewingDocTitle] = useState<string>('');
  const [viewingDocs, setViewingDocs] = useState<DocumentAttachment[]>([]);

  // Toast / notification feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Reload state from storage
  const reloadData = useCallback(() => {
    setFinancialRecords(getFinancialRecords());
    setSellingRecords(getSellingRecords());
    setJerseyRecords(getJerseyRecords());
    setAuditLogs(getAuditLogs());
  }, []);

  // Stay signed in as administrator while a Firebase admin session exists
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdmin(!!user);
    });
    return () => unsubscribe();
  }, []);

  // Show new records from the shared database as soon as they arrive
  useEffect(() => {
    reloadData();
    return subscribeToData(reloadData);
  }, [reloadData]);

  // Admin Login / Logout
  const handleLoginSuccess = () => {
    setIsAdmin(true);
    showToast('Administrator access granted.');
  };

  const handleLogout = () => {
    signOut(auth).catch(() => {});
    setIsAdmin(false);
    showToast('Logged out. Switched to Batch Member View-Only mode.');
  };

  // Financial Record handlers
  const handleSaveFinancialRecord = (
    record: FinancialRecord, 
    isNew: boolean, 
    previousSnapshot?: FinancialRecord
  ) => {
    const existing = getFinancialRecords();
    let updated: FinancialRecord[];

    if (isNew) {
      updated = [record, ...existing];
      addAuditLog(
        'Created',
        record.category.replace('_', ' ').toUpperCase(),
        record.title,
        `Added ${record.type}: ₱${record.amount.toFixed(2)} | Status: ${record.status} | Source/Payee: ${record.sourceOrPayee}`
      );
    } else {
      updated = existing.map((r) => (r.id === record.id ? record : r));
      const prevInfo = previousSnapshot 
        ? `Prev: ₱${previousSnapshot.amount.toFixed(2)} (${previousSnapshot.status})` 
        : 'Existing record';
      addAuditLog(
        'Updated',
        record.category.replace('_', ' ').toUpperCase(),
        record.title,
        `Updated ${record.type}: ₱${record.amount.toFixed(2)} | Status: ${record.status} | Source/Payee: ${record.sourceOrPayee}`,
        prevInfo
      );
    }

    saveFinancialRecords(updated);
    setFinancialRecords(updated);
    setAuditLogs(getAuditLogs());
    showToast(isNew ? 'Financial record added.' : 'Financial record updated.');
  };

  const handleDeleteFinancialRecord = (id: string, recordSnapshot: FinancialRecord) => {
    const existing = getFinancialRecords();
    const updated = existing.filter((r) => r.id !== id);
    saveFinancialRecords(updated);
    setFinancialRecords(updated);

    addAuditLog(
      'Deleted',
      recordSnapshot.category.replace('_', ' ').toUpperCase(),
      recordSnapshot.title,
      `Removed ${recordSnapshot.type} entry of ₱${recordSnapshot.amount.toFixed(2)} (${recordSnapshot.sourceOrPayee})`,
      `Amount: ₱${recordSnapshot.amount.toFixed(2)} | Ref: ${recordSnapshot.referenceCode || 'None'}`
    );
    setAuditLogs(getAuditLogs());
    showToast('Record deleted.');
  };

  // Selling Activity Record handlers
  const handleSaveSelling = (
    record: SellingActivityRecord, 
    isNew: boolean, 
    prevSnapshot?: SellingActivityRecord
  ) => {
    const existing = getSellingRecords();
    let updated: SellingActivityRecord[];

    if (isNew) {
      updated = [record, ...existing];
      addAuditLog(
        'Created',
        'Selling Activities',
        record.title,
        `Created merchandise activity: ${record.unitsSold} units @ ₱${record.unitPrice} | Gross: ₱${record.grossSales} | Net: ₱${record.netProceeds}`
      );
    } else {
      updated = existing.map((r) => (r.id === record.id ? record : r));
      addAuditLog(
        'Updated',
        'Selling Activities',
        record.title,
        `Updated sales: ${record.unitsSold} units | Gross: ₱${record.grossSales} | Net: ₱${record.netProceeds}`,
        prevSnapshot ? `Prev units: ${prevSnapshot.unitsSold} | Prev Gross: ₱${prevSnapshot.grossSales}` : 'None'
      );
    }

    saveSellingRecords(updated);
    setSellingRecords(updated);
    setAuditLogs(getAuditLogs());
    showToast(isNew ? 'Selling activity created.' : 'Selling activity updated.');
  };

  const handleDeleteSelling = (id: string, recordSnapshot: SellingActivityRecord) => {
    const existing = getSellingRecords();
    const updated = existing.filter((r) => r.id !== id);
    saveSellingRecords(updated);
    setSellingRecords(updated);

    addAuditLog(
      'Deleted',
      'Selling Activities',
      recordSnapshot.title,
      `Deleted merchandise project (${recordSnapshot.unitsSold} units)`,
      `Gross: ₱${recordSnapshot.grossSales} | Net: ₱${recordSnapshot.netProceeds}`
    );
    setAuditLogs(getAuditLogs());
    showToast('Selling activity deleted.');
  };

  // Jersey Record handlers
  const handleSaveJersey = (
    record: JerseyRecord, 
    isNew: boolean, 
    prevSnapshot?: JerseyRecord
  ) => {
    const existing = getJerseyRecords();
    let updated: JerseyRecord[];

    if (isNew) {
      updated = [record, ...existing];
      addAuditLog(
        'Created',
        record.jerseyType.replace('_', ' ').toUpperCase(),
        `Order ${record.memberRef}`,
        `Size: ${record.jerseySize} | Paid: ₱${record.amountPaid} | Balance: ₱${record.balance} | Status: ${record.paymentStatus}`
      );
    } else {
      updated = existing.map((r) => (r.id === record.id ? record : r));
      addAuditLog(
        'Updated',
        record.jerseyType.replace('_', ' ').toUpperCase(),
        `Order ${record.memberRef}`,
        `Paid: ₱${record.amountPaid} | Balance: ₱${record.balance} | Status: ${record.paymentStatus} | Supplier: ${record.supplierPaymentStatus}`,
        prevSnapshot ? `Prev Paid: ₱${prevSnapshot.amountPaid} (${prevSnapshot.paymentStatus})` : 'None'
      );
    }

    saveJerseyRecords(updated);
    setJerseyRecords(updated);
    setAuditLogs(getAuditLogs());
    showToast(isNew ? 'Jersey order added.' : 'Jersey order updated.');
  };

  const handleDeleteJersey = (id: string, recordSnapshot: JerseyRecord) => {
    const existing = getJerseyRecords();
    const updated = existing.filter((r) => r.id !== id);
    saveJerseyRecords(updated);
    setJerseyRecords(updated);

    addAuditLog(
      'Deleted',
      recordSnapshot.jerseyType.replace('_', ' ').toUpperCase(),
      `Order ${recordSnapshot.memberRef}`,
      `Removed order record for ${recordSnapshot.memberRef} (Size ${recordSnapshot.jerseySize})`,
      `Paid: ₱${recordSnapshot.amountPaid} | Balance: ₱${recordSnapshot.balance}`
    );
    setAuditLogs(getAuditLogs());
    showToast('Jersey order deleted.');
  };

  const handleQuickUpdateJerseyStatus = (id: string, newStatus: 'Paid' | 'Partially Paid' | 'Unpaid') => {
    const existing = getJerseyRecords();
    const record = existing.find((r) => r.id === id);
    if (!record) return;

    let newPaid = record.amountPaid;
    if (newStatus === 'Paid') newPaid = record.unitPrice;
    if (newStatus === 'Unpaid') newPaid = 0;
    const newBalance = Math.max(0, record.unitPrice - newPaid);

    const updated = existing.map((r) =>
      r.id === id
        ? {
            ...r,
            paymentStatus: newStatus,
            amountPaid: newPaid,
            balance: newBalance,
            updatedAt: new Date().toISOString(),
          }
        : r
    );

    saveJerseyRecords(updated);
    setJerseyRecords(updated);

    addAuditLog(
      'Status Changed',
      record.jerseyType.replace('_', ' ').toUpperCase(),
      `Order ${record.memberRef}`,
      `Payment status updated to "${newStatus}" (Paid: ₱${newPaid.toFixed(2)})`,
      `Previous: ${record.paymentStatus} (Paid: ₱${record.amountPaid.toFixed(2)})`
    );
    setAuditLogs(getAuditLogs());
    showToast(`Order status updated to ${newStatus}.`);
  };

  const handleQuickUpdateJerseySupplier = (id: string, newStatus: 'Completed' | 'Pending') => {
    const existing = getJerseyRecords();
    const record = existing.find((r) => r.id === id);
    if (!record) return;

    const updated = existing.map((r) =>
      r.id === id
        ? {
            ...r,
            supplierPaymentStatus: newStatus,
            updatedAt: new Date().toISOString(),
          }
        : r
    );

    saveJerseyRecords(updated);
    setJerseyRecords(updated);

    addAuditLog(
      'Status Changed',
      record.jerseyType.replace('_', ' ').toUpperCase(),
      `Order ${record.memberRef}`,
      `Supplier payment status changed to "${newStatus}"`,
      `Previous: ${record.supplierPaymentStatus}`
    );
    setAuditLogs(getAuditLogs());
    showToast(`Supplier status updated to ${newStatus}.`);
  };

  // Open Document Viewer
     const handleViewDocument = (
     doc: DocumentAttachment,
     title: string,
     docs?: DocumentAttachment[]
   ) => {
     let siblings: DocumentAttachment[] = docs && docs.length > 0 ? docs : [doc];

     if (!docs || docs.length === 0) {
       const allRecords: any[] = [...financialRecords, ...sellingRecords, ...jerseyRecords];
       outer: for (const rec of allRecords) {
         for (const value of Object.values(rec)) {
           if (
             Array.isArray(value) &&
             value.some((d: any) => d && typeof d === 'object' && d.name === doc.name && d.dataUrl === doc.dataUrl)
           ) {
             siblings = value as DocumentAttachment[];
             break outer;
           }
         }
       }
     }

     setViewingDocs(siblings);
     setViewingDoc(doc);
     setViewingDocTitle(title);
   };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 text-xs animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        isAdmin={isAdmin}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReportsModal={() => setIsReportsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'main' && (
          <MainDashboard
            isAdmin={isAdmin}
            financialRecords={financialRecords}
            sellingRecords={sellingRecords}
            jerseyRecords={jerseyRecords}
            onSelectCategory={(cat) => setActiveTab(cat)}
            onOpenAddRecord={(cat, type) => {
              setDefaultCategory(cat || 'general');
              setDefaultType(type || 'collection');
              setRecordToEdit(null);
              setIsRecordModalOpen(true);
            }}
            onEditRecord={(rec) => {
              setRecordToEdit(rec);
              setIsRecordModalOpen(true);
            }}
            onDeleteRecord={handleDeleteFinancialRecord}
            onViewDocument={handleViewDocument}
          />
        )}

        {activeTab === 'general' && (
          <CategoryDashboard
            categoryKey="general"
            isAdmin={isAdmin}
            financialRecords={financialRecords}
            onBack={() => setActiveTab('main')}
            onOpenAddRecord={(cat, type) => {
              setDefaultCategory(cat);
              setDefaultType(type);
              setRecordToEdit(null);
              setIsRecordModalOpen(true);
            }}
            onEditRecord={(rec) => {
              setRecordToEdit(rec);
              setIsRecordModalOpen(true);
            }}
            onDeleteRecord={handleDeleteFinancialRecord}
            onViewDocument={handleViewDocument}
          />
        )}

        {activeTab === 'selling' && (
          <SellingActivitiesView
            isAdmin={isAdmin}
            sellingRecords={sellingRecords}
            onOpenAdd={() => {
              setSellingToEdit(null);
              setIsSellingModalOpen(true);
            }}
            onEdit={(rec) => {
              setSellingToEdit(rec);
              setIsSellingModalOpen(true);
            }}
            onDelete={handleDeleteSelling}
            onViewDocument={handleViewDocument}
          />
        )}

        {activeTab === 'batch_jersey' && (
          <JerseyRecordsView
            jerseyType="batch_jersey"
            title="Batch Official Jersey Fund"
            subtitle="Official batch jersey collections, sizing roster, and production disbursements to manufacturer"
            themeColor="indigo"
            isAdmin={isAdmin}
            jerseyRecords={jerseyRecords}
            financialRecords={financialRecords}
            onOpenAddOrder={() => {
              setJerseyToEdit(null);
              setDefaultJerseyType('batch_jersey');
              setIsJerseyModalOpen(true);
            }}
            onOpenAddFinancial={(type) => {
              setDefaultCategory('batch_jersey');
              setDefaultType(type);
              setRecordToEdit(null);
              setIsRecordModalOpen(true);
            }}
            onEditJersey={(rec) => {
              setJerseyToEdit(rec);
              setDefaultJerseyType('batch_jersey');
              setIsJerseyModalOpen(true);
            }}
            onDeleteJersey={handleDeleteJersey}
            onQuickUpdateStatus={handleQuickUpdateJerseyStatus}
            onQuickUpdateSupplier={handleQuickUpdateJerseySupplier}
            onViewDocument={handleViewDocument}
          />
        )}

        {activeTab === 'mol_blue' && (
          <JerseyRecordsView
            jerseyType="mol_blue"
            title="MOL Blue Jersey Fund"
            subtitle="MOL Blue Department sports jersey fees, player orders, and apparel manufacturer payments"
            themeColor="blue"
            isAdmin={isAdmin}
            jerseyRecords={jerseyRecords}
            financialRecords={financialRecords}
            onOpenAddOrder={() => {
              setJerseyToEdit(null);
              setDefaultJerseyType('mol_blue');
              setIsJerseyModalOpen(true);
            }}
            onOpenAddFinancial={(type) => {
              setDefaultCategory('mol_blue');
              setDefaultType(type);
              setRecordToEdit(null);
              setIsRecordModalOpen(true);
            }}
            onEditJersey={(rec) => {
              setJerseyToEdit(rec);
              setDefaultJerseyType('mol_blue');
              setIsJerseyModalOpen(true);
            }}
            onDeleteJersey={handleDeleteJersey}
            onQuickUpdateStatus={handleQuickUpdateJerseyStatus}
            onQuickUpdateSupplier={handleQuickUpdateJerseySupplier}
            onViewDocument={handleViewDocument}
          />
        )}

        {activeTab === 'mmc_white' && (
          <JerseyRecordsView
            jerseyType="mmc_white"
            title="MMC White Jersey Fund"
            subtitle="MMC White Department sports jersey fees, participant orders, and fabrication disbursements"
            themeColor="teal"
            isAdmin={isAdmin}
            jerseyRecords={jerseyRecords}
            financialRecords={financialRecords}
            onOpenAddOrder={() => {
              setJerseyToEdit(null);
              setDefaultJerseyType('mmc_white');
              setIsJerseyModalOpen(true);
            }}
            onOpenAddFinancial={(type) => {
              setDefaultCategory('mmc_white');
              setDefaultType(type);
              setRecordToEdit(null);
              setIsRecordModalOpen(true);
            }}
            onEditJersey={(rec) => {
              setJerseyToEdit(rec);
              setDefaultJerseyType('mmc_white');
              setIsJerseyModalOpen(true);
            }}
            onDeleteJersey={handleDeleteJersey}
            onQuickUpdateStatus={handleQuickUpdateJerseyStatus}
            onQuickUpdateSupplier={handleQuickUpdateJerseySupplier}
            onViewDocument={handleViewDocument}
          />
        )}

        {activeTab === 'audit_log' && (
          <AuditLogView logs={auditLogs} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 mt-12 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Morphonoveons Batch 2026
            </span>
            <span>•</span>
            <span>Centralized Transparency & Financial Governance Portal</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsReportsModalOpen(true)}
              className="hover:text-emerald-600 transition-colors"
            >
              Financial Statement
            </button>
          </div>
        </div>
      </footer>

      {/* Dialog Modals */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <ReportsModal
        isOpen={isReportsModalOpen}
        onClose={() => setIsReportsModalOpen(false)}
        financialRecords={financialRecords}
        sellingRecords={sellingRecords}
        jerseyRecords={jerseyRecords}
      />

      <RecordFormModal
        isOpen={isRecordModalOpen}
        onClose={() => {
          setIsRecordModalOpen(false);
          setRecordToEdit(null);
        }}
        recordToEdit={recordToEdit}
        defaultCategory={defaultCategory}
        defaultType={defaultType}
        onSave={handleSaveFinancialRecord}
        onDelete={handleDeleteFinancialRecord}
      />

      <SellingFormModal
        isOpen={isSellingModalOpen}
        onClose={() => {
          setIsSellingModalOpen(false);
          setSellingToEdit(null);
        }}
        recordToEdit={sellingToEdit}
        onSave={handleSaveSelling}
        onDelete={handleDeleteSelling}
      />

      <JerseyFormModal
        isOpen={isJerseyModalOpen}
        onClose={() => {
          setIsJerseyModalOpen(false);
          setJerseyToEdit(null);
        }}
        recordToEdit={jerseyToEdit}
        defaultJerseyType={defaultJerseyType}
        onSave={handleSaveJersey}
        onDelete={handleDeleteJersey}
      />

         <DocumentViewerModal
     document={viewingDoc}
     documents={viewingDocs}
     recordTitle={viewingDocTitle}
     onClose={() => {
       setViewingDoc(null);
       setViewingDocs([]);
       setViewingDocTitle('');
     }}
   />
    </div>
  );
}
