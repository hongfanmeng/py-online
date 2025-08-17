export const getHighlighter = async () => {
  const [
    { createHighlighterCore },
    { createOnigurumaEngine },
    darkPlus,
    lightPlus,
    python,
  ] = await Promise.all([
    import("shiki/core"),
    import("shiki/engine/oniguruma"),
    import("@shikijs/themes/dark-plus"),
    import("@shikijs/themes/light-plus"),
    import("@shikijs/langs/python"),
  ]);

  return createHighlighterCore({
    themes: [darkPlus, lightPlus],
    langs: [python],
    engine: createOnigurumaEngine(import("shiki/wasm")),
  });
};
