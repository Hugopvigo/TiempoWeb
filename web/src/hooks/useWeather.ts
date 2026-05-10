import { useQuery } from "@tanstack/react-query";
import { getWeather } from "@shared/services/openmeteo";
import type { WeatherData } from "@shared/types/weather";

export function useWeather(lat: number, lon: number, cityName: string) {
  return useQuery<WeatherData>({
    queryKey: ["weather", lat, lon],
    queryFn: () => getWeather(lat, lon, cityName),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: lat !== 0 && lon !== 0,
  });
}
