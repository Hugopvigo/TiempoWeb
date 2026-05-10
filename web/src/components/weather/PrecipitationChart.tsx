import type { HourlyForecast } from "@shared/types/weather";

interface PrecipitationChartProps {
  hourly: HourlyForecast[];
}

export function PrecipitationChart({ hourly }: PrecipitationChartProps) {
  const hasPrecipitation = hourly.some((h) => h.precipitationChance > 0);
  if (!hasPrecipitation) return null;

  const maxPrecip = Math.max(...hourly.map((h) => h.precipitationChance), 1);
  const width = hourly.length * 28;
  const height = 140;
  const padding = { top: 12, bottom: 24, left: 4, right: 4 };
  const chartH = height - padding.top - padding.bottom;

  const points = hourly.map((h, i) => ({
    x: padding.left + i * (width - padding.left - padding.right) / Math.max(hourly.length - 1, 1),
    y: padding.top + chartH - (h.precipitationChance / maxPrecip) * chartH,
    value: h.precipitationChance,
    time: h.time,
  }));

  const areaPath = buildAreaPath(points, height - padding.bottom);
  const linePath = buildLinePath(points);

  return (
    <div className="rounded-2xl border border-transparent bg-white/80 p-4 backdrop-blur-md dark:border-white/10 dark:bg-slate-800">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">
        Probabilidad de precipitación
      </p>
      <div className="overflow-x-auto scrollbar-hide">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[300px]"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="precipGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#precipGrad)" />
          <path d={linePath} fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {points.filter((_, i) => i % 3 === 0).map((p) => (
            <circle key={p.time} cx={p.x} cy={p.y} r="3.5" fill="#3B82F6" />
          ))}
          {points.filter((_, i) => i % 4 === 0).map((p) => (
            <text
              key={`t-${p.time}`}
              x={p.x}
              y={height - 6}
              textAnchor="middle"
              className="fill-slate-400 dark:fill-slate-300"
              fontSize="9"
            >
              {formatShortHour(p.time)}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

function buildLinePath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return d;
}

function buildAreaPath(points: { x: number; y: number }[], bottom: number): string {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${bottom} L ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  d += ` L ${points[points.length - 1].x} ${bottom} Z`;
  return d;
}

function formatShortHour(isoTime: string): string {
  try {
    const d = new Date(isoTime);
    return d.toLocaleTimeString("es-ES", { hour: "numeric" });
  } catch {
    return "";
  }
}
