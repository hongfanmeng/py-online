import { atom, useAtom } from "jotai";

export type AppState = {
  isRunning: boolean;
  isReady: boolean;
  error: string | null;
};

// Atoms for each piece of state
export const isRunningAtom = atom(false);
export const isReadyAtom = atom(false);
export const errorAtom = atom<string | null>(null);

export const useAppState = () => {
  const [isRunning, setIsRunning] = useAtom(isRunningAtom);
  const [isReady, setIsReady] = useAtom(isReadyAtom);
  const [error, setError] = useAtom(errorAtom);

  return { isRunning, isReady, error, setIsRunning, setIsReady, setError };
};
