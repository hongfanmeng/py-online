import { expose } from "comlink";
import { loadPyodide, type PyodideAPI } from "pyodide";

export interface PyodideWorkerAPI {
  init(): Promise<void>;
  runCode(code: string): Promise<{ output: string; error?: string }>;
  isReady(): Promise<boolean>;
}

class PyodideWorker implements PyodideWorkerAPI {
  private pyodide: PyodideAPI | null = null;
  private outputBuffer: string[] = [];

  async init(): Promise<void> {
    try {
      this.pyodide = await loadPyodide();
      this.outputBuffer = [];
    } catch (error) {
      throw new Error(`Failed to initialize Pyodide: ${error}`);
    }
  }

  async isReady(): Promise<boolean> {
    return this.pyodide !== null;
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
          const char = String.fromCharCode(charCode);
          if (char === "\n") {
            this.outputBuffer.push("");
          } else {
            if (this.outputBuffer.length === 0) {
              this.outputBuffer.push("");
            }
            this.outputBuffer[this.outputBuffer.length - 1] += char;
          }
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
