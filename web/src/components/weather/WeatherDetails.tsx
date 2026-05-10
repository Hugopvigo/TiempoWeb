import type { CurrentWeather } from "@shared/types/weather";
import { formatTemperature, windDirectionLabel } from "@shared/constants/weather";
import {
  Droplets,
  Wind,
  Sun,
  Gauge,
  Eye,
  Thermometer,
} from "lucide-react";

interface WeatherDetailsProps {
  current: CurrentWeather;
  temperatureUnit: "celsius" | "fahrenheit";
  windUnit: "kmh" | "mph" | "ms" | "knots";
}

const tileConfig = [
  { key: "feelsLike", icon: Thermometer, label: "Sensación", iconColor: "text-orange-500 dark:text-orange-400" },
  { key: "humidity", icon: Droplets, label: "Humedad", iconColor: "text-blue-500 dark:text-blue-400" },
  { key: "wind", icon: Wind, label: "Viento", iconColor: "text-teal-500 dark:text-teal-400" },
  { key: "uv", icon: Sun, label: "Índice UV", iconColor: "text-amber-500 dark:text-amber-400" },
  { key: "pressure", icon: Gauge, label: "Presión", iconColor: "text-purple-500 dark:text-purple-400" },
  { key: "visibility", icon: Eye, label: "Visibilidad", iconColor: "text-cyan-500 dark:text-cyan-400" },
] as const;

export function WeatherDetails({ current, temperatureUnit, windUnit }: WeatherDetailsProps) {
  const windSpeed = convertWind(current.windSpeed, windUnit);
  const windLabel = windUnitLabel(windUnit);

  const values: Record<string, { value: string; detail: string }> = {
    feelsLike: {
      value: formatTemperature(current.feelsLike, temperatureUnit),
      detail: current.feelsLike > current.temperature ? "Más cálido" : current.feelsLike < current.temperature ? "Más frío" : "Igual",
    },
    humidity: {
      value: `${current.humidity}%`,
      detail: current.humidity > 70 ? "Alta" : current.humidity > 40 ? "Normal" : "Baja",
    },
    wind: {
      value: `${windSpeed} ${windLabel}`,
      detail: windDirectionLabel(current.windDirection),
    },
    uv: {
      value: `${current.uvIndex}`,
      detail: uvLabel(current.uvIndex),
    },
    pressure: {
      value: `${Math.round(current.pressure)} hPa`,
      detail: current.pressure > 1020 ? "Alta" : current.pressure < 1000 ? "Baja" : "Normal",
    },
    visibility: {
      value: formatVisibility(current.visibility),
      detail: current.visibility > 10000 ? "Excelente" : current.visibility > 5000 ? "Buena" : "Reducida",
    },
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {tileConfig.map(({ key, icon: Icon, label, iconColor }) => (
        <div
          key={key}
          className="flex flex-col gap-1 rounded-2xl border border-transparent bg-white/80 p-3 backdrop-blur-md dark:border-white/10 dark:bg-slate-800"
        >
          <div className="flex items-center gap-1.5">
            <Icon size={16} className={iconColor} />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">{label}</span>
          </div>
          <p className="text-center text-xl font-semibold text-slate-800 dark:text-white">{values[key].value}</p>
          <p className="text-center text-xs text-slate-500 dark:text-slate-300">{values[key].detail}</p>
        </div>
      ))}
    </div>
  );
}

function convertWind(kmh: number, unit: string): number {
  switch (unit) {
    case "mph":
      return Math.round(kmh * 0.621371);
    case "ms":
      return Math.round((kmh / 3.6) * 10) / 10;
    case "knots":
      return Math.round(kmh * 0.539957);
    default:
      return Math.round(kmh);
  }
}

function windUnitLabel(unit: string): string {
  switch (unit) {
    case "mph": return "mph";
    case "ms": return "m/s";
    case "knots": return "kn";
    default: return "km/h";
  }
}

function uvLabel(uv: number): string {
  if (uv <= 2) return "Bajo";
  if (uv <= 5) return "Moderado";
  if (uv <= 7) return "Alto";
  if (uv <= 10) return "Muy alto";
  return "Extremo";
}

function formatVisibility(meters: number): string {
  if (meters >= 1000) return `${Math.round(meters / 1000)} km`;
  return `${Math.round(meters)} m`;
}
