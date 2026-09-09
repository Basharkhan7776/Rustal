import React, { useRef } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { FileCode, Check, RotateCcw, Play, Loader2, ZoomIn, ZoomOut } from 'lucide-react';
import { useRustlings } from '../context/RustlingsContext';
import { Button } from './ui/Button';

export const CodeEditor: React.FC = () => {
  const {
    currentExercise,
    currentCode,
    updateCode,
    resetCurrentCode,
    runCode,
    isRunning,
    settings,
    updateSettings,
  } = useRustlings();

  const editorRef = useRef<any>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Define custom coss.com dark theme
    monaco.editor.defineTheme('coss-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '71717a', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'f97316', fontStyle: 'bold' },
        { token: 'string', foreground: '34d399' },
        { token: 'number', foreground: '38bdf8' },
        { token: 'type', foreground: 'c084fc' },
        { token: 'function', foreground: '60a5fa' },
      ],
      colors: {
        'editor.background': '#0e0e11',
        'editor.foreground': '#f4f4f5',
        'editorLineNumber.foreground': '#52525b',
        'editorLineNumber.activeForeground': '#f97316',
        'editor.selectionBackground': '#f9731633',
        'editor.lineHighlightBackground': '#18181b50',
        'editorCursor.foreground': '#f97316',
        'editorIndentGuide.background': '#27272a',
        'editorIndentGuide.activeBackground': '#3f3f46',
      },
    });

    monaco.editor.setTheme('coss-dark');

    // Add keyboard shortcut for Cmd+Enter / Ctrl+Enter inside editor
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      runCode();
    });
  };

  const handleZoomIn = () => {
    updateSettings({ fontSize: Math.min(settings.fontSize + 1, 24) });
  };

  const handleZoomOut = () => {
    updateSettings({ fontSize: Math.max(settings.fontSize - 1, 11) });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0e0e11] overflow-hidden border-r border-zinc-800/80">
      {/* Editor Header Bar */}
      <div className="h-9 px-3 border-b border-zinc-800/80 bg-[#121215] flex items-center justify-between text-xs text-zinc-400 select-none shrink-0">
        <div className="flex items-center gap-2 truncate">
          <FileCode className="w-3.5 h-3.5 text-orange-400 shrink-0" />
          <span className="font-mono text-zinc-300 truncate">{currentExercise.path}</span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-800/70 px-1.5 py-0.2 rounded border border-zinc-700/40">
            <Check className="w-2.5 h-2.5 text-emerald-400" />
            Auto-saved
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Font size adjustment */}
          <div className="flex items-center gap-0.5 bg-zinc-900 border border-zinc-800 rounded px-1">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:text-zinc-200 text-zinc-400"
              title="Decrease Font Size"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="text-[10px] font-mono px-1 text-zinc-400">{settings.fontSize}px</span>
            <button
              onClick={handleZoomIn}
              className="p-1 hover:text-zinc-200 text-zinc-400"
              title="Increase Font Size"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={resetCurrentCode}
            title="Reset code to original starter"
            className="h-6 text-[11px] text-zinc-400 hover:text-zinc-200 px-2"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={runCode}
            disabled={isRunning}
            className="h-6 text-[11px] px-2.5 gap-1 shadow-none"
          >
            {isRunning ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Play className="w-3 h-3 fill-white" />
            )}
            Run
          </Button>
        </div>
      </div>

      {/* Monaco Editor Container */}
      <div className="flex-1 w-full h-full relative">
        <Editor
          height="100%"
          language="rust"
          theme="coss-dark"
          value={currentCode}
          onChange={val => updateCode(val || '')}
          onMount={handleEditorDidMount}
          options={{
            fontSize: settings.fontSize,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            tabSize: 4,
            insertSpaces: true,
            lineNumbers: 'on',
            minimap: { enabled: false },
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            padding: { top: 12, bottom: 12 },
            renderLineHighlight: 'line',
            automaticLayout: true,
            bracketPairColorization: { enabled: true },
          }}
          loading={
            <div className="flex items-center justify-center h-full text-xs text-zinc-400 gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
              Loading editor...
            </div>
          }
        />
      </div>
    </div>
  );
};
