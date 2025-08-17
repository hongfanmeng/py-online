import * as Comlink from "comlink";
import { wrap, type Remote } from "comlink";
import { useEffect, useRef } from "react";
import {
  INPUT_DATA_OFFSET,
  INPUT_LENGTH_INDEX,
  type PyodideWorkerAPI,
  type RunCodeResult,
} from "~/workers/pyodide.worker";
import PyodideWorker from "~/workers/pyodide.worker?worker";
import { useAppState } from "~/hooks/use-app-state";

const SHARED_ARRAY_BUFFER_NOT_SUPPORTED = `
SharedArrayBuffer is not supported in this environment. 
Please ensure the page is served with the following HTTP headers:
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: require-corp
These headers are required for Pyodide to function properly.
`.trim();

const INPUT_BUFFER_SIZE = 1024;
const INTERRUPT_SIGNAL = 2;

export interface UsePyodideWorkerProps {
  stdin?: () => Promise<string>;
  stdout?: (charCode: number) => void;
}

export function usePyodideWorker({ stdin, stdout }: UsePyodideWorkerProps) {
  const { setIsReady, setError } = useAppState();

  const workerRef = useRef<Worker | null>(null);
  const workerAPIRef = useRef<Remote<PyodideWorkerAPI> | null>(null);
  const sharedInputBufferRef = useRef<SharedArrayBuffer | null>(null);
  const interruptBufferRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    if (!crossOriginIsolated) {
      setError(SHARED_ARRAY_BUFFER_NOT_SUPPORTED);
      return;
    }

    // Create shared buffers
    const sharedInputBuffer = new SharedArrayBuffer(INPUT_BUFFER_SIZE);
    const interruptBuffer = new Uint8Array(new SharedArrayBuffer(1));
    sharedInputBufferRef.current = sharedInputBuffer;
    interruptBufferRef.current = interruptBuffer;

    const worker = new PyodideWorker();
    const workerAPI = wrap<PyodideWorkerAPI>(worker);

    workerRef.current = worker;
    workerAPIRef.current = workerAPI;

    // Initialize Pyodide
    const initPyodide = async () => {
      try {
        setError(null);
        await workerAPI.init();
        workerAPI.setInputBuffer(sharedInputBuffer);
        workerAPI.setInterruptBuffer(interruptBuffer);
        setIsReady(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    };

    initPyodide();

    return () => {
      setIsReady(false);
      worker.terminate();
      workerRef.current = null;
      workerAPIRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!workerAPIRef.current || !crossOriginIsolated) return;

    const handleStdinRequest = async () => {
      const userInput = await stdin?.();
      const inputString = userInput || "";

      // Write the input string to the shared buffer
      const inputBufferBytes = new Uint8Array(sharedInputBufferRef.current!);
      const encodedInputBytes = new TextEncoder().encode(inputString);
      const bufferControlArray = new Int32Array(sharedInputBufferRef.current!);

      // Store the input length at index 1 for the worker to read
      bufferControlArray[INPUT_LENGTH_INDEX] = encodedInputBytes.length;

      // Copy the encoded input bytes starting at byte 8 (after control data)
      inputBufferBytes.set(encodedInputBytes, INPUT_DATA_OFFSET);

      // Signal the worker that input is ready
      Atomics.notify(new Int32Array(sharedInputBufferRef.current!), 0);
    };

    if (stdin) workerAPIRef.current.setStdin(Comlink.proxy(handleStdinRequest));
    if (stdout) workerAPIRef.current.setStdout(Comlink.proxy(stdout));
  }, [workerAPIRef, stdin, stdout]);

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

  const stop = () => {
    if (interruptBufferRef.current) {
      interruptBufferRef.current[0] = INTERRUPT_SIGNAL;
    }
  };

  return { runCode, stop };
}
