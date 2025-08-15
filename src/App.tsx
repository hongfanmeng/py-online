import { useState } from "react";
import Split from "react-split";
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

  const { ref: xtermRef, instance: xterm } = useXTerm();

  // Custom hooks for terminal functionality
  const { stdin, stdout } = useTerminalIO(xterm);

  const {
    isReady,
    error,
    runCode: runCodeInWorker,
    stop: onStop,
  } = usePyodideWorker({ stdin, stdout });

  useTerminalStatus(xterm, isReady, error);

  const onRun = async () => {
    if (!isReady || !xterm || isRunning) return;

    setIsRunning(true);
    xterm.clear();

    const result = await runCodeInWorker(code);

    // do a sleep(0) for the remaining output to be printed
    await new Promise((resolve) => setTimeout(resolve, 0));

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

  return (
    <ThemeProvider defaultTheme="system">
      <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
        <Header
          isReady={isReady}
          isRunning={isRunning}
          onRun={onRun}
          onStop={onStop}
        />

        <Split
          className="flex flex-row flex-1"
          direction="horizontal"
          minSize={500}
          gutterSize={0}
          gutter={() => {
            const gutter = document.createElement("div");
            gutter.className = "relative cursor-col-resize z-10";
            const child = document.createElement("div");
            child.className = "absolute left-0 top-0 h-full w-6 bg-transparent";
            gutter.appendChild(child);
            return gutter;
          }}
        >
          <EditorPanel
            code={code}
            onCodeChange={setCode}
            isRunning={isRunning}
            isReady={isReady}
            onRun={onRun}
            onStop={onStop}
          />
          <TerminalPanel
            xterm={xterm}
            xtermRef={xtermRef}
            onClearOutput={clearOutput}
          />
        </Split>

        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;
