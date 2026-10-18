import { getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  collection,
  setDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import {
  FinancialRecord,
  SellingActivityRecord,
  JerseyRecord,
  AuditLog,
  GoogleSheetsConfig
} from '../types/transparency';

// Every record is saved as its own document in Firestore, so attachments
// never hit the 1 MB document limit across all records together.
const db = getFirestore(getApp());

type SetName = 'financial' | 'selling' | 'jersey' | 'audit' | 'progress';

const COLLECTIONS: Record<SetName, string> = {
  financial: 'financial',
  selling: 'selling',
  jersey: 'jersey',
  audit: 'audit',
  progress: 'progress',
};

const STORAGE_KEYS = {
  SHEETS_CONFIG: 'morphonoveons_sheets_config_v1',
  ADMIN_SESSION: 'morphonoveons_admin_session_v1',
};

// No longer used. Safe to delete once the old login screen is replaced.
export const ADMIN_PASSWORD = '';

const cache: Record<SetName, any[]> = {
  financial: [],
  selling: [],
  jersey: [],
  audit: [],
  progress: [],
};

const sortKey = (name: SetName, r: any): string =>
  String((name === 'audit' ? r.timestamp : r.createdAt) || '');

// ---- Live updates ----
const listeners = new Set<() => void>();

export const subscribeToData = (callback: () => void) => {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
};

const notify = () => listeners.forEach((cb) => cb());

(Object.keys(COLLECTIONS) as SetName[]).forEach((name) => {
  onSnapshot(
    collection(db, COLLECTIONS[name]),
    (snap) => {
      const items: any[] = [];
      snap.docs.forEach((d) => {
        try {
          items.push(JSON.parse(d.data().json));
        } catch {
          /* skip unreadable record */
        }
      });
      items.sort((a, b) => sortKey(name, b).localeCompare(sortKey(name, a)));
      cache[name] = items;
      notify();
    },
    (err) => console.error(`Could not load ${name} records:`, err)
  );
});

let warned = false;
const onWriteError = (err: unknown) => {
  console.error('Could not save to the shared database:', err);
  if (!warned) {
    warned = true;
    alert('Could not save to the shared database. Please log in as an administrator, or the record may be too large (try a smaller attachment).');
    setTimeout(() => { warned = false; }, 10000);
  }
};

const persist = (name: SetName, records: any[]) => {
  const prev = new Map<string, string>(cache[name].map((r) => [r.id, JSON.stringify(r)]));
  const nextIds = new Set<string>(records.map((r) => r.id));
  cache[name] = records;

  records.forEach((r) => {
    const json = JSON.stringify(r);
    if (prev.get(r.id) !== json) {
      setDoc(doc(db, COLLECTIONS[name], r.id), { json, updatedAt: Date.now() }).catch(onWriteError);
    }
  });
  prev.forEach((_, id) => {
    if (!nextIds.has(id)) {
      deleteDoc(doc(db, COLLECTIONS[name], id)).catch(onWriteError);
    }
  });
};

// ---- Financial records ----
export const getFinancialRecords = (): FinancialRecord[] => cache.financial;
export const saveFinancialRecords = (records: FinancialRecord[]) => persist('financial', records);

// ---- Selling activities ----
export const getSellingRecords = (): SellingActivityRecord[] => cache.selling;
export const saveSellingRecords = (records: SellingActivityRecord[]) => persist('selling', records);

// ---- Jersey records ----
export const getJerseyRecords = (): JerseyRecord[] => cache.jersey;
export const saveJerseyRecords = (records: JerseyRecord[]) => persist('jersey', records);

// ---- Jersey order progress (one record per step) ----
export const getProgressRecords = (): any[] => cache.progress;
export const saveProgressRecords = (records: any[]) => persist('progress', records);

// ---- Audit log ----
export const getAuditLogs = (): AuditLog[] => cache.audit;

export const addAuditLog = (
  action: AuditLog['action'],
  recordCategory: string,
  recordTitle: string,
  updatedInfo: string,
  previousInfo?: string,
  adminActor: string = 'Authorized Officer'
) => {
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
  persist('audit', [newLog, ...cache.audit]);
  return newLog;
};

// ---- Google Sheets settings (no longer used by the app) ----
const defaultSheetsConfig = (): GoogleSheetsConfig => ({
  spreadsheetId: '',
  sheetUrl: '',
  autoSyncEnabled: false,
  syncIntervalMinutes: 2,
  lastSyncStatus: 'idle',
});

export const getSheetsConfig = (): GoogleSheetsConfig => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SHEETS_CONFIG);
    return data ? JSON.parse(data) : defaultSheetsConfig();
  } catch {
    return defaultSheetsConfig();
  }
};

export const saveSheetsConfig = (config: GoogleSheetsConfig) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SHEETS_CONFIG, JSON.stringify(config));
  } catch {
    /* ignore */
  }
};

// ---- Admin session ----
export const getAdminAuth = (): boolean => !!auth.currentUser;

export const setAdminAuth = (isAuthenticated: boolean) => {
  if (!isAuthenticated) signOut(auth).catch(() => {});
};

// Firebase admin login (email + password), used by the login screen.
export const adminSignIn = async (email: string, password: string) => {
  await signInWithEmailAndPassword(auth, email, password);
};

// ---- Reset ----
// Clears all shared records (no sample data is added).
export const resetToInitialData = () => {
  persist('financial', []);
  persist('selling', []);
  persist('jersey', []);
  addAuditLog('Created', 'System Settings', 'Batch Transparency Database', 'All records cleared');
};
