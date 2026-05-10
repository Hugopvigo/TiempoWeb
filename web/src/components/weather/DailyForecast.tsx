import { useState } from "react";
import type { DailyForecast as DailyForecastType } from "@shared/types/weather";
import { formatTemperature } from "@shared/constants/weather";
import { WeatherIcon } from "./WeatherIcon";
import type { IconStyle } from "@shared/types/weather";

interface DailyForecastProps {
  daily: DailyForecastType[];
  temperatureUnit: "celsius" | "fahrenheit";
  iconStyle: IconStyle;
}

export function DailyForecast({ daily, temperatureUnit, iconStyle }: DailyForecastProps) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? daily : daily.slice(0, 4);
  const canExpand = daily.length > 4;

  const allMax = Math.max(...daily.map((d) => d.tempMax));
  const allMin = Math.min(...daily.map((d) => d.tempMin));
  const range = allMax - allMin || 1;

  return (
    <div className="rounded-2xl border border-transparent bg-white/80 p-4 backdrop-blur-md dark:border-white/10 dark:bg-slate-800">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">
        Próximos 7 días
      </p>
      <div className="flex flex-col divide-y divide-slate-200/50 dark:divide-slate-700">
        {visible.map((day) => {
          const barLeft = ((day.tempMin - allMin) / range) * 100;
          const barWidth = ((day.tempMax - day.tempMin) / range) * 100;
          return (
            <div key={day.date} className="flex items-center gap-3 py-2.5">
              <span className="w-12 shrink-0 text-base font-medium text-slate-700 dark:text-slate-200">
                {formatDayName(day.date)}
              </span>
              <WeatherIcon condition={day.condition} colored={iconStyle === "colored"} size={20} />
              <span className="w-8 shrink-0 text-right text-sm text-blue-500 dark:text-blue-300">
                {day.precipitationChance > 0 ? `${day.precipitationChance}%` : ""}
              </span>
              <span className="w-8 shrink-0 text-right text-sm text-slate-400 dark:text-slate-300">
                {formatTemperature(day.tempMin, temperatureUnit)}
              </span>
                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-slate-200/60 dark:bg-slate-700">
                <div
                  className="absolute inset-y-0 rounded-full bg-gradient-to-r from-blue-400 to-orange-400"
                  style={{ left: `${barLeft}%`, width: `${Math.max(barWidth, 4)}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-base font-medium text-slate-700 dark:text-slate-200">
                {formatTemperature(day.tempMax, temperatureUnit)}
              </span>
            </div>
          );
        })}
      </div>
      {canExpand && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-2 w-full rounded-xl py-2 text-sm font-medium text-blue-500 transition-colors hover:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20"
        >
          {showAll ? "Menos" : "Más"}
        </button>
      )}
    </div>
  );
}

function formatDayName(dateStr: string): string {
  try {
    const d = new Date(dateStr + "T12:00:00");
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Hoy";
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (d.toDateString() === tomorrow.toDateString()) return "Mañana";
    return d.toLocaleDateString("es-ES", { weekday: "short" });
  } catch {
    return dateStr;
  }
}
