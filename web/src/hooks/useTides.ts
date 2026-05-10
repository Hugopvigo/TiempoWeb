import { useQuery } from "@tanstack/react-query";
import { getMarineWeather } from "@shared/services/openmeteo";
import type { MarineData } from "@shared/types/weather";

export function useTides(lat: number, lon: number, isCoastal: boolean) {
  return useQuery<MarineData>({
    queryKey: ["tides", lat, lon],
    queryFn: () => getMarineWeather(lat, lon),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    enabled: isCoastal && lat !== 0 && lon !== 0,
    retry: 1,
  });
}

export function useCurrentSeaCondition(lat: number, lon: number, isCoastal: boolean) {
  const { data, ...rest } = useTides(lat, lon, isCoastal);

  const seaCondition = (() => {
    if (!data) return null;
    const now = new Date();
    const currentHour = now.getHours();
    const idx = Math.min(currentHour, data.hourly.waveHeight.length - 1);
    const waveHeight = data.hourly.waveHeight[idx];
    const waveDirection = data.hourly.waveDirection[idx];
    const wavePeriod = data.hourly.wavePeriod[idx];

    if (waveHeight == null) return null;

    let label = "Calma";
    if (waveHeight >= 5) label = "Mar enorme";
    else if (waveHeight >= 3) label = "Mar muy gruesa";
    else if (waveHeight >= 2) label = "Mar gruesa";
    else if (waveHeight >= 1) label = "Marejada";
    else if (waveHeight >= 0.5) label = "Marejadilla";

    return { waveHeight, waveDirection, wavePeriod, label };
  })();

  return { data, seaCondition, ...rest };
}

export function useTideDirection(lat: number, lon: number, isCoastal: boolean) {
  const { data } = useTides(lat, lon, isCoastal);

  const direction = (() => {
    if (!data || data.hourly.seaLevelHeight.length < 2) return null;
    const now = new Date();
    const idx = Math.min(now.getHours(), data.hourly.seaLevelHeight.length - 1);
    const current = data.hourly.seaLevelHeight[idx];
    const next = data.hourly.seaLevelHeight[Math.min(idx + 1, data.hourly.seaLevelHeight.length - 1)];
    const diff = next - current;
    if (Math.abs(diff) < 0.01) return { height: current, direction: "stable" as const };
    const dir: "rising" | "falling" = diff > 0 ? "rising" : "falling";
    return { height: current, direction: dir };
  })();

  return direction;
}

export function deriveTideForecasts(seaLevelHeight: number[], times: string[], dates: string[]) {
  const forecasts: { date: string; tides: { time: string; height: number; type: "high" | "low" }[] }[] = [];

  for (const date of dates) {
    const dayTides: { time: string; height: number; type: "high" | "low" }[] = [];
    const dayIndices = times
      .map((t, i) => ({ t, i }))
      .filter(({ t }) => t.startsWith(date));

    for (const { i } of dayIndices) {
      if (i === 0 || i >= seaLevelHeight.length - 1) continue;
      const prev = seaLevelHeight[i - 1];
      const curr = seaLevelHeight[i];
      const next = seaLevelHeight[i + 1];
      if (curr > prev && curr > next) {
        dayTides.push({ time: times[i], height: Math.round(curr * 100) / 100, type: "high" });
      } else if (curr < prev && curr < next) {
        dayTides.push({ time: times[i], height: Math.round(curr * 100) / 100, type: "low" });
      }
    }

    forecasts.push({ date, tides: dayTides });
  }

  return forecasts;
}
