import pyrightWorkerUrl from "@typefox/pyright-browser/dist/pyright.worker.js?url";
import type { LanguageClientConfig } from "monaco-editor-wrapper";
import { Uri } from "vscode";
import { CloseAction, ErrorAction } from "vscode-languageclient/browser.js";
import {
  BrowserMessageReader,
  BrowserMessageWriter,
} from "vscode-languageserver-protocol/browser.js";

import { readZipFile } from "~/utils/zip";

const languageId = "python";

export const createPyrightWorker = () => {
  const worker = new Worker(
    new URL(pyrightWorkerUrl, window.location.href).href,
    { type: "module" }
  );
  worker.postMessage({ type: "browser/boot", mode: "foreground" });

  return worker;
};

export const getTypeshedFiles = async () => {
  return await readZipFile(
    new URL("./stdlib-source-with-typeshed-pyi.zip", window.location.href).href
  );
};

export const createPythonLanguageClientConfig = (
  worker: Worker,
  typeshedFiles: { [id: string]: string }
) => {
  const reader = new BrowserMessageReader(worker);
  const writer = new BrowserMessageWriter(worker);

  return {
    name: "Python Language Client",
    clientOptions: {
      documentSelector: [languageId, "py"],
      errorHandler: {
        error: () => ({ action: ErrorAction.Continue }),
        closed: () => ({ action: CloseAction.DoNotRestart }),
      },
      workspaceFolder: {
        index: 0,
        name: "workspace",
        uri: Uri.file("/workspace"),
      },
      initializationOptions: { files: typeshedFiles },
    },
    connection: {
      options: {
        $type: "WorkerDirect",
        worker: worker,
      },
      messageTransports: { reader, writer },
    },
  } satisfies LanguageClientConfig;
};
