import { useQuery } from "@tanstack/react-query";
import { getRainViewerData } from "@shared/services/weatherLayers";

export function useWeatherLayers() {
  return useQuery({
    queryKey: ["weatherLayers"],
    queryFn: getRainViewerData,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
