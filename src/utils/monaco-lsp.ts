import {
  createPyrightWorker,
  createPythonLanguageClient,
  getTypeshedFiles,
} from "~/utils/python-lsp";

export const initMonaco = async () => {
  const [{ default: editorWorker }, { loader, Editor }, monaco] =
    await Promise.all([
      import("monaco-editor/esm/vs/editor/editor.worker?worker"),
      import("@monaco-editor/react"),
      import("monaco-editor"),
    ]);

  self.MonacoEnvironment = { getWorker: () => new editorWorker() };
  loader.config({ monaco });
  await loader.init();

  return { default: Editor };
};

export const initMonacoLSP = async () => {
  const [
    { initialize },
    { default: getLanguagesServiceOverride },
    { default: getConfigurationServiceOverride },
  ] = await Promise.all([
    import("@codingame/monaco-vscode-api"),
    import("@codingame/monaco-vscode-languages-service-override"),
    import("@codingame/monaco-vscode-configuration-service-override"),
    import("vscode/localExtensionHost"),
  ]);

  await initialize({
    ...getConfigurationServiceOverride(),
    ...getLanguagesServiceOverride(),
  });

  const typeshedFiles = await getTypeshedFiles();
  const worker = createPyrightWorker();
  const client = await createPythonLanguageClient(worker, typeshedFiles);

  await client.start();
};
