import { useState, useCallback } from "react";
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
  const [loading, setLoading] = useState(false);

  const requestAndSet = useCallback(async (): Promise<City | null> => {
    if (!navigator.geolocation) {
      setError("Geolocalización no disponible");
      return null;
    }

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
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=es`
        );
        if (res.ok) {
          const data = await res.json();
          locationCity.name = data.city || data.locality || "Mi ubicación";
          locationCity.country = data.countryName || "";
          locationCity.admin1 = data.principalSubdivision || "";
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

  return { city, error, loading, requestAndSet };
}
