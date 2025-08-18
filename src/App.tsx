import { useState } from "react";
import Split from "react-split";
import { Footer, Header } from "~/components/layout";
import { EditorPanel } from "~/components/panels/editor-panel";
import { TerminalPanel } from "~/components/panels/terminal-panel";
import { ThemeProvider } from "~/components/theme/theme-provider";
import { useAppState } from "~/hooks/use-app-state";
import { usePyodideWorker } from "~/hooks/use-pyodide-worker";
import { useTerminalIO, useTerminalStatus } from "~/hooks/use-terminal";
import { useXTerm } from "~/hooks/use-xterm";
import { filterPyodideErrors } from "~/utils/error-handler";
import { DEFAULT_CODE } from "~/components/core/monaco-editor";

function App() {
  const [code, setCode] = useState(DEFAULT_CODE);

  const { setIsRunning, isRunning, isReady } = useAppState();

  const { ref: xtermRef, instance: xterm } = useXTerm();
  const { stdin, stdout } = useTerminalIO(xterm);
  const { runCode, stop } = usePyodideWorker({ stdin, stdout });

  useTerminalStatus(xterm);

  const executeCode = async (code: string) => {
    if (!isReady || isRunning || !xterm) return;

    setIsRunning(true);
    xterm.clear();

    const result = await runCode(code);

    // do a sleep(0) for the remaining output to be printed
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Display error if any
    if (result.error) {
      const errorLines = filterPyodideErrors(result.error.split("\n"));
      for (const line of errorLines) xterm.writeln(line);
    }

    if (result.success) {
      xterm.writeln("\x1b[32m=== Code Execution Successful ===\x1b[0m");
    } else {
      xterm.writeln("\x1b[31m=== Code Exited With Errors ===\x1b[0m");
    }

    setIsRunning(false);
  };

  const onRun = () => executeCode(code);
  const onStop = () => stop();

  return (
    <ThemeProvider defaultTheme="system">
      <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
        <Header onRun={onRun} onStop={onStop} />
        <Split
          className="flex flex-row flex-1 min-h-0"
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
            onRun={onRun}
            onStop={onStop}
          />
          <TerminalPanel xterm={xterm} xtermRef={xtermRef} />
        </Split>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;
