import React, { Suspense, useState } from "react";
import { shikiToMonaco } from "@shikijs/monaco";
import { useTheme } from "~/hooks/use-theme";
import { initMonaco, initMonacoLSP } from "~/utils/monaco-lsp";
import { getHighlighter } from "~/utils/shikijs";
import type { EditorProps } from "@monaco-editor/react";

export const DEFAULT_CODE = `# Welcome to Online Python!
# Write your Python code here

print("Hello, World!")
`;

const Editor = React.lazy(() => initMonaco());
initMonacoLSP();

export const MonacoEditor = (props: EditorProps) => {
  const { computedTheme } = useTheme();
  const fallbackTheme = computedTheme === "dark" ? "vs-dark" : "light";
  const shikiTheme = computedTheme === "dark" ? "dark-plus" : "light-plus";

  const [shikiLoaded, setShikiLoaded] = useState(false);
  const theme = shikiLoaded ? shikiTheme : fallbackTheme;

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full">
          Loading...
        </div>
      }
    >
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
          const highlighter = await getHighlighter();
          shikiToMonaco(highlighter, monaco);
          setShikiLoaded(true);
        }}
        onMount={(editor, monaco) => {
          const model = monaco.editor.createModel(DEFAULT_CODE, "python");
          editor.setModel(model);
        }}
        {...props}
      />
    </Suspense>
  );
};
