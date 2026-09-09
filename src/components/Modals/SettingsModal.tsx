import React, { useState, useRef } from 'react';
import {
  Settings,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  HardDrive,
  Keyboard,
  Info,
} from 'lucide-react';
import { useRustlings } from '../../context/RustlingsContext';
import { exportProgressSnapshot, importProgressSnapshot } from '../../lib/storage';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export const SettingsModal: React.FC = () => {
  const {
    showSettingsModal,
    setShowSettingsModal,
    settings,
    updateSettings,
    completedCount,
    totalCount,
    bookmarkedIds,
    resetAllProgress,
  } = useRustlings();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

  const handleExport = () => {
    const jsonStr = exportProgressSnapshot();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rustal-progress-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const content = evt.target?.result as string;
      const ok = importProgressSnapshot(content);
      if (ok) {
        setImportStatus('Progress imported successfully! Reloading...');
        setTimeout(() => {
          window.location.reload();
        }, 800);
      } else {
        setImportStatus('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    resetAllProgress();
    setConfirmReset(false);
    setShowSettingsModal(false);
  };

  return (
    <Modal
      isOpen={showSettingsModal}
      onClose={() => {
        setShowSettingsModal(false);
        setConfirmReset(false);
        setImportStatus(null);
      }}
      title={
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-zinc-300" />
          <span>Settings & Local Storage</span>
        </div>
      }
      description="Configure editor options and manage your local offline progress."
      maxWidth="lg"
    >
      <div className="space-y-5 text-xs text-zinc-300">
        {/* Editor Preferences */}
        <div className="space-y-3">
          <h4 className="font-semibold text-zinc-200 uppercase tracking-wider text-[10px] text-zinc-400 flex items-center gap-1.5">
            <Keyboard className="w-3 h-3 text-orange-400" />
            Editor Preferences
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Font Size */}
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
              <div>
                <span className="font-medium text-zinc-200 block">Editor Font Size</span>
                <span className="text-[11px] text-zinc-400">Current: {settings.fontSize}px</span>
              </div>
              <div className="flex items-center gap-1">
                {[12, 14, 16, 18].map(size => (
                  <button
                    key={size}
                    onClick={() => updateSettings({ fontSize: size })}
                    className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                      settings.fontSize === size
                        ? 'bg-orange-500 text-white font-bold'
                        : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Vim Keybindings Toggle */}
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-zinc-200">Vim Keybindings</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                    Neovim
                  </span>
                </div>
                <span className="text-[11px] text-zinc-400">Modal navigation mode</span>
              </div>
              <button
                onClick={() => updateSettings({ vimMode: !settings.vimMode })}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.vimMode ? 'bg-orange-500' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.vimMode ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Data Persistence & Backup */}
        <div className="space-y-3">
          <h4 className="font-semibold text-zinc-200 uppercase tracking-wider text-[10px] text-zinc-400 flex items-center gap-1.5">
            <HardDrive className="w-3 h-3 text-emerald-400" />
            Local Progress & Backup
          </h4>

          <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">Curriculum Solved:</span>
              <span className="font-mono text-zinc-200 font-semibold">
                {completedCount} / {totalCount} ({Math.round((completedCount / totalCount) * 100)}%)
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">Bookmarked:</span>
              <span className="font-mono text-zinc-200 font-semibold">{bookmarkedIds.size}</span>
            </div>

            <div className="pt-2 border-t border-zinc-800/60 flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExport}
                className="text-[11px] gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-zinc-300" />
                Export Progress (JSON)
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] gap-1.5"
              >
                <Upload className="w-3.5 h-3.5 text-zinc-300" />
                Import Progress
              </Button>
            </div>

            {importStatus && (
              <div className="text-[11px] text-orange-400 bg-orange-950/30 p-2 rounded border border-orange-800/40">
                {importStatus}
              </div>
            )}
          </div>
        </div>

        {/* Reset Danger Zone */}
        <div className="pt-2 border-t border-zinc-800/60">
          {!confirmReset ? (
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-zinc-300 block">Reset All Exercises</span>
                <span className="text-[11px] text-zinc-400">
                  Clears local code edits and marks all exercises pending.
                </span>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setConfirmReset(true)}
                className="text-[11px] gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Reset Data
              </Button>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/50 space-y-2">
              <div className="flex items-center gap-2 text-rose-300 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Are you completely sure?
              </div>
              <p className="text-[11px] text-rose-200/80">
                This will delete all your local changes and completion records. You cannot undo this unless you've exported a backup.
              </p>
              <div className="flex items-center justify-end gap-2 pt-1">
                <Button variant="ghost" size="sm" onClick={() => setConfirmReset(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" size="sm" onClick={handleReset}>
                  Yes, Reset Everything
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* About Info */}
        <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60 text-[10px] text-zinc-400 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
          <div>
            Rustal runs 100% locally in your browser. Rust code is verified through the official Rust Playground API or local toolchain. UI inspired by <span className="text-zinc-200 font-semibold">coss.com</span> and <span className="text-zinc-200 font-semibold">shadcn/ui</span>.
          </div>
        </div>
      </div>
    </Modal>
  );
};
