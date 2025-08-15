import { useState } from "react";
import { EditorPanel, Footer, Header, TerminalPanel } from "~/components";
import { usePyodideWorker } from "~/hooks/pyodide";
import {
  useTerminalFit,
  useTerminalIO,
  useTerminalStatus,
} from "~/hooks/terminal";
import { useXTerm } from "~/hooks/xterm";
import { filterError } from "~/utils/ide";

const DEFAULT_CODE = `# Welcome to Python IDE!
# Write your Python code here

print("Hello, World!")
name = input("Enter your name: ")
print(f"Hello, {name}!")
`;

function App() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [isRunning, setIsRunning] = useState(false);
  const [showTerminal, setShowTerminal] = useState(true);

  const { ref: xtermRef, instance: xterm } = useXTerm();

  // Custom hooks for terminal functionality
  const { stdin, stdout } = useTerminalIO(xterm);

  const {
    isReady,
    error,
    runCode: runCodeInWorker,
  } = usePyodideWorker({ stdin, stdout });

  // Terminal status and fitting effects
  useTerminalStatus(xterm, isReady, error);
  useTerminalFit(xterm, showTerminal);

  const runCode = async () => {
    if (!isReady || !xterm || isRunning) return;

    setIsRunning(true);
    xterm.clear();

    const result = await runCodeInWorker(code);

    // Display error if any
    if (result.error) {
      const errorLines = filterError(result.error.split("\n"));
      for (const line of errorLines) xterm.writeln(line);
    }

    if (result.success) {
      xterm.writeln("\x1b[32m=== Code Execution Successful ===\x1b[0m");
    } else {
      xterm.writeln("\x1b[31m=== Code Exited With Errors ===\x1b[0m");
    }

    setIsRunning(false);
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

  const toggleTerminal = () => {
    setShowTerminal((prev) => !prev);
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-900 text-white overflow-hidden">
      <Header
        isReady={isReady}
        isRunning={isRunning}
        showTerminal={showTerminal}
        onRunCode={runCode}
        onToggleTerminal={toggleTerminal}
      />

      <div className="flex flex-1 overflow-hidden">
        <EditorPanel
          code={code}
          onCodeChange={setCode}
          isRunning={isRunning}
          isReady={isReady}
          onRunCode={runCode}
          onCopyCode={copyCode}
          showTerminal={showTerminal}
        />

        <TerminalPanel
          xtermRef={xtermRef}
          showTerminal={showTerminal}
          onClearOutput={clearOutput}
        />
      </div>

      <Footer />
    </div>
  );
}

export default App;
