import { CampaignSpreadsheetBatch } from '../types';

const DB_NAME = 'bnc_campaign_sheets_db';
const DB_VERSION = 1;
const STORE_NAME = 'campaign_sheets';
const RECORD_KEY = 'all_batches';
const LOCAL_STORAGE_KEY = 'bnc_campaign_form_uploads';

function openCampaignDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open campaign database'));
  });
}

export function readCampaignBatchesSync(): CampaignSpreadsheetBatch[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

export async function loadCampaignBatchesFromStorage(): Promise<CampaignSpreadsheetBatch[]> {
  const localFallback = readCampaignBatchesSync();
  try {
    const db = await openCampaignDb();
    const stored = await new Promise<CampaignSpreadsheetBatch[] | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(RECORD_KEY);
      req.onsuccess = () => resolve(req.result?.batches || null);
      req.onerror = () => reject(req.error || new Error('Failed to load saved campaign sheets'));
    });

    if (Array.isArray(stored) && stored.length > 0) {
      return stored;
    }

    if (localFallback.length > 0) {
      await saveCampaignBatchesToStorage(localFallback);
    }
    return localFallback;
  } catch {
    return localFallback;
  }
}

export async function saveCampaignBatchesToStorage(
  batches: CampaignSpreadsheetBatch[]
): Promise<void> {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(batches));
  } catch {
    // Larger multi-sheet collections exceed 5MB localStorage limit and live in IndexedDB
  }

  try {
    const db = await openCampaignDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put({
        id: RECORD_KEY,
        batches,
        updatedAt: new Date().toISOString(),
      });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error || new Error('Failed to save campaign sheets'));
    });
  } catch (err) {
    console.warn('IndexedDB campaign sheet save warning:', err);
  }
}
