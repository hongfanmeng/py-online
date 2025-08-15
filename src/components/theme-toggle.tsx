import { Moon, Sun } from "lucide-react";
import { useTheme } from "~/components/theme-provider";
import { cn } from "~/utils/cn";

export const ThemeToggle = () => {
  const { setTheme, computedTheme } = useTheme();

  const handleToggle = () => {
    setTheme(computedTheme == "dark" ? "light" : "dark");
  };

  const Icon = computedTheme === "dark" ? Moon : Sun;
  const label = computedTheme === "dark" ? "Dark" : "Light";

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
      <Icon className="size-4 text-foreground" />
      <span className="hidden md:inline">{label}</span>
    </button>
  );
};
