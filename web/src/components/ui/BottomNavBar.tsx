import { Home, Waves, Map, Settings } from "lucide-react";
import { NavLink } from "react-router";

const navItems = [
  { to: "/", icon: Home, label: "Inicio" },
  { to: "/tides", icon: Waves, label: "Mareas" },
  { to: "/map", icon: Map, label: "Mapa" },
  { to: "/settings", icon: Settings, label: "Ajustes" },
];

export function BottomNavBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/80 bg-white/95 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs transition-colors ${
                isActive
                  ? "text-blue-500 dark:text-blue-400"
                  : "text-slate-500 dark:text-slate-400"
              }`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
