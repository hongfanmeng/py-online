import Editor from "@monaco-editor/react";
import { initMonacoLSP } from "~/utils/monaco-lsp";
import { shikiToMonaco } from "@shikijs/monaco";
import { createHighlighter } from "shiki";
import { useTheme } from "./theme-provider";

initMonacoLSP();

const DEFAULT_CODE = `# Welcome to Online Python!
# Write your Python code here

print("Hello, World!")
`;

export const MonacoEditor = () => {
  const { computedTheme } = useTheme();
  const theme = computedTheme === "dark" ? "dark-plus" : "light-plus";

  return (
    <Editor
      height="100%"
      theme={theme}
      options={{
        fontSize: 16,
        lineNumbers: "on",
        tabSize: 4,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
      }}
      beforeMount={async (monaco) => {
        monaco.languages.register({ id: "python", extensions: [".py"] });
        const highlighter = await createHighlighter({
          themes: ["dark-plus", "light-plus"],
          langs: ["python"],
        });
        shikiToMonaco(highlighter, monaco);
      }}
      onMount={(editor, monaco) => {
        const model = monaco.editor.createModel(
          DEFAULT_CODE,
          "python",
          monaco.Uri.parse("/workspace/main.py")
        );
        editor.setModel(model);
      }}
    />
  );
};
