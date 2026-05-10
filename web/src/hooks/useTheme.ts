import { useState, useEffect } from "react";
import { useSettingsStore } from "@/stores/cityStore";
import type { ThemeMode } from "@shared/types/weather";

export function useTheme() {
  const { settings } = useSettingsStore();
  const mode: ThemeMode = settings.theme;

  const getIsDark = (m: ThemeMode) => {
    if (m === "system") return window.matchMedia("(prefers-color-scheme: dark)").matches;
    return m === "dark";
  };

  const [isDark, setIsDark] = useState(() => getIsDark(mode));

  useEffect(() => {
    setIsDark(getIsDark(mode));

    if (mode !== "system") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mode]);

  return { isDark, mode };
}
