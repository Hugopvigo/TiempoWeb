import { getSeaConditionLabel, getSeaConditionDescription } from "@shared/types/weather";
import type { TideDirectionInfo } from "@shared/types/weather";
import { Waves, Compass, Timer, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface SeaConditionCardProps {
  waveHeight: number;
  waveDirection: number;
  wavePeriod: number;
  tideDirection?: TideDirectionInfo;
}

export function SeaConditionCard({ waveHeight, waveDirection, wavePeriod, tideDirection }: SeaConditionCardProps) {
  const conditionLabel = getSeaConditionLabel(waveHeight);
  const conditionDesc = getSeaConditionDescription(waveHeight);

  return (
  <div className="rounded-2xl border border-transparent bg-white/80 p-4 backdrop-blur-md dark:border-white/10 dark:bg-slate-800">
    <div className="mb-3 flex items-center gap-2">
      <Waves size={18} className="text-sky-500 dark:text-sky-400" />
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">
        Estado del mar
      </p>
    </div>

    <p className="mb-1 text-2xl font-semibold text-slate-800 dark:text-white">{conditionLabel}</p>
    <p className="mb-4 text-sm text-slate-500 dark:text-slate-300">{conditionDesc}</p>

    <div className="grid grid-cols-3 gap-3">
      <div className="flex flex-col items-center gap-1 rounded-xl bg-slate-100/60 p-2 dark:bg-slate-700">
        <Waves size={16} className="text-blue-500 dark:text-blue-400" />
        <span className="text-lg font-semibold text-slate-800 dark:text-white">{waveHeight.toFixed(1)}m</span>
        <span className="text-xs text-slate-500 dark:text-slate-300">Oleaje</span>
      </div>
      <div className="flex flex-col items-center gap-1 rounded-xl bg-slate-100/60 p-2 dark:bg-slate-700">
        <Compass size={16} className="text-blue-500 dark:text-blue-400" />
        <span className="text-lg font-semibold text-slate-800 dark:text-white">{windDirLabel(waveDirection)}</span>
        <span className="text-xs text-slate-500 dark:text-slate-300">Dirección</span>
      </div>
      <div className="flex flex-col items-center gap-1 rounded-xl bg-slate-100/60 p-2 dark:bg-slate-700">
        <Timer size={16} className="text-blue-500 dark:text-blue-400" />
        <span className="text-lg font-semibold text-slate-800 dark:text-white">{wavePeriod.toFixed(1)}s</span>
        <span className="text-xs text-slate-500 dark:text-slate-300">Periodo</span>
      </div>
    </div>

    {tideDirection && (
      <div className="mt-3 flex items-center gap-2 rounded-xl bg-sky-500/10 px-3 py-2 dark:bg-sky-500/20">
        {tideDirection.direction === "rising" ? (
          <TrendingUp size={16} className="text-sky-500 dark:text-sky-400" />
        ) : tideDirection.direction === "falling" ? (
          <TrendingDown size={16} className="text-sky-500 dark:text-sky-400" />
        ) : (
          <Minus size={16} className="text-sky-500 dark:text-sky-400" />
        )}
        <span className="text-sm text-slate-700 dark:text-slate-200">
          {tideDirection.direction === "rising"
            ? "Marea subiendo"
            : tideDirection.direction === "falling"
            ? "Marea bajando"
            : "Marea estable"}{" "}
          — {tideDirection.height.toFixed(2)}m
        </span>
      </div>
    )}
  </div>
  );
}

function windDirLabel(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
  return dirs[Math.round(deg / 45) % 8];
}
