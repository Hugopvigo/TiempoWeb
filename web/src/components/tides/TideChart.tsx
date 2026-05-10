interface TideChartProps {
  times: string[];
  heights: number[];
}

export function TideChart({ times, heights }: TideChartProps) {
  if (times.length === 0 || heights.length === 0) return null;

  const minH = Math.min(...heights);
  const maxH = Math.max(...heights);
  const range = maxH - minH || 1;

  const width = times.length * 24;
  const height = 120;
  const padding = { top: 16, bottom: 24, left: 36, right: 8 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const points = heights.map((h, i) => ({
    x: padding.left + (i / Math.max(heights.length - 1, 1)) * chartW,
    y: padding.top + chartH - ((h - minH) / range) * chartH,
  }));

  const areaPath = buildSmoothArea(points, height - padding.bottom);
  const linePath = buildSmoothLine(points);

  return (
  <div className="rounded-2xl border border-transparent bg-white/80 p-4 backdrop-blur-md dark:border-white/10 dark:bg-slate-800">
    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">
      Nivel del mar (24h)
    </p>
      <div className="overflow-x-auto scrollbar-hide">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[300px]" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="tideGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {minH < 0 && (
            <line
              x1={padding.left}
              y1={padding.top + chartH - ((0 - minH) / range) * chartH}
              x2={width - padding.right}
              y2={padding.top + chartH - ((0 - minH) / range) * chartH}
              stroke="currentColor"
              strokeOpacity="0.15"
              strokeDasharray="4 3"
              className="text-slate-300 dark:text-slate-500"
            />
          )}

          <path d={areaPath} fill="url(#tideGrad)" />
          <path d={linePath} fill="none" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {points.filter((_, i) => i % 4 === 0).map((p, i) => {
            const idx = i * 4;
            return (
              <text key={idx} x={p.x} y={height - 4} textAnchor="middle" className="fill-slate-400 dark:fill-slate-300" fontSize="8">
                {formatShortHour(times[idx])}
              </text>
            );
          })}

          <text x={2} y={padding.top + 4} className="fill-slate-400 dark:fill-slate-300" fontSize="8">
            {maxH.toFixed(1)}m
          </text>
          <text x={2} y={height - padding.bottom} className="fill-slate-400 dark:fill-slate-300" fontSize="8">
            {minH.toFixed(1)}m
          </text>
        </svg>
      </div>
    </div>
  );
}

function buildSmoothLine(points: { x: number; y: number }[]): string {
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

function buildSmoothArea(points: { x: number; y: number }[], bottom: number): string {
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
