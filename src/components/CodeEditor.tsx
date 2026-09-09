import React, { useRef, useEffect, useCallback, useState } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import {
  FileCode,
  Check,
  RotateCcw,
  Play,
  Loader2,
  ZoomIn,
  ZoomOut,
  Keyboard,
  ChevronDown,
} from 'lucide-react';
import { useRustlings } from '../context/RustlingsContext';
import { useKeyboardViewport } from '../hooks/useKeyboardViewport';
import { Button } from './ui/Button';
import { Tooltip } from './ui/Tooltip';

const LEFT_RUST_SYMBOLS = [
  '{', '}', '(', ')', '[', ']', ';', ':', '->', '::',
];

const RIGHT_RUST_SYMBOLS = [
  '&', '|', '!', '=', '"', "'", '?', '*', '.', '<', '>', '_', 'Tab',
];

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
    toggleSidebar,
    toggleTerminal,
    nextExercise,
    prevExercise,
    setShowCommandPalette,
    getShortcut,
    isEditorFocused,
    setIsEditorFocused,
    mobileTab,
  } = useRustlings();

  const { isKeyboardOpen, viewportHeight, dismissKeyboard } = useKeyboardViewport();
  const editorRef = useRef<any>(null);
  const lastSymbolActionRef = useRef<number>(0);
  const isInteractingWithToolbarRef = useRef(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  const handleDismissKeyboard = useCallback(() => {
    setIsEditorFocused(false);
    dismissKeyboard();
    if (editorRef.current) {
      const domNode = editorRef.current.getDomNode();
      const textarea = domNode?.querySelector('textarea');
      if (textarea) textarea.blur();
    }
  }, [dismissKeyboard, setIsEditorFocused]);

  useEffect(() => {
    if (mobileTab !== 'code') {
      setIsEditorFocused(false);
    }
  }, [mobileTab, setIsEditorFocused]);

  // Virtual Joystick navigation state & refs
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const joystickIntervalRef = useRef<any>(null);
  const currentDirRef = useRef<'left' | 'right' | 'up' | 'down' | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Clean up joystick interval on unmount
  useEffect(() => {
    return () => {
      if (joystickIntervalRef.current) clearInterval(joystickIntervalRef.current);
    };
  }, []);

  // Programmatic cursor movement for Monaco editor
  const moveCursor = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    if (!editorRef.current) return;
    const editor = editorRef.current;
    const pos = editor.getPosition();
    if (!pos) return;

    const model = editor.getModel();
    if (!model) return;

    let { lineNumber, column } = pos;

    if (direction === 'left') {
      if (column > 1) {
        column--;
      } else if (lineNumber > 1) {
        lineNumber--;
        column = model.getLineMaxColumn(lineNumber);
      }
    } else if (direction === 'right') {
      const maxCol = model.getLineMaxColumn(lineNumber);
      if (column < maxCol) {
        column++;
      } else if (lineNumber < model.getLineCount()) {
        lineNumber++;
        column = 1;
      }
    } else if (direction === 'up') {
      if (lineNumber > 1) {
        lineNumber--;
        column = Math.min(column, model.getLineMaxColumn(lineNumber));
      }
    } else if (direction === 'down') {
      if (lineNumber < model.getLineCount()) {
        lineNumber++;
        column = Math.min(column, model.getLineMaxColumn(lineNumber));
      }
    }

    editor.setPosition({ lineNumber, column });
    editor.revealPositionInCenterIfOutsideViewport({ lineNumber, column });
  }, []);

  // Joystick pointer handlers
  const processJoystickMovement = useCallback((clientX: number, clientY: number) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = clientX - centerX;
    let dy = clientY - centerY;

    const maxRadius = 11;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }

    setJoystickPos({ x: dx, y: dy });

    const deadzone = 3.5;
    let dir: 'left' | 'right' | 'up' | 'down' | null = null;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx < -deadzone) dir = 'left';
      else if (dx > deadzone) dir = 'right';
    } else {
      if (dy < -deadzone) dir = 'up';
      else if (dy > deadzone) dir = 'down';
    }

    if (dir) {
      if (currentDirRef.current !== dir) {
        currentDirRef.current = dir;
        moveCursor(dir);

        if (joystickIntervalRef.current) {
          clearInterval(joystickIntervalRef.current);
        }
        joystickIntervalRef.current = setInterval(() => {
          if (currentDirRef.current) {
            moveCursor(currentDirRef.current);
          }
        }, 110);
      }
    } else {
      currentDirRef.current = null;
      if (joystickIntervalRef.current) {
        clearInterval(joystickIntervalRef.current);
        joystickIntervalRef.current = null;
      }
    }
  }, [moveCursor]);

  const handleJoystickPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    processJoystickMovement(e.clientX, e.clientY);
  }, [processJoystickMovement]);

  const handleJoystickPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    processJoystickMovement(e.clientX, e.clientY);
  }, [isDragging, processJoystickMovement]);

  const handleJoystickPointerUp = useCallback((e: React.PointerEvent) => {
    setIsDragging(false);
    setJoystickPos({ x: 0, y: 0 });
    currentDirRef.current = null;
    if (joystickIntervalRef.current) {
      clearInterval(joystickIntervalRef.current);
      joystickIntervalRef.current = null;
    }
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  }, []);


  // Re-layout and keep active cursor visible whenever viewport changes (e.g. mobile keyboard toggles)
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.layout();
      const pos = editorRef.current.getPosition();
      if (pos) {
        editorRef.current.revealPositionInCenterIfOutsideViewport(pos);
      }
    }
  }, [viewportHeight]);

  const handleInsertSymbol = useCallback((symbol: string) => {
    if (!editorRef.current) return;
    const editor = editorRef.current;

    let selection = editor.getSelection();
    if (!selection) {
      const position = editor.getPosition() || { lineNumber: 1, column: 1 };
      selection = {
        startLineNumber: position.lineNumber,
        startColumn: position.column,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      };
    }

    const textToInsert = symbol === 'Tab' ? '    ' : symbol;

    editor.executeEdits('quick-symbol', [
      {
        range: selection,
        text: textToInsert,
        forceMoveMarkers: true,
      },
    ]);
    editor.pushUndoStop();
    editor.focus();

    const newPos = editor.getPosition();
    if (newPos) {
      editor.revealPositionInCenterIfOutsideViewport(newPos);
    }
  }, []);

  const triggerSymbol = useCallback((e: React.SyntheticEvent, sym: string) => {
    e.preventDefault();
    const now = Date.now();
    if (now - lastSymbolActionRef.current < 120) return;
    lastSymbolActionRef.current = now;
    handleInsertSymbol(sym);
  }, [handleInsertSymbol]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Track when cursor is focused in editor so mobile shortcuts & joystick appear
    editor.onDidFocusEditorText(() => {
      setIsEditorFocused(true);
    });

    editor.onDidFocusEditorWidget(() => {
      setIsEditorFocused(true);
    });

    editor.onMouseDown(() => {
      setIsEditorFocused(true);
    });

    // Keep cursor visible when typing on mobile screens
    editor.onDidChangeCursorPosition(e => {
      setIsEditorFocused(true);
      if (window.innerWidth < 768) {
        editor.revealPositionInCenterIfOutsideViewport(e.position);
      }
    });

    editor.onDidBlurEditorText(() => {
      setTimeout(() => {
        if (isInteractingWithToolbarRef.current) return;
        if (!editor.hasTextFocus() && !editor.hasWidgetFocus()) {
          setIsEditorFocused(false);
        }
      }, 200);
    });

    editor.onDidBlurEditorWidget(() => {
      setTimeout(() => {
        if (isInteractingWithToolbarRef.current) return;
        if (!editor.hasTextFocus() && !editor.hasWidgetFocus()) {
          setIsEditorFocused(false);
        }
      }, 200);
    });

    // Define custom coss.com dark theme
    monaco.editor.defineTheme('coss-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '71717a', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'e4e4e7', fontStyle: 'bold' },
        { token: 'string', foreground: 'a1a1aa' },
        { token: 'number', foreground: 'd4d4d8' },
        { token: 'type', foreground: 'f4f4f5' },
        { token: 'function', foreground: 'e4e4e7' },
      ],
      colors: {
        'editor.background': '#09090b',
        'editor.foreground': '#f4f4f5',
        'editorLineNumber.foreground': '#52525b',
        'editorLineNumber.activeForeground': '#d4d4d8',
        'editor.selectionBackground': '#27272a',
        'editor.lineHighlightBackground': '#121215',
        'editorCursor.foreground': '#f4f4f5',
        'editorIndentGuide.background': '#1f1f23',
        'editorIndentGuide.activeBackground': '#2e2e34',
      },
    });

    monaco.editor.setTheme('coss-dark');

    // Run code shortcut: Cmd+Shift+Enter / Ctrl+Shift+Enter & Cmd+Enter / Ctrl+Enter
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
      runCode();
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      runCode();
    });

    // Sidebar toggle shortcut: Cmd+B / Ctrl+B
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB, () => {
      toggleSidebar();
    });

    // Terminal toggle shortcut: Cmd+T / Ctrl+T & fallback Cmd+J / Ctrl+J
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyT, () => {
      toggleTerminal();
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyJ, () => {
      toggleTerminal();
    });

    // Search shortcut: Cmd+K / Ctrl+K
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, () => {
      setShowCommandPalette(true);
    });

    // Navigation shortcuts: Alt+Left / Alt+Right
    editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.LeftArrow, () => {
      prevExercise();
    });
    editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.RightArrow, () => {
      nextExercise();
    });
  };

  const handleZoomIn = () => {
    updateSettings({ fontSize: Math.min(settings.fontSize + 1, 24) });
  };

  const handleZoomOut = () => {
    updateSettings({ fontSize: Math.max(settings.fontSize - 1, 11) });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 h-full bg-[#09090b] overflow-hidden">
      {/* Editor Header Bar */}
      <div className="h-9 px-3 border-b border-zinc-800/80 bg-[#0c0c0f] flex items-center justify-between text-xs text-zinc-400 select-none shrink-0">
        <div className="flex items-center gap-2 truncate">
          <FileCode className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span className="font-mono text-zinc-300 text-xs truncate">{currentExercise.path}</span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-900 px-1.5 py-0.2 rounded border border-zinc-800">
            <Check className="w-2.5 h-2.5 text-zinc-400" />
            Auto-saved
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Font size adjustment with tooltips */}
          <div className="flex items-center gap-0.5 bg-zinc-900 border border-zinc-800 rounded px-1">
            <Tooltip content="Decrease Font Size">
              <button
                onClick={handleZoomOut}
                className="p-1 hover:text-zinc-200 text-zinc-400"
              >
                <ZoomOut className="w-3 h-3 text-zinc-400" />
              </button>
            </Tooltip>
            <span className="text-[10px] font-mono px-1 text-zinc-400">{settings.fontSize}px</span>
            <Tooltip content="Increase Font Size">
              <button
                onClick={handleZoomIn}
                className="p-1 hover:text-zinc-200 text-zinc-400"
              >
                <ZoomIn className="w-3 h-3 text-zinc-400" />
              </button>
            </Tooltip>
          </div>

          {/* Reset Code icon button with tooltip */}
          <Tooltip content="Reset to starter code">
            <Button
              variant="ghost"
              size="icon"
              onClick={resetCurrentCode}
              className="h-7 w-7 text-zinc-400 hover:text-zinc-100"
            >
              <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
            </Button>
          </Tooltip>

          {/* Run Code icon button with tooltip */}
          <Tooltip content="Run Code" shortcut={getShortcut('⌘⇧↵', 'Ctrl+Shift+Enter')}>
            <Button
              variant="secondary"
              size="icon"
              onClick={runCode}
              disabled={isRunning}
              className="h-7 w-7 text-zinc-200"
            >
              {isRunning ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-300" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-zinc-200 text-zinc-200 ml-0.5" />
              )}
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Monaco Editor Container */}
      <div className="flex-1 min-h-0 w-full relative">
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
            lineNumbersMinChars: 3,
            lineDecorationsWidth: 10,
            glyphMargin: false,
            folding: !isMobile,
            minimap: { enabled: false },
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            padding: { top: isMobile ? 8 : 12, bottom: isMobile ? 8 : 12 },
            renderLineHighlight: 'line',
            automaticLayout: true,
            bracketPairColorization: { enabled: true },
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            scrollbar: {
              verticalScrollbarSize: isMobile ? 4 : 8,
              horizontalScrollbarSize: isMobile ? 4 : 8,
            },
          }}
          loading={
            <div className="flex items-center justify-center h-full text-xs text-zinc-400 gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
              Loading editor...
            </div>
          }
        />
      </div>

      {/* Mobile Center Joystick & Quick Symbol Toolbar (Shown when cursor is focused in editor or keyboard is active) */}
      {(isEditorFocused || isKeyboardOpen) && (
        <div
          onPointerDown={() => {
            isInteractingWithToolbarRef.current = true;
          }}
          onPointerUp={() => {
            setTimeout(() => {
              isInteractingWithToolbarRef.current = false;
            }, 300);
          }}
          className="md:hidden shrink-0 h-11 bg-[#0c0c0f] border-t border-zinc-800/80 flex items-center px-1.5 select-none z-20"
        >
          {/* Left Symbols Strip (scrollable) */}
          <div className="flex-1 min-w-0 overflow-x-auto no-scrollbar flex items-center gap-1 pr-1.5">
            {LEFT_RUST_SYMBOLS.map(sym => (
              <button
                key={sym}
                type="button"
                onPointerDown={e => triggerSymbol(e, sym)}
                onClick={e => triggerSymbol(e, sym)}
                className="shrink-0 min-w-[28px] h-7 px-1.5 flex items-center justify-center font-mono text-xs font-medium rounded bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 text-zinc-200 border border-zinc-800 hover:border-zinc-700 cursor-pointer select-none transition-colors"
              >
                {sym}
              </button>
            ))}
          </div>

          {/* Centered Virtual Analog Joystick */}
          <div className="shrink-0 px-2 flex items-center justify-center border-x border-zinc-800/80">
            <div
              ref={joystickBaseRef}
              onPointerDown={handleJoystickPointerDown}
              onPointerMove={handleJoystickPointerMove}
              onPointerUp={handleJoystickPointerUp}
              onPointerCancel={handleJoystickPointerUp}
              className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-700/80 shadow-inner relative flex items-center justify-center shrink-0 select-none touch-none cursor-grab active:cursor-grabbing"
              title="Drag joystick to move cursor"
              aria-label="Cursor Joystick"
            >
              {/* Direction markers */}
              <span className="absolute top-0.5 text-[6px] text-zinc-600 font-mono select-none pointer-events-none leading-none">▲</span>
              <span className="absolute bottom-0.5 text-[6px] text-zinc-600 font-mono select-none pointer-events-none leading-none">▼</span>
              <span className="absolute left-0.5 text-[6px] text-zinc-600 font-mono select-none pointer-events-none leading-none">◀</span>
              <span className="absolute right-0.5 text-[6px] text-zinc-600 font-mono select-none pointer-events-none leading-none">▶</span>

              {/* Joystick Thumb Nub */}
              <div
                style={{
                  transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`,
                  transition: isDragging ? 'none' : 'transform 150ms cubic-bezier(0.2, 0.8, 0.2, 1)',
                }}
                className="w-4 h-4 rounded-full bg-zinc-200 shadow-sm flex items-center justify-center pointer-events-none"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
              </div>
            </div>
          </div>

          {/* Right Symbols Strip (scrollable) + Dismiss Keyboard Button */}
          <div className="flex-1 min-w-0 overflow-x-auto no-scrollbar flex items-center gap-1 pl-1.5">
            {RIGHT_RUST_SYMBOLS.map(sym => (
              <button
                key={sym}
                type="button"
                onPointerDown={e => triggerSymbol(e, sym)}
                onClick={e => triggerSymbol(e, sym)}
                className="shrink-0 min-w-[28px] h-7 px-1.5 flex items-center justify-center font-mono text-xs font-medium rounded bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 text-zinc-200 border border-zinc-800 hover:border-zinc-700 cursor-pointer select-none transition-colors"
              >
                {sym}
              </button>
            ))}

            {/* Dismiss Keyboard Button pinned on the right */}
            <button
              type="button"
              onPointerDown={e => {
                e.preventDefault();
                handleDismissKeyboard();
              }}
              onClick={handleDismissKeyboard}
              className="sticky right-0 shrink-0 flex items-center gap-1 px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-300 hover:text-zinc-100 text-xs font-medium border border-zinc-700/60 cursor-pointer transition-colors shadow-sm ml-auto z-10"
              title="Dismiss keyboard"
              aria-label="Dismiss keyboard"
            >
              <Keyboard className="w-3.5 h-3.5 text-zinc-400" />
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
