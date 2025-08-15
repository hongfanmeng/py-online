import { Play, Terminal } from "lucide-react";
import { cn } from "~/utils/cn";

export type HeaderProps = {
  isReady: boolean;
  isRunning: boolean;
  showTerminal: boolean;
  onRunCode: () => void;
  onToggleTerminal: () => void;
};

export const Header = ({
  isReady,
  isRunning,
  showTerminal,
  onRunCode,
  onToggleTerminal,
}: HeaderProps) => {
  return (
    <header
      className={cn(
        "h-12 flex justify-between items-center px-4 py-3",
        "bg-zinc-800 border-b border-zinc-700 shadow-md z-10"
      )}
    >
      <div className="flex items-center gap-3">
        <img src="/favicon.png" className="size-6" alt="Python IDE" />
        <span className="text-xl font-bold tracking-tight text-zinc-300">
          Python IDE
        </span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onRunCode}
          disabled={!isReady || isRunning}
          className={cn(
            "flex items-center gap-2 px-3 py-1",
            "bg-blue-700 hover:bg-blue-800 disabled:bg-zinc-800 disabled:text-zinc-500 text-white",
            "cursor-pointer disabled:cursor-not-allowed",
            "font-semibold rounded text-sm border border-blue-700 hover:border-blue-800 disabled:border-zinc-800"
          )}
          title="Run Code"
        >
          <Play className="size-3" />
          <span>{isRunning ? "Running..." : "Run"}</span>
        </button>
        <button
          onClick={onToggleTerminal}
          className={cn(
            "flex items-center gap-2 px-3 py-1",
            "bg-zinc-700 hover:bg-zinc-600 text-zinc-300",
            "cursor-pointer",
            "font-semibold rounded text-sm border border-zinc-700 hover:border-zinc-600"
          )}
          title={showTerminal ? "Hide Terminal" : "Show Terminal"}
        >
          <Terminal className="size-3" />
          <span className="hidden md:inline">
            {showTerminal ? "Hide Terminal" : "Show Terminal"}
          </span>
        </button>
      </div>
    </header>
  );
};
