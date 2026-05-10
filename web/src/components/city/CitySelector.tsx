import { useCities } from "@/hooks/useCities";
import { MapPin, X, Plus, Navigation } from "lucide-react";
import { useNavigate } from "react-router";
import type { City } from "@shared/types/weather";

interface CitySelectorProps {
  open: boolean;
  onClose: () => void;
}

export function CitySelector({ open, onClose }: CitySelectorProps) {
  const { cities, activeCity, setActiveCity, removeCity } = useCities();
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative z-10 mb-0 w-full max-w-lg rounded-t-3xl border border-transparent bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900 sm:mb-0 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Ciudades</h2>
          <button onClick={onClose} className="rounded-full p-1 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
          {cities.map((city) => (
            <CityRow
              key={city.id}
              city={city}
              isActive={city.id === activeCity.id}
              canDelete={cities.length > 1}
              onSelect={() => {
                setActiveCity(city);
                onClose();
              }}
              onRemove={() => removeCity(city.id)}
            />
          ))}
        </div>

        <button
          onClick={() => {
            onClose();
            navigate("/search");
          }}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-500/10 py-3 text-sm font-semibold text-blue-500 transition-colors hover:bg-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30"
        >
          <Plus size={18} />
          Añadir ciudad
        </button>
      </div>
    </div>
  );
}

function CityRow({
  city,
  isActive,
  canDelete,
  onSelect,
  onRemove,
}: {
  city: City;
  isActive: boolean;
  canDelete: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors ${
        isActive
    ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
      : "hover:bg-slate-100 dark:hover:bg-slate-800"
      }`}
    >
      {city.isLocation ? (
<Navigation size={18} className={isActive ? "text-blue-500 dark:text-blue-400" : "text-slate-400 dark:text-slate-400"} />
) : (
<MapPin size={18} className={isActive ? "text-blue-500 dark:text-blue-400" : "text-slate-400 dark:text-slate-400"} />
      )}
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-800 dark:text-white">{city.name}</p>
      {city.admin1 && (
        <p className="text-xs text-slate-500 dark:text-slate-300">{city.admin1}, {city.country}</p>
      )}
    </div>
    {canDelete && !city.isLocation && (
      <span
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.stopPropagation();
            onRemove();
          }
        }}
        className="rounded-full p-1 text-slate-400 hover:bg-red-500/10 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400"
      >
          <X size={14} />
        </span>
      )}
    </button>
  );
}
