import { 
  FinancialRecord, 
  SellingActivityRecord, 
  JerseyRecord, 
  AuditLog, 
  GoogleSheetsConfig,
  CategoryKey 
} from '../types/transparency';

const STORAGE_KEYS = {
  FINANCIAL_RECORDS: 'morphonoveons_financial_records_v1',
  SELLING_RECORDS: 'morphonoveons_selling_records_v1',
  JERSEY_RECORDS: 'morphonoveons_jersey_records_v1',
  AUDIT_LOGS: 'morphonoveons_audit_logs_v1',
  SHEETS_CONFIG: 'morphonoveons_sheets_config_v1',
  ADMIN_SESSION: 'morphonoveons_admin_session_v1',
};

export const ADMIN_PASSWORD = 'Morbulutong2026';

const initialFinancialRecords: FinancialRecord[] = [
  // General Batch Funds
  {
    id: 'rec-gen-001',
    category: 'general',
    type: 'collection',
    title: 'Batch Dues 1st Semester - Section Alpha (35 Members)',
    sourceOrPayee: 'Section Alpha Representative',
    amount: 17500,
    date: '2026-08-15',
    status: 'Paid',
    notes: 'Full collection for Q1 & Q2 batch operational dues.',
    documents: [
      {
        id: 'doc-001',
        name: 'Section_Alpha_Acknowledgement_Receipt.pdf',
        type: 'Receipt',
        uploadDate: '2026-08-15',
        size: '142 KB'
      }
    ],
    referenceCode: 'COLL-GEN-2026-001',
    createdAt: '2026-08-15T09:30:00Z',
    updatedAt: '2026-08-15T09:30:00Z',
  },
  {
    id: 'rec-gen-002',
    category: 'general',
    type: 'collection',
    title: 'Batch Dues 1st Semester - Section Bravo (32 Members)',
    sourceOrPayee: 'Section Bravo Representative',
    amount: 16000,
    date: '2026-08-16',
    status: 'Paid',
    notes: 'Dues remitted through official council treasury deposit.',
    documents: [
      {
        id: 'doc-002',
        name: 'Section_Bravo_Bank_Slip.pdf',
        type: 'Proof of Payment',
        uploadDate: '2026-08-16',
        size: '210 KB'
      }
    ],
    referenceCode: 'COLL-GEN-2026-002',
    createdAt: '2026-08-16T11:15:00Z',
    updatedAt: '2026-08-16T11:15:00Z',
  },
  {
    id: 'rec-gen-003',
    category: 'general',
    type: 'collection',
    title: 'Batch Dues 1st Semester - Section Charlie (30 Members)',
    sourceOrPayee: 'Section Charlie Representative',
    amount: 15000,
    date: '2026-08-18',
    status: 'Paid',
    notes: 'Remitted via treasury cash handover with signed collection sheet.',
    documents: [
      {
        id: 'doc-003',
        name: 'Collection_Sheet_Section_C.pdf',
        type: 'Collection Sheet',
        uploadDate: '2026-08-18',
        size: '340 KB'
      }
    ],
    referenceCode: 'COLL-GEN-2026-003',
    createdAt: '2026-08-18T14:00:00Z',
    updatedAt: '2026-08-18T14:00:00Z',
  },
  {
    id: 'rec-gen-004',
    category: 'general',
    type: 'collection',
    title: 'Batch Solidarity Contribution & Alumni Seed Fund',
    sourceOrPayee: 'Alumni Support Committee Rep',
    amount: 7500,
    date: '2026-09-02',
    status: 'Paid',
    notes: 'Voluntary development fund contribution.',
    documents: [],
    referenceCode: 'COLL-GEN-2026-004',
    createdAt: '2026-09-02T10:00:00Z',
    updatedAt: '2026-09-02T10:00:00Z',
  },
  {
    id: 'rec-gen-005',
    category: 'general',
    type: 'expense',
    title: 'General Assembly Hall Rental & Audio-Visual Systems',
    sourceOrPayee: 'University Student Activity Center',
    amount: 6500,
    date: '2026-08-25',
    status: 'Paid',
    notes: 'Official booking receipt for the 2026 General Batch Convocation.',
    documents: [
      {
        id: 'doc-004',
        name: 'Official_Receipt_Hall_Rental.pdf',
        type: 'Receipt',
        uploadDate: '2026-08-25',
        size: '185 KB'
      }
    ],
    referenceCode: 'EXP-GEN-2026-001',
    createdAt: '2026-08-25T16:20:00Z',
    updatedAt: '2026-08-25T16:20:00Z',
  },
  {
    id: 'rec-gen-006',
    category: 'general',
    type: 'expense',
    title: 'Official Stationery, Logbooks & Receipt Booklets',
    sourceOrPayee: 'Campus Central Supply Store',
    amount: 1450,
    date: '2026-08-28',
    status: 'Paid',
    notes: 'Treasury auditing materials, receipt books, and verification stamps.',
    documents: [],
    referenceCode: 'EXP-GEN-2026-002',
    createdAt: '2026-08-28T09:40:00Z',
    updatedAt: '2026-08-28T09:40:00Z',
  },
  {
    id: 'rec-gen-007',
    category: 'general',
    type: 'expense',
    title: 'Orientation Tarpaulin Banner & Program Printing',
    sourceOrPayee: 'PrintMaster Digital Media Services',
    amount: 2800,
    date: '2026-09-05',
    status: 'Paid',
    notes: '2 high-grade canvas banners and 250 orientation guides.',
    documents: [
      {
        id: 'doc-005',
        name: 'Invoice_PrintMaster_2026.pdf',
        type: 'Supplier Invoice',
        uploadDate: '2026-09-05',
        size: '120 KB'
      }
    ],
    referenceCode: 'EXP-GEN-2026-003',
    createdAt: '2026-09-05T13:00:00Z',
    updatedAt: '2026-09-05T13:00:00Z',
  },

  // Batch Jersey Funds
  {
    id: 'rec-jrs-001',
    category: 'batch_jersey',
    type: 'collection',
    title: 'Batch Official Jersey - Batch Remittance 1 (50 Units)',
    sourceOrPayee: 'Class Treasury Committee',
    amount: 37500,
    date: '2026-08-30',
    status: 'Paid',
    notes: 'Collected payments for official Batch 2026 dark edition jerseys.',
    documents: [],
    referenceCode: 'COLL-JRS-2026-001',
    createdAt: '2026-08-30T10:00:00Z',
    updatedAt: '2026-08-30T10:00:00Z',
  },
  {
    id: 'rec-jrs-002',
    category: 'batch_jersey',
    type: 'collection',
    title: 'Batch Official Jersey - Batch Remittance 2 (30 Units)',
    sourceOrPayee: 'Class Treasury Committee',
    amount: 22500,
    date: '2026-09-10',
    status: 'Paid',
    notes: 'Collected payments for remaining batch units.',
    documents: [],
    referenceCode: 'COLL-JRS-2026-002',
    createdAt: '2026-09-10T14:30:00Z',
    updatedAt: '2026-09-10T14:30:00Z',
  },
  {
    id: 'rec-jrs-003',
    category: 'batch_jersey',
    type: 'expense',
    title: 'Manufacturer Downpayment (50% Production Advance)',
    sourceOrPayee: 'Apex Sportswear Apparel Inc.',
    amount: 28000,
    date: '2026-09-01',
    status: 'Paid',
    notes: 'Bank transfer for fabric cutting and full sublimation setup.',
    documents: [
      {
        id: 'doc-006',
        name: 'Apex_Official_Deposit_Voucher.pdf',
        type: 'Supplier Invoice',
        uploadDate: '2026-09-01',
        size: '290 KB'
      }
    ],
    referenceCode: 'EXP-JRS-2026-001',
    createdAt: '2026-09-01T15:00:00Z',
    updatedAt: '2026-09-01T15:00:00Z',
  },

  // MOL Blue Jersey Funds
  {
    id: 'rec-mol-001',
    category: 'mol_blue',
    type: 'collection',
    title: 'MOL Blue Department Team Jersey Collections (32 Units)',
    sourceOrPayee: 'MOL Department Representative',
    amount: 24000,
    date: '2026-09-04',
    status: 'Paid',
    notes: 'Player and supporter jersey fee collections.',
    documents: [],
    referenceCode: 'COLL-MOL-2026-001',
    createdAt: '2026-09-04T11:00:00Z',
    updatedAt: '2026-09-04T11:00:00Z',
  },
  {
    id: 'rec-mol-002',
    category: 'mol_blue',
    type: 'expense',
    title: 'MOL Blue Production Advance & Screen Sizing Samples',
    sourceOrPayee: 'Apex Sportswear Apparel Inc.',
    amount: 14000,
    date: '2026-09-06',
    status: 'Paid',
    notes: 'Fabric allotment and sizing kit for MOL Blue contingent.',
    documents: [
      {
        id: 'doc-007',
        name: 'MOL_Blue_Supplier_Invoice.pdf',
        type: 'Supplier Invoice',
        uploadDate: '2026-09-06',
        size: '220 KB'
      }
    ],
    referenceCode: 'EXP-MOL-2026-001',
    createdAt: '2026-09-06T16:00:00Z',
    updatedAt: '2026-09-06T16:00:00Z',
  },

  // MMC White Jersey Funds
  {
    id: 'rec-mmc-001',
    category: 'mmc_white',
    type: 'collection',
    title: 'MMC White Department Team Jersey Collections (28 Units)',
    sourceOrPayee: 'MMC Department Representative',
    amount: 21000,
    date: '2026-09-08',
    status: 'Paid',
    notes: 'MMC Department tournament jersey dues.',
    documents: [],
    referenceCode: 'COLL-MMC-2026-001',
    createdAt: '2026-09-08T10:30:00Z',
    updatedAt: '2026-09-08T10:30:00Z',
  },
  {
    id: 'rec-mmc-002',
    category: 'mmc_white',
    type: 'expense',
    title: 'MMC White Sublimation Deposit & Sample Fitting Fee',
    sourceOrPayee: 'Apex Sportswear Apparel Inc.',
    amount: 12500,
    date: '2026-09-09',
    status: 'Paid',
    notes: 'Initial production deposit to proceed with sewing.',
    documents: [
      {
        id: 'doc-008',
        name: 'MMC_White_Payment_Slip.pdf',
        type: 'Proof of Payment',
        uploadDate: '2026-09-09',
        size: '175 KB'
      }
    ],
    referenceCode: 'EXP-MMC-2026-001',
    createdAt: '2026-09-09T14:00:00Z',
    updatedAt: '2026-09-09T14:00:00Z',
  },
];

const initialSellingRecords: SellingActivityRecord[] = [
  {
    id: 'sell-001',
    title: 'Morphonoveons 2026 Signature Lanyards',
    description: 'Double-sided satin lanyards with metal swivel hook & safety breakaway.',
    unitsSold: 150,
    unitPrice: 120,
    grossSales: 18000,
    productionCost: 8250,
    netProceeds: 9750,
    status: 'Completed',
    date: '2026-08-20',
    documents: [
      {
        id: 'doc-s1',
        name: 'Lanyard_Fabrication_Invoice.pdf',
        type: 'Supplier Invoice',
        uploadDate: '2026-08-20',
        size: '310 KB'
      }
    ],
    createdAt: '2026-08-20T10:00:00Z',
    updatedAt: '2026-08-20T10:00:00Z',
  },
  {
    id: 'sell-002',
    title: 'Batch 2026 Die-Cut Vinyl Sticker Pack',
    description: 'Weatherproof matte sticker packs featuring batch crests and icons (4 designs/pack).',
    unitsSold: 220,
    unitPrice: 50,
    grossSales: 11000,
    productionCost: 3850,
    netProceeds: 7150,
    status: 'Completed',
    date: '2026-08-22',
    documents: [],
    createdAt: '2026-08-22T14:00:00Z',
    updatedAt: '2026-08-22T14:00:00Z',
  },
  {
    id: 'sell-003',
    title: 'Sportsfest Refreshment & Snack Booth',
    description: 'Energy snacks, bottled water, and fruit juice booth during inter-batch games.',
    unitsSold: 200,
    unitPrice: 75,
    grossSales: 15000,
    productionCost: 7200,
    netProceeds: 7800,
    status: 'Completed',
    date: '2026-09-12',
    documents: [
      {
        id: 'doc-s2',
        name: 'Food_Ingredients_Receipts_Consolidated.pdf',
        type: 'Receipt',
        uploadDate: '2026-09-12',
        size: '415 KB'
      }
    ],
    createdAt: '2026-09-12T17:00:00Z',
    updatedAt: '2026-09-12T17:00:00Z',
  },
  {
    id: 'sell-004',
    title: 'Heavyweight Canvas Tote Bags - Batch Edition',
    description: 'Eco-friendly screen-printed cotton canvas tote bags for batch members.',
    unitsSold: 60,
    unitPrice: 220,
    grossSales: 13200,
    productionCost: 7200,
    netProceeds: 6000,
    status: 'Pending',
    date: '2026-09-24',
    documents: [],
    createdAt: '2026-09-24T09:00:00Z',
    updatedAt: '2026-09-24T09:00:00Z',
  },
];

const initialJerseyRecords: JerseyRecord[] = [
  // Batch Official Jersey
  {
    id: 'jrs-001',
    jerseyType: 'batch_jersey',
    memberRef: 'BM-2026-001',
    jerseyNumber: '07',
    jerseySize: 'L',
    unitPrice: 750,
    amountPaid: 750,
    balance: 0,
    paymentStatus: 'Paid',
    supplierPaymentStatus: 'Completed',
    supplierName: 'Apex Sportswear Apparel Inc.',
    date: '2026-08-30',
    documents: [],
    createdAt: '2026-08-30T10:00:00Z',
    updatedAt: '2026-08-30T10:00:00Z',
  },
  {
    id: 'jrs-002',
    jerseyType: 'batch_jersey',
    memberRef: 'BM-2026-002',
    jerseyNumber: '10',
    jerseySize: 'M',
    unitPrice: 750,
    amountPaid: 750,
    balance: 0,
    paymentStatus: 'Paid',
    supplierPaymentStatus: 'Completed',
    supplierName: 'Apex Sportswear Apparel Inc.',
    date: '2026-08-30',
    documents: [],
    createdAt: '2026-08-30T10:05:00Z',
    updatedAt: '2026-08-30T10:05:00Z',
  },
  {
    id: 'jrs-003',
    jerseyType: 'batch_jersey',
    memberRef: 'BM-2026-003',
    jerseyNumber: '23',
    jerseySize: 'XL',
    unitPrice: 750,
    amountPaid: 400,
    balance: 350,
    paymentStatus: 'Partially Paid',
    supplierPaymentStatus: 'Pending',
    supplierName: 'Apex Sportswear Apparel Inc.',
    date: '2026-08-31',
    documents: [],
    createdAt: '2026-08-31T11:00:00Z',
    updatedAt: '2026-08-31T11:00:00Z',
  },
  {
    id: 'jrs-004',
    jerseyType: 'batch_jersey',
    memberRef: 'BM-2026-004',
    jerseyNumber: '18',
    jerseySize: 'S',
    unitPrice: 750,
    amountPaid: 0,
    balance: 750,
    paymentStatus: 'Unpaid',
    supplierPaymentStatus: 'Pending',
    supplierName: 'Apex Sportswear Apparel Inc.',
    date: '2026-09-01',
    documents: [],
    createdAt: '2026-09-01T09:00:00Z',
    updatedAt: '2026-09-01T09:00:00Z',
  },

  // MOL Blue Jersey
  {
    id: 'jrs-mol-001',
    jerseyType: 'mol_blue',
    memberRef: 'MOL-BLUE-01',
    jerseyNumber: '11',
    jerseySize: 'M',
    unitPrice: 750,
    amountPaid: 750,
    balance: 0,
    paymentStatus: 'Paid',
    supplierPaymentStatus: 'Completed',
    supplierName: 'Apex Sportswear Apparel Inc.',
    date: '2026-09-04',
    documents: [],
    createdAt: '2026-09-04T11:00:00Z',
    updatedAt: '2026-09-04T11:00:00Z',
  },
  {
    id: 'jrs-mol-002',
    jerseyType: 'mol_blue',
    memberRef: 'MOL-BLUE-02',
    jerseyNumber: '24',
    jerseySize: 'L',
    unitPrice: 750,
    amountPaid: 750,
    balance: 0,
    paymentStatus: 'Paid',
    supplierPaymentStatus: 'Completed',
    supplierName: 'Apex Sportswear Apparel Inc.',
    date: '2026-09-04',
    documents: [],
    createdAt: '2026-09-04T11:10:00Z',
    updatedAt: '2026-09-04T11:10:00Z',
  },
  {
    id: 'jrs-mol-003',
    jerseyType: 'mol_blue',
    memberRef: 'MOL-BLUE-03',
    jerseyNumber: '08',
    jerseySize: '2XL',
    unitPrice: 750,
    amountPaid: 400,
    balance: 350,
    paymentStatus: 'Partially Paid',
    supplierPaymentStatus: 'Pending',
    supplierName: 'Apex Sportswear Apparel Inc.',
    date: '2026-09-05',
    documents: [],
    createdAt: '2026-09-05T13:00:00Z',
    updatedAt: '2026-09-05T13:00:00Z',
  },

  // MMC White Jersey
  {
    id: 'jrs-mmc-001',
    jerseyType: 'mmc_white',
    memberRef: 'MMC-WHT-01',
    jerseyNumber: '04',
    jerseySize: 'S',
    unitPrice: 750,
    amountPaid: 750,
    balance: 0,
    paymentStatus: 'Paid',
    supplierPaymentStatus: 'Completed',
    supplierName: 'Apex Sportswear Apparel Inc.',
    date: '2026-09-08',
    documents: [],
    createdAt: '2026-09-08T10:30:00Z',
    updatedAt: '2026-09-08T10:30:00Z',
  },
  {
    id: 'jrs-mmc-002',
    jerseyType: 'mmc_white',
    memberRef: 'MMC-WHT-02',
    jerseyNumber: '09',
    jerseySize: 'M',
    unitPrice: 750,
    amountPaid: 750,
    balance: 0,
    paymentStatus: 'Paid',
    supplierPaymentStatus: 'Completed',
    supplierName: 'Apex Sportswear Apparel Inc.',
    date: '2026-09-08',
    documents: [],
    createdAt: '2026-09-08T10:35:00Z',
    updatedAt: '2026-09-08T10:35:00Z',
  },
  {
    id: 'jrs-mmc-003',
    jerseyType: 'mmc_white',
    memberRef: 'MMC-WHT-03',
    jerseyNumber: '15',
    jerseySize: 'L',
    unitPrice: 750,
    amountPaid: 750,
    balance: 0,
    paymentStatus: 'Paid',
    supplierPaymentStatus: 'Completed',
    supplierName: 'Apex Sportswear Apparel Inc.',
    date: '2026-09-09',
    documents: [],
    createdAt: '2026-09-09T14:15:00Z',
    updatedAt: '2026-09-09T14:15:00Z',
  },
];

const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-001',
    timestamp: '2026-08-15T09:30:00Z',
    action: 'Created',
    recordCategory: 'General Batch Funds',
    recordTitle: 'Batch Dues 1st Semester - Section Alpha (35 Members)',
    previousInfo: 'None (New entry)',
    updatedInfo: 'Amount: ₱17,500.00 | Status: Paid | Ref: COLL-GEN-2026-001',
    adminActor: 'Authorized Officer',
  },
  {
    id: 'log-002',
    timestamp: '2026-08-25T16:20:00Z',
    action: 'Document Attached',
    recordCategory: 'General Batch Funds',
    recordTitle: 'General Assembly Hall Rental & Audio-Visual Systems',
    previousInfo: '0 documents',
    updatedInfo: 'Attached: Official_Receipt_Hall_Rental.pdf',
    adminActor: 'Authorized Officer',
  },
  {
    id: 'log-003',
    timestamp: '2026-09-01T15:00:00Z',
    action: 'Created',
    recordCategory: 'Batch Jersey',
    recordTitle: 'Manufacturer Downpayment (50% Production Advance)',
    previousInfo: 'None (New entry)',
    updatedInfo: 'Expense: ₱28,000.00 to Apex Sportswear Apparel Inc.',
    adminActor: 'Authorized Officer',
  },
  {
    id: 'log-004',
    timestamp: '2026-09-12T17:05:00Z',
    action: 'Status Changed',
    recordCategory: 'Selling Activities',
    recordTitle: 'Sportsfest Refreshment & Snack Booth',
    previousInfo: 'Status: Pending | Sales: ₱0.00',
    updatedInfo: 'Status: Completed | Gross Sales: ₱15,000.00 | Net: ₱7,800.00',
    adminActor: 'Authorized Officer',
  },
];

export const getFinancialRecords = (): FinancialRecord[] => {
  const data = localStorage.getItem(STORAGE_KEYS.FINANCIAL_RECORDS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.FINANCIAL_RECORDS, JSON.stringify(initialFinancialRecords));
    return initialFinancialRecords;
  }
  try {
    return JSON.parse(data);
  } catch {
    return initialFinancialRecords;
  }
};

export const saveFinancialRecords = (records: FinancialRecord[]) => {
  localStorage.setItem(STORAGE_KEYS.FINANCIAL_RECORDS, JSON.stringify(records));
};

export const getSellingRecords = (): SellingActivityRecord[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SELLING_RECORDS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.SELLING_RECORDS, JSON.stringify(initialSellingRecords));
    return initialSellingRecords;
  }
  try {
    return JSON.parse(data);
  } catch {
    return initialSellingRecords;
  }
};

export const saveSellingRecords = (records: SellingActivityRecord[]) => {
  localStorage.setItem(STORAGE_KEYS.SELLING_RECORDS, JSON.stringify(records));
};

export const getJerseyRecords = (): JerseyRecord[] => {
  const data = localStorage.getItem(STORAGE_KEYS.JERSEY_RECORDS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.JERSEY_RECORDS, JSON.stringify(initialJerseyRecords));
    return initialJerseyRecords;
  }
  try {
    return JSON.parse(data);
  } catch {
    return initialJerseyRecords;
  }
};

export const saveJerseyRecords = (records: JerseyRecord[]) => {
  localStorage.setItem(STORAGE_KEYS.JERSEY_RECORDS, JSON.stringify(records));
};

export const getAuditLogs = (): AuditLog[] => {
  const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(initialAuditLogs));
    return initialAuditLogs;
  }
  try {
    return JSON.parse(data);
  } catch {
    return initialAuditLogs;
  }
};

export const addAuditLog = (
  action: AuditLog['action'],
  recordCategory: string,
  recordTitle: string,
  updatedInfo: string,
  previousInfo?: string,
  adminActor: string = 'Authorized Officer'
) => {
  const logs = getAuditLogs();
  const newLog: AuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    action,
    recordCategory,
    recordTitle,
    previousInfo: previousInfo || 'None',
    updatedInfo,
    adminActor,
  };
  const updatedLogs = [newLog, ...logs];
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(updatedLogs));
  return newLog;
};

export const getSheetsConfig = (): GoogleSheetsConfig => {
  const data = localStorage.getItem(STORAGE_KEYS.SHEETS_CONFIG);
  if (!data) {
    const defaultConfig: GoogleSheetsConfig = {
      spreadsheetId: '',
      sheetUrl: '',
      autoSyncEnabled: true,
      syncIntervalMinutes: 2,
      lastSyncStatus: 'idle',
    };
    return defaultConfig;
  }
  try {
    return JSON.parse(data);
  } catch {
    return {
      spreadsheetId: '',
      sheetUrl: '',
      autoSyncEnabled: true,
      syncIntervalMinutes: 2,
      lastSyncStatus: 'idle',
    };
  }
};

export const saveSheetsConfig = (config: GoogleSheetsConfig) => {
  localStorage.setItem(STORAGE_KEYS.SHEETS_CONFIG, JSON.stringify(config));
};

export const getAdminAuth = (): boolean => {
  return sessionStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) === 'true';
};

export const setAdminAuth = (isAuthenticated: boolean) => {
  if (isAuthenticated) {
    sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'true');
  } else {
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
  }
};

export const resetToInitialData = () => {
  localStorage.setItem(STORAGE_KEYS.FINANCIAL_RECORDS, JSON.stringify(initialFinancialRecords));
  localStorage.setItem(STORAGE_KEYS.SELLING_RECORDS, JSON.stringify(initialSellingRecords));
  localStorage.setItem(STORAGE_KEYS.JERSEY_RECORDS, JSON.stringify(initialJerseyRecords));
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(initialAuditLogs));
  addAuditLog('Created', 'System Settings', 'Batch Transparency Database', 'Sample data restored to initial state');
};
