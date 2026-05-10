import type { WeatherAlert } from "@shared/types/weather";
import { alertColors } from "@shared/constants/theme";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";

interface AlertBannerProps {
  alerts: WeatherAlert[];
}

export function AlertBanner({ alerts }: AlertBannerProps) {
  const navigate = useNavigate();

  if (alerts.length === 0) return null;

  const top = alerts[0];
  const color = alertColors[top.severity];

  return (
    <button
      onClick={() => navigate(`/alert/${top.id}`)}
      className="flex w-full items-center gap-3 rounded-2xl border border-transparent bg-white/80 p-3 backdrop-blur-md dark:border-white/10 dark:bg-slate-800"
    >
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `${color}22` }}
      >
        <AlertTriangle size={16} style={{ color }} />
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-semibold text-slate-800 dark:text-white">{top.title}</p>
        {alerts.length > 1 && (
          <p className="text-xs text-slate-500 dark:text-slate-300">
            +{alerts.length - 1} {alerts.length - 1 === 1 ? "alerta más" : "alertas más"}
          </p>
        )}
      </div>
      <ChevronRight size={18} className="text-slate-400 dark:text-slate-300" />
    </button>
  );
}
