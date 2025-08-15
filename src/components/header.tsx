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
        "h-14 flex justify-between items-center px-4 py-3",
        "bg-gray-900 border-b border-gray-800 shadow-md z-10"
      )}
    >
      <div className="flex items-center gap-3">
        <img src="/favicon.png" className="size-7" alt="Python IDE" />
        <span className="text-2xl font-bold tracking-tight">Python IDE</span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onRunCode}
          disabled={!isReady || isRunning}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5",
            "bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white",
            "cursor-pointer disabled:cursor-not-allowed",
            "font-semibold rounded-lg shadow text-sm"
          )}
          title="Run Code"
        >
          <Play className="w-4 h-4" />
          <span>{isRunning ? "Running..." : "Run"}</span>
        </button>
        <button
          onClick={onToggleTerminal}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5",
            "bg-gray-700 hover:bg-gray-600 text-white",
            "cursor-pointer",
            "font-semibold rounded-lg shadow text-sm"
          )}
          title={showTerminal ? "Hide Terminal" : "Show Terminal"}
        >
          <Terminal className="w-4 h-4" />
          <span className="hidden md:inline">
            {showTerminal ? "Hide Terminal" : "Show Terminal"}
          </span>
        </button>
      </div>
    </header>
  );
};
