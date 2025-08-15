import { Trash2, TerminalIcon } from "lucide-react";
import { useEffect } from "react";
import { Terminal } from "@xterm/xterm";
import { cn } from "~/utils/cn";
import { useTheme } from "~/components/theme-provider";
import { useTerminalFit } from "~/hooks/terminal";
import { XTERM_DARK_THEME, XTERM_LIGHT_THEME } from "~/utils/xterm-theme";

export type TerminalPanelProps = {
  xtermRef: React.RefObject<HTMLDivElement | null>;
  xterm: Terminal | null;
  showTerminal: boolean;
  onClearOutput: () => void;
};

// Terminal panel component
export const TerminalPanel = ({
  xtermRef,
  xterm,
  showTerminal,
  onClearOutput,
}: TerminalPanelProps) => {
  const { computedTheme } = useTheme();

  useEffect(() => {
    if (!xterm) return;
    xterm.options.theme =
      computedTheme == "light" ? XTERM_LIGHT_THEME : XTERM_DARK_THEME;
  }, [xterm, computedTheme]);

  useTerminalFit(xterm, showTerminal);

  return (
    <div
      className={cn(
        "flex flex-col lg:w-1/2 w-full bg-background border-l border-border",
        showTerminal ? "" : "hidden"
      )}
    >
      <div className="flex items-center justify-between h-12 px-4 py-2 bg-card border-b border-border">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-card-foreground" />
          <h3 className="text-sm font-semibold text-card-foreground uppercase tracking-wider">
            Output Terminal
          </h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClearOutput}
            className="flex items-center gap-1 px-2 py-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded text-xs cursor-pointer"
            title="Clear Output"
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
        </div>
      </div>
      <div ref={xtermRef} className="w-full flex-1 min-h-0 [&>.xterm]:p-4" />
    </div>
  );
};
