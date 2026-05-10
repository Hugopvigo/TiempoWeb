import { useState } from "react";
import { getAQILabel, getAQIDescription, getAQIColor } from "@shared/types/weather";
import type { AirQualityData } from "@shared/types/weather";
import { Droplets, Wind, Flower2, ChevronDown, ChevronUp } from "lucide-react";

interface AirQualityCardProps {
  data: AirQualityData;
}

export function AirQualityCard({ data }: AirQualityCardProps) {
  const aqi = data.current.europeanAqi;
  const label = getAQILabel(aqi);
  const description = getAQIDescription(aqi);
  const color = getAQIColor(aqi);
  const [expanded, setExpanded] = useState(false);

  const hasPollen = data.current.grassPollen != null || data.current.olivePollen != null || data.current.birchPollen != null;

  return (
    <div className="rounded-2xl border border-transparent bg-white/80 p-4 backdrop-blur-md dark:border-white/10 dark:bg-slate-800">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">
        Calidad del aire
      </p>

      <div className="mb-3 flex items-center gap-3">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-bold"
          style={{ backgroundColor: color, color: aqi <= 40 ? "#0F172A" : "#FFFFFF" }}
        >
          {Math.round(aqi)}
        </div>
        <div>
          <p className="text-xl font-semibold text-slate-800 dark:text-white">{label}</p>
          <p className="text-base text-slate-500 dark:text-slate-300">{description}</p>
        </div>
      </div>

      <div className="mb-3 h-2.5 overflow-hidden rounded-full bg-slate-200/60 dark:bg-slate-700">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min((aqi / 150) * 100, 100)}%`,
            backgroundColor: color,
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <MetricRow icon={Droplets} iconColor="text-blue-500 dark:text-blue-400" label="PM2.5" value={`${data.current.pm25.toFixed(1)} µg/m³`} />
        <MetricRow icon={Droplets} iconColor="text-orange-500 dark:text-orange-400" label="PM10" value={`${data.current.pm10.toFixed(1)} µg/m³`} />
        <MetricRow icon={Wind} iconColor="text-teal-500 dark:text-teal-400" label="Ozono" value={`${data.current.ozone.toFixed(1)} µg/m³`} />
        <MetricRow icon={Wind} iconColor="text-red-500 dark:text-red-400" label="NO₂" value={`${data.current.nitrogenDioxide.toFixed(1)} µg/m³`} />
      </div>

      {hasPollen && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl bg-slate-100/60 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200/60 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {expanded ? "Menos detalle" : "Más detalle"}
          </button>

          {expanded && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {data.current.grassPollen != null && (
                <MetricRow icon={Flower2} iconColor="text-green-500 dark:text-green-400" label="Polen hierba" value={`${data.current.grassPollen}`} />
              )}
              {data.current.olivePollen != null && (
                <MetricRow icon={Flower2} iconColor="text-lime-500 dark:text-lime-400" label="Polen olivo" value={`${data.current.olivePollen}`} />
              )}
              {data.current.birchPollen != null && (
                <MetricRow icon={Flower2} iconColor="text-emerald-500 dark:text-emerald-400" label="Polen abedul" value={`${data.current.birchPollen}`} />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function MetricRow({ icon: Icon, iconColor, label, value }: { icon: React.ComponentType<{ size?: number; className?: string }>; iconColor: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-slate-100/60 px-3 py-2 dark:bg-slate-700">
      <Icon size={14} className={iconColor} />
      <span className="text-sm text-slate-500 dark:text-slate-300">{label}</span>
      <span className="ml-auto text-sm font-semibold text-slate-700 dark:text-slate-200">{value}</span>
    </div>
  );
}
