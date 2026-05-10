import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useTheme } from "@/hooks/useTheme";

interface ThemeContextValue {
  isDark: boolean;
  mode: "system" | "light" | "dark";
}

const ThemeContext = createContext<ThemeContextValue>({ isDark: false, mode: "system" });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { isDark, mode } = useTheme();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return <ThemeContext.Provider value={{ isDark, mode }}>{children}</ThemeContext.Provider>;
}

export function useThemeContext() {
  return useContext(ThemeContext);
}
