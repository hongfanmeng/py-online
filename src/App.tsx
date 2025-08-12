import { useState, useEffect, useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import { FitAddon } from "@xterm/addon-fit";
import { loadPyodide, type PyodideAPI } from "pyodide";
import { useXTerm } from "./hooks/xterm";
import { filterError } from "./utils/ide";
import { cn } from "./utils/cn";
import { Play, Trash2, Code, Terminal, RefreshCw, Copy } from "lucide-react";

const DEFAULT_CODE = `# Welcome to Python IDE!
# Write your Python code here

print("Hello, World!")

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

for i in range(10):
    print(f"fibonacci({i}) = {fibonacci(i)}")
`;

function App() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [isLoading, setIsLoading] = useState(false);
  const [showTerminal, setShowTerminal] = useState(true);

  const pyodideRef = useRef<PyodideAPI>(null);
  const { ref: xtermRef, instance: xterm } = useXTerm({});

  // Load Pyodide on mount
  useEffect(() => {
    const initPyodide = async () => {
      try {
        const pyodide = await loadPyodide();
        pyodideRef.current = pyodide;
        xterm?.clear();
        xterm?.writeln(
          "\x1b[36mPython runtime loaded. Ready to execute code.\x1b[0m"
        );
      } catch (error) {
        xterm?.writeln(`Error: ${error}`);
      }
    };
    if (xterm) initPyodide();
  }, [xterm]);

  // Fit terminal to container
  useEffect(() => {
    if (xterm) {
      const fitAddon = new FitAddon();
      xterm.loadAddon(fitAddon);
      fitAddon.fit();
      xterm.options.fontSize = 16;
    }
  }, [xterm, showTerminal]);

  const runCode = async () => {
    if (!pyodideRef.current || !xterm) return;
    setIsLoading(true);
    xterm.clear();

    try {
      const pyodide = pyodideRef.current;
      pyodide.setStdout({
        raw: (charCode: number) => {
          const char = String.fromCharCode(charCode);
          if (char === "\n") xterm.writeln("");
          else xterm.write(char);
        },
      });

      const globals = pyodide.globals.get("dict")();
      try {
        await pyodide.runPythonAsync(code, {
          globals,
          filename: "main.py",
        });
        await pyodide.runPythonAsync("print(flush=True)");
      } finally {
        globals.clear();
        globals.destroy();
      }

      xterm.writeln("\x1b[32m=== Code Execution Successful ===\x1b[0m");
    } catch (error: unknown) {
      const lines = filterError(String((error as Error).message).split("\n"));
      for (const line of lines) xterm.writeln(line);
      xterm.writeln("\x1b[31m=== Code Exited With Errors ===\x1b[0m");
    } finally {
      setIsLoading(false);
    }
  };

  const clearOutput = () => {
    xterm?.clear();
    xterm?.writeln("\x1b[90mOutput cleared.\x1b[0m");
  };

  const resetEditor = () => {
    setCode(DEFAULT_CODE);
    xterm?.clear();
    xterm?.writeln("\x1b[36mEditor reset to default code.\x1b[0m");
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // fallback: do nothing
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-blue-950 text-white overflow-hidden">
      {/* Header */}
      <header
        className={cn(
          "h-14 flex justify-between items-center px-6",
          "bg-gray-900 border-b border-gray-800 shadow-md z-10"
        )}
      >
        <div className="flex items-center gap-3">
          <Code className="w-7 h-7 text-blue-400" />
          <span className="text-2xl font-bold tracking-tight">Python IDE</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={runCode}
            disabled={isLoading}
            className={cn(
              "flex items-center gap-2 px-4 py-2",
              "bg-blue-600 hover:bg-blue-700",
              "disabled:bg-gray-600 disabled:cursor-not-allowed",
              "text-white font-semibold rounded-lg text-sm shadow"
            )}
            title="Run Code"
          >
            <Play className="w-4 h-4" />
            <span>{isLoading ? "Running..." : "Run"}</span>
          </button>
          <button
            onClick={() => setShowTerminal((v) => !v)}
            className={cn(
              "flex items-center gap-2 px-3 py-2",
              "bg-gray-700 hover:bg-gray-600",
              "text-white font-semibold rounded-lg text-sm shadow"
            )}
            title={showTerminal ? "Hide Terminal" : "Show Terminal"}
          >
            <Terminal className="w-4 h-4" />
            <span className="hidden md:inline">
              {showTerminal ? "Hide Terminal" : "Show Terminal"}
            </span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor Panel */}
        <div
          className={cn(
            "flex flex-col flex-1 transition-all duration-300",
            showTerminal ? "lg:w-1/2" : "w-full"
          )}
        >
          <div className="flex items-center justify-between h-12 px-6 py-2 bg-gray-800 border-b border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Code className="w-4 h-4" />
              Code Editor
            </h3>
            <div className="flex gap-2">
              <button
                onClick={resetEditor}
                className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-xs"
                title="Reset Editor"
              >
                <RefreshCw className="w-3 h-3" />
                Reset
              </button>
              <button
                onClick={copyCode}
                className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-xs"
                title="Copy Code"
              >
                <Copy className="w-3 h-3" />
                Copy
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <CodeMirror
              value={code}
              style={{ height: "100%", fontSize: 16, background: "#181c2a" }}
              extensions={[python()]}
              theme={oneDark}
              onChange={(value) => setCode(value)}
              basicSetup={{
                lineNumbers: true,
                highlightActiveLineGutter: true,
                highlightSpecialChars: true,
                foldGutter: true,
                drawSelection: true,
                dropCursor: true,
                allowMultipleSelections: true,
                indentOnInput: true,
                bracketMatching: true,
                closeBrackets: true,
                autocompletion: true,
                rectangularSelection: true,
                crosshairCursor: true,
                highlightActiveLine: true,
                highlightSelectionMatches: true,
                closeBracketsKeymap: true,
                defaultKeymap: true,
                searchKeymap: true,
                historyKeymap: true,
                foldKeymap: true,
                completionKeymap: true,
                lintKeymap: true,
              }}
            />
          </div>
        </div>

        {/* Terminal Panel */}
        <div
          className={cn(
            "flex flex-col lg:w-1/2 w-full bg-[#101420] border-l border-gray-800 transition-all duration-300",
            showTerminal ? undefined : "hidden"
          )}
        >
          <div className="flex items-center justify-between h-12 px-6 py-2 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Output Terminal
              </h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearOutput}
                className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-xs"
                title="Clear Output"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-0 bg-[#101420] p-4">
            <div ref={xtermRef} className="w-full h-full" />
          </div>
        </div>
      </div>
      {/* Footer */}
      <footer className="h-8 flex items-center justify-center bg-gray-900 border-t border-gray-800 text-xs text-gray-400">
        <span>
          Python runs in your browser via{" "}
          <a
            href="https://pyodide.org"
            className="text-blue-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Pyodide
          </a>
          . &copy; {new Date().getFullYear()}
        </span>
      </footer>
    </div>
  );
}

export default App;
