import type { WeatherCondition } from "@shared/types/weather";
import { themeGradients } from "@shared/constants/theme";

interface DynamicBackgroundProps {
  condition: WeatherCondition;
  isDark: boolean;
  children: React.ReactNode;
}

export function DynamicBackground({ condition, isDark, children }: DynamicBackgroundProps) {
  const mode = isDark ? "dark" : "light";
  const [from, to] = themeGradients[mode][condition] ?? themeGradients[mode].clear;

  return (
    <div
      className="h-full transition-all duration-700 ease-in-out"
      style={{ background: `linear-gradient(180deg, ${from} 0%, ${to} 100%)` }}
    >
      {children}
    </div>
  );
}
