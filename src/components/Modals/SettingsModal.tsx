import React, { useState, useRef } from 'react';
import {
  Settings,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  HardDrive,
  Keyboard,
} from 'lucide-react';
import { useRustlings } from '../../context/RustlingsContext';
import { exportProgressSnapshot, importProgressSnapshot } from '../../lib/storage';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ActivityHeatmap } from '../ActivityHeatmap';

export const SettingsModal: React.FC = () => {
  const {
    showSettingsModal,
    setShowSettingsModal,
    settings,
    updateSettings,
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
          <Settings className="w-4 h-4 text-zinc-400" />
          <span>Dashboard & Settings</span>
        </div>
      }
      description="Practice activity heatmap, editor preferences, and local storage management."
      maxWidth="3xl"
    >
      <div className="space-y-5 text-xs text-zinc-300 max-h-[80vh] overflow-y-auto pr-1">
        {/* Practice Activity Heatmap */}
        <ActivityHeatmap />

        {/* Editor Preferences */}
        <div className="space-y-2.5">
          <h4 className="font-semibold uppercase tracking-wider text-[10px] text-zinc-400 flex items-center gap-1.5">
            <Keyboard className="w-3 h-3 text-zinc-400" />
            Editor Preferences
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Font Size */}
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="font-medium text-zinc-200 block">Editor Font Size</span>
                <span className="text-[11px] text-zinc-400">Current: {settings.fontSize}px</span>
              </div>
              <div className="flex items-center gap-1">
                {[12, 14, 16, 18].map(size => (
                  <button
                    key={size}
                    onClick={() => updateSettings({ fontSize: size })}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                      settings.fontSize === size
                        ? 'bg-zinc-100 text-zinc-900 font-bold'
                        : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Vim Keybindings Toggle */}
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-zinc-200">Vim Keybindings</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                    Neovim
                  </span>
                </div>
                <span className="text-[11px] text-zinc-400">Modal navigation mode</span>
              </div>
              <button
                onClick={() => updateSettings({ vimMode: !settings.vimMode })}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.vimMode ? 'bg-zinc-200' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-zinc-900 shadow ring-0 transition duration-200 ease-in-out ${
                    settings.vimMode ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Data Persistence & Backup */}
        <div className="space-y-2.5">
          <h4 className="font-semibold uppercase tracking-wider text-[10px] text-zinc-400 flex items-center gap-1.5">
            <HardDrive className="w-3 h-3 text-zinc-400" />
            Local Progress & Backup
          </h4>

          <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="font-medium text-zinc-200 block">Export or Import Your Data</span>
              <span className="text-[11px] text-zinc-400">
                Backup your completed exercises, written code, and practice heatmap as a single JSON file.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExport}
                className="text-[11px] gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-zinc-400" />
                Export JSON
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
                <Upload className="w-3.5 h-3.5 text-zinc-400" />
                Import JSON
              </Button>
            </div>

            {importStatus && (
              <div className="w-full text-[11px] text-zinc-200 bg-zinc-850 p-2 rounded border border-zinc-700">
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
                <span className="text-[11px] text-zinc-500">
                  Clears local code edits, completion records, and activity history.
                </span>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setConfirmReset(true)}
                className="text-[11px] gap-1"
              >
                <Trash2 className="w-3 h-3 text-zinc-400" />
                Reset Data
              </Button>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-zinc-200 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 text-zinc-400" />
                Are you completely sure?
              </div>
              <p className="text-[11px] text-zinc-400">
                This will delete all your local changes, completion records, and activity heatmap. You cannot undo this unless you have exported a backup.
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
      </div>
    </Modal>
  );
};
