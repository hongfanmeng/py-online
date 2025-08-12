# Python Online IDE

A modern, browser-based Python IDE built with React, Pyodide, and CodeMirror. Write and execute Python code directly in your browser with a professional development environment.

## Features

- **Code Editor**: Syntax-highlighted Python code editor with CodeMirror
- **Terminal Output**: Real-time execution results display
- **Python Execution**: Run Python code using Pyodide (Python in the browser)
- **Modern UI**: Dark theme with professional IDE-like interface
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Execution**: Execute code with a single click

## Tech Stack

- **React 19** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Pyodide** - Python runtime for the browser
- **CodeMirror** - Professional code editor
- **Vite** - Fast build tool and dev server

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
