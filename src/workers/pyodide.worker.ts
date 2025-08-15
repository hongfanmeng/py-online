import { expose } from "comlink";
import { loadPyodide, type PyodideAPI } from "pyodide";

// Constants
const INPUT_LENGTH_INDEX = 1;
const INPUT_DATA_OFFSET = 8;

export interface PyodideWorkerAPI {
  init(): Promise<void>;
  runCode(code: string): Promise<{ success: boolean; error?: string }>;
  isReady(): Promise<boolean>;

  setStdout(stdout: (charCode: number) => void): void;
  setStdin(requestStdin: () => Promise<void>): void;

  // shared buffer for message passing
  setInterruptBuffer(interruptBuffer: Uint8Array): void;
  setInputBuffer(inputBuffer: SharedArrayBuffer): void;
}

class PyodideWorker implements PyodideWorkerAPI {
  private pyodide: PyodideAPI | null = null;
  private stdout: ((charCode: number) => void) | null = null;
  private requestStdinInput: (() => Promise<void>) | null = null;
  private inputBuffer: SharedArrayBuffer | null = null;
  private interruptBuffer: Uint8Array | null = null;

  constructor() {}

  async init(): Promise<void> {
    try {
      this.pyodide = await loadPyodide();
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

  setInterruptBuffer(interruptBuffer: Uint8Array) {
    this.interruptBuffer = interruptBuffer;
    this.pyodide?.setInterruptBuffer(interruptBuffer);
  }

  setInputBuffer(inputBuffer: SharedArrayBuffer) {
    this.inputBuffer = inputBuffer;
  }

  private setupStdoutCapture() {
    if (!this.pyodide) return;

    this.pyodide.setStdout({
      raw: (charCode: number) => {
        this.stdout?.(charCode);
      },
    });

    this.pyodide.setStderr({
      raw: (charCode: number) => {
        console.log(123);
        this.stdout?.(charCode);
      },
    });
  }

  private setupStdinCapture() {
    if (!this.pyodide) return;

    this.pyodide.setStdin({
      stdin: () => {
        if (!this.inputBuffer) return "";

        // Request input from the main thread
        this.requestStdinInput?.();

        // Wait for the main thread to provide input
        Atomics.wait(new Int32Array(this.inputBuffer), 0, 0);

        // Read the input string from the shared buffer
        const inputBufferBytes = new Uint8Array(this.inputBuffer);
        const bufferControlArray = new Int32Array(this.inputBuffer);
        const inputLength = bufferControlArray[INPUT_LENGTH_INDEX];
        const inputDataBytes = inputBufferBytes.slice(
          INPUT_DATA_OFFSET,
          INPUT_DATA_OFFSET + inputLength
        );
        const inputString = new TextDecoder().decode(inputDataBytes);

        return inputString;
      },
    });
  }

  private async executePythonCode(code: string): Promise<void> {
    if (!this.pyodide) {
      throw new Error("Pyodide not initialized");
    }

    const globals = this.pyodide.globals.get("dict")();

    try {
      await this.pyodide.runPythonAsync(code, { globals, filename: "main.py" });
      await this.pyodide.runPythonAsync("print(flush=True)");
    } finally {
      globals.clear();
      globals.destroy();
    }
  }

  async runCode(code: string): Promise<{ success: boolean; error?: string }> {
    if (!this.pyodide) {
      throw new Error("Pyodide not initialized");
    }

    try {
      // Set up I/O capture
      this.setupStdoutCapture();
      this.setupStdinCapture();

      if (this.interruptBuffer) {
        this.interruptBuffer[0] = 0;
      }

      // Execute the Python code
      await this.executePythonCode(code);

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
