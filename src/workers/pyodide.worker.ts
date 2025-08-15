import { expose } from "comlink";
import { loadPyodide, type PyodideAPI } from "pyodide";

export interface PyodideWorkerAPI {
  init(sharedInputBuffer: SharedArrayBuffer): Promise<void>;
  runCode(code: string): Promise<{ success: boolean; error?: string }>;
  isReady(): Promise<boolean>;
  setStdout(stdout: (charCode: number) => void): void;
  setStdin(requestStdin: () => Promise<void>): void;
}

class PyodideWorker implements PyodideWorkerAPI {
  private pyodide: PyodideAPI | null = null;
  private stdout: ((charCode: number) => void) | null = null;
  private requestStdinInput: (() => Promise<void>) | null = null;
  private sharedInputBuffer: SharedArrayBuffer | null = null;

  constructor() {}

  async init(sharedInputBuffer: SharedArrayBuffer): Promise<void> {
    try {
      this.pyodide = await loadPyodide();
      this.sharedInputBuffer = sharedInputBuffer;
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

  setStdin(requestStdin: () => Promise<void>) {
    this.requestStdinInput = requestStdin;
  }

  async runCode(code: string): Promise<{ success: boolean; error?: string }> {
    if (!this.pyodide) {
      throw new Error("Pyodide not initialized");
    }

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
          if (!this.sharedInputBuffer) return "";

          // Request input from the main thread
          this.requestStdinInput?.();

          // Wait for the main thread to provide input
          Atomics.wait(new Int32Array(this.sharedInputBuffer), 0, 0);

          // Read the input string from the shared buffer
          const inputBufferBytes = new Uint8Array(this.sharedInputBuffer);
          const bufferControlArray = new Int32Array(this.sharedInputBuffer);
          const inputLength = bufferControlArray[1]; // Length stored at index 1
          const inputDataBytes = inputBufferBytes.slice(8, 8 + inputLength); // Input data starts at byte 8
          const inputString = new TextDecoder().decode(inputDataBytes);

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

      return { success: true };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

const worker = new PyodideWorker();
expose(worker);
