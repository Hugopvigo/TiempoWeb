import { useTides, useCurrentSeaCondition, useTideDirection, deriveTideForecasts } from "@/hooks/useTides";
import { useCities } from "@/hooks/useCities";
import { isCoastalCity } from "@shared/utils/coastal";
import { DynamicBackground } from "@/components/theme";
import { BottomNavBar } from "@/components/ui";
import { useTheme } from "@/hooks/useTheme";
import { useWeather } from "@/hooks/useWeather";
import type { MarineData } from "@shared/types/weather";
import { TideChart } from "@/components/tides/TideChart";
import { SeaConditionCard } from "@/components/tides/SeaConditionCard";
import { TideTable } from "@/components/tides/TideTable";
import { Waves, MapPin } from "lucide-react";

export default function Tides() {
  const { activeCity } = useCities();
  const { isDark } = useTheme();
  const coastal = isCoastalCity(activeCity);
  const { data: weather } = useWeather(activeCity.lat, activeCity.lon, activeCity.name);
  const condition = weather?.current.condition ?? "clear";

  return (
    <DynamicBackground condition={condition} isDark={isDark}>
      <div className="flex h-dvh flex-col">
        <div className="flex-1 overflow-y-auto px-4 pb-4 pt-4">
          <div className="mx-auto flex max-w-lg flex-col gap-4">
        <div className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-white">
          <MapPin size={18} className="text-blue-500 dark:text-blue-400" />
              {activeCity.name}
            </div>

            {!coastal ? (
              <InlandPlaceholder />
            ) : (
              <TidesContent lat={activeCity.lat} lon={activeCity.lon} data={undefined} />
            )}
          </div>
        </div>
        <BottomNavBar />
      </div>
    </DynamicBackground>
  );
}

function TidesContent({ lat, lon }: { lat: number; lon: number; data?: MarineData }) {
  const { data: marine, isLoading, error } = useTides(lat, lon, true);
  const { seaCondition } = useCurrentSeaCondition(lat, lon, true);
  const tideDirection = useTideDirection(lat, lon, true);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
          <div className="h-40 animate-pulse rounded-2xl bg-white/30 dark:bg-slate-700/50" />
          <div className="h-32 animate-pulse rounded-2xl bg-white/30 dark:bg-slate-700/50" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-500/20 p-4 text-center text-sm text-red-300">
        Error al cargar datos de mareas
      </div>
    );
  }

  if (!marine) return null;

  const forecasts = deriveTideForecasts(
    marine.hourly.seaLevelHeight,
    marine.hourly.time,
    marine.daily.date,
  );

  return (
    <div className="flex flex-col gap-4">
      {seaCondition && (
        <SeaConditionCard
          waveHeight={seaCondition.waveHeight}
          waveDirection={seaCondition.waveDirection}
          wavePeriod={seaCondition.wavePeriod}
          tideDirection={tideDirection ?? undefined}
        />
      )}

      <TideChart
        times={marine.hourly.time.slice(0, 24)}
        heights={marine.hourly.seaLevelHeight.slice(0, 24)}
      />

      <TideTable forecasts={forecasts} />
    </div>
  );
}

function InlandPlaceholder() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-transparent bg-white/80 p-8 backdrop-blur-md dark:border-white/10 dark:bg-slate-800">
      <Waves size={48} className="text-slate-300 dark:text-slate-400" />
      <p className="text-center text-sm text-slate-500 dark:text-slate-300">
        Esta ciudad es interior. Selecciona una ciudad costera para ver datos de mareas.
      </p>
    </div>
  );
}
