import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "~/components/theme-provider";
import { cn } from "~/utils/cn";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  // Define the order of themes to toggle through
  const themes: Array<"light" | "dark" | "system"> = [
    "light",
    "dark",
    "system",
  ];

  // Find the next theme in the array, cycling back to the start
  const getNextTheme = (current: "light" | "dark" | "system") => {
    const idx = themes.indexOf(current);
    return themes[(idx + 1) % themes.length];
  };

  const handleToggle = () => {
    setTheme(getNextTheme(theme as "light" | "dark" | "system"));
  };

  let icon = <Monitor className="h-4 w-4 text-foreground" />;
  let label = "System";
  if (theme === "light") {
    icon = <Sun className="h-4 w-4 text-foreground" />;
    label = "Light";
  } else if (theme === "dark") {
    icon = <Moon className="h-4 w-4 text-foreground" />;
    label = "Dark";
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={cn(
        "flex items-center gap-2 px-3 py-1",
        "bg-secondary rounded text-sm",
        "cursor-pointer"
      )}
      title={`Switch theme (current: ${label})`}
      aria-label={`Switch theme (current: ${label})`}
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
    </button>
  );
};
