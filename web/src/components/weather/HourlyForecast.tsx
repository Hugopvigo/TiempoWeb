import type { HourlyForecast as HourlyForecastType } from "@shared/types/weather";
import { formatTemperature } from "@shared/constants/weather";
import { WeatherIcon } from "./WeatherIcon";
import type { IconStyle } from "@shared/types/weather";

interface HourlyForecastProps {
  hourly: HourlyForecastType[];
  temperatureUnit: "celsius" | "fahrenheit";
  iconStyle: IconStyle;
}

export function HourlyForecast({ hourly, temperatureUnit, iconStyle }: HourlyForecastProps) {
  return (
    <div className="rounded-2xl border border-transparent bg-white/80 p-4 backdrop-blur-md dark:border-white/10 dark:bg-slate-800">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">
        Previsión por horas
      </p>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {hourly.map((h, i) => (
          <div key={h.time} className="flex shrink-0 flex-col items-center gap-1.5">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-300">
              {i === 0 ? "Ahora" : formatHour(h.time)}
            </span>
            <WeatherIcon condition={h.condition} colored={iconStyle === "colored"} size={24} />
            <span className="text-base font-semibold text-slate-800 dark:text-white">
              {formatTemperature(h.temperature, temperatureUnit)}
            </span>
            {h.precipitationChance > 0 && (
              <span className="text-sm text-blue-500 dark:text-blue-300">
                {h.precipitationChance}%
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function formatHour(isoTime: string): string {
  try {
    const date = new Date(isoTime);
    return date.toLocaleTimeString("es-ES", { hour: "numeric", minute: "2-digit" });
  } catch {
    return isoTime;
  }
}
