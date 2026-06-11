import type { City } from "../types/weather";

const KNOWN_COASTAL_CITIES = new Set([
  "barcelona", "valencia", "málaga", "malaga", "cádiz", "cadiz",
  "san sebastián", "san sebastian", "bilbao", "santander", "gijón", "gijon",
  "a coruña", "coruna", "vigo", "alicante", "cartagena",
  "palma de mallorca", "palma", "santa cruz de tenerife",
  "las palmas de gran canaria", "las palmas", "huelva", "almería", "almeria",
  "tarragona", "castellón", "castellon", "pontevedra", "lugo-costera",
  "ceuta", "melilla", "motril", "fuengirola", "marbella", "benidorm",
  "torrevieja", "elche", "hondarribia", "getxo", "castro-urdiales", "castro urdiales",
  "villaviciosa", "llanes", "ribadesella", "cudillero", "avilés", "aviles",
  "ferrol", "nazare", "cangas", "baiona", "nigran",
]);

const KNOWN_INLAND_CITIES = new Set([
  "madrid", "zaragoza", "valladolid", "burgos", "pamplona",
  "teruel", "cuenca", "guadalajara", "toledo", "ciudad real",
  "albacete", "jaén", "jaen", "granada", "córdoba", "cordoba",
  "badajoz", "cáceres", "caceres", "salamanca", "león", "leon",
  "palencia", "zamora", "ávila", "avila", "segovia", "soria",
]);

export function isCoastalCity(city: City): boolean {
  if (city.isCoastal != null) return city.isCoastal;

  const nameLower = city.name.toLowerCase();
  for (const known of KNOWN_COASTAL_CITIES) {
    if (nameLower.includes(known)) return true;
  }
  for (const known of KNOWN_INLAND_CITIES) {
    if (nameLower.includes(known)) return false;
  }

  const distToCoast = distanceToNearestCoast(city.lat, city.lon);
  return distToCoast < 25;
}

function distanceToNearestCoast(lat: number, lon: number): number {
  const coastlinePoints = [
    [43.4, -8.0], [43.3, -2.0], [43.1, -2.5], [42.5, -2.7],
    [42.0, -3.0], [41.4, -2.5], [40.5, -1.0], [39.5, -0.3],
    [38.8, 0.0], [38.0, -1.0], [37.5, -1.3], [36.8, -2.5],
    [36.5, -5.0], [36.2, -6.0], [37.0, -7.5], [37.5, -8.0],
    [38.5, -9.0], [39.5, -9.0], [40.5, -8.8], [41.5, -8.8],
    [42.5, -8.9], [43.3, -8.5], [43.4, -8.0],
    [28.5, -16.0], [28.1, -15.5], [27.8, -15.5],
    [28.5, -16.5], [39.0, 1.5], [39.5, 2.8], [40.0, 3.5],
  ];

  let minDist = Infinity;
  for (const [clat, clon] of coastlinePoints) {
    const d = haversineKm(lat, lon, clat, clon);
    if (d < minDist) minDist = d;
  }
  return minDist;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
