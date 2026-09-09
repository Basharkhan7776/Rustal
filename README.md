# 🦀 Rustal — Web-Based Local-Store Rustlings

> Master the Rust programming language directly in your browser. Complete official Rustlings curriculum with **coss.com/ui** & **shadcn/ui** design, Monaco editor, dual real-time compilation engines, and 100% offline local progress persistence.

---

## ✨ Features

- **94 Official Rustlings Exercises**: Includes all exercises from Rustlings v6.5 across 25 modules (`00_intro` to `23_conversions` and `quizzes`).
- **coss.com / shadcn Aesthetics**: Minimalist dark UI inspired by Cal.com's design system (`coss.com/ui`) with crisp 1px borders, subtle pills, smooth transitions, and high-contrast typography.
- **Monaco Code Editor**: Full VS Code editor engine with Rust syntax highlighting, auto-save, bracket matching, and font size adjustment.
- **Vim Navigation Mode**: Built-in toggle for Vim modal editing (perfect for Neovim / LazyVim users).
- **Dual Execution Engines**:
  - **Native Local Compiler**: Blazing fast instant compilation via local `rustc` / `cargo` when running in dev mode (`bun run dev`).
  - **Rust Playground API**: Zero-install, browser-native compilation via the official `play.rust-lang.org/execute` API with unrestricted CORS headers for static deployments.
- **Interactive Terminal & ANSI Colors**: Real-time compiler diagnostics with syntax colors, error pointers, and cargo test results.
- **Topic Theory & Guides**: Rich markdown explanations from topic `README.md` files with direct links to The Rust Book.
- **Progressive Hints & Solutions**: Expandable hints to guide you when stuck, plus official solutions with confirmation guards and an "Apply to Editor" feature.
- **100% Local Persistence**:
  - Automatically saves code edits per exercise in browser `localStorage`.
  - Solved status, bookmarks, and notes.
  - Export & Import progress as JSON snapshots for backups or sharing across devices.
  - Reset single exercise or reset all progress.
- **Command Palette (`⌘K` / `Ctrl+K`)**: Instant fuzzy search across all 94 exercises.
- **Keyboard Shortcuts**:
  - `⌘ + Enter` / `Ctrl + Enter`: Run & Test current exercise
  - `⌘ + K` / `Ctrl + K`: Jump to exercise
  - `Alt + →`: Next exercise
  - `Alt + ←`: Previous exercise

---

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh) (v1.2+) or Node.js (v18+)
- [Rust](https://www.rust-lang.org) (optional, for local `rustc` compiler execution)

### Installation & Run

```bash
# Clone and enter directory
cd rustal

# Install dependencies with Bun
bun install

# Start development server (supports instant local compilation)
bun run dev

# Or build for production
bun run build
bun run preview
```

Open `http://localhost:5173` in your browser.

---

## 📁 Project Structure

```
rustal/
├── src/
│   ├── components/
│   │   ├── ui/               # shadcn / coss.com base components (Button, Badge, Modal)
│   │   ├── Header.tsx        # Breadcrumb, progress bar, navigation, run trigger
│   │   ├── Sidebar.tsx       # 25 module accordions, search, filters
│   │   ├── CodeEditor.tsx    # Monaco editor with Rust syntax & auto-save
│   │   ├── InstructionsPane.tsx # Markdown theory, hints, and solutions
│   │   ├── TerminalOutput.tsx# ANSI-rendered terminal console
│   │   ├── CommandPalette.tsx# Quick switcher (⌘K)
│   │   └── Modals/           # Solution & Settings modals
│   ├── context/
│   │   └── RustlingsContext.tsx # Central application state & keyboard shortcuts
│   ├── data/
│   │   └── exercises.json    # Pre-extracted 94 exercises, hints, readmes, and solutions
│   ├── lib/
│   │   ├── ansi.ts           # ANSI escape code parser for compiler output
│   │   ├── storage.ts        # LocalStorage persistence & backup engine
│   │   └── utils.ts          # Tailwind cn utility and helpers
│   ├── services/
│   │   └── compiler.ts       # Execution router (Local endpoint + Rust Playground API)
│   ├── types/
│   │   └── exercise.ts       # TypeScript interfaces
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── scripts/
│   └── extract-exercises.py  # Synchronizes exercises from rustlings repository
├── vite.config.ts            # Vite config with local Rust runner plugin
└── package.json
```

---

## 📜 Re-syncing Exercises

If you update or modify the exercises in your local Rustlings folder:

```bash
bun run extract
```

This re-extracts starter code, solutions, and hints from `/home/bashar-khan/rust/rustlings`.
