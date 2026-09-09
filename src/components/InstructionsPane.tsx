import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  BookOpen,
  HelpCircle,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useRustlings } from '../context/RustlingsContext';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';

export const InstructionsPane: React.FC = () => {
  const { currentExercise, applySolution } = useRustlings();
  const [activeTab, setActiveTab] = useState<'theory' | 'hint' | 'solution'>('theory');
  const [hintRevealed, setHintRevealed] = useState<boolean>(false);
  const [solutionRevealed, setSolutionRevealed] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopySolution = () => {
    if (currentExercise.solutionCode) {
      navigator.clipboard.writeText(currentExercise.solutionCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-80 lg:w-96 flex flex-col h-full bg-[#121215] border-l border-zinc-800/80 shrink-0 select-none overflow-hidden">
      {/* Tab Switcher */}
      <div className="h-9 px-3 border-b border-zinc-800/80 bg-[#0e0e11] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1 bg-zinc-900/90 p-0.5 rounded-lg border border-zinc-800">
          <button
            onClick={() => setActiveTab('theory')}
            className={cn(
              'px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1.5',
              activeTab === 'theory'
                ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            <BookOpen className="w-3 h-3 text-orange-400" />
            Theory
          </button>
          <button
            onClick={() => setActiveTab('hint')}
            className={cn(
              'px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1.5',
              activeTab === 'hint'
                ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            <HelpCircle className="w-3 h-3 text-amber-400" />
            Hint
          </button>
          <button
            onClick={() => setActiveTab('solution')}
            className={cn(
              'px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1.5',
              activeTab === 'solution'
                ? 'bg-zinc-800 text-zinc-100 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            <Sparkles className="w-3 h-3 text-sky-400" />
            Solution
          </button>
        </div>

        <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/60 px-1.5 py-0.2 rounded border border-zinc-700/40">
          #{currentExercise.order}
        </span>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 text-xs text-zinc-300 leading-relaxed space-y-4">
        {activeTab === 'theory' && (
          <div className="space-y-4">
            {/* Exercise Title & Instructions */}
            <div className="border border-zinc-800/80 bg-zinc-900/40 rounded-xl p-3">
              <h2 className="text-sm font-semibold text-zinc-100 mb-1 flex items-center gap-2">
                <span>{currentExercise.title}</span>
              </h2>
              {currentExercise.instructions ? (
                <div className="text-xs text-zinc-300 whitespace-pre-line bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/60 font-mono text-[11px]">
                  {currentExercise.instructions}
                </div>
              ) : (
                <p className="text-xs text-zinc-400">
                  Fix the compilation or logic error in this exercise to proceed!
                </p>
              )}
            </div>

            {/* Category Theory Markdown */}
            {currentExercise.categoryReadme && (
              <div className="border border-zinc-800/80 bg-zinc-900/20 rounded-xl p-3.5 space-y-2">
                <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider text-zinc-400">
                  Topic Guide: {currentExercise.categoryTitle}
                </h3>
                <div className="prose prose-invert prose-xs max-w-none text-zinc-300 [&_h1]:text-sm [&_h1]:font-bold [&_h2]:text-xs [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1 [&_p]:text-xs [&_p]:my-1.5 [&_ul]:my-1 [&_ul]:pl-4 [&_li]:my-0.5 [&_code]:bg-zinc-800 [&_code]:px-1 [&_code]:py-0.2 [&_code]:rounded [&_code]:text-orange-300 [&_a]:text-orange-400 [&_a]:underline">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: ({ node: _node, ...props }) => (
                        <a {...props} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-orange-400 hover:text-orange-300">
                          {props.children}
                          <ExternalLink className="w-2.5 h-2.5 inline" />
                        </a>
                      ),
                    }}
                  >
                    {currentExercise.categoryReadme}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'hint' && (
          <div className="space-y-4">
            <div className="border border-amber-900/30 bg-amber-950/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  Official Hint
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setHintRevealed(!hintRevealed)}
                  className="h-6 text-[11px] text-amber-300 hover:text-amber-100 hover:bg-amber-900/40"
                >
                  {hintRevealed ? (
                    <>
                      <EyeOff className="w-3 h-3" /> Hide
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3" /> Reveal
                    </>
                  )}
                </Button>
              </div>

              {hintRevealed ? (
                <div className="text-xs text-amber-100/90 whitespace-pre-line leading-relaxed bg-black/40 p-3 rounded-lg border border-amber-800/30 font-sans">
                  {currentExercise.hint || 'No explicit hint available for this exercise. Inspect the compiler error message carefully!'}
                </div>
              ) : (
                <div
                  onClick={() => setHintRevealed(true)}
                  className="p-6 rounded-lg border border-dashed border-amber-800/40 text-center cursor-pointer hover:bg-amber-900/10 transition-colors"
                >
                  <p className="text-xs text-amber-300/80 font-medium">Click to reveal hint</p>
                  <p className="text-[10px] text-zinc-400 mt-1">Try to solve it without hints first!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'solution' && (
          <div className="space-y-4">
            <div className="border border-sky-900/30 bg-sky-950/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-sky-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  Official Solution
                </span>
                {solutionRevealed && (
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopySolution}
                      className="h-6 text-[11px] text-zinc-300 hover:text-white"
                      title="Copy Solution Code"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={applySolution}
                      className="h-6 text-[11px] px-2"
                      title="Replace current editor with solution"
                    >
                      Apply
                    </Button>
                  </div>
                )}
              </div>

              {solutionRevealed ? (
                <div className="space-y-2">
                  <pre className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-[11px] font-mono text-zinc-300 overflow-x-auto select-text leading-snug">
                    {currentExercise.solutionCode}
                  </pre>
                  <p className="text-[10px] text-zinc-400">
                    Click "Apply" to copy this solution directly into your code editor.
                  </p>
                </div>
              ) : (
                <div
                  onClick={() => setSolutionRevealed(true)}
                  className="p-6 rounded-lg border border-dashed border-sky-800/40 text-center cursor-pointer hover:bg-sky-900/10 transition-colors"
                >
                  <p className="text-xs text-sky-300/90 font-medium">Click to reveal official solution</p>
                  <p className="text-[10px] text-zinc-400 mt-1">Use this if you are stuck after reading the hints!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
