import { useMemo } from "react";
import { calculateMoonPhase, calculateMoonTimes } from "@shared/utils/lunar";
import type { LunarPhaseData } from "@shared/types/weather";

export function useLunarPhase(lat: number, lon: number, daily?: { sunrise: string; sunset: string }[]) {
  return useMemo<LunarPhaseData>(() => {
    const now = new Date();
    const { phaseIndex, phase, illumination } = calculateMoonPhase(now);
    const { moonrise, moonset } = calculateMoonTimes(now, lat, lon);
    const today = daily?.[0];

    return {
      phase,
      phaseIndex,
      illumination,
      moonrise,
      moonset,
      sunrise: today?.sunrise ?? "",
      sunset: today?.sunset ?? "",
    };
  }, [lat, lon, daily]);
}
