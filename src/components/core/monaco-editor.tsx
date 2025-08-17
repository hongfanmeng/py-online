import React, { Suspense } from "react";
import { shikiToMonaco } from "@shikijs/monaco";
import { useTheme } from "~/hooks/use-theme";
import { initMonaco, initMonacoLSP } from "~/utils/monaco-lsp";
import { getHighlighter } from "~/utils/shikijs";
import type { EditorProps, Monaco } from "@monaco-editor/react";

export const DEFAULT_CODE = `# Welcome to Online Python!
# Write your Python code here

print("Hello, World!")
`;

const Editor = React.lazy(() => initMonaco());
initMonacoLSP();

export const MonacoEditor = (props: EditorProps) => {
  const { computedTheme } = useTheme();
  const theme = computedTheme === "dark" ? "dark-plus" : "light-plus";

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
          // fallback to load vs-dark and vs when shiki is not loaded
          registerFallbackThemes(monaco);
          // load shiki to monaco
          const highlighter = await getHighlighter();
          shikiToMonaco(highlighter, monaco);
        }}
        onMount={(editor, monaco) => {
          monaco.languages.register({ id: "python", extensions: [".py"] });
          const model = monaco.editor.createModel(DEFAULT_CODE, "python");
          editor.setModel(model);
        }}
        {...props}
      />
    </Suspense>
  );
};

const registerFallbackThemes = (monaco: Monaco) => {
  monaco.editor.defineTheme("dark-plus", {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {},
  });
  monaco.editor.defineTheme("light-plus", {
    base: "vs",
    inherit: true,
    rules: [],
    colors: {},
  });
};
