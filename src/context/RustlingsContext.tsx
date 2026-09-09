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
  getActivityHistory,
  recordDailyActivity,
  clearAllLocalProgress,
} from '../lib/storage';
import { executeRustCode } from '../services/compiler';

const exercises: Exercise[] = rawExercises as Exercise[];

export type MobileTab = 'code' | 'terminal' | 'theory' | 'hint' | 'solution';

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
  activityHistory: Record<string, number>;
  filter: 'all' | 'pending' | 'completed' | 'bookmarked';
  setFilter: (f: 'all' | 'pending' | 'completed' | 'bookmarked') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  settings: AppSettings;
  updateSettings: (s: Partial<AppSettings>) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;
  terminalCollapsed: boolean;
  setTerminalCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  toggleTerminal: () => void;
  mobileTab: MobileTab;
  setMobileTab: (tab: MobileTab) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleMobileSidebar: () => void;
  getShortcut: (mac: string, win: string) => string;
  showCommandPalette: boolean;
  setShowCommandPalette: (b: boolean) => void;
  showSolutionModal: boolean;
  setShowSolutionModal: (b: boolean) => void;
  showSettingsModal: boolean;
  setShowSettingsModal: (b: boolean) => void;
  showResetModal: boolean;
  setShowResetModal: (b: boolean) => void;
  resetAllProgress: () => void;
  canInstall: boolean;
  isInstalled: boolean;
  showInstallBanner: boolean;
  promptInstall: () => Promise<void>;
  dismissInstallBanner: () => void;
  isEditorFocused: boolean;
  setIsEditorFocused: React.Dispatch<React.SetStateAction<boolean>>;
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

  const [activityHistory, setActivityHistory] = useState<Record<string, number>>(() => {
    return getActivityHistory();
  });

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<CompileResult | null>(null);

  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'bookmarked'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isEditorFocused, setIsEditorFocused] = useState<boolean>(false);

  const [showCommandPalette, setShowCommandPalette] = useState<boolean>(false);
  const [showSolutionModal, setShowSolutionModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [terminalCollapsed, setTerminalCollapsed] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('code');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const toggleTerminal = useCallback(() => {
    setTerminalCollapsed(prev => !prev);
  }, []);

  const toggleMobileSidebar = useCallback(() => {
    setMobileSidebarOpen(prev => !prev);
  }, []);

  const getShortcut = useCallback(
    (mac: string, win: string) => {
      return settings.keymapPlatform === 'mac' ? mac : win;
    },
    [settings.keymapPlatform]
  );

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
      setMobileSidebarOpen(false);
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
        const updatedActivity = recordDailyActivity();
        setActivityHistory({ ...updatedActivity });
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

    // On mobile screens, automatically navigate to the terminal view so output is visible
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setMobileTab('terminal');
    }

    try {
      const result = await executeRustCode(currentCode, currentExercise.mode);
      setLastResult(result);

      if (result.success) {
        setCompletedIds(prev => {
          if (!prev.has(currentExercise.id)) {
            const next = new Set(prev);
            next.add(currentExercise.id);
            setStoredCompletedIds(Array.from(next));
            const updated = recordDailyActivity();
            setActivityHistory({ ...updated });
            return next;
          }
          return prev;
        });

        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#ffffff', '#a1a1aa', '#71717a', '#27272a'],
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
    setActivityHistory({});
    setCurrentId(exercises[0]?.id || 'intro1');
    setLastResult(null);
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();

      const isAnyModalOpen =
        showCommandPalette || showSettingsModal || showSolutionModal || showResetModal || mobileSidebarOpen;

      // If Escape is pressed, dismiss any open modal / drawer
      if (e.key === 'Escape') {
        if (mobileSidebarOpen) setMobileSidebarOpen(false);
        if (showCommandPalette) setShowCommandPalette(false);
        if (showSettingsModal) setShowSettingsModal(false);
        if (showSolutionModal) setShowSolutionModal(false);
        if (showResetModal) setShowResetModal(false);
        return;
      }

      // If a modal is open, avoid triggering workspace actions (except Escape)
      if (isAnyModalOpen) {
        return;
      }

      // Sidebar Toggle: Ctrl+B or Cmd+B (also supports Ctrl+\)
      if (isCmdOrCtrl && (key === 'b' || e.key === '\\')) {
        e.preventDefault();
        e.stopPropagation();
        toggleSidebar();
        return;
      }

      // Terminal Toggle: Ctrl+T or Cmd+T (with Ctrl+J or Ctrl+` fallbacks for browser safety)
      if (
        (isCmdOrCtrl && key === 't') ||
        (isCmdOrCtrl && key === 'j') ||
        (isCmdOrCtrl && e.key === '`')
      ) {
        e.preventDefault();
        e.stopPropagation();
        toggleTerminal();
        return;
      }

      // Compile & Run: Ctrl+Shift+Enter or Cmd+Shift+Enter (also Ctrl+Enter / Cmd+Enter)
      if (isCmdOrCtrl && e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        runCode();
        return;
      }

      // Search / Command Palette: Ctrl+K or Cmd+K
      if (isCmdOrCtrl && key === 'k') {
        e.preventDefault();
        e.stopPropagation();
        setShowCommandPalette(prev => !prev);
        return;
      }

      // Navigation: Alt+ArrowRight / Alt+ArrowLeft
      if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        e.stopPropagation();
        nextExercise();
        return;
      }

      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        e.stopPropagation();
        prevExercise();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [
    runCode,
    toggleSidebar,
    toggleTerminal,
    nextExercise,
    prevExercise,
    showCommandPalette,
    showSettingsModal,
    showSolutionModal,
    showResetModal,
    mobileSidebarOpen,
  ]);

  // ================= PWA INSTALLATION SUPPORT =================
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
  });
  const [showInstallBanner, setShowInstallBanner] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem('rustal_pwa_banner_dismissed');
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent automatic prompt to give user our slick in-app experience
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice?.outcome === 'accepted') {
        setIsInstalled(true);
        setShowInstallBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback instruction for browsers
      alert(
        'To install Rustal locally on Chrome / Edge:\n• Click the Install icon (⊕ / 📥) in your browser address bar\n• Or open browser menu (⋮) -> "Install Rustal"'
      );
    }
  };

  const dismissInstallBanner = () => {
    setShowInstallBanner(false);
    try {
      localStorage.setItem('rustal_pwa_banner_dismissed', 'true');
    } catch {}
  };

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
    activityHistory,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    settings,
    updateSettings,
    sidebarCollapsed,
    setSidebarCollapsed,
    toggleSidebar,
    terminalCollapsed,
    setTerminalCollapsed,
    toggleTerminal,
    mobileTab,
    setMobileTab,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    toggleMobileSidebar,
    getShortcut,
    showCommandPalette,
    setShowCommandPalette,
    showSolutionModal,
    setShowSolutionModal,
    showSettingsModal,
    setShowSettingsModal,
    showResetModal,
    setShowResetModal,
    resetAllProgress,
    canInstall: !!deferredPrompt,
    isInstalled,
    showInstallBanner,
    promptInstall,
    dismissInstallBanner,
    isEditorFocused,
    setIsEditorFocused,
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
