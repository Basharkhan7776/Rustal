import React, { useState } from 'react';
import { Sparkles, Copy, Check, AlertTriangle, ArrowRight } from 'lucide-react';
import { useRustlings } from '../../context/RustlingsContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export const SolutionModal: React.FC = () => {
  const {
    currentExercise,
    showSolutionModal,
    setShowSolutionModal,
    applySolution,
  } = useRustlings();

  const [confirmed, setConfirmed] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleClose = () => {
    setShowSolutionModal(false);
    setConfirmed(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentExercise.solutionCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    applySolution();
    handleClose();
  };

  return (
    <Modal
      isOpen={showSolutionModal}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-zinc-400" />
          <span>Solution: {currentExercise.title}</span>
        </div>
      }
      description={`Official solution for ${currentExercise.path}`}
      maxWidth="lg"
    >
      {!confirmed ? (
        <div className="space-y-4 py-2">
          <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-zinc-200">
                Reveal solution?
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Solving the exercises yourself gives the deepest learning. Have you tried checking the hints tab first?
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={handleClose}>
              Go back
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setConfirmed(true)}
            >
              Reveal Solution
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative">
            <pre className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-200 overflow-x-auto max-h-96 select-text leading-relaxed">
              {currentExercise.solutionCode}
            </pre>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopy}
              className="absolute top-2.5 right-2.5 h-7 text-[11px] gap-1 bg-zinc-900/90 border-zinc-700"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-zinc-200" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-zinc-400" />
                  <span>Copy</span>
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
            <p className="text-[11px] text-zinc-500">
              Apply this solution to test it directly in your editor.
            </p>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleClose}>
                Close
              </Button>
              <Button variant="primary" size="sm" onClick={handleApply} className="gap-1">
                <span>Apply to Editor</span>
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
