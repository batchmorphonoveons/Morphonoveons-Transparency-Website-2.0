import firebaseConfig from '../../firebase-applet-config.json';
import { getAccessToken } from '../firebase';
import { 
  FinancialRecord, 
  SellingActivityRecord, 
  JerseyRecord, 
  CategoryKey,
  GoogleSheetsConfig 
} from '../types/transparency';
import { 
  getFinancialRecords, 
  saveFinancialRecords, 
  getSellingRecords, 
  saveSellingRecords, 
  getJerseyRecords, 
  saveJerseyRecords, 
  addAuditLog, 
  getSheetsConfig, 
  saveSheetsConfig 
} from './storage';

export const extractSpreadsheetId = (input: string): string => {
  if (!input) return '';
  const trimmed = input.trim();
  // If it's already an ID (alphanumeric, dashes, underscores, around 30-50 chars)
  if (/^[a-zA-Z0-9_-]{25,60}$/.test(trimmed)) {
    return trimmed;
  }
  // Try matching /spreadsheets/d/([a-zA-Z0-9_-]+)
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
};

// CSV row parser handling quotes
function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(cell.trim());
      cell = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(cell.trim());
      if (row.some(c => c.length > 0)) {
        lines.push(row);
      }
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell.trim());
    if (row.some(c => c.length > 0)) {
      lines.push(row);
    }
  }
  return lines;
}

export interface SyncResult {
  success: boolean;
  message: string;
  recordsCount?: number;
  updatedAt?: string;
}

/**
 * Fetch transparency records from Google Sheet.
 * Tries Google Sheets API v4 first (with OAuth token or API key),
 * falls back to Google Visualization CSV export for public sheets.
 */
export async function syncFromGoogleSheet(customSheetId?: string): Promise<SyncResult> {
  const config = getSheetsConfig();
  const rawId = customSheetId || config.spreadsheetId;
  const sheetId = extractSpreadsheetId(rawId);

  if (!sheetId) {
    const msg = 'No Google Spreadsheet ID or URL configured.';
    saveSheetsConfig({
      ...config,
      lastSyncStatus: 'error',
      lastSyncMessage: msg,
    });
    return { success: false, message: msg };
  }

  try {
    const accessToken = await getAccessToken();
    const apiKey = firebaseConfig.apiKey;
    let fetchedRows: string[][] = [];
    let methodUsed = '';

    // Strategy 1: If user is authenticated with Google OAuth
    if (accessToken) {
      try {
        const metadataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`;
        const metaRes = await fetch(metadataUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (metaRes.ok) {
          const metaData = await metaRes.json();
          const firstSheetTitle = metaData.sheets?.[0]?.properties?.title || 'Sheet1';
          const range = encodeURIComponent(`${firstSheetTitle}!A1:Z500`);
          const valuesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}`;
          const valuesRes = await fetch(valuesUrl, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (valuesRes.ok) {
            const data = await valuesRes.json();
            if (data.values && data.values.length > 1) {
              fetchedRows = data.values;
              methodUsed = 'Google Sheets API (Authenticated)';
            }
          }
        }
      } catch (e) {
        console.warn('Authenticated Sheets API fetch failed, trying public fallback:', e);
      }
    }

    // Strategy 2: Google Sheets API with API Key (works on sheets shared "Anyone with the link can view")
    if (fetchedRows.length === 0 && apiKey) {
      try {
        // Try getting spreadsheet metadata first to identify sheet title
        const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?key=${apiKey}`;
        const metaRes = await fetch(metaUrl);
        if (metaRes.ok) {
          const metaData = await metaRes.json();
          const firstSheetTitle = metaData.sheets?.[0]?.properties?.title || 'Sheet1';
          const range = encodeURIComponent(`${firstSheetTitle}!A1:Z500`);
          const valuesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
          const valRes = await fetch(valuesUrl);
          if (valRes.ok) {
            const data = await valRes.json();
            if (data.values && data.values.length > 1) {
              fetchedRows = data.values;
              methodUsed = 'Google Sheets API v4 (Public Key)';
            }
          }
        }
      } catch (e) {
        console.warn('API key fetch failed, trying gviz CSV fallback:', e);
      }
    }

    // Strategy 3: Google Sheets Visualization CSV export (universal for public Google Sheets)
    if (fetchedRows.length === 0) {
      const gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
      const gvizRes = await fetch(gvizUrl);
      if (!gvizRes.ok) {
        throw new Error(
          `Unable to access Google Sheet (${gvizRes.status} ${gvizRes.statusText}). Make sure the spreadsheet is set to "Anyone with the link can view".`
        );
      }
      const csvText = await gvizRes.text();
      fetchedRows = parseCSV(csvText);
      methodUsed = 'Google Sheets Live Export (Public CSV)';
    }

    if (fetchedRows.length < 2) {
      throw new Error('Spreadsheet was reached, but no data rows were found.');
    }

    // Parse header
    const headers = fetchedRows[0].map(h => String(h || '').trim().toLowerCase());
    
    // Normalize index finder
    const findIndex = (possibleNames: string[]) => {
      return headers.findIndex(h => possibleNames.some(name => h.includes(name)));
    };

    const catIdx = findIndex(['category', 'fund', 'type of fund']);
    const typeIdx = findIndex(['transaction type', 'flow', 'type', 'credit/debit']);
    const titleIdx = findIndex(['title', 'description', 'activity', 'item', 'name']);
    const sourceIdx = findIndex(['source', 'payee', 'representative', 'from/to', 'collector', 'vendor']);
    const amountIdx = findIndex(['amount', 'total', 'collections', 'expense', 'cost', 'sales', 'value']);
    const dateIdx = findIndex(['date', 'time', 'timestamp']);
    const statusIdx = findIndex(['status', 'payment status', 'condition']);
    const refIdx = findIndex(['reference', 'code', 'receipt', 'ref']);
    const notesIdx = findIndex(['notes', 'remarks', 'memo']);

    // Separate records
    const newFinancial: FinancialRecord[] = [];
    const newSelling: SellingActivityRecord[] = [];
    const newJersey: JerseyRecord[] = [];

    const existingFin = getFinancialRecords();
    const existingSell = getSellingRecords();
    const existingJrs = getJerseyRecords();

    let processedCount = 0;

    for (let i = 1; i < fetchedRows.length; i++) {
      const row = fetchedRows[i];
      if (!row || row.length === 0 || row.every(c => !c)) continue;

      const rawCategory = (catIdx !== -1 ? row[catIdx] : '').toLowerCase();
      const rawType = (typeIdx !== -1 ? row[typeIdx] : '').toLowerCase();
      const title = (titleIdx !== -1 ? row[titleIdx] : '') || `Record #${i}`;
      const sourceOrPayee = (sourceIdx !== -1 ? row[sourceIdx] : '') || 'Batch Treasury Representative';
      const rawAmount = (amountIdx !== -1 ? row[amountIdx] : '0').replace(/[^0-9.-]/g, '');
      const amount = parseFloat(rawAmount) || 0;
      const date = (dateIdx !== -1 ? row[dateIdx] : '') || new Date().toISOString().split('T')[0];
      const rawStatus = (statusIdx !== -1 ? row[statusIdx] : '').toLowerCase();
      const ref = (refIdx !== -1 ? row[refIdx] : '') || `GS-${i.toString().padStart(3, '0')}`;
      const notes = notesIdx !== -1 ? row[notesIdx] : '';

      // Determine standard status
      let status: FinancialRecord['status'] = 'Paid';
      if (rawStatus.includes('partial')) status = 'Partially Paid';
      else if (rawStatus.includes('unpaid')) status = 'Unpaid';
      else if (rawStatus.includes('pending')) status = 'Pending';
      else if (rawStatus.includes('complete')) status = 'Completed';

      // Map Category
      let category: CategoryKey = 'general';
      if (rawCategory.includes('sell') || rawCategory.includes('merch') || rawCategory.includes('fundrais')) {
        category = 'selling';
      } else if (rawCategory.includes('mol') || rawCategory.includes('blue')) {
        category = 'mol_blue';
      } else if (rawCategory.includes('mmc') || rawCategory.includes('white')) {
        category = 'mmc_white';
      } else if (rawCategory.includes('jersey') || rawCategory.includes('batch jersey')) {
        category = 'batch_jersey';
      }

      // Check if selling activity
      if (category === 'selling') {
        const estCost = Math.round(amount * 0.45);
        newSelling.push({
          id: `gs-sell-${i}`,
          title,
          description: notes || `Batch selling activity synchronized from Google Sheet.`,
          unitsSold: Math.max(1, Math.round(amount / 100)),
          unitPrice: 100,
          grossSales: amount,
          productionCost: estCost,
          netProceeds: amount - estCost,
          status: status === 'Completed' || status === 'Paid' ? 'Completed' : 'Pending',
          date,
          documents: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else if (category === 'batch_jersey' || category === 'mol_blue' || category === 'mmc_white') {
        // Financial record for the jersey fund
        const isExpense = rawType.includes('exp') || rawType.includes('disburs') || rawType.includes('out') || rawType.includes('cost');
        newFinancial.push({
          id: `gs-fin-${i}`,
          category,
          type: isExpense ? 'expense' : 'collection',
          title,
          sourceOrPayee,
          amount,
          date,
          status,
          notes,
          documents: [],
          referenceCode: ref,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        // Also generate matching jersey record item if it's an individual/unit collection
        if (!isExpense) {
          newJersey.push({
            id: `gs-jrs-${i}`,
            jerseyType: category as 'batch_jersey' | 'mol_blue' | 'mmc_white',
            memberRef: ref.startsWith('BM-') || ref.startsWith('MOL-') || ref.startsWith('MMC-') ? ref : `UNIT-${i.toString().padStart(3, '0')}`,
            jerseySize: 'L',
            unitPrice: 750,
            amountPaid: amount,
            balance: Math.max(0, 750 - amount),
            paymentStatus: amount >= 750 ? 'Paid' : amount > 0 ? 'Partially Paid' : 'Unpaid',
            supplierPaymentStatus: 'Completed',
            date,
            documents: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      } else {
        // General batch fund
        const isExpense = rawType.includes('exp') || rawType.includes('disburs') || rawType.includes('out') || rawType.includes('cost');
        newFinancial.push({
          id: `gs-fin-${i}`,
          category: 'general',
          type: isExpense ? 'expense' : 'collection',
          title,
          sourceOrPayee,
          amount,
          date,
          status,
          notes,
          documents: [],
          referenceCode: ref,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      processedCount++;
    }

    if (newFinancial.length > 0) {
      saveFinancialRecords(newFinancial);
    }
    if (newSelling.length > 0) {
      saveSellingRecords(newSelling);
    }
    if (newJersey.length > 0) {
      saveJerseyRecords(newJersey);
    }

    const now = new Date().toISOString();
    const updatedConfig: GoogleSheetsConfig = {
      ...config,
      spreadsheetId: sheetId,
      lastSyncedAt: now,
      lastSyncStatus: 'success',
      lastSyncMessage: `Successfully synchronized ${processedCount} records via ${methodUsed}.`,
    };
    saveSheetsConfig(updatedConfig);

    addAuditLog(
      'Google Sheets Synced',
      'All Categories',
      'Google Spreadsheet Live Synchronization',
      `Synchronized ${processedCount} records from Google Sheet (${sheetId.substring(0, 8)}...) via ${methodUsed}`,
      `Previous records: ${existingFin.length + existingSell.length + existingJrs.length}`
    );

    return {
      success: true,
      recordsCount: processedCount,
      updatedAt: now,
      message: `Successfully synchronized ${processedCount} records from Google Sheet!`,
    };
  } catch (error: any) {
    const errorMsg = error?.message || 'Failed to fetch spreadsheet data.';
    saveSheetsConfig({
      ...config,
      spreadsheetId: sheetId,
      lastSyncStatus: 'error',
      lastSyncMessage: errorMsg,
    });
    return {
      success: false,
      message: errorMsg,
    };
  }
}

/**
 * Generate CSV template text that administrators can copy or import into Google Sheets
 */
export function generateSheetTemplateCSV(): string {
  const headers = [
    'Category',
    'Type',
    'Title / Description',
    'Source / Payee / Committee',
    'Amount (PHP)',
    'Date (YYYY-MM-DD)',
    'Status',
    'Reference Code',
    'Notes / Remarks'
  ];

  const rows = [
    ['General Batch Funds', 'Collection', 'Batch Dues 1st Sem - Section Alpha (35 Members)', 'Section Alpha Representative', '17500', '2026-08-15', 'Paid', 'COLL-GEN-2026-001', 'Official class dues'],
    ['General Batch Funds', 'Collection', 'Batch Dues 1st Sem - Section Bravo (32 Members)', 'Section Bravo Representative', '16000', '2026-08-16', 'Paid', 'COLL-GEN-2026-002', 'Remitted to batch account'],
    ['General Batch Funds', 'Expense', 'General Assembly Hall Rental & Audio-Visual Systems', 'University Student Activity Center', '6500', '2026-08-25', 'Paid', 'EXP-GEN-2026-001', 'Convocation hall booking'],
    ['Selling Activities', 'Collection', 'Morphonoveons 2026 Signature Lanyards', 'Batch Merch Committee', '18000', '2026-08-20', 'Completed', 'SELL-001', '150 units sold at 120 each'],
    ['Selling Activities', 'Collection', 'Sportsfest Refreshment & Snack Booth', 'Batch Welfare Committee', '15000', '2026-09-12', 'Completed', 'SELL-003', 'Energy snacks and refreshments'],
    ['Batch Jersey', 'Collection', 'Batch Official Jersey - Batch Remittance 1 (50 Units)', 'Class Treasury Committee', '37500', '2026-08-30', 'Paid', 'COLL-JRS-2026-001', 'Batch jersey collection'],
    ['Batch Jersey', 'Expense', 'Manufacturer Downpayment (50% Production Advance)', 'Apex Sportswear Apparel Inc.', '28000', '2026-09-01', 'Paid', 'EXP-JRS-2026-001', 'Fabric and sublimation advance'],
    ['MOL Blue Jersey', 'Collection', 'MOL Blue Department Team Jersey Collections (32 Units)', 'MOL Department Representative', '24000', '2026-09-04', 'Paid', 'COLL-MOL-2026-001', 'MOL blue team fees'],
    ['MOL Blue Jersey', 'Expense', 'MOL Blue Production Advance & Screen Sizing Samples', 'Apex Sportswear Apparel Inc.', '14000', '2026-09-06', 'Paid', 'EXP-MOL-2026-001', 'MOL blue downpayment'],
    ['MMC White Jersey', 'Collection', 'MMC White Department Team Jersey Collections (28 Units)', 'MMC Department Representative', '21000', '2026-09-08', 'Paid', 'COLL-MMC-2026-001', 'MMC white team fees'],
    ['MMC White Jersey', 'Expense', 'MMC White Sublimation Deposit & Sample Fitting Fee', 'Apex Sportswear Apparel Inc.', '12500', '2026-09-09', 'Paid', 'EXP-MMC-2026-001', 'MMC white downpayment']
  ];

  const escapeCSV = (field: string) => `"${field.replace(/"/g, '""')}"`;
  const csvLines = [
    headers.map(escapeCSV).join(','),
    ...rows.map(row => row.map(escapeCSV).join(','))
  ];
  return csvLines.join('\n');
}

/**
 * Export current app records as CSV
 */
export function exportAllDataAsCSV(): string {
  const finRecords = getFinancialRecords();
  const headers = ['Category', 'Type', 'Title', 'Source / Payee', 'Amount', 'Date', 'Status', 'Reference', 'Notes', 'Attached Documents'];
  
  const escapeCSV = (field: string) => `"${String(field || '').replace(/"/g, '""')}"`;

  const rows = finRecords.map(r => [
    r.category,
    r.type,
    r.title,
    r.sourceOrPayee,
    r.amount.toFixed(2),
    r.date,
    r.status,
    r.referenceCode || '',
    r.notes || '',
    r.documents.map(d => d.name).join('; ')
  ]);

  return [
    headers.map(escapeCSV).join(','),
    ...rows.map(row => row.map(escapeCSV).join(','))
  ].join('\n');
}
