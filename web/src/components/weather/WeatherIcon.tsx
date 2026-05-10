import { conditionToIcon } from "@shared/constants/weather";
import type { WeatherCondition } from "@shared/types/weather";
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  Snowflake,
  CloudFog,
  Moon,
  CloudMoon,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  sun: Sun,
  "cloud-sun": CloudSun,
  cloud: Cloud,
  "cloud-rain": CloudRain,
  "cloud-lightning": CloudLightning,
  snowflake: Snowflake,
  "cloud-fog": CloudFog,
  moon: Moon,
  "cloud-moon": CloudMoon,
};

interface WeatherIconProps {
  condition: WeatherCondition;
  colored?: boolean;
  size?: number;
  className?: string;
}

export function WeatherIcon({ condition, colored = false, size = 24, className }: WeatherIconProps) {
  const iconName = conditionToIcon[condition];
  const Icon = iconMap[iconName] ?? Sun;

  const colorClass = colored
    ? conditionColors[condition] ?? ""
    : "";

  return <Icon size={size} className={`${colorClass} ${className ?? ""}`} />;
}

const conditionColors: Record<WeatherCondition, string> = {
  clear: "text-amber-400 dark:text-amber-300",
  partly_cloudy: "text-sky-400 dark:text-sky-300",
  cloudy: "text-slate-400 dark:text-slate-300",
  rain: "text-blue-400 dark:text-blue-300",
  storm: "text-purple-400 dark:text-purple-300",
  snow: "text-blue-200 dark:text-blue-200",
  fog: "text-slate-300 dark:text-slate-300",
  night_clear: "text-indigo-300 dark:text-indigo-200",
  night_cloudy: "text-slate-400 dark:text-slate-300",
};
