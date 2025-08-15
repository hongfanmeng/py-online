import { expose } from "comlink";
import { loadPyodide, type PyodideAPI } from "pyodide";

export interface PyodideWorkerAPI {
  init(stdinBuffer: SharedArrayBuffer): Promise<void>;
  runCode(code: string): Promise<{ output: string; error?: string }>;
  isReady(): Promise<boolean>;
  setStdout(stdout: (charCode: number) => void): void;
  setStdin(requestStdin: () => Promise<void>): void;
}

class PyodideWorker implements PyodideWorkerAPI {
  private pyodide: PyodideAPI | null = null;
  private outputBuffer: string[] = [];
  private stdout: ((charCode: number) => void) | null = null;
  private stdin: (() => Promise<void>) | null = null;
  private stdinBuffer: SharedArrayBuffer | null = null;

  constructor() {}

  async init(stdinBuffer: SharedArrayBuffer): Promise<void> {
    try {
      this.pyodide = await loadPyodide();
      this.outputBuffer = [];
      this.stdinBuffer = stdinBuffer;
    } catch (error) {
      throw new Error(`Failed to initialize Pyodide: ${error}`);
    }
  }

  async isReady(): Promise<boolean> {
    return this.pyodide !== null;
  }

  setStdout(stdout: (charCode: number) => void) {
    this.stdout = stdout;
  }

  setStdin(stdin: () => Promise<void>) {
    this.stdin = stdin;
  }

  async runCode(code: string): Promise<{ output: string; error?: string }> {
    if (!this.pyodide) {
      throw new Error("Pyodide not initialized");
    }

    this.outputBuffer = [];

    try {
      // Set up stdout capture
      this.pyodide.setStdout({
        raw: (charCode: number) => {
          this.stdout?.(charCode);
        },
      });

      // Set up stdin with synchronous Atomics-based communication
      this.pyodide.setStdin({
        stdin: () => {
          if (!this.stdinBuffer) return "";
          this.stdin?.();
          Atomics.wait(new Int32Array(this.stdinBuffer), 0, 0);

          // Read the input string from the buffer
          const uint8Array = new Uint8Array(this.stdinBuffer);
          const length = new Int32Array(this.stdinBuffer)[1]; // Length stored at index 1
          const stringBytes = uint8Array.slice(8, 8 + length); // String data starts at byte 8
          const inputString = new TextDecoder().decode(stringBytes);

          return inputString;
        },
      });

      const globals = this.pyodide.globals.get("dict")();

      try {
        await this.pyodide.runPythonAsync(code, {
          globals,
          filename: "main.py",
        });
        await this.pyodide.runPythonAsync("print(flush=True)");
      } finally {
        globals.clear();
        globals.destroy();
      }

      return { output: this.outputBuffer.join("\n") };
    } catch (error: unknown) {
      return {
        output: this.outputBuffer.join("\n"),
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

const worker = new PyodideWorker();
expose(worker);
