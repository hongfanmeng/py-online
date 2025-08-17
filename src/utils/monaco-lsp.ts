import "vscode/localExtensionHost";
import {
  createPyrightWorker,
  createPythonLanguageClient,
  getTypeshedFiles,
} from "~/utils/python-lsp";
import { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import getLanguagesServiceOverride from "@codingame/monaco-vscode-languages-service-override";
import getConfigurationServiceOverride from "@codingame/monaco-vscode-configuration-service-override";
import { initialize } from "@codingame/monaco-vscode-api";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";

export const initMonacoLSP = async () => {
  self.MonacoEnvironment = { getWorker: () => new editorWorker() };
  loader.config({ monaco });

  await initialize({
    ...getConfigurationServiceOverride(),
    ...getLanguagesServiceOverride(),
  });

  await loader.init();

  const typeshedFiles = await getTypeshedFiles();
  const worker = createPyrightWorker();
  const client = createPythonLanguageClient(worker, typeshedFiles);
  client.start();
};
