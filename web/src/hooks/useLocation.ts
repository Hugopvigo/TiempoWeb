import { useEffect, useState, useCallback } from "react";
import type { City } from "@shared/types/weather";

interface LocationState {
  city: City | null;
  error: string | null;
  loading: boolean;
  requestAndSet: () => Promise<City | null>;
}

export function useLocation(): LocationState {
  const [city, setCity] = useState<City | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const requestAndSet = useCallback(async (): Promise<City | null> => {
    setLoading(true);
    setError(null);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10000,
        });
      });

      const lat = Math.round(pos.coords.latitude * 10000) / 10000;
      const lon = Math.round(pos.coords.longitude * 10000) / 10000;

      const locationCity: City = {
        id: "gps-current",
        name: "Mi ubicación",
        country: "",
        admin1: "",
        lat,
        lon,
        isLocation: true,
      };

      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=&latitude=${lat}&longitude=${lon}&count=1&language=es`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.results?.[0]) {
            const r = data.results[0];
            locationCity.name = r.name || "Mi ubicación";
            locationCity.country = r.country || "";
            locationCity.admin1 = r.admin1 || "";
          }
        }
      } catch {
        // fallback to "Mi ubicación"
      }

      setCity(locationCity);
      return locationCity;
    } catch {
      setError("No se pudo obtener la ubicación");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      requestAndSet();
    } else {
      setLoading(false);
      setError("Geolocalización no disponible");
    }
  }, [requestAndSet]);

  return { city, error, loading, requestAndSet };
}
