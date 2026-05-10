import { useMemo } from "react";
import { useSettingsStore } from "@/stores/cityStore";
import type { ThemeMode } from "@shared/types/weather";

export function useTheme() {
  const { settings } = useSettingsStore();
  const mode: ThemeMode = settings.theme;

  const isDark = useMemo(() => {
    if (mode === "system") return window.matchMedia("(prefers-color-scheme: dark)").matches;
    return mode === "dark";
  }, [mode]);

  return { isDark, mode };
}
