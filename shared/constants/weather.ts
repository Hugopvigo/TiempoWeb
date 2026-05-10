import type { WeatherCondition } from "../types/weather";

export const weatherCodeToCondition = (code: number, isDay: boolean): WeatherCondition => {
  if (code === 0) return isDay ? "clear" : "night_clear";
  if (code <= 3) return isDay ? "partly_cloudy" : "night_cloudy";
  if (code <= 49) return "fog";
  if (code <= 59) return "rain";
  if (code <= 69) return "snow";
  if (code <= 79) return "rain";
  if (code <= 84) return "rain";
  if (code <= 86) return "snow";
  if (code <= 99) return "storm";
  return "cloudy";
};

export const conditionToDescription: Record<WeatherCondition, string> = {
  clear: "Despejado",
  partly_cloudy: "Parcialmente nublado",
  cloudy: "Nublado",
  rain: "Lluvia",
  storm: "Tormenta",
  snow: "Nieve",
  fog: "Niebla",
  night_clear: "Noche despejada",
  night_cloudy: "Noche nublada",
};

export const conditionToIcon: Record<WeatherCondition, string> = {
  clear: "sun",
  partly_cloudy: "cloud-sun",
  cloudy: "cloud",
  rain: "cloud-rain",
  storm: "cloud-lightning",
  snow: "snowflake",
  fog: "cloud-fog",
  night_clear: "moon",
  night_cloudy: "cloud-moon",
};

export const windDirectionLabel = (degrees: number): string => {
  const directions = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
};

export const formatTemperature = (temp: number, unit: "celsius" | "fahrenheit"): string => {
  if (unit === "fahrenheit") return `${Math.round(temp * 9 / 5 + 32)}°`;
  return `${Math.round(temp)}°`;
};
