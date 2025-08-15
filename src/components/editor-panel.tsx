import { Editor } from "@monaco-editor/react";
import { Code, Copy, Play } from "lucide-react";
import { cn } from "~/utils/cn";

export type EditorPanelProps = {
  code: string;
  onCodeChange: (value: string) => void;
  isRunning: boolean;
  isReady: boolean;
  onRunCode: () => void;
  onCopyCode: () => void;
  showTerminal: boolean;
};

// Editor panel component
export const EditorPanel = ({
  code,
  onCodeChange,
  isRunning,
  isReady,
  onRunCode,
  onCopyCode,
  showTerminal,
}: EditorPanelProps) => {
  return (
    <div
      className={cn(
        "flex flex-col flex-1",
        showTerminal ? "lg:w-1/2" : "w-full",
        showTerminal ? "border-r border-zinc-700" : ""
      )}
    >
      <div className="flex items-center justify-between h-12 px-4 py-2 bg-zinc-800 border-b border-zinc-700">
        <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
          <Code className="w-4 h-4" />
          Code Editor
        </h3>
        <div className="flex gap-2">
          <button
            disabled={isRunning || !isReady}
            onClick={onRunCode}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded text-xs",
              "bg-zinc-700 hover:bg-zinc-600 text-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-500",
              "cursor-pointer disabled:cursor-not-allowed"
            )}
            title="Run Code"
          >
            <Play className="w-3 h-3" />
            Run
          </button>
          <button
            onClick={onCopyCode}
            className="flex items-center gap-1 px-2 py-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded text-xs cursor-pointer"
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
          theme="vs-dark"
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
