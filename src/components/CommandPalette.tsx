import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, CheckCircle2, Circle, CornerDownLeft } from 'lucide-react';
import { useRustlings } from '../context/RustlingsContext';
import { cn } from '../lib/utils';
import { Badge } from './ui/Badge';

const CommandPaletteDialog: React.FC = () => {
  const {
    exercises,
    setCurrentExerciseId,
    completedIds,
    setShowCommandPalette,
  } = useRustlings();

  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return exercises;
    const q = search.toLowerCase();
    return exercises.filter(
      e =>
        e.title.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q) ||
        e.categoryTitle.toLowerCase().includes(q) ||
        e.path.toLowerCase().includes(q)
    );
  }, [exercises, search]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        setCurrentExerciseId(filtered[selectedIndex].id);
        setShowCommandPalette(false);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowCommandPalette(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-100">
      <div
        className="fixed inset-0"
        onClick={() => setShowCommandPalette(false)}
        aria-hidden="true"
      />
      <div
        className="relative w-full max-w-xl bg-[#121215] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[75vh]"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="p-3 border-b border-zinc-800 flex items-center gap-2.5">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search exercises by name, topic, or file..."
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-800 text-zinc-400 rounded border border-zinc-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-400">
              No matching exercises found for "{search}"
            </div>
          ) : (
            filtered.map((ex, idx) => {
              const isSelected = idx === selectedIndex;
              const isDone = completedIds.has(ex.id);

              return (
                <div
                  key={ex.id}
                  onClick={() => {
                    setCurrentExerciseId(ex.id);
                    setShowCommandPalette(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    'px-3 py-2 rounded-lg flex items-center justify-between text-xs cursor-pointer transition-colors',
                    isSelected
                      ? 'bg-orange-500/15 text-zinc-100 border border-orange-500/30'
                      : 'text-zinc-300 hover:bg-zinc-800/40'
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    )}
                    <div className="flex flex-col truncate">
                      <span className="font-medium text-zinc-100 truncate">{ex.title}</span>
                      <span className="text-[10px] text-zinc-400 truncate">{ex.categoryTitle} • {ex.path}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={ex.mode === 'test' ? 'info' : 'warning'} size="sm">
                      {ex.mode}
                    </Badge>
                    {isSelected && (
                      <CornerDownLeft className="w-3.5 h-3.5 text-orange-400" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 border-t border-zinc-800/80 bg-zinc-950/40 text-[11px] text-zinc-400 flex items-center justify-between">
          <span>
            Use <kbd className="px-1 font-mono bg-zinc-800 rounded">↑</kbd> <kbd className="px-1 font-mono bg-zinc-800 rounded">↓</kbd> to navigate, <kbd className="px-1 font-mono bg-zinc-800 rounded">Enter</kbd> to select
          </span>
          <span className="font-mono">{filtered.length} exercises</span>
        </div>
      </div>
    </div>
  );
};

export const CommandPalette: React.FC = () => {
  const { showCommandPalette } = useRustlings();
  if (!showCommandPalette) return null;
  return <CommandPaletteDialog />;
};
