import { wrap, type Remote } from "comlink";
import { useEffect, useRef, useState } from "react";
import { type PyodideWorkerAPI } from "~/workers/pyodide.worker";
import PyodideWorker from "~/workers/pyodide.worker?worker";
import * as Comlink from "comlink";

interface RunCodeResult {
  success: boolean;
  error?: string;
}

export interface UsePyodideWorkerProps {
  getUserInput?: () => Promise<string>;
  stdout?: (charCode: number) => void;
}

export function usePyodideWorker({
  getUserInput: getInputLine,
  stdout,
}: UsePyodideWorkerProps = {}) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const workerAPIRef = useRef<Remote<PyodideWorkerAPI> | null>(null);
  const sharedInputBufferRef = useRef<SharedArrayBuffer | null>(null);

  useEffect(() => {
    // Create worker
    const sharedInputBuffer = new SharedArrayBuffer(1024);
    sharedInputBufferRef.current = sharedInputBuffer;
    const worker = new PyodideWorker();
    const workerAPI = wrap<PyodideWorkerAPI>(worker);

    workerRef.current = worker;
    workerAPIRef.current = workerAPI;

    // Initialize Pyodide
    const initPyodide = async () => {
      try {
        setError(null);
        await workerAPI.init(sharedInputBuffer);
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

    const handleStdinRequest = async () => {
      const userInput = await getInputLine?.();
      const inputString = userInput || "";

      // Write the input string to the shared buffer
      const inputBufferBytes = new Uint8Array(sharedInputBufferRef.current!);
      const encodedInputBytes = new TextEncoder().encode(inputString);
      const bufferControlArray = new Int32Array(sharedInputBufferRef.current!);

      // Store the input length at index 1 for the worker to read
      bufferControlArray[1] = encodedInputBytes.length;

      // Copy the encoded input bytes starting at byte 8 (after control data)
      inputBufferBytes.set(encodedInputBytes, 8);

      // Signal the worker that input is ready
      Atomics.notify(new Int32Array(sharedInputBufferRef.current!), 0);
    };

    workerAPIRef.current.setStdin(Comlink.proxy(handleStdinRequest));

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
