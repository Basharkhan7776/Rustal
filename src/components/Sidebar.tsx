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

export const Sidebar: React.FC = () => {
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

  const [collapsed, setCollapsed] = useState(false);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() => {
    // Default open the active exercise's category
    return { [currentExercise.category]: true };
  });

  const toggleCategory = (cat: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  // Group exercises by category
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

  // Filter exercises
  const filteredCategories = useMemo(() => {
    return categories
      .map(cat => {
        const matchingExercises = cat.exercises.filter(ex => {
          // Search query filter
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesName = ex.title.toLowerCase().includes(query) || ex.id.toLowerCase().includes(query);
            const matchesPath = ex.path.toLowerCase().includes(query);
            if (!matchesName && !matchesPath) return false;
          }

          // Tab filter
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
      <div className="w-12 border-r border-zinc-800/80 bg-[#0c0c0f] flex flex-col items-center py-3 gap-4 shrink-0 select-none">
        <button
          onClick={() => setCollapsed(false)}
          title="Expand Sidebar"
          className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors"
        >
          <PanelLeft className="w-4 h-4" />
        </button>
        <div className="h-px w-6 bg-zinc-800" />
        <div className="flex-1 flex flex-col items-center gap-2 overflow-y-auto w-full px-1">
          {exercises.map(ex => {
            const isDone = completedIds.has(ex.id);
            const isActive = ex.id === currentExercise.id;
            return (
              <button
                key={ex.id}
                onClick={() => setCurrentExerciseId(ex.id)}
                title={`${ex.title} (${ex.categoryTitle})`}
                className={cn(
                  'w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-mono transition-all',
                  isActive
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 font-bold'
                    : isDone
                    ? 'text-emerald-400 hover:bg-zinc-800/60'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40'
                )}
              >
                {isDone ? '✓' : ex.order}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <aside className="w-72 border-r border-zinc-800/80 bg-[#0c0c0f] flex flex-col shrink-0 select-none overflow-hidden h-full">
      {/* Sidebar Header */}
      <div className="p-3 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
          <Layers className="w-3.5 h-3.5 text-orange-400" />
          <span>Curriculum Modules</span>
          <span className="text-[10px] text-zinc-400 bg-zinc-800 px-1.5 py-0.2 rounded-full">
            {exercises.length}
          </span>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          title="Collapse Sidebar"
          className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
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
            className="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-orange-500/30"
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
                    ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/80 shadow-xs'
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
          <div className="text-center py-8 text-xs text-zinc-400">
            No exercises found matching your filter.
          </div>
        ) : (
          filteredCategories.map(cat => {
            const isOpen = openCategories[cat.id] ?? true;
            const completedInCat = cat.exercises.filter(e => completedIds.has(e.id)).length;
            const isCatAllDone = completedInCat === cat.exercises.length && cat.exercises.length > 0;

            return (
              <div key={cat.id} className="rounded-lg overflow-hidden border border-zinc-800/40 bg-zinc-900/20">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(cat.id)}
                  className="w-full px-2.5 py-1.5 flex items-center justify-between text-xs text-zinc-300 hover:bg-zinc-800/40 transition-colors"
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
                      "text-[10px] font-mono px-1.5 py-0.2 rounded-full",
                      isCatAllDone
                        ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/50"
                        : "text-zinc-400 bg-zinc-800/80"
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
                              ? 'bg-orange-500/15 text-orange-200 border border-orange-500/30 font-medium'
                              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                          )}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {isDone ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : isActive ? (
                              <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                                <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                              </div>
                            ) : (
                              <Circle className="w-3 h-3 text-zinc-400 shrink-0" />
                            )}
                            <span className="truncate">{ex.title}</span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {isBookmarked && (
                              <Bookmark className="w-3 h-3 fill-amber-400 text-amber-400" />
                            )}
                            <span className="text-[9px] font-mono text-zinc-400 opacity-60 group-hover:opacity-100">
                              {ex.mode === 'test' ? 'test' : 'run'}
                            </span>
                          </div>
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
      <div className="p-2.5 border-t border-zinc-800/80 bg-zinc-950/40 text-[11px] text-zinc-400 flex items-center justify-between">
        <span>Press <kbd className="px-1 py-0.2 text-[10px] font-mono bg-zinc-800 rounded border border-zinc-700">⌘K</kbd> to quick switch</span>
        <span className="font-mono">{completedIds.size}/{exercises.length}</span>
      </div>
    </aside>
  );
};
