import type { CurrentWeather as CurrentWeatherType, DailyForecast } from "@shared/types/weather";
import { formatTemperature, conditionToDescription } from "@shared/constants/weather";
import { WeatherIcon } from "./WeatherIcon";
import type { IconStyle } from "@shared/types/weather";

interface CurrentWeatherProps {
  current: CurrentWeatherType;
  today: DailyForecast | undefined;
  temperatureUnit: "celsius" | "fahrenheit";
  iconStyle: IconStyle;
}

export function CurrentWeather({ current, today, temperatureUnit, iconStyle }: CurrentWeatherProps) {
  return (
    <div className="flex flex-col items-center gap-1 py-2">
      <WeatherIcon condition={current.condition} colored={iconStyle === "colored"} size={72} />
      <p className="text-8xl font-extralight tracking-tight text-slate-800 dark:text-white">
        {formatTemperature(current.temperature, temperatureUnit)}
      </p>
      <p className="text-xl font-medium text-slate-600 dark:text-slate-200">
        {conditionToDescription[current.condition]}
      </p>
      {today && (
        <p className="text-base text-slate-500 dark:text-slate-300">
          H:{formatTemperature(today.tempMax, temperatureUnit)}{" "}
          L:{formatTemperature(today.tempMin, temperatureUnit)}
        </p>
      )}
      <p className="text-base text-slate-500 dark:text-slate-300">
        Sensación {formatTemperature(current.feelsLike, temperatureUnit)}
      </p>
    </div>
  );
}
