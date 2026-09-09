import React, { useMemo } from 'react';
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
import { formatTime } from '../lib/utils';
import { Button } from './ui/Button';
import { Tooltip } from './ui/Tooltip';

export interface TerminalOutputProps {
  height: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const TerminalOutput: React.FC<TerminalOutputProps> = ({
  height,
  collapsed,
  onToggleCollapse,
}) => {
  const { isRunning, lastResult, clearLastResult, nextExercise } = useRustlings();

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
      style={{ height: collapsed ? 36 : height }}
      className="bg-[#09090b] flex flex-col shrink-0 select-none overflow-hidden"
    >
      {/* Terminal Header */}
      <div className="h-9 px-3 bg-[#0c0c0f] border-b border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400 shrink-0">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-3.5 h-3.5 text-zinc-400" />
          <span className="font-semibold text-zinc-300">Terminal</span>

          {/* Status Indicator */}
          {isRunning ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-300 bg-zinc-850 px-2 py-0.5 rounded-md border border-zinc-700">
              <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />
              Compiling...
            </span>
          ) : lastResult ? (
            lastResult.success ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-200 bg-zinc-850 px-2 py-0.5 rounded-md border border-zinc-700">
                <CheckCircle2 className="w-3 h-3 text-zinc-300" />
                Passed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-300 bg-zinc-850 px-2 py-0.5 rounded-md border border-zinc-700">
                <XCircle className="w-3 h-3 text-zinc-400" />
                Failed
              </span>
            )
          ) : (
            <span className="text-[11px] text-zinc-500">Ready</span>
          )}

          {lastResult?.executionTimeMs !== undefined && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-zinc-500 font-mono">
              <Clock className="w-2.5 h-2.5 text-zinc-500" />
              {formatTime(lastResult.executionTimeMs)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {lastResult?.success && (
            <Tooltip content="Continue to next exercise" shortcut="Alt+→">
              <Button
                variant="primary"
                size="sm"
                onClick={nextExercise}
                className="h-6 text-[11px] px-2.5 gap-1.5"
              >
                <span>Next Exercise</span>
                <ArrowRight className="w-3 h-3 text-zinc-950" />
              </Button>
            </Tooltip>
          )}

          {lastResult && (
            <Tooltip content="Clear terminal output">
              <button
                onClick={clearLastResult}
                className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
              </button>
            </Tooltip>
          )}

          <Tooltip content={collapsed ? 'Expand terminal' : 'Collapse terminal'}>
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              {collapsed ? (
                <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              )}
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Terminal Body */}
      {!collapsed && (
        <div className="flex-1 p-3 overflow-y-auto font-mono text-[12px] leading-relaxed text-zinc-300 bg-[#08080a] select-text">
          {isRunning ? (
            <div className="flex items-center gap-2 text-zinc-400 py-3 font-sans text-xs">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
              <span>Compiling code...</span>
            </div>
          ) : lastResult ? (
            <div className="space-y-2">
              {/* Success announcement banner */}
              {lastResult.success && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-200 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-zinc-300 shrink-0" />
                    <span className="font-medium">All checks passed!</span>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={nextExercise}
                    className="h-6 text-[11px] px-2 gap-1 text-zinc-200"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-3 h-3 text-zinc-400" />
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
            <div className="text-zinc-500 py-3 font-sans text-xs">
              Press <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-850 text-zinc-400 rounded border border-zinc-800">⌘ + Enter</kbd> to compile and test the current exercise.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
