import React, { useState, useMemo } from 'react';
import {
  Terminal as TerminalIcon,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { useRustlings } from '../context/RustlingsContext';
import { parseAnsi } from '../lib/ansi';
import { formatTime, cn } from '../lib/utils';
import { Button } from './ui/Button';

export const TerminalOutput: React.FC = () => {
  const { isRunning, lastResult, clearLastResult, nextExercise } = useRustlings();
  const [collapsed, setCollapsed] = useState<boolean>(false);

  const combinedOutput = useMemo(() => {
    if (!lastResult) return '';
    const parts: string[] = [];
    if (lastResult.stderr) parts.push(lastResult.stderr);
    if (lastResult.stdout) parts.push(lastResult.stdout);
    return parts.join('\n');
  }, [lastResult]);

  const ansiSpans = useMemo(() => {
    return parseAnsi(combinedOutput);
  }, [combinedOutput]);

  return (
    <div
      className={cn(
        'border-t border-zinc-800/80 bg-[#09090b] flex flex-col shrink-0 transition-all duration-200 select-none',
        collapsed ? 'h-9' : 'h-64 sm:h-72'
      )}
    >
      {/* Terminal Header */}
      <div className="h-9 px-3 bg-[#0e0e11] border-b border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400 shrink-0">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-3.5 h-3.5 text-zinc-400" />
          <span className="font-semibold text-zinc-300">Terminal</span>

          {/* Status Indicator */}
          {isRunning ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-orange-400 bg-orange-950/40 px-2 py-0.5 rounded-full border border-orange-800/40">
              <Loader2 className="w-3 h-3 animate-spin" />
              Compiling...
            </span>
          ) : lastResult ? (
            lastResult.success ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-800/40">
                <CheckCircle2 className="w-3 h-3" />
                Passed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-800/40">
                <XCircle className="w-3 h-3" />
                Failed
              </span>
            )
          ) : (
            <span className="text-[11px] text-zinc-400">Ready</span>
          )}

          {lastResult?.executionTimeMs !== undefined && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-zinc-400 font-mono">
              <Clock className="w-2.5 h-2.5" />
              {formatTime(lastResult.executionTimeMs)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {lastResult?.success && (
            <Button
              variant="success"
              size="sm"
              onClick={nextExercise}
              className="h-6 text-[11px] px-2.5 gap-1.5 animate-pulse"
            >
              <span>Next Exercise</span>
              <ArrowRight className="w-3 h-3" />
            </Button>
          )}

          {lastResult && (
            <button
              onClick={clearLastResult}
              title="Clear terminal"
              className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand terminal' : 'Collapse terminal'}
            className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            {collapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      {!collapsed && (
        <div className="flex-1 p-3 overflow-y-auto font-mono text-[12px] leading-relaxed text-zinc-300 bg-[#08080a] select-text">
          {isRunning ? (
            <div className="flex items-center gap-2 text-zinc-400 py-4">
              <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
              <span>Sending code to Rust Playground compiler...</span>
            </div>
          ) : lastResult ? (
            <div className="space-y-2">
              {/* Success announcement banner */}
              {lastResult.success && (
                <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-lg p-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-300 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-semibold">All checks passed! Great job! 🎉</span>
                  </div>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={nextExercise}
                    className="h-6 text-[11px] px-2 gap-1"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              )}

              {/* Formatted ANSI compiler and test output */}
              <div className="whitespace-pre-wrap font-mono-code selection:bg-zinc-700">
                {ansiSpans.map((span, idx) => (
                  <span
                    key={idx}
                    style={{
                      color: span.color,
                      backgroundColor: span.bgColor,
                      fontWeight: span.bold ? 'bold' : 'normal',
                      opacity: span.dim ? 0.7 : 1,
                      textDecoration: span.underline ? 'underline' : 'none',
                      fontStyle: span.italic ? 'italic' : 'normal',
                    }}
                  >
                    {span.text}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-zinc-400 py-4 font-sans text-xs">
              Press <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-800 text-zinc-300 rounded border border-zinc-700">⌘ + Enter</kbd> to compile and test the current exercise.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
