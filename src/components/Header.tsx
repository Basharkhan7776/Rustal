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
  FlaskConical,
  Terminal,
  Loader2,
} from 'lucide-react';
import { useRustlings } from '../context/RustlingsContext';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

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
    setShowSolutionModal,
    setShowSettingsModal,
    setShowCommandPalette,
  } = useRustlings();

  const isCompleted = completedIds.has(currentExercise.id);
  const isBookmarked = bookmarkedIds.has(currentExercise.id);
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <header className="h-14 border-b border-zinc-800/80 bg-[#0c0c0f] px-4 flex items-center justify-between gap-4 select-none shrink-0 z-20">
      {/* Left branding & current exercise info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm shadow-inner">
            🦀
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-zinc-100 tracking-tight leading-tight flex items-center gap-1.5">
              Rustal
              <span className="text-[10px] font-normal px-1.5 py-0.2 rounded-sm bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                v6.5
              </span>
            </span>
            <span className="text-[10px] text-zinc-400 hidden sm:inline leading-none">
              Interactive Rustlings
            </span>
          </div>
        </div>

        <div className="h-4 w-px bg-zinc-800 mx-1 hidden md:block" />

        {/* Breadcrumb */}
        <div className="hidden md:flex items-center gap-2 text-xs text-zinc-400 truncate">
          <span className="text-zinc-500">{currentExercise.categoryTitle}</span>
          <span className="text-zinc-600">/</span>
          <span className="font-semibold text-zinc-200 truncate">{currentExercise.title}</span>
          <Badge
            variant={currentExercise.mode === 'test' ? 'info' : 'warning'}
            size="sm"
            className="ml-1 shrink-0"
          >
            {currentExercise.mode === 'test' ? (
              <>
                <FlaskConical className="w-2.5 h-2.5" /> tests
              </>
            ) : (
              <>
                <Terminal className="w-2.5 h-2.5" /> run
              </>
            )}
          </Badge>
        </div>
      </div>

      {/* Center: Overall Progress bar */}
      <div className="hidden lg:flex items-center gap-3 max-w-xs w-full">
        <div className="flex-1">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
            <span className="font-medium text-zinc-300">Curriculum Progress</span>
            <span className="font-mono text-zinc-400">
              {completedCount} / {totalCount} ({progressPercent}%)
            </span>
          </div>
          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-emerald-400 transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Search button trigger */}
        <button
          onClick={() => setShowCommandPalette(true)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all"
        >
          <Search className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden sm:inline">Jump to...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-zinc-800 text-zinc-400 rounded border border-zinc-700">
            ⌘K
          </kbd>
        </button>

        {/* Prev / Next navigation */}
        <div className="flex items-center border border-zinc-800 rounded-lg p-0.5 bg-zinc-900/60">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevExercise}
            title="Previous Exercise (Alt + ←)"
            className="h-7 w-7 text-zinc-400 hover:text-zinc-100"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="w-px h-3.5 bg-zinc-800" />
          <Button
            variant="ghost"
            size="icon"
            onClick={nextExercise}
            title="Next Exercise (Alt + →)"
            className="h-7 w-7 text-zinc-400 hover:text-zinc-100"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Bookmark button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleBookmark(currentExercise.id)}
          title={isBookmarked ? 'Remove bookmark' : 'Bookmark exercise'}
          className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
        >
          <Bookmark
            className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400 text-amber-400' : 'text-zinc-400'}`}
          />
        </Button>

        {/* Manual Mark complete button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => toggleCompleted(currentExercise.id)}
          title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
          className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
        >
          <CheckCircle2
            className={`w-4 h-4 ${isCompleted ? 'text-emerald-400 fill-emerald-500/20' : 'text-zinc-500'}`}
          />
        </Button>

        {/* Reset starter code */}
        <Button
          variant="outline"
          size="sm"
          onClick={resetCurrentCode}
          title="Reset to starter code"
          className="hidden md:flex text-zinc-400 hover:text-zinc-200"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </Button>

        {/* View Solution */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSolutionModal(true)}
          className="hidden sm:flex text-zinc-300 hover:text-zinc-100"
        >
          <Sparkles className="w-3.5 h-3.5 text-orange-400" />
          Solution
        </Button>

        {/* Run & Test Button */}
        <Button
          variant="primary"
          size="sm"
          disabled={isRunning}
          onClick={runCode}
          className="relative group shadow-md shadow-orange-950/40"
          title="Run & Test (⌘ + Enter)"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Running...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Run & Test</span>
              <kbd className="hidden lg:inline-block ml-1 px-1 py-0.2 text-[9px] font-mono bg-orange-600/60 rounded text-orange-100">
                ⌘↵
              </kbd>
            </>
          )}
        </Button>

        {/* Settings button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSettingsModal(true)}
          title="Settings & Data"
          className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
};
