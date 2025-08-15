import { useEffect } from "react";
import { FitAddon } from "@xterm/addon-fit";
import type { Terminal } from "@xterm/xterm";

export const useTerminalIO = (xterm: Terminal | null) => {
  const stdin = () => {
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
  };

  const stdout = (charCode: number) => {
    const char = String.fromCharCode(charCode);
    if (char === "\n") xterm?.writeln("");
    else xterm?.write(char);
  };

  return { stdin, stdout };
};

// Manages terminal status messages
export const useTerminalStatus = (
  xterm: Terminal | null,
  isReady: boolean,
  error: string | null
) => {
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

// Fits terminal to container when shown and on window resize
export const useTerminalFit = (
  xterm: Terminal | null,
  showTerminal: boolean
) => {
  useEffect(() => {
    if (!xterm || !showTerminal) return;

    const fitAddon = new FitAddon();
    xterm.loadAddon(fitAddon);
    fitAddon.fit();

    const handleResize = () => {
      fitAddon.fit();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [xterm, showTerminal]);
};
