export const filterError = (lines: string[]) => {
  let skipping = false;
  const filtered: string[] = [];
  for (const line of lines) {
    if (line.includes('File "/lib/python313.zip/_pyodide/_base.py"')) {
      skipping = true;
      continue;
    }
    if (skipping && line.startsWith('  File "main.py"')) {
      skipping = false;
    }
    if (!skipping) {
      filtered.push(line);
    }
  }
  return filtered;
};
