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
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useRustlings } from '../context/RustlingsContext';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';
import { Tooltip } from './ui/Tooltip';
import {
  getStoredInstructionsFontSize,
  setStoredInstructionsFontSize,
} from '../lib/storage';

export interface InstructionsPaneProps {
  width: number;
}

export const InstructionsPane: React.FC<InstructionsPaneProps> = ({ width }) => {
  const { currentExercise, applySolution } = useRustlings();
  const [activeTab, setActiveTab] = useState<'theory' | 'hint' | 'solution'>('theory');
  const [hintRevealed, setHintRevealed] = useState<boolean>(false);
  const [solutionRevealed, setSolutionRevealed] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Font size adjustment with min and max (just like code section)
  const [fontSize, setFontSize] = useState<number>(() => getStoredInstructionsFontSize(12));

  const handleZoomIn = () => {
    setFontSize(prev => {
      const next = Math.min(prev + 1, 20);
      setStoredInstructionsFontSize(next);
      return next;
    });
  };

  const handleZoomOut = () => {
    setFontSize(prev => {
      const next = Math.max(prev - 1, 11);
      setStoredInstructionsFontSize(next);
      return next;
    });
  };

  const handleCopySolution = () => {
    if (currentExercise.solutionCode) {
      navigator.clipboard.writeText(currentExercise.solutionCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      style={{ width }}
      className="flex flex-col h-full bg-[#0c0c0f] shrink-0 select-none overflow-hidden"
    >
      {/* Tab Switcher & Rightmost Font Zoom Controls */}
      <div className="h-9 px-3 border-b border-zinc-800/80 bg-[#09090b] flex items-center justify-between shrink-0">
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
            <BookOpen className="w-3 h-3 text-zinc-400" />
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
            <HelpCircle className="w-3 h-3 text-zinc-400" />
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
            <Sparkles className="w-3 h-3 text-zinc-400" />
            Solution
          </button>
        </div>

        {/* Rightmost Controls: Font Size + / - with Tooltips and min/max */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 bg-zinc-900 border border-zinc-800 rounded px-1">
            <Tooltip content="Decrease Font Size">
              <button
                onClick={handleZoomOut}
                disabled={fontSize <= 11}
                className="p-1 hover:text-zinc-200 text-zinc-400 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ZoomOut className="w-3 h-3 text-zinc-400" />
              </button>
            </Tooltip>
            <span className="text-[10px] font-mono px-1 text-zinc-400">{fontSize}px</span>
            <Tooltip content="Increase Font Size">
              <button
                onClick={handleZoomIn}
                disabled={fontSize >= 20}
                className="p-1 hover:text-zinc-200 text-zinc-400 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ZoomIn className="w-3 h-3 text-zinc-400" />
              </button>
            </Tooltip>
          </div>

          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-850 px-1.5 py-0.2 rounded border border-zinc-800">
            #{currentExercise.order}
          </span>
        </div>
      </div>

      {/* Tab Content with Dynamic Font Size */}
      <div
        style={{ fontSize: `${fontSize}px` }}
        className="flex-1 overflow-y-auto p-3 text-zinc-300 leading-relaxed space-y-3"
      >
        {activeTab === 'theory' && (
          <div className="space-y-3">
            {/* Exercise Title & Instructions */}
            <div className="border border-zinc-800/80 bg-zinc-900/40 rounded-xl p-3">
              <h2 className="font-semibold text-zinc-100 mb-1 flex items-center gap-2 text-[13px]">
                <span>{currentExercise.title}</span>
              </h2>
              {currentExercise.instructions ? (
                <div
                  style={{ fontSize: `${Math.max(10, fontSize - 1)}px` }}
                  className="text-zinc-300 whitespace-pre-line bg-zinc-950/80 p-2.5 rounded-lg border border-zinc-800/60 font-mono"
                >
                  {currentExercise.instructions}
                </div>
              ) : (
                <p className="text-zinc-400">
                  Fix the compilation or logic error in this exercise to proceed.
                </p>
              )}
            </div>

            {/* Category Theory Markdown */}
            {currentExercise.categoryReadme && (
              <div className="border border-zinc-800/80 bg-zinc-900/20 rounded-xl p-3.5 space-y-2">
                <h3 className="font-semibold uppercase tracking-wider text-zinc-400 text-[11px]">
                  Topic Guide: {currentExercise.categoryTitle}
                </h3>
                <div
                  style={{ fontSize: `${fontSize}px` }}
                  className="prose prose-invert max-w-none text-zinc-300 [&_h1]:font-bold [&_h2]:font-semibold [&_h2]:mt-2.5 [&_h2]:mb-1 [&_p]:my-1.5 [&_ul]:my-1 [&_ul]:pl-4 [&_li]:my-0.5 [&_code]:bg-zinc-850 [&_code]:border [&_code]:border-zinc-800 [&_code]:px-1 [&_code]:py-0.2 [&_code]:rounded [&_code]:text-zinc-200 [&_a]:text-zinc-200 [&_a]:underline"
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: ({ node: _node, ...props }) => (
                        <a {...props} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-zinc-200 hover:text-white">
                          {props.children}
                          <ExternalLink className="w-2.5 h-2.5 inline text-zinc-400" />
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
          <div className="space-y-3">
            <div className="border border-zinc-800/80 bg-zinc-900/40 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-200 flex items-center gap-1.5 text-[12px]">
                  <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
                  Official Hint
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setHintRevealed(!hintRevealed)}
                  className="h-6 text-[11px] text-zinc-400 hover:text-zinc-100"
                >
                  {hintRevealed ? (
                    <>
                      <EyeOff className="w-3 h-3 text-zinc-400" /> Hide
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3 text-zinc-400" /> Reveal
                    </>
                  )}
                </Button>
              </div>

              {hintRevealed ? (
                <div
                  style={{ fontSize: `${fontSize}px` }}
                  className="text-zinc-200 whitespace-pre-line leading-relaxed bg-zinc-950 p-3 rounded-lg border border-zinc-800 font-sans"
                >
                  {currentExercise.hint || 'No explicit hint available for this exercise. Inspect the compiler error message carefully.'}
                </div>
              ) : (
                <div
                  onClick={() => setHintRevealed(true)}
                  className="p-5 rounded-lg border border-dashed border-zinc-800 text-center cursor-pointer hover:bg-zinc-850/60 transition-colors"
                >
                  <p className="text-zinc-300 font-medium text-[12px]">Click to reveal hint</p>
                  <p className="text-zinc-500 mt-1 text-[11px]">Try to solve it without hints first</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'solution' && (
          <div className="space-y-3">
            <div className="border border-zinc-800/80 bg-zinc-900/40 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-200 flex items-center gap-1.5 text-[12px]">
                  <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                  Official Solution
                </span>
                {solutionRevealed && (
                  <div className="flex items-center gap-1">
                    <Tooltip content="Copy solution">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopySolution}
                        className="h-6 w-6 text-zinc-400 hover:text-white"
                      >
                        {copied ? <Check className="w-3 h-3 text-zinc-100" /> : <Copy className="w-3 h-3 text-zinc-400" />}
                      </Button>
                    </Tooltip>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={applySolution}
                      className="h-6 text-[11px] px-2"
                    >
                      Apply
                    </Button>
                  </div>
                )}
              </div>

              {solutionRevealed ? (
                <div className="space-y-2">
                  <pre
                    style={{ fontSize: `${Math.max(10, fontSize - 1)}px` }}
                    className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg font-mono text-zinc-200 overflow-x-auto select-text leading-snug"
                  >
                    {currentExercise.solutionCode}
                  </pre>
                  <p className="text-[10px] text-zinc-500">
                    Click "Apply" to copy this solution directly into your code editor.
                  </p>
                </div>
              ) : (
                <div
                  onClick={() => setSolutionRevealed(true)}
                  className="p-5 rounded-lg border border-dashed border-zinc-800 text-center cursor-pointer hover:bg-zinc-850/60 transition-colors"
                >
                  <p className="text-zinc-300 font-medium text-[12px]">Click to reveal official solution</p>
                  <p className="text-zinc-500 mt-1 text-[11px]">Use this if you get stuck after checking hints</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
