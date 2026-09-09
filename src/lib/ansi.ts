export interface AnsiSpan {
  text: string;
  color?: string;
  bgColor?: string;
  bold?: boolean;
  dim?: boolean;
  italic?: boolean;
  underline?: boolean;
}

const COLOR_MAP: Record<number, string> = {
  30: '#71717a', // Black / Dark gray
  31: '#f87171', // Red
  32: '#4ade80', // Green
  33: '#facc15', // Yellow
  34: '#60a5fa', // Blue
  35: '#c084fc', // Magenta
  36: '#38bdf8', // Cyan
  37: '#f4f4f5', // White

  // Bright variants
  90: '#a1a1aa',
  91: '#ef4444',
  92: '#22c55e',
  93: '#eab308',
  94: '#3b82f6',
  95: '#a855f7',
  96: '#06b6d4',
  97: '#ffffff',
};

const BG_COLOR_MAP: Record<number, string> = {
  40: '#27272a',
  41: '#7f1d1d',
  42: '#14532d',
  43: '#713f12',
  44: '#1e3a8a',
  45: '#581c87',
  46: '#164e63',
  47: '#52525b',
};

export function parseAnsi(text: string): AnsiSpan[] {
  if (!text) return [];

  // Regex to match ANSI escape codes e.g. \x1b[31;1m or \u001b[0m
  // eslint-disable-next-line no-control-regex
  const ansiRegex = /\x1b\[([0-9;]*)m/g;
  const spans: AnsiSpan[] = [];

  let lastIndex = 0;
  let currentColor: string | undefined = undefined;
  let currentBgColor: string | undefined = undefined;
  let currentBold = false;
  let currentDim = false;
  let currentItalic = false;
  let currentUnderline = false;

  let match: RegExpExecArray | null;

  while ((match = ansiRegex.exec(text)) !== null) {
    const rawText = text.slice(lastIndex, match.index);
    if (rawText.length > 0) {
      spans.push({
        text: rawText,
        color: currentColor,
        bgColor: currentBgColor,
        bold: currentBold,
        dim: currentDim,
        italic: currentItalic,
        underline: currentUnderline,
      });
    }

    const codeStr = match[1];
    if (!codeStr || codeStr === '0') {
      // Reset all
      currentColor = undefined;
      currentBgColor = undefined;
      currentBold = false;
      currentDim = false;
      currentItalic = false;
      currentUnderline = false;
    } else {
      const codes = codeStr.split(';').map(c => parseInt(c, 10));
      for (const code of codes) {
        if (code === 0) {
          currentColor = undefined;
          currentBgColor = undefined;
          currentBold = false;
          currentDim = false;
          currentItalic = false;
          currentUnderline = false;
        } else if (code === 1) {
          currentBold = true;
        } else if (code === 2) {
          currentDim = true;
        } else if (code === 3) {
          currentItalic = true;
        } else if (code === 4) {
          currentUnderline = true;
        } else if (code === 22) {
          currentBold = false;
          currentDim = false;
        } else if (code === 23) {
          currentItalic = false;
        } else if (code === 24) {
          currentUnderline = false;
        } else if (code === 39) {
          currentColor = undefined;
        } else if (code === 49) {
          currentBgColor = undefined;
        } else if (COLOR_MAP[code]) {
          currentColor = COLOR_MAP[code];
        } else if (BG_COLOR_MAP[code]) {
          currentBgColor = BG_COLOR_MAP[code];
        }
      }
    }

    lastIndex = ansiRegex.lastIndex;
  }

  // Trailing text
  if (lastIndex < text.length) {
    spans.push({
      text: text.slice(lastIndex),
      color: currentColor,
      bgColor: currentBgColor,
      bold: currentBold,
      dim: currentDim,
      italic: currentItalic,
      underline: currentUnderline,
    });
  }

  return spans;
}
