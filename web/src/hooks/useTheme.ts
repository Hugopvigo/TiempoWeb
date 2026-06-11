import { useSyncExternalStore } from "react";
import { useSettingsStore } from "@/stores/cityStore";
import type { ThemeMode } from "@shared/types/weather";

function subscribeToSystemTheme(callback: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function systemPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function useTheme() {
  const { settings } = useSettingsStore();
  const mode: ThemeMode = settings.theme;
  const prefersDark = useSyncExternalStore(subscribeToSystemTheme, systemPrefersDark);
  const isDark = mode === "system" ? prefersDark : mode === "dark";

  return { isDark, mode };
}
