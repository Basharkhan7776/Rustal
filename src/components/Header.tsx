import React from 'react';
import {
  Play,
  RotateCcw,
  Sparkles,
  Search,
  ChevronLeft,
  ChevronRight,
  Settings,
  CheckCircle2,
  Bookmark,
  Loader2,
  PanelLeft,
  Terminal,
} from 'lucide-react';
import { useRustlings } from '../context/RustlingsContext';
import { Button } from './ui/Button';
import { Tooltip } from './ui/Tooltip';

export const Header: React.FC = () => {
  const {
    currentExercise,
    nextExercise,
    prevExercise,
    runCode,
    isRunning,
    completedCount,
    totalCount,
    completedIds,
    toggleCompleted,
    bookmarkedIds,
    toggleBookmark,
    resetCurrentCode,
    sidebarCollapsed,
    toggleSidebar,
    terminalCollapsed,
    toggleTerminal,
    getShortcut,
    setShowSolutionModal,
    setShowSettingsModal,
    setShowCommandPalette,
  } = useRustlings();

  const isCompleted = completedIds.has(currentExercise.id);
  const isBookmarked = bookmarkedIds.has(currentExercise.id);
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <header className="h-12 border-b border-zinc-800/80 bg-[#09090b] px-3 flex items-center justify-between gap-4 select-none shrink-0 z-20">
      {/* Left branding & current exercise info */}
      <div className="flex items-center gap-2 min-w-0">
        <Tooltip
          content={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          shortcut={getShortcut('⌘B', 'Ctrl+B')}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
          >
            <PanelLeft className="w-4 h-4 text-zinc-400" />
          </Button>
        </Tooltip>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 font-bold text-xs">
            🦀
          </div>
          <span className="font-semibold text-sm text-zinc-100 tracking-tight leading-tight">
            Rustal
          </span>
        </div>

        <div className="h-4 w-px bg-zinc-800/80 mx-1 hidden sm:block" />

        {/* Breadcrumb (without any run/test badge) */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400 truncate">
          <span className="text-zinc-500">{currentExercise.categoryTitle}</span>
          <span className="text-zinc-600">/</span>
          <span className="font-medium text-zinc-200 truncate">{currentExercise.title}</span>
        </div>
      </div>

      {/* Center: Overall Progress bar */}
      <div className="hidden md:flex items-center gap-3 max-w-xs w-full">
        <div className="flex-1">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
            <span className="text-zinc-400 font-medium">Progress</span>
            <span className="font-mono text-zinc-400">
              {completedCount} / {totalCount} ({progressPercent}%)
            </span>
          </div>
          <div className="h-1.5 w-full bg-zinc-800/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-zinc-300 transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Right controls: Icon buttons with tooltips instead of text labels */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Search button trigger */}
        <Tooltip content="Search exercises" shortcut={getShortcut('⌘K', 'Ctrl+K')}>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setShowCommandPalette(true)}
            className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
          >
            <Search className="w-4 h-4 text-zinc-400" />
          </Button>
        </Tooltip>

        {/* Prev / Next navigation */}
        <div className="flex items-center border border-zinc-800 rounded-lg p-0.5 bg-zinc-900/60">
          <Tooltip content="Previous exercise" shortcut={getShortcut('⌥←', 'Alt+←')}>
            <Button
              variant="ghost"
              size="icon"
              onClick={prevExercise}
              className="h-7 w-7 text-zinc-400 hover:text-zinc-100"
            >
              <ChevronLeft className="w-4 h-4 text-zinc-400" />
            </Button>
          </Tooltip>
          <div className="w-px h-3.5 bg-zinc-800" />
          <Tooltip content="Next exercise" shortcut={getShortcut('⌥→', 'Alt+→')}>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextExercise}
              className="h-7 w-7 text-zinc-400 hover:text-zinc-100"
            >
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </Button>
          </Tooltip>
        </div>

        {/* Bookmark button */}
        <Tooltip content={isBookmarked ? 'Remove bookmark' : 'Bookmark exercise'}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleBookmark(currentExercise.id)}
            className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
          >
            <Bookmark
              className={`w-4 h-4 ${isBookmarked ? 'fill-zinc-200 text-zinc-200' : 'text-zinc-400'}`}
            />
          </Button>
        </Tooltip>

        {/* Mark completed button */}
        <Tooltip content={isCompleted ? 'Mark incomplete' : 'Mark completed'}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleCompleted(currentExercise.id)}
            className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
          >
            <CheckCircle2
              className={`w-4 h-4 ${isCompleted ? 'text-zinc-100 fill-zinc-800' : 'text-zinc-400'}`}
            />
          </Button>
        </Tooltip>

        {/* Reset starter code button */}
        <Tooltip content="Reset to starter code">
          <Button
            variant="secondary"
            size="icon"
            onClick={resetCurrentCode}
            className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
          >
            <RotateCcw className="w-4 h-4 text-zinc-400" />
          </Button>
        </Tooltip>

        {/* View Solution button */}
        <Tooltip content="Reveal solution">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setShowSolutionModal(true)}
            className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
          >
            <Sparkles className="w-4 h-4 text-zinc-400" />
          </Button>
        </Tooltip>

        {/* Run & Test Button (Primary Icon Button with tooltip) */}
        <Tooltip content="Run & Test" shortcut={getShortcut('⌘⇧↵', 'Ctrl+Shift+Enter')}>
          <Button
            variant="primary"
            size="icon"
            disabled={isRunning}
            onClick={runCode}
            className="h-8 w-8"
          >
            {isRunning ? (
              <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
            ) : (
              <Play className="w-4 h-4 fill-zinc-950 text-zinc-950 ml-0.5" />
            )}
          </Button>
        </Tooltip>

        {/* Terminal Toggle Button */}
        <Tooltip
          content={terminalCollapsed ? 'Expand terminal' : 'Collapse terminal'}
          shortcut={getShortcut('⌘T', 'Ctrl+T')}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTerminal}
            className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
          >
            <Terminal className="w-4 h-4 text-zinc-400" />
          </Button>
        </Tooltip>

        {/* Settings button */}
        <Tooltip content="Settings & Data">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettingsModal(true)}
            className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
          >
            <Settings className="w-4 h-4 text-zinc-400" />
          </Button>
        </Tooltip>
      </div>
    </header>
  );
};
