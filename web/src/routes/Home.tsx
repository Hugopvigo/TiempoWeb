import { useState } from "react";
import { DynamicBackground } from "@/components/theme";
import { BottomNavBar } from "@/components/ui";
import {
  CurrentWeatherSkeleton,
  HourlyForecastSkeleton,
  DailyForecastSkeleton,
  WeatherDetailsSkeleton,
} from "@/components/ui/Skeleton";
import { CurrentWeather, HourlyForecast, PrecipitationChart, DailyForecast, WeatherDetails, AirQualityCard, LunarPhaseCard } from "@/components/weather";
import { AlertBanner } from "@/components/alerts";
import { CitySelector } from "@/components/city";
import { useCities } from "@/hooks/useCities";
import { useWeather } from "@/hooks/useWeather";
import { useAirQuality } from "@/hooks/useAirQuality";
import { useLunarPhase } from "@/hooks/useLunarPhase";
import { useMergedAlerts } from "@/hooks/useAlerts";
import { useTheme } from "@/hooks/useTheme";
import { useSettingsStore } from "@/stores/cityStore";
import { MapPin, ChevronDown } from "lucide-react";

export default function Home() {
  const { activeCity } = useCities();
  const { isDark } = useTheme();
  const { settings } = useSettingsStore();
  const { data: weather, isLoading, error } = useWeather(activeCity.lat, activeCity.lon, activeCity.name);
  const { data: airQuality } = useAirQuality(activeCity.lat, activeCity.lon);
  const lunar = useLunarPhase(activeCity.lat, activeCity.lon, weather?.daily);
  const alerts = useMergedAlerts(weather, activeCity);
  const [citySelectorOpen, setCitySelectorOpen] = useState(false);

  const condition = weather?.current.condition ?? "clear";

  return (
    <DynamicBackground condition={condition} isDark={isDark}>
      <div className="flex h-dvh flex-col">
        <div className="flex-1 overflow-y-auto px-4 pb-4 pt-4">
          <div className="mx-auto flex max-w-lg flex-col gap-4">
            <button
              onClick={() => setCitySelectorOpen(true)}
          className="mx-auto flex items-center gap-1 text-lg font-semibold text-slate-800 dark:text-white"
        >
          {activeCity.isLocation && <MapPin size={18} className="text-blue-500 dark:text-blue-400" />}
          <span className="line-clamp-2">{activeCity.name}</span>
          <ChevronDown size={16} className="text-slate-400 dark:text-slate-300" />
            </button>

            {error && (
              <div className="rounded-2xl bg-red-500/20 p-4 text-center text-sm text-red-300">
                Error al cargar el tiempo. Reintentando...
              </div>
            )}

            {isLoading && (
              <div className="flex flex-col gap-4">
                <CurrentWeatherSkeleton />
                <HourlyForecastSkeleton />
                <DailyForecastSkeleton />
                <WeatherDetailsSkeleton />
              </div>
            )}

            {weather && (
              <>
                <CurrentWeather
                  current={weather.current}
                  today={weather.daily[0]}
                  temperatureUnit={settings.temperatureUnit}
                  iconStyle={settings.iconStyle}
                />

                {alerts.length > 0 && <AlertBanner alerts={alerts} />}

                <HourlyForecast
                  hourly={weather.hourly}
                  temperatureUnit={settings.temperatureUnit}
                  iconStyle={settings.iconStyle}
                />

                <PrecipitationChart hourly={weather.hourly} />

                <DailyForecast
                  daily={weather.daily}
                  temperatureUnit={settings.temperatureUnit}
                  iconStyle={settings.iconStyle}
                />

            <WeatherDetails
              current={weather.current}
              temperatureUnit={settings.temperatureUnit}
              windUnit={settings.windUnit}
            />

            {airQuality && <AirQualityCard data={airQuality} />}

            <LunarPhaseCard data={lunar} />
          </>
            )}
          </div>
        </div>
        <BottomNavBar />
        <CitySelector open={citySelectorOpen} onClose={() => setCitySelectorOpen(false)} />
      </div>
    </DynamicBackground>
  );
}
