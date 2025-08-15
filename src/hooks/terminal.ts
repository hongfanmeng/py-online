import { useEffect } from "react";
import { FitAddon } from "@xterm/addon-fit";
import type { Terminal } from "@xterm/xterm";

export const useTerminalIO = (xterm: Terminal | null) => {
  const stdin = () =>
    new Promise<string>((resolve) => {
      let inputBuffer = "";
      const disposable = xterm?.onData((data: string) => {
        if (data.includes("\n") || data.includes("\r")) {
          const input = data.split(/\r|\n/)[0];
          inputBuffer += input;
          xterm?.writeln(input);
          disposable?.dispose();
          resolve(inputBuffer);
        } else {
          inputBuffer += data;
          xterm?.write(data);
        }
      });
    });

  const stdout = (charCode: number) => {
    const char = String.fromCharCode(charCode);
    if (char === "\n") {
      xterm?.writeln("");
    } else {
      xterm?.write(char);
    }
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
};

// Fits terminal to container when shown
export const useTerminalFit = (
  xterm: Terminal | null,
  showTerminal: boolean
) => {
  useEffect(() => {
    if (xterm && showTerminal) {
      const fitAddon = new FitAddon();
      xterm.loadAddon(fitAddon);
      fitAddon.fit();
    }
  }, [xterm, showTerminal]);
};
