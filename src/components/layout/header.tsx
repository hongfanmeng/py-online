import { Play, Square } from "lucide-react";
import { cn } from "~/utils/cn";
import { ThemeToggle } from "~/components/theme/theme-toggle";
import { useAppState } from "~/hooks/use-app-state";

export type HeaderProps = {
  onRun: () => void;
  onStop: () => void;
};

export const Header = ({ onRun, onStop }: HeaderProps) => {
  const { isRunning, isReady } = useAppState();
  return (
    <header
      className={cn(
        "h-12 flex justify-between items-center px-4 py-3",
        "bg-card border-b border-border z-10"
      )}
    >
      <div className="flex items-center gap-3">
        <img src="/apple-touch-icon.png" className="size-6" alt="Icon" />
        <span className="text-xl font-bold text-card-foreground">
          Online Python
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={isRunning ? onStop : onRun}
          disabled={!isReady}
          className={cn(
            "flex items-center gap-2 px-3 py-1",
            isRunning
              ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              : "bg-primary hover:bg-primary/90 text-primary-foreground",
            "disabled:bg-muted disabled:text-muted-foreground",
            "cursor-pointer disabled:cursor-not-allowed",
            "font-semibold rounded text-sm border disabled:border-muted"
          )}
          title={isRunning ? "Stop Code" : "Run Code"}
        >
          {isRunning ? (
            <Square className="size-3" />
          ) : (
            <Play className="size-3" />
          )}
          <span>{isRunning ? "Stop" : "Run"}</span>
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
};
