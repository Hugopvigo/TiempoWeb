import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useCities } from "@/hooks/useCities";
import { useWeather } from "@/hooks/useWeather";
import { useMergedAlerts } from "@/hooks/useAlerts";
import { DynamicBackground } from "@/components/theme";
import { useTheme } from "@/hooks/useTheme";
import { alertBackground, alertColors, alertSeverityLabel } from "@shared/constants/theme";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { BottomNavBar } from "@/components/ui";

export default function AlertDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeCity } = useCities();
  const { isDark } = useTheme();
  const { data: weather } = useWeather(activeCity.lat, activeCity.lon, activeCity.name);
  const alerts = useMergedAlerts(weather, activeCity);
  const [muted, setMuted] = useState(false);

  const alert = alerts.find((a) => a.id === id);

  if (!alert) {
    return (
      <DynamicBackground isDark={isDark}>
        <div className="flex h-dvh flex-col px-4 pt-4">
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-lg">
              <button onClick={() => navigate(-1)} style={backStyle}>
                <ArrowLeft size={20} /> Vigo
              </button>
              <p className="ds-muted">Alerta no encontrada.</p>
            </div>
          </div>
          <BottomNavBar />
        </div>
      </DynamicBackground>
    );
  }

  const color = alertColors[alert.severity];
  const sev = alertSeverityLabel[alert.severity];

  return (
    <DynamicBackground isDark={isDark}>
      <div className="flex h-dvh flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto flex max-w-lg flex-col" style={{ minHeight: "100%" }}>
            <header style={{ background: alertBackground[alert.severity], padding: "20px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={() => navigate(-1)} style={{ ...backStyle, color: "#12222B" }}>
                <ArrowLeft size={20} /> {activeCity.name}
              </button>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#12222B" }}>
                Aviso {sev.toLowerCase()} · riesgo importante
              </span>
              <h1 className="ds-display" style={{ margin: 0, fontSize: 36, lineHeight: 1.05, fontWeight: 700, color: "#12222B" }}>
                {alert.title}
              </h1>
            </header>

            <main style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16, flexGrow: 1 }}>
              <section className="ds-card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                  <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{timeRange(alert.startTime, alert.endTime)}</h2>
                  <span className="ds-label" style={{ fontSize: 13 }}>{startsIn(alert.startTime)}</span>
                </div>
                <div style={{ position: "relative", height: 10, borderRadius: 5, background: "var(--surface)" }}>
                  <div style={{ position: "absolute", left: `${leftPct(alert.startTime)}%`, width: `${Math.max(widthPct(alert.startTime, alert.endTime), 2)}%`, top: 0, bottom: 0, borderRadius: 5, background: color }} />
                  <div style={{ position: "absolute", left: `${nowPct()}%`, top: -4, width: 3, height: 18, borderRadius: 2, background: "var(--ink)" }} />
                </div>
                <div style={{ position: "relative", height: 16, fontSize: 12, color: "var(--muted)" }}>
                  {[0, 6, 12, 18, 24].map((h) => (
                    <span key={h} style={{ position: "absolute", left: `${(h / 24) * 100}%`, transform: h === 0 ? undefined : h === 24 ? "translateX(-100%)" : "translateX(-50%)" }}>
                      {String(h).padStart(2, "0")}
                    </span>
                  ))}
                </div>
                <span className="ds-label" style={{ fontSize: 12 }}>La raya marca la hora actual, {nowClock()}.</span>
              </section>

              <section className="ds-card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Zona del aviso</h2>
                  <span className="ds-label" style={{ fontSize: 13 }}>{activeCity.name} está dentro</span>
                </div>
                <ZoneMap polygons={alert.polygons} point={alert.point} color={color} />
                <span className="ds-label" style={{ fontSize: 12 }}>Contorno de la zona según AEMET.</span>
              </section>

              <section className="ds-card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Qué se espera</h2>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.4 }}>{alert.detail ?? alert.description}</p>
                {alert.type === "rain" && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 6, fontSize: 12 }}>
                    <Threshold bg="#FFF4B8" label="Amarillo" value="15 mm/h" />
                    <Threshold bg={alertColors.orange} label={`${sev}, este aviso`} value="30 mm/h" />
                    <Threshold bg="#FFD9D6" label="Rojo" value="60 mm/h" />
                  </div>
                )}
              </section>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginTop: "auto" }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span className="ds-label" style={{ fontSize: 12, lineHeight: 1.35 }}>Fuente: AEMET. Emitido hoy.</span>
                  <a href="https://www.aemet.es/es/eltiempo/prediccion/avisos" target="_blank" rel="noreferrer" className="ds-accent" style={{ minHeight: 44, display: "flex", alignItems: "center", fontSize: 13, fontWeight: 600, textDecoration: "underline" }}>
                    Ver en AEMET
                  </a>
                </div>
                <button
                  onClick={() => setMuted(true)}
                  style={{ minHeight: 44, padding: "0 16px", borderRadius: 22, background: "var(--ink)", color: "var(--surface)", fontSize: 14, fontWeight: 600, whiteSpace: "nowrap" }}
                >
                  {muted ? "Aviso silenciado" : "Silenciar este aviso"}
                </button>
              </div>
            </main>
          </div>
        </div>
        <BottomNavBar />
      </div>
    </DynamicBackground>
  );
}

const backStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 4, minHeight: 44, fontSize: 15, fontWeight: 600, alignSelf: "flex-start",
};

function Threshold({ bg, label, value }: { bg: string; label: string; value: string }) {
  return (
    <div style={{ borderRadius: 10, padding: 8, background: bg, color: "#12222B", display: "flex", flexDirection: "column", gap: 2 }}>
      <span>{label}</span>
      <span style={{ fontSize: 15, fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function ZoneMap({ polygons, point, color }: { polygons?: [number, number][][]; point?: { lat: number; lon: number }; color: string }) {
  const all = polygons?.flat() ?? [];
  if (all.length < 3) {
    return <div style={{ height: 120, borderRadius: 14, background: "var(--surface)", display: "grid", placeItems: "center", color: "var(--muted)", fontSize: 14 }}>Zona: {color ? "del aviso" : ""}</div>;
  }
  const lats = all.map((p) => p[0]);
  const lons = all.map((p) => p[1]);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLon = Math.min(...lons), maxLon = Math.max(...lons);
  const latR = maxLat - minLat || 1;
  const lonR = maxLon - minLon || 1;
  const px = (lat: number, lon: number) => `${16 + ((lon - minLon) / lonR) * 294},${174 - ((lat - minLat) / latR) * 158}`;
  const paths = polygons!.map((poly) => `M ${poly.map(([lat, lon]) => px(lat, lon)).join(" L ")} Z`);
  return (
    <svg viewBox="0 0 326 190" width="100%" role="img" aria-label="Zona del aviso" style={{ display: "block", height: "auto" }}>
      {paths.map((d, i) => <path key={i} d={d} fill={color} fillOpacity={0.55} stroke={color} strokeWidth={2} />)}
      {point && <circle cx={Number(px(point.lat, point.lon).split(",")[0])} cy={Number(px(point.lat, point.lon).split(",")[1])} r={5} fill="var(--ink)" />}
    </svg>
  );
}

function leftPct(iso: string): number {
  const h = new Date(iso).getHours() + new Date(iso).getMinutes() / 60;
  return Math.min(100, Math.max(0, (h / 24) * 100));
}

function widthPct(start: string, end: string): number {
  return Math.max(0, leftPct(end) - leftPct(start));
}

function nowPct(): number {
  const d = new Date();
  return ((d.getHours() + d.getMinutes() / 60) / 24) * 100;
}

function nowClock(): string {
  return new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

function startsIn(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "En vigor";
  const mins = Math.round(diff / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `Empieza en ${h} h ${m} min` : `Empieza en ${m} min`;
}

function timeRange(start: string, end: string): string {
  const fmt = (iso: string) => new Date(iso).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  try {
    return `Hoy, de ${fmt(start)} a ${fmt(end)}`;
  } catch {
    return `${start} — ${end}`;
  }
}
