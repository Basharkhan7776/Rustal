import React, { useState, useEffect } from 'react';
import { RustlingsProvider } from './context/RustlingsContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CodeEditor } from './components/CodeEditor';
import { InstructionsPane } from './components/InstructionsPane';
import { TerminalOutput } from './components/TerminalOutput';
import { ResizeHandle } from './components/ui/ResizeHandle';
import { CommandPalette } from './components/CommandPalette';
import { SolutionModal } from './components/Modals/SolutionModal';
import { SettingsModal } from './components/Modals/SettingsModal';

const PANEL_STORAGE_KEY = 'rustal_v1_panel_sizes';

interface PanelSizes {
  sidebarWidth: number;
  instructionsWidth: number;
  terminalHeight: number;
}

const DEFAULT_PANELS: PanelSizes = {
  sidebarWidth: 260,
  instructionsWidth: 360,
  terminalHeight: 220,
};

function getSavedPanels(): PanelSizes {
  try {
    const raw = localStorage.getItem(PANEL_STORAGE_KEY);
    return raw ? { ...DEFAULT_PANELS, ...JSON.parse(raw) } : DEFAULT_PANELS;
  } catch {
    return DEFAULT_PANELS;
  }
}

const AppContent: React.FC = () => {
  const [panelSizes, setPanelSizes] = useState<PanelSizes>(getSavedPanels);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [terminalCollapsed, setTerminalCollapsed] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem(PANEL_STORAGE_KEY, JSON.stringify(panelSizes));
    } catch {}
  }, [panelSizes]);

  // Sidebar horizontal resize handler
  const handleSidebarResize = (delta: number) => {
    setPanelSizes(prev => ({
      ...prev,
      sidebarWidth: Math.max(160, Math.min(prev.sidebarWidth + delta, 550)),
    }));
  };

  // Instructions pane horizontal resize handler (dragging left increases width)
  const handleInstructionsResize = (delta: number) => {
    setPanelSizes(prev => ({
      ...prev,
      instructionsWidth: Math.max(200, Math.min(prev.instructionsWidth - delta, 750)),
    }));
  };

  // Terminal pane vertical resize handler (dragging up increases height)
  const handleTerminalResize = (delta: number) => {
    if (terminalCollapsed) setTerminalCollapsed(false);
    setPanelSizes(prev => ({
      ...prev,
      terminalHeight: Math.max(80, Math.min(prev.terminalHeight - delta, 650)),
    }));
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#09090b] text-zinc-100 antialiased font-sans">
      {/* Top Header Navbar */}
      <Header />

      {/* Main Workspace with 4-way Resizable Panels */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Panel 1: Sidebar */}
        <Sidebar
          width={panelSizes.sidebarWidth}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Divider 1: Resize Sidebar horizontally */}
        {!sidebarCollapsed && (
          <ResizeHandle
            direction="vertical"
            onResize={handleSidebarResize}
          />
        )}

        {/* Right workspace: (Editor + Instructions) on top, Terminal on bottom */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Half: Editor and Instructions */}
          <div className="flex-1 flex min-h-0 min-w-0 overflow-hidden">
            {/* Panel 2: Monaco Code Editor */}
            <CodeEditor />

            {/* Divider 2: Resize Editor vs Instructions horizontally */}
            <ResizeHandle
              direction="vertical"
              onResize={handleInstructionsResize}
            />

            {/* Panel 3: Instructions & Theory Pane */}
            <InstructionsPane width={panelSizes.instructionsWidth} />
          </div>

          {/* Divider 3: Resize Terminal Output vertically (Up/Down) */}
          <ResizeHandle
            direction="horizontal"
            onResize={handleTerminalResize}
          />

          {/* Panel 4: Terminal Output */}
          <TerminalOutput
            height={panelSizes.terminalHeight}
            collapsed={terminalCollapsed}
            onToggleCollapse={() => setTerminalCollapsed(!terminalCollapsed)}
          />
        </div>
      </div>

      {/* Interactive Modals */}
      <CommandPalette />
      <SolutionModal />
      <SettingsModal />
    </div>
  );
};

export default function App() {
  return (
    <RustlingsProvider>
      <AppContent />
    </RustlingsProvider>
  );
}
