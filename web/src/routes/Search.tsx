import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { searchCities } from "@shared/services/openmeteo";
import { useCities } from "@/hooks/useCities";
import { useLocation } from "@/hooks/useLocation";
import { isCoastalCity } from "@shared/utils/coastal";
import type { City } from "@shared/types/weather";
import { ArrowLeft, MapPin, Navigation, Search, X } from "lucide-react";
import { BottomNavBar } from "@/components/ui";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<City[]>([]);
  const [searching, setSearching] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const navigate = useNavigate();
  const { addCity, setActiveCity, setLocationCity, cities } = useCities();
  const { requestAndSet, loading: locationLoading } = useLocation();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }

    clearTimeout(debounceRef.current);
    abortRef.current?.abort();

    debounceRef.current = setTimeout(async () => {
      abortRef.current = new AbortController();
      setSearching(true);
      try {
        const found = await searchCities(query.trim(), abortRef.current.signal);
        setResults(found);
      } catch {
        if (!abortRef.current.signal.aborted) setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, [query]);

  const handleSelect = useCallback(
    (city: City) => {
      const withCoastal = { ...city, isCoastal: isCoastalCity(city) };
      if (!cities.some((c) => c.id === withCoastal.id)) {
        addCity(withCoastal);
      }
      setActiveCity(withCoastal);
      navigate("/");
    },
    [addCity, setActiveCity, cities, navigate],
  );

  const handleUseLocation = useCallback(async () => {
    const city = await requestAndSet();
    if (city) {
      const withCoastal = { ...city, isCoastal: isCoastalCity(city) };
      setLocationCity(withCoastal);
      navigate("/");
    }
  }, [requestAndSet, setLocationCity, navigate]);

  const existingIds = new Set(cities.map((c) => c.id));

  return (
    <div className="flex h-dvh flex-col bg-slate-50 dark:bg-slate-950">
      <div className="flex-1 overflow-y-auto px-4 pt-4">
      <div className="mx-auto max-w-lg">
        <div className="mb-4 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-slate-600 dark:text-slate-300">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Buscar ciudad</h1>
        </div>

        <div className="relative mb-4">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nombre de la ciudad..."
          autoFocus
          className="w-full rounded-2xl bg-white py-3 pl-11 pr-10 text-sm text-slate-800 placeholder-slate-400 shadow-sm outline-none ring-1 ring-slate-200/60 focus:ring-2 focus:ring-blue-500/40 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400 dark:ring-white/10"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {!query && (
          <button
            onClick={handleUseLocation}
            disabled={locationLoading}
            className="mb-4 flex w-full items-center gap-3 rounded-2xl bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-500 transition-colors hover:bg-blue-500/20 disabled:opacity-50 dark:bg-blue-500/15 dark:text-blue-400"
          >
            <Navigation size={18} />
            {locationLoading ? "Obteniendo ubicación..." : "Usar mi ubicación"}
          </button>
        )}

        {searching && (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        )}

        {!searching && results.length > 0 && (
          <div className="flex flex-col gap-1">
            {results.map((city) => {
              const exists = existingIds.has(city.id);
              return (
                <button
                  key={city.id}
                  onClick={() => handleSelect(city)}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors hover:bg-white/60 dark:hover:bg-slate-800"
                >
                  <MapPin size={18} className="shrink-0 text-slate-400 dark:text-slate-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800 dark:text-white">{city.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-300">
                  {city.admin1}{city.admin1 && city.country ? ", " : ""}{city.country}
                </p>
                  </div>
                  {exists && (
                    <span className="text-xs text-blue-500 dark:text-blue-400">Añadida</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {!searching && query.trim().length > 2 && results.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-300">
            No se encontraron ciudades
          </p>
        )}
      </div>
      </div>
      <BottomNavBar />
    </div>
  );
}
