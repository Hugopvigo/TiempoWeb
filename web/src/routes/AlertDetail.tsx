import { useNavigate, useParams } from "react-router";
import { useCities } from "@/hooks/useCities";
import { useWeather } from "@/hooks/useWeather";
import { useMergedAlerts } from "@/hooks/useAlerts";
import { DynamicBackground } from "@/components/theme";
import { useTheme } from "@/hooks/useTheme";
import { alertColors } from "@shared/constants/theme";
import { ArrowLeft, AlertTriangle, Clock } from "lucide-react";
import { BottomNavBar } from "@/components/ui";

export default function AlertDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeCity } = useCities();
  const { isDark } = useTheme();
  const { data: weather } = useWeather(activeCity.lat, activeCity.lon, activeCity.name);
  const alerts = useMergedAlerts(weather, activeCity);

  const alert = alerts.find((a) => a.id === id);

  if (!alert) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 pt-4 dark:bg-slate-950">
        <div className="mx-auto max-w-lg pb-24">
          <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <ArrowLeft size={20} />
            Volver
          </button>
          <p className="text-slate-500 dark:text-slate-300">Alerta no encontrada</p>
        </div>
        <BottomNavBar />
      </div>
    );
  }

  const color = alertColors[alert.severity];

  return (
    <DynamicBackground condition="clear" isDark={isDark}>
      <div className="min-h-screen px-4 pt-4">
        <div className="mx-auto max-w-lg pb-24">
          <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <ArrowLeft size={20} />
            Volver
          </button>

          <div className="rounded-2xl border border-transparent bg-white/80 p-5 backdrop-blur-md dark:border-white/10 dark:bg-slate-800">
            <div className="mb-4 flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: `${color}22` }}
              >
                <AlertTriangle size={20} style={{ color }} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800 dark:text-white">{alert.title}</h1>
                <span
                  className="inline-block rounded-full px-2 py-0.5 text-xs font-semibold text-white"
                  style={{ backgroundColor: color }}
                >
                  {severityLabel(alert.severity)}
                </span>
              </div>
            </div>

            <p className="mb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {alert.description}
            </p>

        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
          <Clock size={14} />
          <span>{formatTimeRange(alert.startTime, alert.endTime)}</span>
        </div>
      </div>
    </div>
    <BottomNavBar />
  </div>
</DynamicBackground>
  );
}

function severityLabel(s: string): string {
  switch (s) {
    case "red":
      return "Roja";
    case "orange":
      return "Naranja";
    case "yellow":
      return "Amarilla";
    default:
      return s;
  }
}

function formatTimeRange(start: string, end: string): string {
  try {
    const s = new Date(start);
    const e = new Date(end);
    const fmt = (d: Date) =>
      d.toLocaleDateString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    return `${fmt(s)} — ${fmt(e)}`;
  } catch {
    return `${start} — ${end}`;
  }
}
