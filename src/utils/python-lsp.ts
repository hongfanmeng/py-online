import { MonacoLanguageClient } from "monaco-languageclient";

import pyrightWorkerUrl from "@typefox/pyright-browser/dist/pyright.worker.js?url";
import {
  BrowserMessageReader,
  BrowserMessageWriter,
} from "vscode-languageserver-protocol/browser.js";
import { ErrorAction, CloseAction } from "vscode-languageclient";
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

export const createPythonLanguageClient = (
  worker: Worker,
  typeshedFiles: { [id: string]: string }
) => {
  const reader = new BrowserMessageReader(worker);
  const writer = new BrowserMessageWriter(worker);

  return new MonacoLanguageClient({
    name: "Python Language Client",
    clientOptions: {
      documentSelector: [languageId],
      errorHandler: {
        error: () => ({ action: ErrorAction.Continue }),
        closed: () => ({ action: CloseAction.DoNotRestart }),
      },
      initializationOptions: { files: typeshedFiles },
    },
    messageTransports: { reader, writer },
  });
};
