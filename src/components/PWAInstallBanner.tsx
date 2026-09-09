import React from 'react';
import { Download, X } from 'lucide-react';
import { useRustlings } from '../context/RustlingsContext';
import { Button } from './ui/Button';

export const PWAInstallBanner: React.FC = () => {
  const { canInstall, isInstalled, showInstallBanner, promptInstall, dismissInstallBanner } = useRustlings();

  if (!canInstall || isInstalled || !showInstallBanner) {
    return null;
  }

  return (
    <div
      role="banner"
      aria-label="Install Rustal Application"
      className="fixed z-50 bottom-16 md:bottom-4 right-3 md:right-4 max-w-[calc(100vw-1.5rem)] sm:max-w-sm bg-[#121215]/95 backdrop-blur-md border border-zinc-800 shadow-2xl rounded-xl p-3 flex items-center gap-3 animate-in slide-in-from-bottom-3 fade-in duration-300 select-none"
    >
      <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
        <img
          src="/favicon-32x32.png"
          alt="Rustal Logo"
          className="w-7 h-7 object-contain rounded-sm"
          onError={(e) => {
            // Fallback to emoji if image fails
            (e.currentTarget as HTMLElement).style.display = 'none';
            if (e.currentTarget.parentElement) {
              e.currentTarget.parentElement.innerText = '🦀';
            }
          }}
        />
      </div>

      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center gap-1.5">
          <h4 className="text-xs font-semibold text-zinc-100 truncate">Install Rustal</h4>
          <span className="text-[10px] text-zinc-400 bg-zinc-850 px-1.5 py-0.2 rounded border border-zinc-800">
            Offline App
          </span>
        </div>
        <p className="text-[11px] text-zinc-400 truncate mt-0.5">
          Fast launch & offline practice
        </p>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          variant="primary"
          size="sm"
          onClick={promptInstall}
          className="h-7 text-xs px-2.5 gap-1.5 font-medium"
        >
          <Download className="w-3.5 h-3.5 text-zinc-950" />
          <span>Install</span>
        </Button>

        <button
          onClick={dismissInstallBanner}
          className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 transition-colors"
          aria-label="Dismiss install banner"
        >
          <X className="w-3.5 h-3.5 text-zinc-400" />
        </button>
      </div>
    </div>
  );
};
