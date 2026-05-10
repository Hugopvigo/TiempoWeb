import { useCityStore } from "@/stores/cityStore";

export function useCities() {
  const { cities, activeCity, addCity, removeCity, setActiveCity, setLocationCity, reorderCities } = useCityStore();
  return { cities, activeCity, addCity, removeCity, setActiveCity, setLocationCity, reorderCities };
}
