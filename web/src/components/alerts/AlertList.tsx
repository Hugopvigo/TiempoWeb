import type { WeatherAlert } from "@shared/types/weather";
import { alertColors } from "@shared/constants/theme";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";

interface AlertListProps {
  alerts: WeatherAlert[];
}

export function AlertList({ alerts }: AlertListProps) {
  const navigate = useNavigate();

  if (alerts.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {alerts.map((alert) => {
        const color = alertColors[alert.severity];
        return (
          <button
            key={alert.id}
            onClick={() => navigate(`/alert/${alert.id}`)}
            className="flex items-center gap-3 rounded-2xl border border-transparent bg-white/80 p-3 text-left backdrop-blur-md transition-colors hover:bg-white/90 dark:border-white/10 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: `${color}22` }}
            >
              <AlertTriangle size={14} style={{ color }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800 dark:text-white">{alert.title}</p>
              <span
                className="mt-0.5 inline-block rounded-full px-1.5 py-0.5 text-[10px] font-semibold text-white"
                style={{ backgroundColor: color }}
              >
                {alert.severity === "red" ? "Roja" : alert.severity === "orange" ? "Naranja" : "Amarilla"}
              </span>
            </div>
            <ChevronRight size={16} className="text-slate-400 dark:text-slate-300" />
          </button>
        );
      })}
    </div>
  );
}
