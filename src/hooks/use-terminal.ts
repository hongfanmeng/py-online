import type { FitAddon } from "@xterm/addon-fit";
import type { Terminal } from "@xterm/xterm";
import { useCallback, useEffect, useState } from "react";
import { useAppState } from "~/hooks/use-app-state";

export const useTerminalIO = (xterm: Terminal | null) => {
  const stdin = useCallback(() => {
    return new Promise<string>((resolve) => {
      let inputBuffer = "";
      const disposable = xterm?.onData((data: string) => {
        for (const char of data) {
          if (char === "\r" || char === "\n") {
            xterm?.writeln("");
            disposable?.dispose();
            resolve(inputBuffer);
            return;
          }
          if (char === "\x7f" || char === "\b") {
            if (inputBuffer) {
              inputBuffer = inputBuffer.slice(0, -1);
              xterm?.write("\b \b");
            }
            continue;
          }
          inputBuffer += char;
          xterm?.write(char);
        }
      });
    });
  }, [xterm]);

  const stdout = useCallback(
    (charCode: number) => {
      const char = String.fromCharCode(charCode);
      if (char === "\n") xterm?.writeln("");
      else xterm?.write(char);
    },
    [xterm]
  );

  return { stdin, stdout };
};

export const useTerminalStatus = (xterm: Terminal | null) => {
  const { isReady, error } = useAppState();

  useEffect(() => {
    if (!xterm) return;

    if (!isReady && !error) {
      xterm.writeln("\x1b[33mLoading Python runtime, please wait...\x1b[0m");
      return;
    }

    if (isReady) {
      xterm.clear();
      xterm.writeln("\x1b[32mPython runtime loaded. Ready to run.\x1b[0m");
      return;
    }

    if (error) {
      const errorLines = error.split("\n");
      for (const line of errorLines) {
        xterm.writeln(`\x1b[31m${line}\x1b[0m`);
      }
    }
  }, [xterm, isReady, error]);
};

export const useTerminalFit = (
  xtermRef: React.RefObject<HTMLDivElement | null>,
  xterm: Terminal | null
) => {
  const [fitAddon, setFitAddon] = useState<FitAddon | null>(null);
  useEffect(() => {
    import("@xterm/addon-fit").then(({ FitAddon }) => {
      setFitAddon(new FitAddon());
    });
  }, []);

  useEffect(() => {
    if (!xterm || !xtermRef.current || !fitAddon) return;

    xterm.loadAddon(fitAddon);
    fitAddon.fit();

    const handleResize = () => fitAddon.fit();

    window.addEventListener("resize", handleResize);
    const observer = new window.ResizeObserver(handleResize);
    observer.observe(xtermRef.current);

    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
  }, [xterm, xtermRef, fitAddon]);
};
