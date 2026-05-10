import type { WeatherCondition } from "../types/weather";

type GradientPair = [string, string];

interface ThemeGradients {
  light: Record<WeatherCondition, GradientPair>;
  dark: Record<WeatherCondition, GradientPair>;
}

export const themeGradients: ThemeGradients = {
  light: {
    clear: ["#7DD3FC", "#FDBA74"],      // Cielo azul a naranja suave (Día)
    partly_cloudy: ["#BAE6FD", "#E0F2FE"], // Azul cielo muy suave
    cloudy: ["#E2E8F0", "#CBD5E0"],      // Gris azulado claro
    rain: ["#93C5FD", "#BFDBFE"],        // Lluvia azulada clara
    storm: ["#94A3B8", "#CBD5E0"],       // Gris tormenta suave
    snow: ["#F1F5F9", "#E2E8F0"],        // Nieve (Blanco/Gris)
    fog: ["#D1D5DB", "#E5E7EB"],         // Niebla
    night_clear: ["#E2E8F0", "#CBD5E0"], // Noche clara (Gris perla suave para contraste con texto negro)
    night_cloudy: ["#CBD5E0", "#A0AEC0"], // Noche nublada (Gris suave)
  },
  dark: {
    clear: ["#020617", "#0F172A"],
    partly_cloudy: ["#020617", "#1E293B"],
    cloudy: ["#0A0F1E", "#1E293B"],
    rain: ["#020617", "#0F172A"],
    storm: ["#020617", "#0A0F1E"],
    snow: ["#0A0F1E", "#1E293B"],
    fog: ["#0A0F1E", "#1E293B"],
    night_clear: ["#020617", "#0F172A"],
    night_cloudy: ["#020617", "#0F172A"],
  },
};

export const cardBackground = {
  light: "rgba(255, 255, 255, 0.8)", // Un poco más opaco para mejor lectura
  dark: "rgba(30, 41, 59, 0.9)",
};

export const cardBorder = {
  light: "rgba(0, 0, 0, 0.03)",
  dark: "rgba(255, 255, 255, 0.06)",
};

export const textColor = {
  light: "#0F172A", // Slate 900 (Casi negro, contraste máximo)
  dark: "#F8FAFC",  // Slate 50 (Casi blanco, contraste máximo)
};

export const secondaryTextColor = {
  light: "#475569", // Slate 600
  dark: "#94A3B8",  // Slate 400
};

export const screenBackground = {
  light: "#F5F7FA",
  dark: "#020617", // Slate 950 en lugar de puro negro
};

export const navBarBackground = {
  light: "#FFFFFF",
  dark: "#0F172A", // Slate 900
};

export const alertColors = {
  yellow: "#FFD600",
  orange: "#FF9500",
  red: "#FF3B30",
} as const;
