import { useSettingsStore } from "@/stores/cityStore";
import { useCities } from "@/hooks/useCities";
import { DynamicBackground } from "@/components/theme";
import { BottomNavBar } from "@/components/ui";
import { useTheme } from "@/hooks/useTheme";
import {
  Sun,
  Moon,
  Monitor,
  Thermometer,
  Wind,
  Palette,
  Trash2,
} from "lucide-react";

export default function Settings() {
  const { isDark } = useTheme();
  const { settings, updateSettings } = useSettingsStore();
  const { cities, activeCity, setActiveCity, removeCity } = useCities();

  return (
    <DynamicBackground condition="clear" isDark={isDark}>
      <div className="flex min-h-screen flex-col">
        <div className="flex-1 overflow-y-auto px-4 pb-24 pt-4">
          <div className="mx-auto flex max-w-lg flex-col gap-4">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Ajustes</h1>

        <ThemeSection settings={settings} updateSettings={updateSettings} />
        <UnitsSection settings={settings} updateSettings={updateSettings} />
        <IconsSection settings={settings} updateSettings={updateSettings} />
        <CitiesSection
              cities={cities}
              activeCity={activeCity}
              setActiveCity={setActiveCity}
              removeCity={removeCity}
            />
          </div>
        </div>
        <BottomNavBar />
      </div>
    </DynamicBackground>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-transparent bg-white/80 p-4 backdrop-blur-md dark:border-white/10 dark:bg-slate-800">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">
        {title}
      </p>
      {children}
    </div>
  );
}

function ThemeSection({ settings, updateSettings }: { settings: any; updateSettings: (p: any) => void }) {
  const options = [
    { value: "system" as const, label: "Sistema", icon: Monitor },
    { value: "light" as const, label: "Claro", icon: Sun },
    { value: "dark" as const, label: "Oscuro", icon: Moon },
  ];

  return (
    <SectionCard title="Tema">
      <div className="flex gap-2">
        {options.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => updateSettings({ theme: value })}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
              settings.theme === value
                ? "bg-blue-500 text-white"
                : "bg-slate-100/60 text-slate-600 hover:bg-slate-200/60 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>
    </SectionCard>
  );
}

function UnitsSection({ settings, updateSettings }: { settings: any; updateSettings: (p: any) => void }) {
  const tempUnits = [
    { value: "celsius" as const, label: "°C" },
    { value: "fahrenheit" as const, label: "°F" },
  ];

  const windUnits = [
    { value: "kmh" as const, label: "km/h" },
    { value: "mph" as const, label: "mph" },
    { value: "ms" as const, label: "m/s" },
    { value: "knots" as const, label: "kn" },
  ];

  return (
    <SectionCard title="Unidades">
      <div className="mb-3 flex items-center gap-3">
        <Thermometer size={16} className="text-orange-500 dark:text-orange-400" />
        <span className="text-sm text-slate-700 dark:text-slate-300">Temperatura</span>
        <div className="ml-auto flex gap-1">
          {tempUnits.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => updateSettings({ temperatureUnit: value })}
              className={`rounded-lg px-3 py-1 text-sm font-semibold transition-colors ${
                settings.temperatureUnit === value
                  ? "bg-blue-500 text-white"
                  : "bg-slate-100/60 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Wind size={16} className="text-teal-500 dark:text-teal-400" />
        <span className="text-sm text-slate-700 dark:text-slate-300">Viento</span>
        <div className="ml-auto flex gap-1">
          {windUnits.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => updateSettings({ windUnit: value })}
              className={`rounded-lg px-3 py-1 text-sm font-semibold transition-colors ${
                settings.windUnit === value
                  ? "bg-blue-500 text-white"
                  : "bg-slate-100/60 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}

function IconsSection({ settings, updateSettings }: { settings: any; updateSettings: (p: any) => void }) {
  return (
    <SectionCard title="Estilo de iconos">
      <div className="flex gap-2">
        {(["colored", "monochrome"] as const).map((style) => (
          <button
            key={style}
            onClick={() => updateSettings({ iconStyle: style })}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
              settings.iconStyle === style
                ? "bg-blue-500 text-white"
                : "bg-slate-100/60 text-slate-600 hover:bg-slate-200/60 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            }`}
          >
            <Palette size={16} />
            {style === "colored" ? "Coloreados" : "Monocromo"}
          </button>
        ))}
      </div>
    </SectionCard>
  );
}

function CitiesSection({
  cities,
  activeCity,
  setActiveCity,
  removeCity,
}: {
  cities: any[];
  activeCity: any;
  setActiveCity: (c: any) => void;
  removeCity: (id: string) => void;
}) {
  return (
    <SectionCard title="Mis ciudades">
      <div className="flex flex-col gap-2">
        {cities.map((city) => (
          <div
            key={city.id}
            className={`flex items-center gap-3 rounded-xl px-3 py-2 ${
              city.id === activeCity.id
          ? "bg-blue-500/10 dark:bg-blue-500/15"
          : "hover:bg-slate-100/60 dark:hover:bg-slate-800"
            }`}
          >
            <button onClick={() => setActiveCity(city)} className="flex-1 text-left">
              <p className="text-sm font-medium text-slate-800 dark:text-white">{city.name}</p>
              {city.admin1 && (
          <p className="text-xs text-slate-500 dark:text-slate-300">
            {city.admin1}, {city.country}
          </p>
              )}
            </button>
            {cities.length > 1 && !city.isLocation && (
          <button
            onClick={() => removeCity(city.id)}
            className="rounded-lg p-1 text-slate-400 hover:bg-red-500/10 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
