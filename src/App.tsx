import { FitAddon } from "@xterm/addon-fit";
import { Code, Copy, Play, Terminal, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import CodeMirror from "@uiw/react-codemirror";

import { usePyodideWorker } from "~/hooks/pyodide";
import { useXTerm } from "~/hooks/xterm";
import { cn } from "~/utils/cn";
import { filterError } from "~/utils/ide";

const DEFAULT_CODE = `# Welcome to Python IDE!
# Write your Python code here

print("Hello, World!")
`;

function App() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [isRunning, setIsRunning] = useState(false);
  const [showTerminal, setShowTerminal] = useState(true);

  const { ref: xtermRef, instance: xterm } = useXTerm();
  const { isReady, error, runCode: runCodeInWorker } = usePyodideWorker();

  useEffect(() => {
    if (!xterm) return;

    if (!isReady && !error) {
      xterm.writeln("\x1b[36mLoading Python runtime, please wait...\x1b[0m");
      return;
    }

    if (isReady) {
      xterm.clear();
      xterm.writeln("\x1b[36mPython runtime loaded. Ready to run.\x1b[0m");
      return;
    }

    if (error) {
      xterm.writeln(`\x1b[31mError loading Python runtime: ${error}\x1b[0m`);
    }
  }, [xterm, isReady, error]);

  // Fit terminal to container
  useEffect(() => {
    if (xterm && showTerminal) {
      const fitAddon = new FitAddon();
      xterm.loadAddon(fitAddon);
      fitAddon.fit();
    }
  }, [xterm, showTerminal]);

  const runCode = async () => {
    if (!isReady || !xterm || isRunning) return;

    setIsRunning(true);
    xterm.clear();

    try {
      const result = await runCodeInWorker(code);

      if (result.output) {
        result.output.split("\n").forEach((line) => xterm.writeln(line));
      }

      // Display error if any
      if (result.error) {
        const lines = filterError(result.error.split("\n"));
        for (const line of lines) xterm.writeln(line);
        xterm.writeln("\x1b[31m=== Code Exited With Errors ===\x1b[0m");
      } else {
        xterm.writeln("\x1b[32m=== Code Execution Successful ===\x1b[0m");
      }
    } catch (error: unknown) {
      xterm.writeln(`\x1b[31mError: ${error}\x1b[0m`);
    } finally {
      setIsRunning(false);
    }
  };

  const clearOutput = () => {
    xterm?.clear();
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
          "h-14 flex justify-between items-center px-4 py-3",
          "bg-gray-900 border-b border-gray-800 shadow-md z-10"
        )}
      >
        <div className="flex items-center gap-3">
          <img src="/favicon.png" className="size-7"></img>
          <span className="text-2xl font-bold tracking-tight">Python IDE</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={runCode}
            disabled={!isReady || isRunning}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5",
              "bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white",
              "cursor-pointer disabled:cursor-not-allowed",
              "font-semibold rounded-lg shadow text-sm"
            )}
            title="Run Code"
          >
            <Play className="w-4 h-4" />
            <span>{isRunning ? "Running..." : "Run"}</span>
          </button>
          <button
            onClick={() => setShowTerminal((v) => !v)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5",
              "bg-gray-700 hover:bg-gray-600 text-white",
              "cursor-pointer",
              "font-semibold rounded-lg shadow text-sm"
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
            showTerminal ? "lg:w-1/2" : "w-full",
            showTerminal ? "border-r border-gray-700" : ""
          )}
        >
          <div className="flex items-center justify-between h-12 px-4 py-2 bg-gray-800 border-b border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Code className="w-4 h-4" />
              Code Editor
            </h3>
            <div className="flex gap-2">
              <button
                disabled={isRunning || !isReady}
                onClick={runCode}
                className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-xs cursor-pointer"
                title="Run Code"
              >
                <Play className="w-3 h-3" />
                Run
              </button>
              <button
                onClick={copyCode}
                className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-xs cursor-pointer"
                title="Copy Code"
              >
                <Copy className="w-3 h-3" />
                Copy
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden scheme-dark">
            <CodeMirror
              value={code}
              style={{ fontSize: 16 }}
              className="[&>.cm-editor]:h-full h-full"
              extensions={[python()]}
              theme={oneDark}
              onChange={(value) => setCode(value)}
              basicSetup={{
                lineNumbers: true,
                tabSize: 4,
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
          <div className="flex items-center justify-between h-12 px-4 py-2 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Output Terminal
              </h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearOutput}
                className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-xs cursor-pointer"
                title="Clear Output"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            </div>
          </div>
          <div
            ref={xtermRef}
            className="w-full scheme-dark flex-1 min-h-0 [&>.xterm]:p-4"
          />
        </div>
      </div>
      {/* Footer */}
      <footer className="h-8 flex items-center justify-center bg-gray-900 border-t border-gray-800 text-xs text-gray-400">
        <span>
          Python runs in a web worker via{" "}
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
