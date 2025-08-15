import { Editor } from "@monaco-editor/react";
import { Code, Copy, Play } from "lucide-react";
import { cn } from "~/utils/cn";
import { useTheme } from "~/components/theme-provider";

export type EditorPanelProps = {
  code: string;
  onCodeChange: (value: string) => void;
  isRunning: boolean;
  isReady: boolean;
  onRunCode: () => void;
  onCopyCode: () => void;
};

// Editor panel component
export const EditorPanel = ({
  code,
  onCodeChange,
  isRunning,
  isReady,
  onRunCode,
  onCopyCode,
}: EditorPanelProps) => {
  const { computedTheme } = useTheme();
  const editorTheme = computedTheme === "dark" ? "vs-dark" : "vs";

  return (
    <div className="flex flex-col flex-1 border-r border-border">
      <div className="flex items-center justify-between h-12 px-4 py-2 bg-card border-b border-border">
        <h3 className="text-sm font-semibold text-card-foreground uppercase tracking-wider flex items-center gap-2">
          <Code className="w-4 h-4" />
          Code Editor
        </h3>
        <div className="flex gap-2">
          <button
            disabled={isRunning || !isReady}
            onClick={onRunCode}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded text-xs",
              "bg-secondary hover:bg-secondary/80 text-secondary-foreground disabled:bg-muted disabled:text-muted-foreground",
              "cursor-pointer disabled:cursor-not-allowed"
            )}
            title="Run Code"
          >
            <Play className="w-3 h-3" />
            Run
          </button>
          <button
            onClick={onCopyCode}
            className="flex items-center gap-1 px-2 py-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded text-xs cursor-pointer"
            title="Copy Code"
          >
            <Copy className="w-3 h-3" />
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
