// lib/storage.ts

/**
 * Smart GST - Central Storage Layer
 *
 * सभी modules इसी file के through localStorage access करेंगे.
 * SSR / Next.js safe implementation.
 */

const STORAGE_PREFIX = "smart-gst:";

/* =====================================================
   STORAGE KEYS
===================================================== */

export const STORAGE_KEYS = {
  BUSINESS_PROFILE: "business-profile",
  APP_SETTINGS: "app-settings",

  CUSTOMERS: "customers",
  SUPPLIERS: "suppliers",
  PRODUCTS: "products",

  INVOICES: "invoices",
  PURCHASES: "purchases",
  PAYMENTS: "payments",

  SUPPORT_REQUESTS: "support-requests",

  DOCUMENT_COUNTERS: "document-counters",

  LAST_BACKUP: "last-backup",
} as const;

/* =====================================================
   ENVIRONMENT CHECK
===================================================== */

/**
 * Check whether browser localStorage is available.
 * Important for Next.js SSR compatibility.
 */
function isStorageAvailable(): boolean {
  return typeof window !== "undefined" &&
    typeof window.localStorage !== "undefined";
}

/**
 * Create namespaced storage key.
 */
function createStorageKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

/* =====================================================
   BASIC STORAGE OPERATIONS
===================================================== */

/**
 * Save any serializable data.
 */
export function setStorage<T>(
  key: string,
  value: T
): boolean {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    const storageKey = createStorageKey(key);

    window.localStorage.setItem(
      storageKey,
      JSON.stringify(value)
    );

    return true;
  } catch (error) {
    console.error(
      `Failed to save storage key: ${key}`,
      error
    );

    return false;
  }
}

/**
 * Get data from storage.
 */
export function getStorage<T>(
  key: string,
  fallback: T
): T {
  if (!isStorageAvailable()) {
    return fallback;
  }

  try {
    const storageKey = createStorageKey(key);

    const value =
      window.localStorage.getItem(storageKey);

    if (!value) {
      return fallback;
    }

    return JSON.parse(value) as T;
  } catch (error) {
    console.error(
      `Failed to read storage key: ${key}`,
      error
    );

    return fallback;
  }
}

/**
 * Remove one storage item.
 */
export function removeStorage(
  key: string
): boolean {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    window.localStorage.removeItem(
      createStorageKey(key)
    );

    return true;
  } catch (error) {
    console.error(
      `Failed to remove storage key: ${key}`,
      error
    );

    return false;
  }
}

/**
 * Check whether a key exists.
 */
export function hasStorage(
  key: string
): boolean {
  if (!isStorageAvailable()) {
    return false;
  }

  return (
    window.localStorage.getItem(
      createStorageKey(key)
    ) !== null
  );
}

/* =====================================================
   ARRAY / COLLECTION HELPERS
===================================================== */

/**
 * Get collection safely.
 */
export function getCollection<T>(
  key: string
): T[] {
  return getStorage<T[]>(key, []);
}

/**
 * Save complete collection.
 */
export function setCollection<T>(
  key: string,
  items: T[]
): boolean {
  return setStorage(key, items);
}

/**
 * Add item to collection.
 */
export function addToCollection<T>(
  key: string,
  item: T
): T[] {
  const items = getCollection<T>(key);

  const updatedItems = [...items, item];

  setCollection(key, updatedItems);

  return updatedItems;
}

/**
 * Update item inside collection by ID.
 */
export function updateCollectionItem<
  T extends { id: string }
>(
  key: string,
  id: string,
  updates: Partial<T>
): T[] {
  const items = getCollection<T>(key);

  const updatedItems = items.map((item) =>
    item.id === id
      ? {
          ...item,
          ...updates,
          updatedAt: new Date().toISOString(),
        }
      : item
  );

  setCollection(key, updatedItems);

  return updatedItems;
}

/**
 * Replace complete item.
 */
export function replaceCollectionItem<
  T extends { id: string }
>(
  key: string,
  id: string,
  replacement: T
): T[] {
  const items = getCollection<T>(key);

  const updatedItems = items.map((item) =>
    item.id === id
      ? replacement
      : item
  );

  setCollection(key, updatedItems);

  return updatedItems;
}

/**
 * Delete item from collection.
 */
export function deleteCollectionItem<
  T extends { id: string }
>(
  key: string,
  id: string
): T[] {
  const items = getCollection<T>(key);

  const updatedItems = items.filter(
    (item) => item.id !== id
  );

  setCollection(key, updatedItems);

  return updatedItems;
}

/**
 * Find one item by ID.
 */
export function getCollectionItem<
  T extends { id: string }
>(
  key: string,
  id: string
): T | undefined {
  const items = getCollection<T>(key);

  return items.find(
    (item) => item.id === id
  );
}

/* =====================================================
   DOCUMENT COUNTER SYSTEM
===================================================== */

export type DocumentCounters = Record<
  string,
  number
>;

/**
 * Get all document counters.
 */
export function getDocumentCounters(): DocumentCounters {
  return getStorage<DocumentCounters>(
    STORAGE_KEYS.DOCUMENT_COUNTERS,
    {}
  );
}

/**
 * Get counter for document prefix.
 */
export function getDocumentCounter(
  prefix: string
): number {
  const counters = getDocumentCounters();

  return counters[prefix] ?? 0;
}

/**
 * Get next document sequence number.
 *
 * Example:
 * INV current = 24
 * Returns = 25
 */
export function getNextDocumentNumber(
  prefix: string
): number {
  const counters = getDocumentCounters();

  const nextNumber =
    (counters[prefix] ?? 0) + 1;

  counters[prefix] = nextNumber;

  setStorage(
    STORAGE_KEYS.DOCUMENT_COUNTERS,
    counters
  );

  return nextNumber;
}

/**
 * Set document counter manually.
 */
export function setDocumentCounter(
  prefix: string,
  value: number
): void {
  const counters = getDocumentCounters();

  counters[prefix] = Math.max(
    0,
    Math.floor(value)
  );

  setStorage(
    STORAGE_KEYS.DOCUMENT_COUNTERS,
    counters
  );
}

/* =====================================================
   BACKUP / EXPORT
===================================================== */

export interface SmartGSTBackup {
  version: string;
  app: string;
  exportedAt: string;

  data: Record<string, unknown>;
}

/**
 * Export complete Smart GST data.
 */
export function exportAllData(): SmartGSTBackup {
  const data: Record<string, unknown> = {};

  Object.values(STORAGE_KEYS).forEach((key) => {
    data[key] = getStorage(key, null);
  });

  return {
    version: "1.0.0",
    app: "Smart GST",
    exportedAt: new Date().toISOString(),
    data,
  };
}

/**
 * Convert backup to JSON string.
 */
export function exportAllDataAsJSON(): string {
  return JSON.stringify(
    exportAllData(),
    null,
    2
  );
}

/* =====================================================
   BACKUP IMPORT
===================================================== */

export interface ImportResult {
  success: boolean;
  importedKeys: string[];
  errors: string[];
}

/**
 * Import Smart GST backup.
 */
export function importAllData(
  backup: SmartGSTBackup
): ImportResult {
  const result: ImportResult = {
    success: false,
    importedKeys: [],
    errors: [],
  };

  if (!backup || !backup.data) {
    result.errors.push(
      "Invalid backup file"
    );

    return result;
  }

  try {
    Object.entries(backup.data).forEach(
      ([key, value]) => {
        try {
          setStorage(key, value);

          result.importedKeys.push(key);
        } catch {
          result.errors.push(
            `Failed to import ${key}`
          );
        }
      }
    );

    result.success =
      result.errors.length === 0;

    if (result.success) {
      setStorage(
        STORAGE_KEYS.LAST_BACKUP,
        new Date().toISOString()
      );
    }

    return result;
  } catch (error) {
    console.error(
      "Backup import failed",
      error
    );

    result.errors.push(
      "Unexpected error while importing backup"
    );

    return result;
  }
}

/* =====================================================
   CLEAR DATA
===================================================== */

/**
 * Clear all Smart GST app data.
 * Does NOT clear unrelated website localStorage.
 */
export function clearAllAppData(): boolean {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    const keysToRemove: string[] = [];

    for (
      let index = 0;
      index < window.localStorage.length;
      index++
    ) {
      const key =
        window.localStorage.key(index);

      if (
        key &&
        key.startsWith(STORAGE_PREFIX)
      ) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => {
      window.localStorage.removeItem(key);
    });

    return true;
  } catch (error) {
    console.error(
      "Failed to clear app data",
      error
    );

    return false;
  }
}

/* =====================================================
   STORAGE INFORMATION
===================================================== */

export interface StorageInfo {
  usedKeys: number;
  estimatedSize: number;
}

/**
 * Get estimated Smart GST storage usage.
 */
export function getStorageInfo(): StorageInfo {
  if (!isStorageAvailable()) {
    return {
      usedKeys: 0,
      estimatedSize: 0,
    };
  }

  let usedKeys = 0;
  let estimatedSize = 0;

  for (
    let index = 0;
    index < window.localStorage.length;
    index++
  ) {
    const key =
      window.localStorage.key(index);

    if (
      key &&
      key.startsWith(STORAGE_PREFIX)
    ) {
      const value =
        window.localStorage.getItem(key);

      usedKeys += 1;

      estimatedSize +=
        (key.length + (value?.length ?? 0)) *
        2;
    }
  }

  return {
    usedKeys,
    estimatedSize,
  };
}
