import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useWeatherLayers } from "@/hooks/useWeatherLayers";
import { useCities } from "@/hooks/useCities";
import { useCityStore } from "@/stores/cityStore";
import { useSettingsStore } from "@/stores/cityStore";
import { getRadarTileUrl, getSatelliteTileUrl, getOpenWeatherMapTileUrl } from "@shared/services/weatherLayers";
import type { RainViewerData } from "@shared/services/weatherLayers";
import { Layers, Play, Pause, SkipBack, SkipForward, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { BottomNavBar } from "@/components/ui";

type LayerType = "radar" | "satellite" | "temp" | "wind" | "pressure";

const LAYER_LABELS: Record<LayerType, string> = {
  radar: "Radar",
  satellite: "Satélite",
  temp: "Temperatura",
  wind: "Viento",
  pressure: "Presión",
};

export function WeatherMap() {
  const { activeCity } = useCities();
  const { settings } = useSettingsStore();
  const { data: rainViewerData } = useWeatherLayers();
  const navigate = useNavigate();

  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const cityMarkersRef = useRef<L.LayerGroup>(L.layerGroup());

  const [activeLayer, setActiveLayer] = useState<LayerType>("radar");
  const [radarFrame, setRadarFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    const obs = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const baseTiles = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  const owmKey = settings.openWeatherMapApiKey;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [activeCity.lat, activeCity.lon],
      zoom: 7,
      zoomControl: false,
    });

    L.tileLayer(baseTiles, {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 18,
    }).addTo(map);

    cityMarkersRef.current.addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) map.removeLayer(layer);
    });

    L.tileLayer(baseTiles, {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 18,
    }).addTo(map);

    const overlayUrl = getOverlayUrl(activeLayer, rainViewerData ?? null, radarFrame, owmKey);
    if (overlayUrl) {
      tileLayerRef.current = L.tileLayer(overlayUrl, {
        opacity: activeLayer === "radar" || activeLayer === "satellite" ? 0.6 : 0.7,
        maxZoom: 18,
      }).addTo(map);
    }
  }, [activeLayer, radarFrame, rainViewerData, baseTiles, owmKey]);

  useEffect(() => {
    if (!mapRef.current) return;
    cityMarkersRef.current.clearLayers();

    const { cities } = useCityStore.getState();
    cities.forEach((city) => {
      L.circleMarker([city.lat, city.lon], {
        radius: 6,
        fillColor: city.id === activeCity.id ? "#3B82F6" : "#94A3B8",
        color: "#fff",
        weight: 2,
        fillOpacity: 0.9,
      }).bindPopup(city.name).addTo(cityMarkersRef.current);
    });
  }, [activeCity]);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setView([activeCity.lat, activeCity.lon], 7, { animate: true });
  }, [activeCity.lat, activeCity.lon]);

  const totalFrames = getTotalFrames(activeLayer, rainViewerData ?? null);

  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setRadarFrame((prev) => (prev + 1) % Math.max(totalFrames, 1));
      }, 800);
    } else {
      clearInterval(playIntervalRef.current);
    }
    return () => clearInterval(playIntervalRef.current);
  }, [isPlaying, totalFrames]);

  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="flex-1">
        <div ref={containerRef} className="h-[calc(100vh-140px)] w-full" />

        <div className="absolute left-4 top-4 z-[1000]">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 rounded-2xl border border-transparent bg-white/90 px-3 py-2 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-slate-800 dark:text-slate-200"
          >
            <ArrowLeft size={16} />
            <span className="text-sm font-semibold">Volver</span>
          </button>
        </div>

        <div className="absolute bottom-20 left-1/2 z-[1000] -translate-x-1/2">
        <div className="flex items-center gap-1 rounded-2xl border border-transparent bg-white/90 px-3 py-2 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-slate-800">
        <Layers size={14} className="text-slate-400 dark:text-slate-300" />
            {(Object.keys(LAYER_LABELS) as LayerType[]).map((layer) => (
              <button
                key={layer}
                onClick={() => {
                  setActiveLayer(layer);
                  setRadarFrame(0);
                  setIsPlaying(false);
                }}
                disabled={layer !== "radar" && layer !== "satellite" && !owmKey}
                className={`rounded-xl px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-30 ${
                  activeLayer === layer
                    ? "bg-blue-500 text-white"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {LAYER_LABELS[layer]}
              </button>
            ))}
          </div>
        </div>

        {(activeLayer === "radar" || activeLayer === "satellite") && totalFrames > 0 && (
          <div className="absolute bottom-32 left-1/2 z-[1000] -translate-x-1/2">
            <div className="flex items-center gap-3 rounded-2xl border border-transparent bg-white/90 px-4 py-2 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-slate-800">
                <button onClick={() => setRadarFrame(0)} className="text-slate-500 dark:text-slate-300">
                  <SkipBack size={16} />
                </button>
                <button onClick={() => setIsPlaying(!isPlaying)} className="text-blue-500 dark:text-blue-400">
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <button onClick={() => setRadarFrame(totalFrames - 1)} className="text-slate-500 dark:text-slate-300">
                  <SkipForward size={16} />
                </button>
              <input
                type="range"
                min={0}
                max={totalFrames - 1}
                value={radarFrame}
                onChange={(e) => {
                  setRadarFrame(Number(e.target.value));
                  setIsPlaying(false);
                }}
                className="w-24 accent-blue-500"
              />
                <span className="text-xs text-slate-500 dark:text-slate-300">
                {radarFrame + 1}/{totalFrames}
              </span>
            </div>
          </div>
        )}
      </div>
      <BottomNavBar />
    </div>
  );
}

function getOverlayUrl(
  layer: LayerType,
  data: RainViewerData | null,
  frame: number,
  owmKey?: string,
): string | null {
  switch (layer) {
    case "radar":
      return data ? getRadarTileUrl(data, frame) : null;
    case "satellite":
      return data ? getSatelliteTileUrl(data, frame) : null;
    case "temp":
      return owmKey ? getOpenWeatherMapTileUrl("temp_new", owmKey) : null;
    case "wind":
      return owmKey ? getOpenWeatherMapTileUrl("wind_new", owmKey) : null;
    case "pressure":
      return owmKey ? getOpenWeatherMapTileUrl("pressure_new", owmKey) : null;
    default:
      return null;
  }
}

function getTotalFrames(layer: LayerType, data: RainViewerData | null): number {
  if (!data) return 0;
  if (layer === "radar") return data.radarPast.length + data.radarNowcast.length;
  if (layer === "satellite") return data.satelliteInfrared.length;
  return 0;
}
