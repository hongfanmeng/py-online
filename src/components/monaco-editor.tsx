import React from "react";

import { shikiToMonaco } from "@shikijs/monaco";
import { useTheme } from "~/components/theme-provider";
import { initMonaco, initMonacoLSP } from "~/utils/monaco-lsp";
import { highlighter } from "~/utils/shikijs";
import type { EditorProps } from "@monaco-editor/react";

const Editor = React.lazy(() => initMonaco());
initMonacoLSP();

const DEFAULT_CODE = `# Welcome to Online Python!
# Write your Python code here

print("Hello, World!")
`;

export const MonacoEditor = (props: EditorProps) => {
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
      {...props}
    />
  );
};
