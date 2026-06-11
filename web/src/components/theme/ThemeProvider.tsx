import { useEffect, type ReactNode } from "react";
import { useTheme } from "@/hooks/useTheme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { isDark } = useTheme();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return <>{children}</>;
}
