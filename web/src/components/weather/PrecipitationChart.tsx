import type { HourlyForecast } from "@shared/types/weather";

interface PrecipitationChartProps {
  hourly: HourlyForecast[];
  sunrise?: string;
  sunset?: string;
}

/** Gráfico combinado de lluvia (barras) y temperatura (línea), con amanecer y puesta. */
export function PrecipitationChart({ hourly, sunrise, sunset }: PrecipitationChartProps) {
  const hours = hourly.slice(0, 24);
  if (hours.length < 2) return null;

  const W = 326;
  const H = 164;
  const top = 22;
  const bottom = H - 24;
  const left = 4;
  const right = W - 4;
  const plotH = bottom - top;

  const maxRain = Math.max(...hours.map((h) => h.precipitation), 0.5);
  const temps = hours.map((h) => h.temperature);
  const minT = Math.min(...temps) - 1;
  const maxT = Math.max(...temps) + 1;
  const tRange = maxT - minT || 1;

  const x = (i: number) => left + (i * (right - left)) / (hours.length - 1);
  const tempY = (t: number) => top + ((maxT - t) / tRange) * plotH;
  const barW = Math.max(((right - left) / hours.length) * 0.55, 3);

  const linePath = hours.reduce((d, h, i) => {
    if (i === 0) return `M ${x(i)} ${tempY(h.temperature)}`;
    const prev = x(i - 1);
    const curr = x(i);
    const mid = (prev + curr) / 2;
    return `${d} C ${mid} ${tempY(hours[i - 1].temperature)}, ${mid} ${tempY(h.temperature)}, ${curr} ${tempY(h.temperature)}`;
  }, "");
  const areaPath = `${linePath} L ${right} ${bottom} L ${left} ${bottom} Z`;

  const totalRain = hours.reduce((sum, h) => sum + h.precipitation, 0);
  const lastRainIdx = hours.reduce((acc, h, i) => (h.precipitation > 0.05 ? i : acc), -1);
  const maxChance = Math.max(...hours.map((h) => h.precipitationChance));
  const amount = totalRain < 1 ? totalRain.toFixed(1) : Math.round(totalRain).toString();
  const rainLabel =
    totalRain >= 0.1
      ? `${amount} mm · ${maxChance}% prob.${lastRainIdx >= 0 ? ` hasta las ${hourLabel(hours[lastRainIdx].time)} h` : ""}`
      : `Sin lluvia · ${maxChance}% prob.`;

  const tickIdx = [0, 6, 12, 18, hours.length - 1].filter((v, i, arr) => arr.indexOf(v) === i);

  const sunMark = (iso: string | undefined, label: string, anchor: "start" | "end") => {
    if (!iso) return null;
    let target = new Date(iso).getTime();
    if (Number.isNaN(target)) return null;
    // Amanecer del día siguiente: si el dato es de hoy (ya pasó), súbelo 24 h.
    if (target < new Date(hours[0].time).getTime()) target += 86400000;
    let idx = 0;
    let best = Infinity;
    hours.forEach((h, i) => {
      const diff = Math.abs(new Date(h.time).getTime() - target);
      if (diff < best) {
        best = diff;
        idx = i;
      }
    });
    const px = Math.min(right - 2, Math.max(left + 2, x(idx)));
    const textAnchor = px < 52 ? "start" : px > W - 52 ? "end" : anchor;
    return (
      <g>
        <line x1={px} y1={top - 4} x2={px} y2={bottom} stroke="var(--warm)" strokeWidth={1} strokeDasharray="2 3" />
        <text x={textAnchor === "start" ? px + 3 : px - 3} y={top - 8} textAnchor={textAnchor} fontFamily="var(--font-sans)" fontSize={11} fontWeight={600} fill="var(--warm)">
          {label} {hourLabel(iso)}
        </text>
      </g>
    );
  };

  return (
    <div className="ds-card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Próximas 24 horas</h2>
        <span className="ds-accent" style={{ fontSize: 13, fontWeight: 600 }}>{rainLabel}</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`Temperatura y lluvia de las próximas 24 horas: ${rainLabel}`} style={{ display: "block", height: "auto" }}>
        <defs>
          <linearGradient id="tempArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--ink)" stopOpacity="0.16" />
            <stop offset="100%" stopColor="var(--ink)" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        <line x1={left} y1={bottom} x2={right} y2={bottom} stroke="var(--surface-line)" strokeWidth={1} />

        {sunMark(sunset, "Puesta", "start")}
        {sunMark(sunrise, "Salida", "end")}

        <path d={areaPath} fill="url(#tempArea)" />

        <g fill="var(--rain)">
          {hours.map((h, i) => {
            const barH = (h.precipitation / maxRain) * plotH * 0.72;
            return (
              <rect key={h.time} x={x(i) - barW / 2} y={bottom - barH} width={barW} height={barH} rx={2}>
                <title>{`${hourLabel(h.time)} h · ${h.precipitation.toFixed(1)} mm · ${h.precipitationChance}% de lluvia`}</title>
              </rect>
            );
          })}
        </g>

        <path d={linePath} fill="none" stroke="var(--ink)" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />

        {tickIdx.map((i) => (
          <g key={i}>
            <line x1={x(i)} y1={bottom} x2={x(i)} y2={bottom + 4} stroke="var(--surface-line)" strokeWidth={1} />
            <text
              x={x(i)}
              y={H - 4}
              textAnchor={i === 0 ? "start" : i === hours.length - 1 ? "end" : "middle"}
              fontSize={11}
              fill="var(--muted)"
            >
              {hourLabel(hours[i].time)}
            </text>
          </g>
        ))}
      </svg>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 12, color: "var(--muted)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: "var(--rain)" }} /> Lluvia, mm por hora
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 14, height: 3, borderRadius: 2, background: "var(--ink)" }} /> Temperatura
        </span>
      </div>
    </div>
  );
}

function hourLabel(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("es-ES", { hour: "2-digit" });
  } catch {
    return "";
  }
}
