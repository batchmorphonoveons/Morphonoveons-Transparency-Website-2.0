import { getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import {
  FinancialRecord,
  SellingActivityRecord,
  JerseyRecord,
  AuditLog,
  GoogleSheetsConfig
} from '../types/transparency';

// Records are stored in Firestore (shared by everyone) and cached in the browser.
const db = getFirestore(getApp());

type SetName = 'financial' | 'selling' | 'jersey' | 'audit';

const CACHE_KEYS: Record<SetName, string> = {
  financial: 'morphonoveons_financial_records_v2',
  selling: 'morphonoveons_selling_records_v2',
  jersey: 'morphonoveons_jersey_records_v2',
  audit: 'morphonoveons_audit_logs_v2',
};

const STORAGE_KEYS = {
  SHEETS_CONFIG: 'morphonoveons_sheets_config_v1',
  ADMIN_SESSION: 'morphonoveons_admin_session_v1',
};

// Kept so the current login screen still works. Will be removed when login moves to Firebase.
export const ADMIN_PASSWORD = 'Morbulutong2026';

const readCache = (name: SetName): any[] => {
  try {
    const data = localStorage.getItem(CACHE_KEYS[name]);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const cache: Record<SetName, any[]> = {
  financial: readCache('financial'),
  selling: readCache('selling'),
  jersey: readCache('jersey'),
  audit: readCache('audit'),
};

// ---- Live updates ----
const listeners = new Set<() => void>();

export const subscribeToData = (callback: () => void) => {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
};

const notify = () => {
  if (listeners.size > 0) {
    listeners.forEach((cb) => cb());
    return;
  }
  // Nothing is listening yet: reload once so the page shows the latest data.
  try {
    const last = Number(sessionStorage.getItem('morph_last_reload') || 0);
    if (Date.now() - last < 5000) return;
    sessionStorage.setItem('morph_last_reload', String(Date.now()));
  } catch {
    return;
  }
  window.location.reload();
};

(['financial', 'selling', 'jersey', 'audit'] as SetName[]).forEach((name) => {
  onSnapshot(
    doc(db, 'portal', name),
    (snap) => {
      if (!snap.exists()) return;
      const json = snap.data().json as string;
      if (json === JSON.stringify(cache[name])) return;
      try {
        cache[name] = JSON.parse(json);
      } catch {
        return;
      }
      localStorage.setItem(CACHE_KEYS[name], json);
      notify();
    },
    (err) => console.error(`Could not load ${name} records:`, err)
  );
});

let warned = false;
const persist = (name: SetName, records: any[]) => {
  cache[name] = records;
  const json = JSON.stringify(records);
  localStorage.setItem(CACHE_KEYS[name], json);
  setDoc(doc(db, 'portal', name), { json, updatedAt: Date.now() }).catch((err) => {
    console.error(`Could not save ${name} records:`, err);
    if (!warned) {
      warned = true;
      alert('Could not save to the shared database. Please sign in as an administrator.');
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

// ---- Google Sheets settings (per browser) ----
const defaultSheetsConfig = (): GoogleSheetsConfig => ({
  spreadsheetId: '',
  sheetUrl: '',
  autoSyncEnabled: true,
  syncIntervalMinutes: 2,
  lastSyncStatus: 'idle',
});

export const getSheetsConfig = (): GoogleSheetsConfig => {
  const data = localStorage.getItem(STORAGE_KEYS.SHEETS_CONFIG);
  if (!data) return defaultSheetsConfig();
  try {
    return JSON.parse(data);
  } catch {
    return defaultSheetsConfig();
  }
};

export const saveSheetsConfig = (config: GoogleSheetsConfig) => {
  localStorage.setItem(STORAGE_KEYS.SHEETS_CONFIG, JSON.stringify(config));
};

// ---- Admin session ----
export const getAdminAuth = (): boolean => {
  return sessionStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) === 'true';
};

export const setAdminAuth = (isAuthenticated: boolean) => {
  if (isAuthenticated) {
    sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'true');
  } else {
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    signOut(auth).catch(() => {});
  }
};

// Firebase admin login (used once the login screen is switched over).
export const adminSignIn = async (email: string, password: string) => {
  await signInWithEmailAndPassword(auth, email, password);
  setAdminAuth(true);
};

// ---- Reset ----
// Clears all shared records (no sample data is added).
export const resetToInitialData = () => {
  persist('financial', []);
  persist('selling', []);
  persist('jersey', []);
  addAuditLog('Created', 'System Settings', 'Batch Transparency Database', 'All records cleared');
};
