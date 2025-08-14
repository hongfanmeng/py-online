import { wrap, type Remote } from "comlink";
import { useEffect, useRef, useState } from "react";
import { type PyodideWorkerAPI } from "~/workers/pyodide.worker";
import PyodideWorker from "~/workers/pyodide.worker?worker";

interface RunCodeResult {
  output: string;
  error?: string;
}

export function usePyodideWorker() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const workerAPIRef = useRef<Remote<PyodideWorkerAPI> | null>(null);

  useEffect(() => {
    // Create worker
    const worker = new PyodideWorker();
    const workerAPI = wrap<PyodideWorkerAPI>(worker);

    workerRef.current = worker;
    workerAPIRef.current = workerAPI;

    // Initialize Pyodide
    const initPyodide = async () => {
      try {
        setError(null);
        await workerAPI.init();
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
