import type { City } from "../types/weather";
import { zoneNamesForProvince, provinceKey, zoneProvinceKey } from "./meteoalertaZonas";

/**
 * Normaliza un nombre de comunidad o provincia para compararlo sin acentos,
 * sin mayúsculas y sin los prefijos que usa cada fuente:
 *   "Comunidad Autónoma de Madrid" → "madrid"
 *   "Comunidad de Madrid"         → "madrid"
 *   "Principado de Asturias"      → "asturias"
 *   "Provincia de Madrid"         → "madrid"
 */
function normText(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

// Prefijos que aparecen delante del nombre de la región.
const REGION_PREFIX =
  /^(comunidad autonoma|comunidad foral|comunitat autonoma|comunidad|ciudad autonoma|principado|region|provincia)\s+(de |del |de la |de las |de los )?/;

/**
 * Comunidad (código de zona AEMET) a partir del nombre de la comunidad. Se
 * aceptan las dos formas que usan las fuentes: Open-Meteo ("Comunidad Autónoma
 * de Galicia", "Comunidad Valenciana") y el geocodificador del dispositivo
 * ("Comunidad de Madrid", "Principado de Asturias").
 */
const CCAA_NAMES: Record<string, string> = {
  // Andalucía
  "andalucia": "AND",
  // Aragón
  "aragon": "ARA",
  // Asturias
  "asturias": "AST",
  "principado de asturias": "AST",
  // Canarias
  "canarias": "CAN",
  // Cantabria
  "cantabria": "SAN",
  // Castilla-La Mancha
  "castilla-la mancha": "CLM",
  "castilla la mancha": "CLM",
  // Castilla y León
  "castilla y leon": "CYL",
  // Cataluña
  "cataluna": "CAT",
  // Comunidad Valenciana
  "comunidad valenciana": "VAL",
  "comunitat valenciana": "VAL",
  "valenciana": "VAL",
  "valencia": "VAL",
  // Extremadura
  "extremadura": "EXT",
  // Galicia
  "galicia": "GAL",
  // Illes Balears
  "islas baleares": "IB",
  "illes balears": "IB",
  "baleares": "IB",
  // Madrid
  "madrid": "MAD",
  // Murcia
  "murcia": "MUR",
  "region de murcia": "MUR",
  // Navarra
  "navarra": "NAV",
  // País Vasco
  "pais vasco": "PVA",
  "euskadi": "PVA",
  // La Rioja
  "la rioja": "RIO",
  "rioja": "RIO",
  // Ceuta y Melilla
  "ceuta": "CEU",
  "melilla": "MEL",
};

/**
 * Provincia → comunidad. Sirve de respaldo cuando la ciudad no trae
 * comunidad (o viene con un nombre que no se reconoce): en España cada
 * provincia pertenece a una sola comunidad.
 */
const PROVINCE_TO_CCAA: Record<string, string> = {
  // Andalucía
  almeria: "AND", cadiz: "AND", cordoba: "AND", granada: "AND",
  huelva: "AND", jaen: "AND", malaga: "AND", sevilla: "AND",
  // Aragón
  huesca: "ARA", teruel: "ARA", zaragoza: "ARA",
  // Asturias
  asturias: "AST",
  // Canarias
  "las palmas": "CAN", "santa cruz de tenerife": "CAN",
  // Cantabria
  cantabria: "SAN",
  // Castilla-La Mancha
  albacete: "CLM", "ciudad real": "CLM", cuenca: "CLM",
  guadalajara: "CLM", toledo: "CLM",
  // Castilla y León
  avila: "CYL", burgos: "CYL", leon: "CYL", palencia: "CYL",
  salamanca: "CYL", segovia: "CYL", soria: "CYL",
  valladolid: "CYL", zamora: "CYL",
  // Cataluña
  barcelona: "CAT", girona: "CAT", lleida: "CAT", tarragona: "CAT",
  // Comunidad Valenciana
  alicante: "VAL", castellon: "VAL", valencia: "VAL",
  // Extremadura
  badajoz: "EXT", caceres: "EXT",
  // Galicia
  "a coruna": "GAL", lugo: "GAL", ourense: "GAL", pontevedra: "GAL",
  // Illes Balears
  "illes balears": "IB",
  // Madrid
  madrid: "MAD",
  // Murcia
  murcia: "MUR",
  // Navarra
  navarra: "NAV",
  // País Vasco
  alava: "PVA", bizkaia: "PVA", gipuzkoa: "PVA",
  // La Rioja
  "la rioja": "RIO",
  // Ceuta y Melilla
  ceuta: "CEU", melilla: "MEL",
};

// Códigos oficiales del parámetro `area` de /api/avisos_cap/ultimoelaborado/area/{area}
// según la especificación de AEMET OpenData (AEMET_OpenData_specification.json).
const ZONE_TO_CCAA: Record<string, string> = {
  AND: "61",
  ARA: "62",
  AST: "63",
  IB: "64",
  CAN: "65",
  SAN: "66",
  CYL: "67",
  CLM: "68",
  CAT: "69",
  EXT: "70",
  GAL: "71",
  MAD: "72",
  MUR: "73",
  NAV: "74",
  PVA: "75",
  RIO: "76",
  VAL: "77",
  CEU: "78",
  MEL: "79",
};

/** Código de zona AEMET de una comunidad, a partir de su nombre. */
export function resolveCCAA(admin1: string | undefined): string | undefined {
  if (!admin1) return undefined;
  const norm = normText(admin1);
  const direct = CCAA_NAMES[norm];
  if (direct) return direct;
  return CCAA_NAMES[norm.replace(REGION_PREFIX, "").trim()];
}

/**
 * Zona AEMET de una ciudad: por su comunidad y, si no se reconoce, por su
 * provincia (el geocodificador del dispositivo a veces devuelve la provincia
 * en el campo de comunidad).
 */
export function getAEMETZone(city: City): string | undefined {
  return (
    resolveCCAA(city.admin1) ??
    PROVINCE_TO_CCAA[provinceKey(city.admin1)] ??
    PROVINCE_TO_CCAA[provinceKey(city.admin2)]
  );
}

export function getCCAACode(zonaCode: string): string | undefined {
  return ZONE_TO_CCAA[zonaCode];
}

/**
 * Patrones de nombre de zona Meteoalerta (CAP <areaDesc>) para una ciudad.
 * Lista vacía = sin filtro: se muestran todos los avisos de la comunidad.
 *
 * Orden: zona concreta si conocemos el municipio (Madrid capital está en
 * "Metropolitana y Henares", Vigo en "Rias Baixas"); si no, todas las zonas de
 * su provincia (admin2 de la geocodificación); si tampoco, toda la comunidad.
 * El admin1 no se usa como patrón: "Galicia" no aparece en ningún nombre de
 * zona y "Madrid" casaba con "Sierra de Madrid" (avisos de nieve de la Sierra
 * para la capital y para Getafe).
 */
export function getAEMETSubzonePatterns(city: City): string[] {
  const exact = CITY_KEYWORD_ZONES[city.name.trim().toLowerCase()];
  if (exact) {
    // La zona concreta solo vale si es de la provincia de la ciudad: hay dos
    // Vigo (Pontevedra y Asturias) y "Madrid" en medio mundo.
    const cityProvince = provinceKey(city.admin2);
    const zones = cityProvince
      ? exact.filter((z) => zoneProvinceKey(z) === cityProvince)
      : exact;
    if (zones.length > 0) return zones;
  }

  return zoneNamesForProvince(city.admin2);
}

// Municipio (nombre exacto, en minúsculas) → zona Meteoalerta en la que está.
// Solo los que se saben seguros; el resto cae en las zonas de su provincia.
const CITY_KEYWORD_ZONES: Record<string, string[]> = {
  // Madrid: área metropolitana
  "madrid": ["Metropolitana y Henares"],
  "alcalá de henares": ["Metropolitana y Henares"],
  "alcala de henares": ["Metropolitana y Henares"],
  "alcorcón": ["Metropolitana y Henares"],
  "getafe": ["Metropolitana y Henares"],
  "leganés": ["Metropolitana y Henares"],
  "leganes": ["Metropolitana y Henares"],
  "fuenlabrada": ["Metropolitana y Henares"],
  "móstoles": ["Metropolitana y Henares"],
  "mostoles": ["Metropolitana y Henares"],
  "parla": ["Metropolitana y Henares"],
  "torrejón de ardoz": ["Metropolitana y Henares"],
  "torrejon de ardoz": ["Metropolitana y Henares"],
  "coslada": ["Metropolitana y Henares"],
  "san fernando de henares": ["Metropolitana y Henares"],
  // Madrid: sur y oeste
  "aranjuez": ["Sur, Vegas y Oeste"],
  // Galicia
  "vigo": ["Rias Baixas"],
  "pontevedra": ["Rias Baixas"],
  // Baleares: la provincia es la comunidad entera, así que se acota por isla
  "palma": ["Norte y nordeste de Mallorca", "Interior de Mallorca", "Sur de Mallorca", "Levante mallorquín"],
  "palma de mallorca": ["Norte y nordeste de Mallorca", "Interior de Mallorca", "Sur de Mallorca", "Levante mallorquín"],
  "ibiza": ["Ibiza y Formentera"],
  "eivissa": ["Ibiza y Formentera"],
  "formentera": ["Ibiza y Formentera"],
  "mahón": ["Menorca"],
  "maó": ["Menorca"],
  "ciutadella": ["Menorca"],
  "inca": ["Menorca"],
  // Canarias: la provincia es la comunidad entera, así que se acota por isla
  "las palmas de gran canaria": ["Norte de Gran Canaria", "Cumbres de Gran Canaria", "Este, sur y oeste de Gran Canaria"],
  "arrecife": ["Lanzarote"],
  "puerto del rosario": ["Fuerteventura"],
  "santa cruz de tenerife": ["Norte de Tenerife", "Área Metropolitana de Tenerife", "Este, sur y oeste de Tenerife"],
};
