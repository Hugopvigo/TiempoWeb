import { useState } from "react";
import type { DailyForecast as DailyForecastType, HourlyForecast, IconStyle } from "@shared/types/weather";
import { formatTemperature } from "@shared/constants/weather";
import { WeatherIcon } from "./WeatherIcon";

interface DailyForecastProps {
  daily: DailyForecastType[];
  hourly: HourlyForecast[];
  temperatureUnit: "celsius" | "fahrenheit";
  iconStyle: IconStyle;
}

export function DailyForecast({ daily, hourly, temperatureUnit, iconStyle }: DailyForecastProps) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? daily : daily.slice(0, 4);
  const canExpand = daily.length > 4;

  const allMax = Math.max(...daily.map((d) => d.tempMax));
  const allMin = Math.min(...daily.map((d) => d.tempMin));
  const range = allMax - allMin || 1;

  const rainByDate: Record<string, number> = {};
  hourly.forEach((h) => {
    const day = h.time.slice(0, 10);
    rainByDate[day] = (rainByDate[day] ?? 0) + h.precipitation;
  });

  return (
    <div className="ds-card" style={{ padding: "16px 16px 6px", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingBottom: 6 }}>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Próximos días</h2>
        <span className="ds-label" style={{ fontSize: 12 }}>Lluvia, mínima y máxima</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {visible.map((day, i) => {
          const barLeft = ((day.tempMin - allMin) / range) * 100;
          const barWidth = ((day.tempMax - day.tempMin) / range) * 100;
          const mm = rainByDate[day.date] ?? 0;
          return (
            <div
              key={day.date}
              style={{
                display: "grid",
                gridTemplateColumns: "52px 22px 52px 30px minmax(0, 1fr) 30px",
                alignItems: "center",
                columnGap: 8,
                minHeight: 44,
                fontSize: 15,
                borderTop: i > 0 ? "1px solid var(--surface-line)" : undefined,
              }}
            >
              <span style={{ fontWeight: 600 }}>{formatDayName(day.date)}</span>
              <WeatherIcon condition={day.condition} colored={iconStyle === "colored"} size={20} />
              <span
                className="ds-accent"
                style={{ fontSize: 13, fontWeight: 600, textAlign: "right" }}
                title={mm >= 0.5 ? `${Math.round(mm)} mm previstos` : undefined}
              >
                {day.precipitationChance > 0 ? `${day.precipitationChance}%` : mm >= 0.5 ? `${Math.round(mm)} mm` : "Seco"}
              </span>
              <span className="ds-muted" style={{ textAlign: "right" }}>{formatTemperature(day.tempMin, temperatureUnit)}</span>
              <div style={{ height: 6, borderRadius: 3, background: "var(--surface)", position: "relative" }}>
                <div style={{ position: "absolute", left: `${barLeft}%`, width: `${Math.max(barWidth, 4)}%`, top: 0, bottom: 0, borderRadius: 3, background: "linear-gradient(90deg, #60A5FA, #FB923C)" }} />
              </div>
              <span style={{ fontWeight: 600, textAlign: "right" }}>{formatTemperature(day.tempMax, temperatureUnit)}</span>
            </div>
          );
        })}
      </div>
      {canExpand && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="ds-accent"
          style={{ minHeight: 44, width: "100%", fontSize: 14, fontWeight: 600 }}
        >
          {showAll ? "Ver menos" : "Ver toda la semana"}
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
    return d.toLocaleDateString("es-ES", { weekday: "short" }).replace(".", "");
  } catch {
    return dateStr;
  }
}
