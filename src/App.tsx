import React from 'react';
import { RustlingsProvider } from './context/RustlingsContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CodeEditor } from './components/CodeEditor';
import { InstructionsPane } from './components/InstructionsPane';
import { TerminalOutput } from './components/TerminalOutput';
import { CommandPalette } from './components/CommandPalette';
import { SolutionModal } from './components/Modals/SolutionModal';
import { SettingsModal } from './components/Modals/SettingsModal';

const AppContent: React.FC = () => {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#09090b] text-zinc-100 antialiased font-sans">
      {/* Top Navbar */}
      <Header />

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Module & Exercise Navigation */}
        <Sidebar />

        {/* Center Workspace */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Half: Code Editor & Instructions Pane */}
          <div className="flex-1 flex min-h-0 overflow-hidden">
            <CodeEditor />
            <InstructionsPane />
          </div>

          {/* Bottom Half: Terminal Output Pane */}
          <TerminalOutput />
        </main>
      </div>

      {/* Interactive Overlays */}
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
