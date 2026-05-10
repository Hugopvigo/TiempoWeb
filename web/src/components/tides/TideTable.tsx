interface TideForecast {
  date: string;
  tides: { time: string; height: number; type: "high" | "low" }[];
}

interface TideTableProps {
  forecasts: TideForecast[];
}

export function TideTable({ forecasts }: TideTableProps) {
  if (forecasts.length === 0) return null;

  return (
  <div className="rounded-2xl border border-transparent bg-white/80 p-4 backdrop-blur-md dark:border-white/10 dark:bg-slate-800">
    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">
      Tabla de mareas
    </p>
    <div className="flex flex-col divide-y divide-slate-200/50 dark:divide-slate-700">
      {forecasts.map((day) => (
        <div key={day.date} className="py-3 first:pt-0 last:pb-0">
          <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            {formatDate(day.date)}
          </p>
          {day.tides.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {day.tides.map((tide, i) => (
                <div
                  key={`${day.date}-${i}`}
                  className={`rounded-xl px-3 py-2 text-center ${
                    tide.type === "high"
                      ? "bg-sky-500/10 dark:bg-sky-500/20"
                      : "bg-orange-500/10 dark:bg-orange-500/20"
                  }`}
                >
                  <p className="flex items-center justify-center gap-1 text-xs text-slate-500 dark:text-slate-300">
                    <span>{tide.type === "high" ? "↑" : "↓"}</span>
                    {tide.type === "high" ? "Pleamar" : "Bajamar"}
                  </p>
                  <p className={`text-sm font-semibold ${tide.type === "high" ? "text-sky-600 dark:text-sky-400" : "text-orange-600 dark:text-orange-400"}`}>
                    {tide.height.toFixed(2)}m
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-300">
                    {formatTideTime(tide.time)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-400">Sin datos</p>
          )}
        </div>
      ))}
    </div>
  </div>
  );
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + "T12:00:00");
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Hoy";
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (d.toDateString() === tomorrow.toDateString()) return "Mañana";
    return d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric" });
  } catch {
    return dateStr;
  }
}

function formatTideTime(isoTime: string): string {
  try {
    const d = new Date(isoTime);
    return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return isoTime;
  }
}
