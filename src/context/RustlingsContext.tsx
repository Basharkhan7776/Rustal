import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import rawExercises from '../data/exercises.json';
import type { Exercise, CompileResult, AppSettings } from '../types/exercise';
import {
  getStoredCurrentExercise,
  setStoredCurrentExercise,
  getStoredUserCodes,
  saveStoredUserCode,
  removeStoredUserCode,
  getStoredCompletedIds,
  setStoredCompletedIds,
  getStoredBookmarks,
  setStoredBookmarks,
  getStoredSettings,
  saveStoredSettings,
  clearAllLocalProgress,
} from '../lib/storage';
import { executeRustCode } from '../services/compiler';

const exercises: Exercise[] = rawExercises as Exercise[];

interface RustlingsContextValue {
  exercises: Exercise[];
  currentExercise: Exercise;
  currentCode: string;
  setCurrentExerciseId: (id: string) => void;
  nextExercise: () => void;
  prevExercise: () => void;
  updateCode: (code: string) => void;
  resetCurrentCode: () => void;
  applySolution: () => void;
  completedIds: Set<string>;
  toggleCompleted: (id: string) => void;
  bookmarkedIds: Set<string>;
  toggleBookmark: (id: string) => void;
  runCode: () => Promise<void>;
  isRunning: boolean;
  lastResult: CompileResult | null;
  clearLastResult: () => void;
  completedCount: number;
  totalCount: number;
  filter: 'all' | 'pending' | 'completed' | 'bookmarked';
  setFilter: (f: 'all' | 'pending' | 'completed' | 'bookmarked') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  settings: AppSettings;
  updateSettings: (s: Partial<AppSettings>) => void;
  showCommandPalette: boolean;
  setShowCommandPalette: (b: boolean) => void;
  showSolutionModal: boolean;
  setShowSolutionModal: (b: boolean) => void;
  showSettingsModal: boolean;
  setShowSettingsModal: (b: boolean) => void;
  showResetModal: boolean;
  setShowResetModal: (b: boolean) => void;
  resetAllProgress: () => void;
}

const RustlingsContext = createContext<RustlingsContextValue | null>(null);

export function RustlingsProvider({ children }: { children: React.ReactNode }) {
  const [currentId, setCurrentId] = useState<string>(() => {
    return getStoredCurrentExercise(exercises[0]?.id || 'intro1');
  });

  const [completedIds, setCompletedIds] = useState<Set<string>>(() => {
    return new Set(getStoredCompletedIds());
  });

  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => {
    return new Set(getStoredBookmarks());
  });

  const [userCodes, setUserCodes] = useState<Record<string, string>>(() => {
    return getStoredUserCodes();
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    return getStoredSettings();
  });

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<CompileResult | null>(null);

  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'bookmarked'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [showCommandPalette, setShowCommandPalette] = useState<boolean>(false);
  const [showSolutionModal, setShowSolutionModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);

  const currentExercise = exercises.find(e => e.id === currentId) || exercises[0];

  const currentCode = userCodes[currentExercise.id] !== undefined
    ? userCodes[currentExercise.id]
    : currentExercise.starterCode;

  const setCurrentExerciseId = useCallback((id: string) => {
    const target = exercises.find(e => e.id === id);
    if (target) {
      setCurrentId(id);
      setStoredCurrentExercise(id);
      setLastResult(null);
    }
  }, []);

  const nextExercise = useCallback(() => {
    const curIdx = exercises.findIndex(e => e.id === currentExercise.id);
    if (curIdx < exercises.length - 1) {
      setCurrentExerciseId(exercises[curIdx + 1].id);
    }
  }, [currentExercise.id, setCurrentExerciseId]);

  const prevExercise = useCallback(() => {
    const curIdx = exercises.findIndex(e => e.id === currentExercise.id);
    if (curIdx > 0) {
      setCurrentExerciseId(exercises[curIdx - 1].id);
    }
  }, [currentExercise.id, setCurrentExerciseId]);

  const updateCode = useCallback((code: string) => {
    setUserCodes(prev => ({
      ...prev,
      [currentExercise.id]: code,
    }));
    saveStoredUserCode(currentExercise.id, code);
  }, [currentExercise.id]);

  const resetCurrentCode = useCallback(() => {
    setUserCodes(prev => {
      const next = { ...prev };
      delete next[currentExercise.id];
      return next;
    });
    removeStoredUserCode(currentExercise.id);
    setLastResult(null);
  }, [currentExercise.id]);

  const applySolution = useCallback(() => {
    if (currentExercise.solutionCode) {
      updateCode(currentExercise.solutionCode);
    }
  }, [currentExercise.solutionCode, updateCode]);

  const toggleCompleted = useCallback((id: string) => {
    setCompletedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      setStoredCompletedIds(Array.from(next));
      return next;
    });
  }, []);

  const toggleBookmark = useCallback((id: string) => {
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      setStoredBookmarks(Array.from(next));
      return next;
    });
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      saveStoredSettings(updated);
      return updated;
    });
  }, []);

  const runCode = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    setLastResult(null);

    try {
      const result = await executeRustCode(currentCode, currentExercise.mode);
      setLastResult(result);

      if (result.success) {
        // Mark as completed
        setCompletedIds(prev => {
          if (!prev.has(currentExercise.id)) {
            const next = new Set(prev);
            next.add(currentExercise.id);
            setStoredCompletedIds(Array.from(next));
            return next;
          }
          return prev;
        });

        // Trigger celebratory confetti
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#f97316', '#22c55e', '#38bdf8', '#eab308'],
        });
      }
    } catch (e: any) {
      setLastResult({
        success: false,
        stdout: '',
        stderr: e?.message || 'Execution error',
        exitDetail: 'Failed',
        executionTimeMs: 0,
      });
    } finally {
      setIsRunning(false);
    }
  }, [currentCode, currentExercise.id, currentExercise.mode, isRunning]);

  const resetAllProgress = useCallback(() => {
    clearAllLocalProgress();
    setCompletedIds(new Set());
    setBookmarkedIds(new Set());
    setUserCodes({});
    setCurrentId(exercises[0]?.id || 'intro1');
    setLastResult(null);
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      // Cmd+Enter / Ctrl+Enter: Run
      if (isCmdOrCtrl && e.key === 'Enter') {
        e.preventDefault();
        runCode();
        return;
      }

      // Cmd+K / Ctrl+K: Search palette
      if (isCmdOrCtrl && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
        return;
      }

      // Alt+ArrowRight: Next
      if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        nextExercise();
        return;
      }

      // Alt+ArrowLeft: Prev
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        prevExercise();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [runCode, nextExercise, prevExercise]);

  const value: RustlingsContextValue = {
    exercises,
    currentExercise,
    currentCode,
    setCurrentExerciseId,
    nextExercise,
    prevExercise,
    updateCode,
    resetCurrentCode,
    applySolution,
    completedIds,
    toggleCompleted,
    bookmarkedIds,
    toggleBookmark,
    runCode,
    isRunning,
    lastResult,
    clearLastResult: () => setLastResult(null),
    completedCount: completedIds.size,
    totalCount: exercises.length,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    settings,
    updateSettings,
    showCommandPalette,
    setShowCommandPalette,
    showSolutionModal,
    setShowSolutionModal,
    showSettingsModal,
    setShowSettingsModal,
    showResetModal,
    setShowResetModal,
    resetAllProgress,
  };

  return (
    <RustlingsContext.Provider value={value}>
      {children}
    </RustlingsContext.Provider>
  );
}

// oxlint-disable-next-line react/only-export-components
export function useRustlings(): RustlingsContextValue {
  const ctx = useContext(RustlingsContext);
  if (!ctx) {
    throw new Error('useRustlings must be used within a RustlingsProvider');
  }
  return ctx;
}
