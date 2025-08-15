import { wrap, type Remote } from "comlink";
import { useEffect, useRef, useState } from "react";
import { type PyodideWorkerAPI } from "~/workers/pyodide.worker";
import PyodideWorker from "~/workers/pyodide.worker?worker";
import * as Comlink from "comlink";

interface RunCodeResult {
  output: string;
  error?: string;
}

export interface UsePyodideWorkerProps {
  getInputLine?: () => Promise<string>;
  stdout?: (charCode: number) => void;
}

export function usePyodideWorker({
  getInputLine,
  stdout,
}: UsePyodideWorkerProps = {}) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const workerAPIRef = useRef<Remote<PyodideWorkerAPI> | null>(null);
  const stdinBufferRef = useRef<SharedArrayBuffer | null>(null);

  useEffect(() => {
    // Create worker
    const stdinBuffer = new SharedArrayBuffer(1024);
    stdinBufferRef.current = stdinBuffer;
    const worker = new PyodideWorker();
    const workerAPI = wrap<PyodideWorkerAPI>(worker);

    workerRef.current = worker;
    workerAPIRef.current = workerAPI;

    // Initialize Pyodide
    const initPyodide = async () => {
      try {
        setError(null);
        await workerAPI.init(stdinBuffer);
        setIsReady(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    };

    initPyodide();

    return () => {
      worker.terminate();
      workerRef.current = null;
      workerAPIRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!workerAPIRef.current) return;
    const stdin = async () => {
      const line = await getInputLine?.();
      const inputString = line || "";

      // Write the input string to the buffer
      const uint8Array = new Uint8Array(stdinBufferRef.current!);
      const stringBytes = new TextEncoder().encode(inputString);
      const int32Array = new Int32Array(stdinBufferRef.current!);

      // Store the length at index 1
      int32Array[1] = stringBytes.length;

      // Copy the string bytes starting at byte 8
      uint8Array.set(stringBytes, 8);

      Atomics.notify(new Int32Array(stdinBufferRef.current!), 0);
    };

    workerAPIRef.current.setStdin(Comlink.proxy(stdin));

    if (stdout) workerAPIRef.current.setStdout(Comlink.proxy(stdout));
  }, [workerAPIRef, getInputLine, stdout]);

  const runCode = async (code: string): Promise<RunCodeResult> => {
    if (!workerAPIRef.current) {
      throw new Error("Worker not initialized");
    }

    try {
      return await workerAPIRef.current.runCode(code);
    } catch (err) {
      throw new Error(`Failed to run code: ${err}`);
    }
  };

  return { isReady, error, runCode };
}
