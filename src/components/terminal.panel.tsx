import { Trash2, Terminal } from "lucide-react";
import { cn } from "~/utils/cn";

export type TerminalPanelProps = {
  xtermRef: React.RefObject<HTMLDivElement | null>;
  showTerminal: boolean;
  onClearOutput: () => void;
};

// Terminal panel component
export const TerminalPanel = ({
  xtermRef,
  showTerminal,
  onClearOutput,
}: TerminalPanelProps) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:w-1/2 w-full bg-zinc-900 border-l border-zinc-700",
        showTerminal ? "" : "hidden"
      )}
    >
      <div className="flex items-center justify-between h-12 px-4 py-2 bg-zinc-800 border-b border-zinc-700">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-zinc-300" />
          <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
            Output Terminal
          </h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClearOutput}
            className="flex items-center gap-1 px-2 py-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded text-xs cursor-pointer"
            title="Clear Output"
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
        </div>
      </div>
      <div
        ref={xtermRef}
        className="w-full scheme-dark flex-1 min-h-0 [&>.xterm]:p-4"
      />
    </div>
  );
};
