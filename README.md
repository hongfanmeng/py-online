# Python Online IDE

A modern, browser-based Python IDE built with React, Pyodide, and Monaco Editor. Write and execute Python code directly in your browser with a professional development environment featuring real-time terminal output and interactive input support.

## Features

- **Monaco Editor**: Professional code editor with syntax highlighting, line numbers, and Python language support
- **Real-time Terminal**: XTerm.js-based terminal with colored output and interactive input support
- **Python Execution**: Run Python code using Pyodide (Python in the browser) with full standard library support
- **Interactive Input**: Support for `input()` function with real-time user interaction
- **Modern UI**: Dark theme with professional IDE-like interface using Tailwind CSS
- **Responsive Design**: Works on desktop and mobile devices with collapsible panels
- **Code Management**: Copy code to clipboard and clear terminal output
- **Error Handling**: Clean error display with Pyodide-specific message filtering
- **Worker-based Architecture**: Runs Python execution in a separate Web Worker for better performance

## Tech Stack

- **React 19** - Modern React with hooks and TypeScript
- **TypeScript** - Type-safe development throughout
- **Pyodide** - Python runtime for the browser with full standard library
- **Monaco Editor** - Professional code editor (same as VS Code)
- **XTerm.js** - Terminal emulator for output display
- **Comlink** - Web Worker communication
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server
- **Lucide React** - Beautiful icons

## Architecture

The application uses a modern architecture with the following key components:

- **Main Thread**: React UI components and state management
- **Web Worker**: Python execution environment using Pyodide
- **SharedArrayBuffer**: Efficient communication between main thread and worker for stdin/stdout
- **Monaco Editor**: Professional code editing experience
- **XTerm.js**: Terminal output with proper ANSI color support

### Key Components

- `App.tsx` - Main application component with state management
- `EditorPanel` - Monaco editor with run/copy controls
- `TerminalPanel` - XTerm.js terminal for output display
- `Header` - Application header with controls
- `Footer` - Application footer
- `usePyodideWorker` - Hook for Pyodide worker communication
- `useXTerm` - Hook for XTerm.js terminal management

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd py-online
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
pnpm build
```

The built files will be in the `dist` directory.

## Usage

### Basic Python Code Execution

1. Write Python code in the Monaco editor
2. Click the "Run" button or use the keyboard shortcut
3. View the output in the terminal panel
4. Use the "Clear" button to clear terminal output

### Interactive Input

The IDE supports Python's `input()` function:

```python
name = input("Enter your name: ")
print(f"Hello, {name}!")
```

When the code requests input, a prompt will appear in the terminal where you can type your response.

### Supported Python Features

- Full Python standard library
- File I/O operations
- Mathematical computations
- Data structures and algorithms
- Most third-party packages available through Pyodide

### Limitations

- Network access is limited due to browser security restrictions
- Some system-specific modules may not be available
- File system access is virtualized within the browser environment
