import { Play } from "lucide-react";
import { cn } from "~/utils/cn";
import { ThemeToggle } from "~/components/theme-toggle";

export type HeaderProps = {
  isReady: boolean;
  isRunning: boolean;
  onRunCode: () => void;
};

export const Header = ({ isReady, isRunning, onRunCode }: HeaderProps) => {
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
        <ThemeToggle />
      </div>
    </header>
  );
};
