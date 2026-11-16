import type { WeatherCondition } from "@shared/types/weather";

interface DynamicBackgroundProps {
  /** Se mantiene por compatibilidad: el rediseño usa una superficie plana. */
  condition?: WeatherCondition;
  isDark: boolean;
  children: React.ReactNode;
}

/** Superficie plana del rediseño: gris azulado claro de día, azul noche de noche. */
export function DynamicBackground({ isDark, children }: DynamicBackgroundProps) {
  return (
    <div
      className="h-full transition-colors duration-500 ease-in-out"
      data-mode={isDark ? "dark" : "light"}
      style={{ background: "var(--surface)", color: "var(--ink)" }}
    >
      {children}
    </div>
  );
}
