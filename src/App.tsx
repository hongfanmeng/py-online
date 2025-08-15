import { useState } from "react";
import { EditorPanel, Footer, Header, TerminalPanel } from "~/components";
import { ThemeProvider } from "~/components/theme-provider";
import { usePyodideWorker } from "~/hooks/pyodide";
import { useTerminalIO, useTerminalStatus } from "~/hooks/terminal";
import { useXTerm } from "~/hooks/xterm";
import { filterError } from "~/utils/ide";

const DEFAULT_CODE = `# Welcome to Online Python!
# Write your Python code here

print("Hello, World!")
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

  useTerminalStatus(xterm, isReady, error);

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
    <ThemeProvider defaultTheme="system">
      <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
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
          />

          <TerminalPanel
            xterm={xterm}
            xtermRef={xtermRef}
            showTerminal={showTerminal}
            onClearOutput={clearOutput}
          />
        </div>

        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;
