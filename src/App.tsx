import React, { useState, useEffect, useRef } from 'react';
import { RustlingsProvider, useRustlings } from './context/RustlingsContext';
import { Header } from './components/Header';
import { Sidebar, MobileSidebarDrawer } from './components/Sidebar';
import { CodeEditor } from './components/CodeEditor';
import { InstructionsPane } from './components/InstructionsPane';
import { TerminalOutput } from './components/TerminalOutput';
import { ResizeHandle } from './components/ui/ResizeHandle';
import { MobileTabBar } from './components/MobileTabBar';
import { CommandPalette } from './components/CommandPalette';
import { SolutionModal } from './components/Modals/SolutionModal';
import { SettingsModal } from './components/Modals/SettingsModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';

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
  const {
    sidebarCollapsed,
    toggleSidebar,
    terminalCollapsed,
    setTerminalCollapsed,
    toggleTerminal,
    mobileTab,
  } = useRustlings();
  const [panelSizes, setPanelSizes] = useState<PanelSizes>(getSavedPanels);
  const startSizesRef = useRef<PanelSizes>(panelSizes);

  useEffect(() => {
    try {
      localStorage.setItem(PANEL_STORAGE_KEY, JSON.stringify(panelSizes));
    } catch {}
  }, [panelSizes]);

  // Sidebar 1:1 resize handler
  const handleSidebarResizeStart = () => {
    startSizesRef.current = panelSizes;
  };
  const handleSidebarResize = (deltaX: number) => {
    const initial = startSizesRef.current.sidebarWidth;
    const newWidth = Math.max(160, Math.min(initial + deltaX, 550));
    setPanelSizes(prev => ({ ...prev, sidebarWidth: newWidth }));
  };

  // Instructions pane 1:1 resize handler
  const handleInstructionsResizeStart = () => {
    startSizesRef.current = panelSizes;
  };
  const handleInstructionsResize = (deltaX: number) => {
    const initial = startSizesRef.current.instructionsWidth;
    const newWidth = Math.max(200, Math.min(initial - deltaX, 750));
    setPanelSizes(prev => ({ ...prev, instructionsWidth: newWidth }));
  };

  // Terminal pane 1:1 vertical resize handler
  const handleTerminalResizeStart = () => {
    startSizesRef.current = panelSizes;
  };
  const handleTerminalResize = (deltaY: number) => {
    if (terminalCollapsed) setTerminalCollapsed(false);
    const initial = startSizesRef.current.terminalHeight;
    const newHeight = Math.max(60, Math.min(initial - deltaY, 650));
    setPanelSizes(prev => ({ ...prev, terminalHeight: newHeight }));
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#09090b] text-zinc-100 antialiased font-sans">
      {/* Top Header Navbar */}
      <Header />

      {/* Desktop Workspace with 4-way Resizable Panels (>= 768px) */}
      <div className="hidden md:flex flex-1 min-h-0 overflow-hidden">
        {/* Panel 1: Sidebar */}
        <Sidebar
          width={panelSizes.sidebarWidth}
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />

        {/* Divider 1: Resize Sidebar horizontally */}
        {!sidebarCollapsed && (
          <ResizeHandle
            direction="vertical"
            onResizeStart={handleSidebarResizeStart}
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
              onResizeStart={handleInstructionsResizeStart}
              onResize={handleInstructionsResize}
            />

            {/* Panel 3: Instructions & Theory Pane */}
            <InstructionsPane width={panelSizes.instructionsWidth} />
          </div>

          {/* Divider 3: Resize Terminal Output vertically (Up/Down) */}
          <ResizeHandle
            direction="horizontal"
            onResizeStart={handleTerminalResizeStart}
            onResize={handleTerminalResize}
          />

          {/* Panel 4: Terminal Output */}
          <TerminalOutput
            height={panelSizes.terminalHeight}
            collapsed={terminalCollapsed}
            onToggleCollapse={toggleTerminal}
          />
        </div>
      </div>

      {/* Mobile Workspace: 5-Section Single-View (< 768px) */}
      <div className="flex md:hidden flex-1 flex-col min-h-0 overflow-hidden relative pb-[56px]">
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {mobileTab === 'code' && <CodeEditor />}
          {mobileTab === 'terminal' && (
            <TerminalOutput
              isMobile
              height={0}
              collapsed={false}
              onToggleCollapse={() => {}}
            />
          )}
          {mobileTab === 'theory' && (
            <InstructionsPane isMobile controlledTab="theory" width={0} />
          )}
          {mobileTab === 'hint' && (
            <InstructionsPane isMobile controlledTab="hint" width={0} />
          )}
          {mobileTab === 'solution' && (
            <InstructionsPane isMobile controlledTab="solution" width={0} />
          )}
        </div>

        {/* Bottom 5-Section Navigation Bar */}
        <MobileTabBar />
      </div>

      {/* Mobile Slide-Out Drawer Overlay */}
      <MobileSidebarDrawer />

      {/* Interactive Modals */}
      <CommandPalette />
      <SolutionModal />
      <SettingsModal />

      {/* PWA Offline Installation Banner */}
      <PWAInstallBanner />
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
