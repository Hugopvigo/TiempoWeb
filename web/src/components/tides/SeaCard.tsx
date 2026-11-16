import type { MarineData } from "@shared/types/weather";
import { Link } from "react-router";

interface SeaCardProps {
  marine: MarineData;
  cityName: string;
}

/** Tarjeta oscura del mar: curva de marea, próximas pleamar/bajamar y oleaje. */
export function SeaCard({ marine, cityName }: SeaCardProps) {
  const times = marine.hourly.time.slice(0, 24);
  const levels = marine.hourly.seaLevelHeight.slice(0, 24);
  if (times.length < 2) return null;

  const min = Math.min(...levels);
  const max = Math.max(...levels);
  const range = max - min || 1;
  const W = 326;
  const H = 84;
  const top = 6;
  const bottom = 58;

  const x = (i: number) => (i * W) / (times.length - 1);
  const y = (v: number) => top + ((max - v) / range) * (bottom - top);

  const curve = levels.reduce((d, v, i) => {
    if (i === 0) return `M ${x(i)} ${y(v)}`;
    const mid = (x(i - 1) + x(i)) / 2;
    return `${d} C ${mid} ${y(levels[i - 1])}, ${mid} ${y(v)}, ${x(i)} ${y(v)}`;
  }, "");
  const area = `${curve} L ${W} ${H} L 0 ${H} Z`;

  const nowIdx = Math.min(Math.max(new Date().getHours(), 0), times.length - 1);
  const rising = levels[Math.min(nowIdx + 1, levels.length - 1)] >= levels[nowIdx];

  const tide = (type: "high" | "low") => {
    for (let i = nowIdx + 1; i < levels.length - 1; i++) {
      const prev = levels[i - 1];
      const curr = levels[i];
      const next = levels[i + 1];
      if ((type === "high" && curr > prev && curr > next) || (type === "low" && curr < prev && curr < next)) {
        return { time: times[i], height: curr };
      }
    }
    return null;
  };
  const high = tide("high");
  const low = tide("low");

  const waveIdx = Math.min(new Date().getHours(), marine.hourly.waveHeight.length - 1);
  const wave = marine.hourly.waveHeight[waveIdx];
  const period = marine.hourly.wavePeriod[waveIdx];
  const dirDeg = marine.hourly.waveDirection[waveIdx];
  const dirs = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
  const dir = dirs[Math.round((dirDeg ?? 0) / 45) % 8];

  return (
    <section
      style={{
        background: "var(--sea)",
        color: "var(--sea-ink)",
        borderRadius: 20,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>El mar en {cityName}</h2>
        <span style={{ fontSize: 13, color: "var(--sea-muted)" }}>{rising ? "Marea subiendo" : "Marea bajando"}</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Curva de marea de hoy" style={{ display: "block", height: "auto" }}>
        <path d={area} fill="#7FB2F0" fillOpacity={0.16} />
        <path d={curve} fill="none" stroke="#7FB2F0" strokeWidth={2.5} strokeLinecap="round" />
        <line x1={x(nowIdx)} y1={0} x2={x(nowIdx)} y2={bottom + 6} stroke="var(--sea-muted)" strokeWidth={1} strokeDasharray="3 3" />
        <circle cx={x(nowIdx)} cy={y(levels[nowIdx])} r={5} fill="var(--sea-ink)" />
      </svg>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, fontSize: 13, color: "var(--sea-muted)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span>Pleamar</span>
          <span style={{ fontSize: 17, fontWeight: 600, color: "var(--sea-ink)" }}>{clock(high?.time)}</span>
          <span>{high ? `${high.height.toFixed(1)} m` : "—"}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span>Bajamar</span>
          <span style={{ fontSize: 17, fontWeight: 600, color: "var(--sea-ink)" }}>{clock(low?.time)}</span>
          <span>{low ? `${low.height.toFixed(1)} m` : "—"}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span>Oleaje</span>
          <span style={{ fontSize: 17, fontWeight: 600, color: "var(--sea-ink)" }}>{wave != null ? `${wave.toFixed(1)} m` : "—"}</span>
          <span>{period ? `Del ${dir.toLowerCase()}, ${Math.round(period)} s` : "—"}</span>
        </div>
      </div>

      <Link to="/tides" style={{ minHeight: 44, display: "flex", alignItems: "center", fontSize: 14, fontWeight: 600, textDecoration: "underline", color: "var(--sea-ink)" }}>
        Ver mareas de la semana
      </Link>
    </section>
  );
}

function clock(iso?: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}
