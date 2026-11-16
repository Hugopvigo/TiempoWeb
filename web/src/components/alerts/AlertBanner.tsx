import type { WeatherAlert } from "@shared/types/weather";
import { alertBackground, alertSeverityLabel } from "@shared/constants/theme";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router";

interface AlertBannerProps {
  alerts: WeatherAlert[];
}

/** Avisos destacados: color por severidad, titular grande y acceso al detalle. */
export function AlertBanner({ alerts }: AlertBannerProps) {
  const navigate = useNavigate();
  if (alerts.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {alerts.map((alert) => {
        const bg = alertBackground[alert.severity];
        const sev = alertSeverityLabel[alert.severity].toLowerCase();
        const origin = alert.source === "local"
          ? `Previsión ${sev}`
          : `Aviso ${sev} de AEMET`;
        const zone = alert.zone ? ` en ${alert.zone}` : "";
        return (
          <button
            key={alert.id}
            onClick={() => navigate(`/alert/${alert.id}`)}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              width: "100%",
              background: bg,
              color: "#12222B",
              borderRadius: 20,
              padding: 16,
              textAlign: "left",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600 }}>
              <AlertTriangle size={18} strokeWidth={2.2} style={{ color: "#12222B" }} />
              {origin}{zone}
            </span>
            <span className="ds-display" style={{ fontSize: 34, lineHeight: 1.05, fontWeight: 700 }}>
              {alert.detail ?? alert.description ?? alert.title}
            </span>
            <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600 }}>
              <span>{startsIn(alert.startTime)}</span>
              <span style={{ textDecoration: "underline" }}>Ver el aviso</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function startsIn(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "En vigor ahora";
  const mins = Math.round(diff / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `Empieza en ${h} h ${m} min` : `Empieza en ${m} min`;
}
