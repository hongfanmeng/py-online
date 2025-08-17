import { createHighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";

import darkPlus from "@shikijs/themes/dark-plus";
import lightPlus from "@shikijs/themes/light-plus";
import python from "@shikijs/langs/python";

export const highlighter = await createHighlighterCore({
  themes: [darkPlus, lightPlus],
  langs: [python],
  engine: createOnigurumaEngine(import("shiki/wasm")),
});
