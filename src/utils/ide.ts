export const filterError = (lines: string[]) => {
  const isPyodideFile = (line: string) =>
    line.includes('File "/lib/python313.zip/_pyodide/_base.py"') ||
    line.includes('File "/lib/python') ||
    line.includes("_pyodide/_base.py");

  const isInstallationMessage = (line: string) =>
    (line.includes("The module") &&
      line.includes("is included in the Pyodide distribution")) ||
    line.includes("You can install it by calling:") ||
    line.includes("await micropip.install(") ||
    line.includes("await pyodide.loadPackage(") ||
    line.includes("See https://pyodide.org/");

  let skipping = false;
  const filtered: string[] = [];

  for (const line of lines) {
    if (isPyodideFile(line)) {
      skipping = true;
      continue;
    }

    if (skipping && line.startsWith('  File "main.py"')) {
      skipping = false;
    }

    if (isInstallationMessage(line) || (skipping && line.trim() === "")) {
      continue;
    }

    if (!skipping) {
      filtered.push(line);
    }
  }

  return filtered;
};
