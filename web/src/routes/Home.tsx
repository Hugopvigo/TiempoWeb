import { useState } from "react";
import { DynamicBackground } from "@/components/theme";
import {
  CurrentWeatherSkeleton,
  HourlyForecastSkeleton,
  DailyForecastSkeleton,
  WeatherDetailsSkeleton,
} from "@/components/ui/Skeleton";
import { CurrentWeather, HourlyForecast, PrecipitationChart, DailyForecast, WeatherDetails, AirQualityCard, LunarPhaseCard } from "@/components/weather";
import { SeaCard } from "@/components/tides";
import { AlertBanner } from "@/components/alerts";
import { CitySelector } from "@/components/city";
import { useCities } from "@/hooks/useCities";
import { useWeather } from "@/hooks/useWeather";
import { useTides } from "@/hooks/useTides";
import { useAirQuality } from "@/hooks/useAirQuality";
import { useLunarPhase } from "@/hooks/useLunarPhase";
import { useMergedAlerts } from "@/hooks/useAlerts";
import { useTheme } from "@/hooks/useTheme";
import { useSettingsStore } from "@/stores/cityStore";
import { isCoastalCity } from "@shared/utils/coastal";
import { conditionToDescription, formatTemperature } from "@shared/constants/weather";
import type { WeatherData } from "@shared/types/weather";
import { MapPin, ChevronDown } from "lucide-react";

export default function Home() {
  const { activeCity } = useCities();
  const { isDark } = useTheme();
  const { settings } = useSettingsStore();
  const { data: weather, isLoading, error } = useWeather(activeCity.lat, activeCity.lon, activeCity.name);
  const { data: airQuality } = useAirQuality(activeCity.lat, activeCity.lon);
  const { data: marine } = useTides(activeCity.lat, activeCity.lon, isCoastalCity(activeCity));
  const lunar = useLunarPhase(activeCity.lat, activeCity.lon, weather?.daily);
  const alerts = useMergedAlerts(weather, activeCity);
  const [citySelectorOpen, setCitySelectorOpen] = useState(false);

  const openCity = () => setCitySelectorOpen(true);

  return (
    <DynamicBackground condition={weather?.current.condition ?? "clear"} isDark={isDark}>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 md:grid md:grid-cols-[minmax(0,360px)_minmax(0,1fr)] md:items-start md:gap-6 md:pt-8">
            {/* Columna izquierda (en escritorio): cabecera, titular y datos */}
            <div className="contents md:flex md:flex-col md:gap-4">
              <div className="order-1 md:hidden">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: 44 }}>
                  <button onClick={openCity} aria-label={`${activeCity.name}. Cambiar de ciudad o buscar`} style={{ display: "flex", alignItems: "center", gap: 6, minHeight: 44, fontSize: 17, fontWeight: 600 }}>
                    {activeCity.isLocation && <MapPin size={18} className="ds-accent" />}
                    <span className="line-clamp-2">{activeCity.name}</span>
                    <ChevronDown size={16} className="ds-muted" />
                  </button>
                  <span className="ds-label" style={{ fontSize: 13 }}>
                    {weather ? `Actualizado a las ${clock(weather.updatedAt)}` : "Actualizando…"}
                  </span>
                </div>
              </div>

              <div className="order-2">
                <span className="ds-label hidden md:block" style={{ fontSize: 13 }}>
                  {weather ? `Actualizado a las ${clock(weather.updatedAt)}` : "Actualizando…"}
                </span>
                {error && (
                  <div style={{ background: "var(--card)", borderRadius: 20, padding: 16, marginTop: 12, textAlign: "center", fontSize: 14, color: "var(--muted)" }}>
                    Error al cargar el tiempo. Reintentando…
                  </div>
                )}
                {isLoading && (
                  <div className="flex flex-col gap-4 pt-4">
                    <CurrentWeatherSkeleton />
                    <HourlyForecastSkeleton />
                    <DailyForecastSkeleton />
                    <WeatherDetailsSkeleton />
                  </div>
                )}
                {weather && (
                  <CurrentWeather
                    current={weather.current}
                    today={weather.daily[0]}
                    headline={buildHeadline(weather)}
                    temperatureUnit={settings.temperatureUnit}
                    iconStyle={settings.iconStyle}
                  />
                )}
              </div>

              {weather && alerts.length > 0 && <div className="order-3"><AlertBanner alerts={alerts} /></div>}

              {weather && (
                <div className="order-6">
                  <WeatherDetails
                    current={weather.current}
                    temperatureUnit={settings.temperatureUnit}
                    windUnit={settings.windUnit}
                  />
                </div>
              )}

              {airQuality && (
                <div className="order-9">
                  <AirQualityCard data={airQuality} />
                </div>
              )}

              <div className="order-10">
                <LunarPhaseCard data={lunar} />
              </div>
            </div>

            {/* Columna derecha (en escritorio): gráfico, mar y previsión */}
            <div className="contents md:flex md:flex-col md:gap-4">
              {weather && (
                <div className="order-4">
                  <PrecipitationChart
                    hourly={weather.hourly}
                    sunrise={weather.daily[0]?.sunrise}
                    sunset={weather.daily[0]?.sunset}
                  />
                </div>
              )}

              {weather && (
                <div className="order-5">
                  <HourlyForecast
                    hourly={weather.hourly}
                    temperatureUnit={settings.temperatureUnit}
                    iconStyle={settings.iconStyle}
                  />
                </div>
              )}

              {marine && <div className="order-7"><SeaCard marine={marine} cityName={activeCity.name} /></div>}

              {weather && (
                <div className="order-8">
                  <DailyForecast
                    daily={weather.daily}
                    hourly={weather.hourly}
                    temperatureUnit={settings.temperatureUnit}
                    iconStyle={settings.iconStyle}
                  />
                </div>
              )}
            </div>
          </main>
        </div>

        <CitySelector open={citySelectorOpen} onClose={() => setCitySelectorOpen(false)} />
      </div>
    </DynamicBackground>
  );
}

/** Titular en lenguaje natural, calculado a partir de la previsión real. */
function buildHeadline(weather: WeatherData): string {
  const hours = weather.hourly.slice(0, 24);
  const rain = hours.filter((h) => h.precipitation > 0.1);
  if (rain.length > 0) {
    const last = rain[rain.length - 1];
    const after = hours.find((h) => new Date(h.time).getTime() > new Date(last.time).getTime());
    const tail = after ? afterText(after.condition) : "";
    return `Llueve hasta las ${hHour(last.time)} h.${tail ? ` ${tail}` : ""}`;
  }
  if (weather.current.condition === "snow") return "Nieve. Consulta la previsión por horas.";
  if (weather.current.condition === "storm") return "Tormenta. Mejora a lo largo del día.";
  const desc = conditionToDescription[weather.current.condition];
  const tomorrow = weather.daily[1];
  const next = tomorrow ? ` Mañana, máxima de ${formatTemperature(tomorrow.tempMax, "celsius")}.` : "";
  return `${desc.charAt(0).toUpperCase()}${desc.slice(1)}.${next}`;
}

function afterText(condition: string): string {
  if (condition === "clear" || condition === "partly_cloudy") return "Después, claros.";
  if (condition === "cloudy") return "Después, nublado.";
  if (condition === "snow") return "Después, nieve.";
  if (condition === "rain") return "Sigue lloviendo.";
  return "";
}

function hHour(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("es-ES", { hour: "2-digit" });
  } catch {
    return "";
  }
}

function clock(ts: number): string {
  try {
    return new Date(ts).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}
