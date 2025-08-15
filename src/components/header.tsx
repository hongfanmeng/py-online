import { Play, Terminal } from "lucide-react";
import { cn } from "~/utils/cn";
import { ThemeToggle } from "~/components/theme-toggle";

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
        "bg-card border-b border-border z-10"
      )}
    >
      <div className="flex items-center gap-3">
        <img src="/favicon.png" className="size-6" alt="Online Python" />
        <span className="text-xl font-bold text-card-foreground">
          Online Python
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onRunCode}
          disabled={!isReady || isRunning}
          className={cn(
            "flex items-center gap-2 px-3 py-1",
            "bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground",
            "cursor-pointer disabled:cursor-not-allowed",
            "font-semibold rounded text-sm border border-primary hover:border-primary/90 disabled:border-muted"
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
            "bg-secondary hover:bg-secondary/80 text-secondary-foreground",
            "cursor-pointer",
            "font-semibold rounded text-sm border border-border hover:border-border/80"
          )}
          title={showTerminal ? "Hide Terminal" : "Show Terminal"}
        >
          <Terminal className="size-3" />
          <span className="hidden md:inline">
            {showTerminal ? "Hide Terminal" : "Show Terminal"}
          </span>
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
};
