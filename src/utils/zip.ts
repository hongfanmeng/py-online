import type { JSZipObject } from "jszip";

const noTrailingSlash = ([name]: [string, JSZipObject]) => {
  return !name.endsWith("/");
};

const sanitizeFileName = (filename: string) => {
  return filename.replace(/^(stdlib|stubs)/, "/$1");
};

export const readZipFile = async (url: string) => {
  const JSZip = await import("jszip");
  try {
    const response = await fetch(url);
    const data = await response.arrayBuffer();
    const results: { [id: string]: string } = {};
    const zip = await JSZip.loadAsync(data);
    const files = Object.entries(zip.files);
    for (const [filename, file] of files.filter(noTrailingSlash)) {
      results[sanitizeFileName(filename)] = await file.async("text");
    }
    return results;
  } catch (error) {
    console.error(error);
    return {};
  }
};
