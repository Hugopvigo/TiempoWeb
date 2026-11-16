import { createContext, useContext, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { ChevronDown, MapPin } from "lucide-react";
import { CitySelector } from "@/components/city";
import { useCities } from "@/hooks/useCities";
import { BottomNavBar } from "./BottomNavBar";
import { LogoMark } from "./LogoMark";

/** Permite que cualquier vista abra el selector de ciudades (p. ej. la cabecera móvil). */
export const CitySelectorContext = createContext<() => void>(() => {});
export const useOpenCitySelector = () => useContext(CitySelectorContext);

const sections = [
  { to: "/", label: "Hoy" },
  { to: "/tides", label: "Mareas" },
  { to: "/map", label: "Mapa" },
  { to: "/settings", label: "Ajustes" },
];

/** Estructura común a todas las rutas: cabecera de escritorio, contenido, footer y menú móvil. */
export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { activeCity } = useCities();
  const [citySelectorOpen, setCitySelectorOpen] = useState(false);
  const openCitySelector = () => setCitySelectorOpen(true);

  return (
    <CitySelectorContext.Provider value={openCitySelector}>
    <div className="flex min-h-dvh flex-col" style={{ background: "var(--surface)", color: "var(--ink)" }}>
      <header className="hidden md:block" style={{ background: "var(--card)", borderBottom: "1px solid var(--surface-line)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", minHeight: 64, boxSizing: "border-box" }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "var(--ink)" }}>
            <LogoMark size={30} />
            <span className="ds-display" style={{ fontSize: 22, fontWeight: 700 }}>Tiempo</span>
          </Link>
          <nav aria-label="Secciones" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {sections.map(({ to, label }) => {
              const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  style={{
                    minHeight: 44,
                    boxSizing: "border-box",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 12px",
                    fontSize: 15,
                    textDecoration: "none",
                    fontWeight: active ? 600 : 400,
                    color: active ? "var(--ink)" : "var(--muted)",
                    borderBottom: active ? "2px solid var(--ink)" : "2px solid transparent",
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={openCitySelector}
              aria-label={`${activeCity.name}. Cambiar de ciudad o buscar`}
              style={{ minWidth: 180, height: 44, boxSizing: "border-box", borderRadius: 22, border: "1px solid var(--surface-line)", padding: "0 16px", font: "inherit", fontSize: 15, fontWeight: 600, color: "var(--ink)", background: "var(--surface)", display: "flex", alignItems: "center", gap: 8 }}
            >
              {activeCity.isLocation && <MapPin size={16} className="ds-accent" />}
              <span className="line-clamp-1">{activeCity.name}</span>
              <ChevronDown size={16} className="ds-muted" style={{ marginLeft: "auto" }} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col">{children}</div>

      <footer style={{ textAlign: "center", fontSize: 12, lineHeight: 1.5, color: "var(--muted)", padding: "14px 16px 18px" }}>
        Desarrollado por Hugo Perez-Vigo · Datos de AEMET
      </footer>

      <div className="md:hidden"><BottomNavBar /></div>
      <CitySelector open={citySelectorOpen} onClose={() => setCitySelectorOpen(false)} />
    </div>
    </CitySelectorContext.Provider>
  );
}
