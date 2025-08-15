export const XTERM_LIGHT_THEME = {
  // Core Colors
  foreground: "#000000",
  background: "#fffffe",
  cursor: "#000000",
  cursorAccent: "#fffffe",

  // Selection Colors
  selectionBackground: "#b3d7ff", // A light, non-intrusive blue
  selectionForeground: "#000000", // Ensure text in selection is highly readable
  selectionInactiveBackground: "#e0e0e0", // A muted gray when terminal is not focused

  // Standard ANSI Colors (Tango Palette - Darker for light background)
  black: "#2e3436",
  red: "#cc0000",
  green: "#4e9a06",
  yellow: "#c4a000",
  blue: "#3465a4",
  magenta: "#75507b",
  cyan: "#06989a",
  white: "#d3d7cf",

  // Bright ANSI Colors (Tango Palette)
  brightBlack: "#555753",
  brightRed: "#ef2929",
  brightGreen: "#8ae234",
  brightYellow: "#fce94f",
  brightBlue: "#729fcf",
  brightMagenta: "#ad7fa8",
  brightCyan: "#34e2e2",
  brightWhite: "#eeeeec",
};

export const XTERM_DARK_THEME = {
  // Core Colors
  foreground: "#d4d4d4",
  background: "#1e1e1e",
  cursor: "#d4d4d4",
  cursorAccent: "#1e1e1e",

  // Selection Colors
  selectionBackground: "#264f78", // A muted blue, common in code editors
  selectionForeground: "#ffffff", // Use a bright color for contrast on selection
  selectionInactiveBackground: "#3a3d41", // A subtle dark gray when unfocused

  // Standard ANSI Colors (Tango Palette)
  black: "#2e3436",
  red: "#cc0000",
  green: "#4e9a06",
  yellow: "#c4a000",
  blue: "#3465a4",
  magenta: "#75507b",
  cyan: "#06989a",
  white: "#d3d7cf",

  // Bright ANSI Colors (Tango Palette - Vibrant for dark background)
  brightBlack: "#555753",
  brightRed: "#ef2929",
  brightGreen: "#8ae234",
  brightYellow: "#fce94f",
  brightBlue: "#729fcf",
  brightMagenta: "#ad7fa8",
  brightCyan: "#34e2e2",
  brightWhite: "#eeeeec",
};
