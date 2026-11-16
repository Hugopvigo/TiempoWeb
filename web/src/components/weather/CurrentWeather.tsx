import type { CurrentWeather as CurrentWeatherType, DailyForecast, IconStyle } from "@shared/types/weather";
import { formatTemperature } from "@shared/constants/weather";
import { WeatherIcon } from "./WeatherIcon";

interface CurrentWeatherProps {
  current: CurrentWeatherType;
  today: DailyForecast | undefined;
  headline: string;
  temperatureUnit: "celsius" | "fahrenheit";
  iconStyle: IconStyle;
}

/** Icono a la izquierda, titular a su derecha y temperatura protagonista debajo. */
export function CurrentWeather({ current, today, headline, temperatureUnit, iconStyle }: CurrentWeatherProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "4px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ flexShrink: 0 }}>
          <WeatherIcon condition={current.condition} colored={iconStyle === "colored"} size={64} />
        </div>
        <h1
          className="ds-display"
          style={{ margin: 0, fontSize: "clamp(28px, 7.5vw, 36px)", lineHeight: 1.05, fontWeight: 700 }}
        >
          {headline}
        </h1>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
        <span
          className="ds-display"
          style={{ fontSize: 64, lineHeight: 1, fontWeight: 600, letterSpacing: "-0.03em" }}
        >
          {formatTemperature(current.temperature, temperatureUnit)}
        </span>
        <div className="ds-muted" style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: 15 }}>
          {today && (
            <span>
              Hoy: máxima {formatTemperature(today.tempMax, temperatureUnit)}, mínima{" "}
              {formatTemperature(today.tempMin, temperatureUnit)}
            </span>
          )}
          <span>Sensación de {formatTemperature(current.feelsLike, temperatureUnit)} por el viento</span>
        </div>
      </div>
    </div>
  );
}
