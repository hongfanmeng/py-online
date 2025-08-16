import "@codingame/monaco-vscode-python-default-extension";
import {
  MonacoEditorReactComp,
  type MonacoEditorProps as MonacoEditorPropsBase,
} from "@typefox/monaco-editor-react";
import type {
  MonacoEditorLanguageClientWrapper,
  WrapperConfig,
} from "monaco-editor-wrapper";
import { configureDefaultWorkerFactory } from "monaco-editor-wrapper/workers/workerLoaders";
import { useEffect, useMemo, useState } from "react";
import {
  createPyrightWorker,
  createPythonLanguageClientConfig,
  getTypeshedFiles,
} from "~/utils/python-lsp";

const DEFAULT_CODE = `# Welcome to Online Python!
# Write your Python code here

print("Hello, World!")
`;

const wrapperConfig: WrapperConfig = {
  $type: "extended",
  vscodeApiConfig: {
    userConfiguration: {
      json: JSON.stringify({
        "workbench.colorTheme": "Default Dark Modern",
        "editor.wordBasedSuggestions": "off",
        "editor.fontSize": 16,
        "editor.minimap.enabled": false,
      }),
    },
  },
  editorAppConfig: {
    codeResources: {
      modified: {
        uri: "/workspace/main.py",
        text: DEFAULT_CODE,
      },
    },
    monacoWorkerFactory: configureDefaultWorkerFactory,
  },
};

type MonacoEditorProps = Omit<MonacoEditorPropsBase, "wrapperConfig"> & {
  wrapperRef?: React.RefObject<MonacoEditorLanguageClientWrapper | null>;
};

export const MonacoEditor = (props: MonacoEditorProps) => {
  const worker = useMemo(() => createPyrightWorker(), []);
  const [typeshedFiles, setTypeshedFiles] = useState<Record<string, string>>();

  useEffect(() => {
    getTypeshedFiles().then((files) => setTypeshedFiles(files));
  }, []);

  const memoizedWrapperConfig = useMemo(() => {
    if (!typeshedFiles) return null;
    return {
      ...wrapperConfig,
      languageClientConfigs: {
        configs: {
          python: createPythonLanguageClientConfig(worker, typeshedFiles),
        },
      },
    };
  }, [worker, typeshedFiles]);

  if (!typeshedFiles || !memoizedWrapperConfig) {
    // You can replace this with a spinner or skeleton if desired
    return (
      <div className="flex items-center justify-center h-full">
        Loading editor...
      </div>
    );
  }

  return (
    <MonacoEditorReactComp
      wrapperRef={props.wrapperRef}
      wrapperConfig={memoizedWrapperConfig}
      onLoad={(editor) => {
        if (props.wrapperRef) props.wrapperRef.current = editor;
      }}
      {...props}
    />
  );
};
