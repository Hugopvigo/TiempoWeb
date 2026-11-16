import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { isAEMETConfigured, getAEMETAlerts } from "@shared/services/aemet";
import { generateAlerts } from "@shared/services/alerts";
import { getAEMETZone, getAEMETSubzonePatterns } from "@shared/constants/aemetZones";
import type { WeatherAlert, WeatherData, City } from "@shared/types/weather";
import type { GeoPoint } from "@shared/services/aemet";

export function useAEMETAlerts(
  zonaCode: string | undefined,
  subzonePatterns: string[] | undefined,
  point: GeoPoint | undefined
) {
  return useQuery<WeatherAlert[]>({
    queryKey: ["alerts", zonaCode, subzonePatterns?.join(",") ?? "", point?.lat, point?.lon],
    queryFn: async () => {
      const alerts = await getAEMETAlerts(zonaCode!, subzonePatterns, point);
      // Fallo de consulta: que la query quede en error y conserve los últimos avisos buenos.
      if (alerts === null) throw new Error("AEMET no disponible");
      return alerts;
    },
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    enabled: isAEMETConfigured() && !!zonaCode,
  });
}

export function useLocalAlerts(weather: WeatherData | undefined): WeatherAlert[] {
  return useMemo(() => {
    if (!weather) return [];
    return generateAlerts(weather);
  }, [weather]);
}

export function useMergedAlerts(
  weather: WeatherData | undefined,
  city: City | undefined
): WeatherAlert[] {
  const zonaCode = city ? getAEMETZone(city) : undefined;
  const subzonePatterns = city ? getAEMETSubzonePatterns(city) : undefined;
  const aemetConfigured = isAEMETConfigured() && !!zonaCode;

  const { data: aemetAlerts, isLoading: aemetLoading } = useAEMETAlerts(
    aemetConfigured ? zonaCode : undefined,
    subzonePatterns,
    city ? { lat: city.lat, lon: city.lon } : undefined
  );

  const localAlerts = useLocalAlerts(weather);

  return useMemo(() => {
    if (!aemetConfigured || aemetLoading) return localAlerts;

    if (!aemetAlerts || aemetAlerts.length === 0) return localAlerts;

    const aemetTypes = new Set(aemetAlerts.map((a) => a.type));
    const complementLocal = localAlerts.filter(
      (a) => !aemetTypes.has(a.type)
    );
    const merged = [...aemetAlerts, ...complementLocal];
    merged.sort((a, b) => severityOrder(a.severity) - severityOrder(b.severity));
    return merged;
  }, [aemetAlerts, aemetLoading, aemetConfigured, localAlerts]);
}

function severityOrder(s: WeatherAlert["severity"]): number {
  return s === "red" ? 0 : s === "orange" ? 1 : 2;
}
