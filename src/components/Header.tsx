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
  Terminal,
  Menu,
  MoreVertical,
} from 'lucide-react';
import { useRustlings } from '../context/RustlingsContext';
import { Button } from './ui/Button';
import { Tooltip } from './ui/Tooltip';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from './ui/DropdownMenu';

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
    terminalCollapsed,
    toggleTerminal,
    toggleMobileSidebar,
    getShortcut,
    setShowSolutionModal,
    setShowSettingsModal,
    setShowCommandPalette,
  } = useRustlings();

  const isCompleted = completedIds.has(currentExercise.id);
  const isBookmarked = bookmarkedIds.has(currentExercise.id);
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <header className="h-12 border-b border-zinc-800/80 bg-[#09090b] px-3 flex items-center justify-between gap-2 select-none shrink-0 z-20">
      {/* ================= DESKTOP HEADER LEFT ================= */}
      <div className="hidden md:flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 font-bold text-xs">
            🦀
          </div>
          <span className="font-semibold text-sm text-zinc-100 tracking-tight leading-tight">
            Rustal
          </span>
        </div>

        <div className="h-4 w-px bg-zinc-800/80 mx-1" />

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 truncate">
          <span className="text-zinc-500">{currentExercise.categoryTitle}</span>
          <span className="text-zinc-600">/</span>
          <span className="font-medium text-zinc-200 truncate">{currentExercise.title}</span>
        </div>
      </div>

      {/* ================= MOBILE HEADER LEFT ================= */}
      <div className="flex md:hidden items-center gap-2 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMobileSidebar}
          className="h-8 w-8 text-zinc-400 hover:text-zinc-100 shrink-0"
          aria-label="Open Curriculum Modules"
        >
          <Menu className="w-4 h-4 text-zinc-400" />
        </Button>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-sm">🦀</span>
          <span className="font-semibold text-sm text-zinc-100 tracking-tight leading-tight hidden xs:inline">
            Rustal
          </span>
        </div>

        {/* Compact exercise title badge */}
        <span className="font-mono text-[11px] text-zinc-300 bg-zinc-850 px-2 py-0.5 rounded border border-zinc-800 truncate max-w-[120px]">
          {currentExercise.title}
        </span>
      </div>

      {/* ================= DESKTOP PROGRESS BAR ================= */}
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

      {/* ================= DESKTOP CONTROLS ================= */}
      <div className="hidden md:flex items-center gap-1.5 shrink-0">
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

        {/* Run & Test Button */}
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

      {/* ================= MOBILE CONTROLS ================= */}
      <div className="flex md:hidden items-center gap-1.5 shrink-0">
        {/* Mobile Prev / Next Navigation */}
        <div className="flex items-center border border-zinc-800 rounded-lg p-0.5 bg-zinc-900/60">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevExercise}
            className="h-7 w-7 text-zinc-400 hover:text-zinc-100"
            aria-label="Previous exercise"
          >
            <ChevronLeft className="w-4 h-4 text-zinc-400" />
          </Button>
          <div className="w-px h-3.5 bg-zinc-800" />
          <Button
            variant="ghost"
            size="icon"
            onClick={nextExercise}
            className="h-7 w-7 text-zinc-400 hover:text-zinc-100"
            aria-label="Next exercise"
          >
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </Button>
        </div>

        {/* Mobile Primary Run Button */}
        <Button
          variant="primary"
          size="icon"
          disabled={isRunning}
          onClick={runCode}
          className="h-8 w-8"
          aria-label="Run and test code"
        >
          {isRunning ? (
            <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
          ) : (
            <Play className="w-4 h-4 fill-zinc-950 text-zinc-950 ml-0.5" />
          )}
        </Button>

        {/* Mobile More Actions Dropdown Menu */}
        <DropdownMenu
          trigger={
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
              aria-label="More actions"
            >
              <MoreVertical className="w-4 h-4 text-zinc-400" />
            </Button>
          }
          align="right"
        >
          {/* Search */}
          <DropdownMenuItem
            icon={<Search className="w-3.5 h-3.5 text-zinc-400" />}
            onClick={() => setShowCommandPalette(true)}
            shortcut={getShortcut('⌘K', 'Ctrl+K')}
          >
            Search Curriculum
          </DropdownMenuItem>

          {/* Mark Complete */}
          <DropdownMenuItem
            icon={
              <CheckCircle2
                className={`w-3.5 h-3.5 ${isCompleted ? 'text-zinc-100 fill-zinc-700' : 'text-zinc-400'}`}
              />
            }
            onClick={() => toggleCompleted(currentExercise.id)}
          >
            {isCompleted ? 'Mark as Incomplete' : 'Mark as Completed'}
          </DropdownMenuItem>

          {/* Bookmark */}
          <DropdownMenuItem
            icon={
              <Bookmark
                className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-zinc-200 text-zinc-200' : 'text-zinc-400'}`}
              />
            }
            onClick={() => toggleBookmark(currentExercise.id)}
          >
            {isBookmarked ? 'Remove Bookmark' : 'Bookmark Exercise'}
          </DropdownMenuItem>

          {/* Reset Code */}
          <DropdownMenuItem
            icon={<RotateCcw className="w-3.5 h-3.5 text-zinc-400" />}
            onClick={resetCurrentCode}
          >
            Reset Starter Code
          </DropdownMenuItem>

          {/* Reveal Solution */}
          <DropdownMenuItem
            icon={<Sparkles className="w-3.5 h-3.5 text-zinc-400" />}
            onClick={() => setShowSolutionModal(true)}
          >
            Reveal Official Solution
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Progress Overview */}
          <div className="px-2.5 py-1.5 space-y-1 select-none">
            <div className="flex items-center justify-between text-[10px] text-zinc-400">
              <span>Curriculum Progress</span>
              <span className="font-mono text-zinc-300">
                {completedCount}/{totalCount} ({progressPercent}%)
              </span>
            </div>
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-zinc-300 transition-all rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Settings & Dashboard */}
          <DropdownMenuItem
            icon={<Settings className="w-3.5 h-3.5 text-zinc-400" />}
            onClick={() => setShowSettingsModal(true)}
          >
            Dashboard & Settings
          </DropdownMenuItem>
        </DropdownMenu>
      </div>
    </header>
  );
};
