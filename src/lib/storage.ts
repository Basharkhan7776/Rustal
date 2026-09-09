import type { AppSettings } from '../types/exercise';

const STORAGE_KEYS = {
  CURRENT_EXERCISE: 'rustal_v1_current_exercise',
  USER_CODE: 'rustal_v1_user_code',
  COMPLETED: 'rustal_v1_completed_ids',
  BOOKMARKS: 'rustal_v1_bookmarks',
  NOTES: 'rustal_v1_notes',
  SETTINGS: 'rustal_v1_settings',
};

export const DEFAULT_SETTINGS: AppSettings = {
  vimMode: false,
  fontSize: 14,
  theme: 'dark',
  autoRunOnLoad: false,
};

export interface LocalStorageSnapshot {
  version: 1;
  exportedAt: string;
  completedIds: string[];
  userCode: Record<string, string>;
  bookmarks: string[];
  notes: Record<string, string>;
  settings: AppSettings;
}

export function getStoredCurrentExercise(fallbackId: string): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_EXERCISE) || fallbackId;
  } catch {
    return fallbackId;
  }
}

export function setStoredCurrentExercise(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_EXERCISE, id);
  } catch {}
}

export function getStoredUserCodes(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_CODE);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveStoredUserCode(id: string, code: string): void {
  try {
    const all = getStoredUserCodes();
    all[id] = code;
    localStorage.setItem(STORAGE_KEYS.USER_CODE, JSON.stringify(all));
  } catch {}
}

export function removeStoredUserCode(id: string): void {
  try {
    const all = getStoredUserCodes();
    delete all[id];
    localStorage.setItem(STORAGE_KEYS.USER_CODE, JSON.stringify(all));
  } catch {}
}

export function getStoredCompletedIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPLETED);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setStoredCompletedIds(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COMPLETED, JSON.stringify(ids));
  } catch {}
}

export function getStoredBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setStoredBookmarks(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(ids));
  } catch {}
}

export function getStoredNotes(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveStoredNote(id: string, note: string): void {
  try {
    const all = getStoredNotes();
    all[id] = note;
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(all));
  } catch {}
}

export function getStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {}
}

export function exportProgressSnapshot(): string {
  const snapshot: LocalStorageSnapshot = {
    version: 1,
    exportedAt: new Date().toISOString(),
    completedIds: getStoredCompletedIds(),
    userCode: getStoredUserCodes(),
    bookmarks: getStoredBookmarks(),
    notes: getStoredNotes(),
    settings: getStoredSettings(),
  };
  return JSON.stringify(snapshot, null, 2);
}

export function importProgressSnapshot(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (!data || typeof data !== 'object') return false;

    if (Array.isArray(data.completedIds)) {
      setStoredCompletedIds(data.completedIds);
    }
    if (data.userCode && typeof data.userCode === 'object') {
      localStorage.setItem(STORAGE_KEYS.USER_CODE, JSON.stringify(data.userCode));
    }
    if (Array.isArray(data.bookmarks)) {
      setStoredBookmarks(data.bookmarks);
    }
    if (data.notes && typeof data.notes === 'object') {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(data.notes));
    }
    if (data.settings && typeof data.settings === 'object') {
      saveStoredSettings({ ...DEFAULT_SETTINGS, ...data.settings });
    }
    return true;
  } catch {
    return false;
  }
}

export function clearAllLocalProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.USER_CODE);
    localStorage.removeItem(STORAGE_KEYS.COMPLETED);
    localStorage.removeItem(STORAGE_KEYS.BOOKMARKS);
    localStorage.removeItem(STORAGE_KEYS.NOTES);
  } catch {}
}
