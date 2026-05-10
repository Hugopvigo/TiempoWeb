import type { City } from "../types/weather";

const ADMIN1_TO_AEMET_ZONE: Record<string, string> = {
  "Andalucía": "AND",
  "Aragón": "ARA",
  "Asturias": "AST",
  "Principado de Asturias": "AST",
  "Canarias": "CAN",
  "Cantabria": "SAN",
  "Castilla-La Mancha": "CLM",
  "Castilla la Mancha": "CLM",
  "Castilla y León": "CYL",
  "Castilla y Leon": "CYL",
  "Catalunya": "CAT",
  "Cataluña": "CAT",
  "Catalonia": "CAT",
  "Comunitat Valenciana": "VAL",
  "Comunidad Valenciana": "VAL",
  "Valenciana": "VAL",
  "Extremadura": "EXT",
  "Galicia": "GAL",
  "Illes Balears": "IB",
  "Islas Baleares": "IB",
  "Baleares": "IB",
  "Madrid": "MAD",
  "Comunidad de Madrid": "MAD",
  "Murcia": "MUR",
  "Región de Murcia": "MUR",
  "Region de Murcia": "MUR",
  "Navarra": "NAV",
  "Comunidad Foral de Navarra": "NAV",
  "País Vasco": "PVA",
  "Euskadi": "PVA",
  "Pais Vasco": "PVA",
  "La Rioja": "RIO",
  "Rioja": "RIO",
  "Ceuta": "CEU",
  "Melilla": "MEL",
};

const ZONE_TO_CCAA: Record<string, string> = {
  AND: "61",
  ARA: "62",
  AST: "63",
  IB: "64",
  CAN: "65",
  SAN: "66",
  CLM: "67",
  CYL: "68",
  CAT: "69",
  VAL: "70",
  EXT: "71",
  GAL: "72",
  MAD: "73",
  MUR: "74",
  NAV: "75",
  PVA: "76",
  RIO: "77",
  CEU: "78",
  MEL: "79",
};

export function getAEMETZone(city: City): string | undefined {
  if (!city.admin1) return undefined;
  const normalized = city.admin1.trim();
  return ADMIN1_TO_AEMET_ZONE[normalized];
}

export function getCCAACode(zonaCode: string): string | undefined {
  return ZONE_TO_CCAA[zonaCode];
}

// ─── Subzone mappings ───────────────────────
// Names used by AEMET CAP areaDesc for each CCAA.
// Keys are the AEMET zone codes; values are arrays of subzone name patterns
// that appear in CAP <areaDesc> fields.

export const CCAA_SUBZONES: Record<string, string[]> = {
  GAL: [
    "A Coruña", "Coruña", "A Coruna", "Coruna",
    "Lugo",
    "Ourense",
    "Pontevedra",
    "Rías Baixas", "Rias Baixas",
    "Miño", "Minho",
  ],
  MAD: [
    "Sierra",
    "Metropolitana", "Henares",
    "Sur", "Vegas",
    "Oeste",
  ],
  AND: [
    "Almería", "Almeria",
    "Cádiz", "Cadiz", "Estrecho",
    "Córdoba", "Cordoba",
    "Granada",
    "Huelva", "Aracena", "Andévalo", "Andevalo", "Condado",
    "Jaén", "Jaen", "Cazorla", "Morena",
    "Málaga", "Malaga", "Sol", "Guadalhorce",
    "Sevilla", "Seville",
  ],
  ARA: [
    "Huesca", "Pirineo",
    "Teruel",
    "Zaragoza", "Ibérica", "Iberica",
  ],
  AST: [
    "Asturias", "Cordillera", "Picos de Europa",
    "Costa", "Litoral", "Occidental", "Oriental",
  ],
  CAN: [
    "Tenerife", "Gran Canaria", "Lanzarote", "Fuerteventura",
    "La Palma", "La Gomera", "El Hierro",
    "Cumbres", "Medianías", "Medianias", "Costas",
  ],
  SAN: [
    "Cantabria", "Cantábrico", "Cantabrico",
    "Liébana", "Liebana", "Costa", "Central",
  ],
  CLM: [
    "Albacete", "Hellín", "Hellin",
    "Ciudad Real",
    "Cuenca",
    "Guadalajara", "Parameras",
    "Toledo", "Tajo", "Montes",
    "Mancha", "Alcarria",
  ],
  CYL: [
    "Ávila", "Avila",
    "Burgos",
    "León", "Leon",
    "Palencia",
    "Salamanca",
    "Segovia",
    "Soria",
    "Valladolid",
    "Zamora", "Sanabria",
    "Meseta", "Ibérica", "Iberica",
  ],
  CAT: [
    "Barcelona",
    "Girona", "Gerona",
    "Lleida", "Lérida", "Lerida",
    "Tarragona",
    "Pirineo", "Aran",
    "Costa", "Litoral",
    "Central", "Interior", "Prepirineo",
  ],
  VAL: [
    "Alicante", "Alacant",
    "Castellón", "Castellon",
    "Valencia",
    "Costa", "Litoral", "Interior",
  ],
  EXT: [
    "Badajoz",
    "Cáceres", "Caceres",
    "Tajo", "Guadiana", "Meseta",
  ],
  IB: [
    "Mallorca", "Menorca", "Ibiza", "Eivissa", "Formentera",
    "Baleares", "Balears", "Pitiusas",
  ],
  MUR: [
    "Murcia", "Altiplano", "Vega", "Segura", "Campo de Cartagena",
    "Litoral", "Cartagena",
  ],
  NAV: [
    "Navarra", "Navarre", "Pirineo", "Cantábrica",
    "Centro", "Ribera",
  ],
  PVA: [
    "Bizkaia", "Vizcaya",
    "Gipuzkoa", "Guipúzcoa", "Guipuzcoa",
    "Álava", "Alava",
    "Costa", "Litoral", "Interior",
    "Euskadi", "País Vasco", "Pais Vasco",
  ],
  RIO: [
    "Rioja", "Ribera", "Ibérica", "Iberica",
  ],
  CEU: ["Ceuta"],
  MEL: ["Melilla"],
};

// Subzone override by city name: city name → subzone patterns to match
const CITY_SUBZONE_OVERRIDE: Record<string, string[]> = {};

/**
 * Returns the best-guess AEMET subzone names for a city
 * based on its name and admin1. Used to match against CAP areaDesc.
 */
export function getAEMETSubzonePatterns(city: City): string[] {
  const nameLower = city.name.toLowerCase();
  const admin1 = city.admin1 || "";

  // Check explicit override first
  if (CITY_SUBZONE_OVERRIDE[city.name]) {
    return CITY_SUBZONE_OVERRIDE[city.name];
  }

  const patterns: string[] = [admin1];

  // Try to extract province/county from city name or admin1 context
  const provinceKeywords: Record<string, string[]> = {
    "coruña": ["A Coruña", "Coruña", "Coruna"],
    "coruna": ["A Coruña", "Coruña", "Coruna"],
    "lugo": ["Lugo"],
    "ourense": ["Ourense"],
    "orense": ["Ourense"],
    "pontevedra": ["Pontevedra"],
    "santiago": ["A Coruña", "Coruña", "Coruna"],
    "ferrol": ["A Coruña", "Coruña", "Coruna"],
    "vigo": ["Pontevedra"],
    "rias": ["Rías Baixas", "Rias Baixas"],
    "madrid": ["Metropolitana", "Henares", "Sur", "Vegas", "Sierra", "Oeste"],
    "alcalá": ["Henares"],
    "alcala": ["Henares"],
  };

  for (const [key, zonePatterns] of Object.entries(provinceKeywords)) {
    if (nameLower.includes(key)) {
      patterns.push(...zonePatterns);
    }
  }

  // Deduplicate
  return [...new Set(patterns)];
}
