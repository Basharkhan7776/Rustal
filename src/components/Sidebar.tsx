import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Circle,
  Bookmark,
  ChevronDown,
  ChevronRight,
  Search,
  Layers,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { useRustlings } from '../context/RustlingsContext';
import { cn } from '../lib/utils';
import { Tooltip } from './ui/Tooltip';

export interface SidebarProps {
  width: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  width,
  collapsed,
  onToggleCollapse,
}) => {
  const {
    exercises,
    currentExercise,
    setCurrentExerciseId,
    completedIds,
    bookmarkedIds,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
  } = useRustlings();

  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() => {
    return { [currentExercise.category]: true };
  });

  const toggleCategory = (cat: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  const categories = useMemo(() => {
    const map = new Map<string, {
      id: string;
      title: string;
      order: number;
      exercises: typeof exercises;
    }>();

    exercises.forEach(ex => {
      if (!map.has(ex.category)) {
        map.set(ex.category, {
          id: ex.category,
          title: ex.categoryTitle,
          order: ex.categoryOrder,
          exercises: [],
        });
      }
      map.get(ex.category)!.exercises.push(ex);
    });

    return Array.from(map.values()).sort((a, b) => a.order - b.order);
  }, [exercises]);

  const filteredCategories = useMemo(() => {
    return categories
      .map(cat => {
        const matchingExercises = cat.exercises.filter(ex => {
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesName = ex.title.toLowerCase().includes(query) || ex.id.toLowerCase().includes(query);
            const matchesPath = ex.path.toLowerCase().includes(query);
            if (!matchesName && !matchesPath) return false;
          }

          if (filter === 'completed') return completedIds.has(ex.id);
          if (filter === 'pending') return !completedIds.has(ex.id);
          if (filter === 'bookmarked') return bookmarkedIds.has(ex.id);
          return true;
        });

        return {
          ...cat,
          exercises: matchingExercises,
        };
      })
      .filter(cat => cat.exercises.length > 0);
  }, [categories, searchQuery, filter, completedIds, bookmarkedIds]);

  if (collapsed) {
    return (
      <div className="w-12 border-r border-zinc-800/80 bg-[#09090b] flex flex-col items-center py-2.5 gap-3 shrink-0 select-none">
        <Tooltip content="Expand Sidebar" side="right">
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850 transition-colors"
          >
            <PanelLeft className="w-4 h-4 text-zinc-400" />
          </button>
        </Tooltip>
        <div className="h-px w-6 bg-zinc-800/80" />
        <div className="flex-1 flex flex-col items-center gap-1.5 overflow-y-auto w-full px-1">
          {exercises.map(ex => {
            const isDone = completedIds.has(ex.id);
            const isActive = ex.id === currentExercise.id;
            return (
              <Tooltip key={ex.id} content={`${ex.title} (${ex.categoryTitle})`} side="right">
                <button
                  onClick={() => setCurrentExerciseId(ex.id)}
                  className={cn(
                    'w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-mono transition-all',
                    isActive
                      ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 font-bold'
                      : isDone
                      ? 'text-zinc-300 hover:bg-zinc-850'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
                  )}
                >
                  {isDone ? '✓' : ex.order}
                </button>
              </Tooltip>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <aside
      style={{ width }}
      className="border-r border-zinc-800/80 bg-[#09090b] flex flex-col shrink-0 select-none overflow-hidden h-full"
    >
      {/* Sidebar Header */}
      <div className="p-3 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
          <Layers className="w-3.5 h-3.5 text-zinc-400" />
          <span>Curriculum Modules</span>
          <span className="text-[10px] text-zinc-400 bg-zinc-850 px-1.5 py-0.2 rounded-full border border-zinc-800">
            {exercises.length}
          </span>
        </div>
        <Tooltip content="Collapse Sidebar" side="bottom">
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <PanelLeftClose className="w-4 h-4 text-zinc-400" />
          </button>
        </Tooltip>
      </div>

      {/* Search Input */}
      <div className="p-2 border-b border-zinc-800/60">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Filter exercises..."
            className="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-200"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 mt-2">
          {(['all', 'pending', 'completed', 'bookmarked'] as const).map(f => {
            const count =
              f === 'all'
                ? exercises.length
                : f === 'completed'
                ? completedIds.size
                : f === 'bookmarked'
                ? bookmarkedIds.size
                : exercises.length - completedIds.size;

            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'flex-1 py-1 px-1.5 rounded-md text-[10px] font-medium transition-colors text-center truncate',
                  filter === f
                    ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                )}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Accordion Module List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-8 text-xs text-zinc-500">
            No exercises found matching your filter.
          </div>
        ) : (
          filteredCategories.map(cat => {
            const isOpen = openCategories[cat.id] ?? true;
            const completedInCat = cat.exercises.filter(e => completedIds.has(e.id)).length;
            const isCatAllDone = completedInCat === cat.exercises.length && cat.exercises.length > 0;

            return (
              <div key={cat.id} className="rounded-lg overflow-hidden border border-zinc-800/40 bg-zinc-900/30">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(cat.id)}
                  className="w-full px-2.5 py-1.5 flex items-center justify-between text-xs text-zinc-300 hover:bg-zinc-850 transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    {isOpen ? (
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    )}
                    <span className="font-medium text-zinc-200 truncate">{cat.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={cn(
                      "text-[10px] font-mono px-1.5 py-0.2 rounded-full border",
                      isCatAllDone
                        ? "bg-zinc-800 text-zinc-200 border-zinc-700"
                        : "text-zinc-400 bg-zinc-850 border-zinc-800"
                    )}>
                      {completedInCat}/{cat.exercises.length}
                    </span>
                  </div>
                </button>

                {/* Category Exercises */}
                {isOpen && (
                  <div className="pl-4 pr-1.5 py-1 space-y-0.5 border-t border-zinc-800/30">
                    {cat.exercises.map(ex => {
                      const isActive = ex.id === currentExercise.id;
                      const isDone = completedIds.has(ex.id);
                      const isBookmarked = bookmarkedIds.has(ex.id);

                      return (
                        <button
                          key={ex.id}
                          onClick={() => setCurrentExerciseId(ex.id)}
                          className={cn(
                            'w-full text-left px-2 py-1 rounded-md text-xs flex items-center justify-between gap-1.5 transition-all group',
                            isActive
                              ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 font-medium'
                              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                          )}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {isDone ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
                            ) : isActive ? (
                              <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
                              </div>
                            ) : (
                              <Circle className="w-3 h-3 text-zinc-600 shrink-0" />
                            )}
                            <span className="truncate">{ex.title}</span>
                          </div>

                          {/* Removed run badge - now only bookmark indicator if bookmarked */}
                          {isBookmarked && (
                            <Bookmark className="w-3 h-3 fill-zinc-300 text-zinc-300 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-2.5 border-t border-zinc-800/80 bg-zinc-950/40 text-[11px] text-zinc-500 flex items-center justify-between">
        <span>Press <kbd className="px-1 py-0.2 text-[10px] font-mono bg-zinc-850 text-zinc-400 rounded border border-zinc-800">⌘K</kbd> to quick switch</span>
        <span className="font-mono">{completedIds.size}/{exercises.length}</span>
      </div>
    </aside>
  );
};
