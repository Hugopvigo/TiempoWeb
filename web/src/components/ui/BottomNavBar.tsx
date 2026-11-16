import { CloudSun, Waves, Map, SlidersHorizontal } from "lucide-react";
import { NavLink } from "react-router";

const navItems = [
  { to: "/", icon: CloudSun, label: "Hoy" },
  { to: "/tides", icon: Waves, label: "Mareas" },
  { to: "/map", icon: Map, label: "Mapa" },
  { to: "/settings", icon: SlidersHorizontal, label: "Ajustes" },
];

export function BottomNavBar() {
  return (
    <nav
      aria-label="Secciones"
      className="shrink-0"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        background: "var(--card)",
        borderTop: "1px solid var(--surface-line)",
        padding: "8px 8px 16px",
      }}
    >
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          style={({ isActive }) => ({
            minHeight: 48,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            fontSize: 12,
            fontWeight: isActive ? 600 : 400,
            color: isActive ? "var(--ink)" : "var(--muted)",
            textDecoration: "none",
          })}
        >
          {({ isActive }) => (
            <>
              <Icon size={22} fill={isActive ? "currentColor" : "none"} strokeWidth={2} />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
