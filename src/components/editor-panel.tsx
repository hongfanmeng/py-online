import { Editor } from "@monaco-editor/react";
import { Code, Copy, Play, Square } from "lucide-react";
import { useTheme } from "~/components/theme-provider";
import { cn } from "~/utils/cn";

export type EditorPanelProps = {
  code: string;
  onCodeChange: (value: string) => void;
  isRunning: boolean;
  isReady: boolean;
  onRun: () => void;
  onStop: () => void;
};

export const EditorPanel = ({
  code,
  onCodeChange,
  isRunning,
  isReady,
  onRun,
  onStop,
}: EditorPanelProps) => {
  const { computedTheme } = useTheme();
  const editorTheme = computedTheme === "dark" ? "vs-dark" : "vs";

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // fallback: do nothing
    }
  };

  return (
    <div className="flex flex-col border-r border-border h-full">
      <div className="flex items-center justify-between h-12 px-4 py-2 bg-card border-b border-border">
        <h3 className="text-sm font-semibold text-card-foreground uppercase tracking-wider flex items-center gap-2">
          <Code className="w-4 h-4" />
          Code Editor
        </h3>
        <div className="flex gap-2">
          <button
            disabled={!isReady}
            onClick={isRunning ? onStop : onRun}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded text-xs",
              "disabled:bg-muted disabled:text-muted-foreground",
              "bg-secondary hover:bg-secondary/80 text-secondary-foreground",
              "cursor-pointer disabled:cursor-not-allowed"
            )}
            title={isRunning ? "Stop Code" : "Run Code"}
          >
            {isRunning && <Square className="size-2.5" />}
            {!isRunning && <Play className="size-2.5" />}
            {isRunning ? "Stop" : "Run"}
          </button>
          <button
            onClick={onCopy}
            className="flex items-center gap-1 px-2 py-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded text-xs cursor-pointer"
            title="Copy Code"
          >
            <Copy className="size-2.5" />
            Copy
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="python"
          value={code}
          onChange={(value) => onCodeChange(value || "")}
          theme={editorTheme}
          options={{
            fontSize: 16,
            lineNumbers: "on",
            tabSize: 4,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
};
