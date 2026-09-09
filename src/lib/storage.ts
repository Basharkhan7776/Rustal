import type { AppSettings } from '../types/exercise';

const STORAGE_KEYS = {
  CURRENT_EXERCISE: 'rustal_v1_current_exercise',
  USER_CODE: 'rustal_v1_user_code',
  COMPLETED: 'rustal_v1_completed_ids',
  BOOKMARKS: 'rustal_v1_bookmarks',
  NOTES: 'rustal_v1_notes',
  SETTINGS: 'rustal_v1_settings',
  ACTIVITY: 'rustal_v1_activity_history',
  INSTRUCTIONS_FONT_SIZE: 'rustal_v1_instructions_font_size',
  TERMINAL_FONT_SIZE: 'rustal_v1_terminal_font_size',
};

export function detectPlatform(): 'mac' | 'windows' {
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
    const nav = navigator as any;
    const p = nav.userAgentData?.platform || nav.platform || nav.userAgent || '';
    if (/Mac|iPhone|iPad|iPod/i.test(p)) {
      return 'mac';
    }
  }
  return 'windows';
}

export const DEFAULT_SETTINGS: AppSettings = {
  vimMode: false,
  fontSize: 14,
  theme: 'dark',
  autoRunOnLoad: false,
  keymapPlatform: detectPlatform(),
};

export interface LocalStorageSnapshot {
  version: 1;
  exportedAt: string;
  completedIds: string[];
  userCode: Record<string, string>;
  bookmarks: string[];
  notes: Record<string, string>;
  settings: AppSettings;
  activityHistory?: Record<string, number>;
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
    const detected = detectPlatform();
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw
      ? { ...DEFAULT_SETTINGS, keymapPlatform: detected, ...JSON.parse(raw) }
      : { ...DEFAULT_SETTINGS, keymapPlatform: detected };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {}
}

// Activity History for Practice Heatmap
export function getActivityHistory(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function recordDailyActivity(dateStr?: string, incrementBy = 1): Record<string, number> {
  try {
    const history = getActivityHistory();
    const date = dateStr || new Date().toISOString().slice(0, 10);
    history[date] = (history[date] || 0) + incrementBy;
    localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(history));
    return history;
  } catch {
    return {};
  }
}

// Instructions Font Size
export function getStoredInstructionsFontSize(defaultSize = 13): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INSTRUCTIONS_FONT_SIZE);
    if (!raw) return defaultSize;
    const parsed = parseInt(raw, 10);
    return isNaN(parsed) ? defaultSize : Math.max(11, Math.min(parsed, 20));
  } catch {
    return defaultSize;
  }
}

export function setStoredInstructionsFontSize(size: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.INSTRUCTIONS_FONT_SIZE, size.toString());
  } catch {}
}

// Terminal Font Size
export function getStoredTerminalFontSize(defaultSize = 12): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TERMINAL_FONT_SIZE);
    if (!raw) return defaultSize;
    const parsed = parseInt(raw, 10);
    return isNaN(parsed) ? defaultSize : Math.max(10, Math.min(parsed, 20));
  } catch {
    return defaultSize;
  }
}

export function setStoredTerminalFontSize(size: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TERMINAL_FONT_SIZE, size.toString());
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
    activityHistory: getActivityHistory(),
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
    if (data.activityHistory && typeof data.activityHistory === 'object') {
      localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(data.activityHistory));
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
    localStorage.removeItem(STORAGE_KEYS.ACTIVITY);
  } catch {}
}
