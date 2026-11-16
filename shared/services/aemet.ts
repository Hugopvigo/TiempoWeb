import type { WeatherAlert } from "../types/weather";
import { getCCAACode } from "../constants/aemetZones";
import { XMLParser } from "fast-xml-parser";

const BASE_URL = "https://opendata.aemet.es/opendata";

interface AEMETConfig {
  apiKey: string;
}

let config: AEMETConfig = { apiKey: "" };

export function configureAEMET(apiKey: string) {
  config = { apiKey };
}

async function aemetFetch<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      api_key: config.apiKey,
      Accept: "application/json",
    },
  });

  if (!res.ok) throw new Error(`AEMET error: ${res.status}`);

  const data = await res.json();
  if (data.datos) {
    const dataRes = await fetch(data.datos);
    if (!dataRes.ok) throw new Error(`AEMET data error: ${dataRes.status}`);
    return dataRes.json();
  }

  return data;
}

const CAP_SEVERITY: Record<string, WeatherAlert["severity"] | null> = {
  Extreme: "red",
  Severe: "orange",
  Moderate: "yellow",
  Minor: null,
};

// Fenómenos del Plan Meteoalerta (eventos CAP en español, p. ej. "Aviso de
// temperaturas máximas de nivel rojo"). Se compara sin acentos porque el XML
// llega en UTF-8 y así da igual cómo venga escrito.
export function capEventToType(event: string): WeatherAlert["type"] | null {
  const e = stripAccents(event);
  if (/lluvia|precipitaci/.test(e)) return "rain";
  if (/tormenta|rayos|electric/.test(e)) return "storm";
  if (/nieve|nevada|alud/.test(e)) return "snow";
  if (/viento|racha/.test(e)) return "wind";
  if (/calor|temperaturas? max/.test(e)) return "heat";
  if (/frio|temperaturas? min|hielo|deshielo/.test(e)) return "cold";
  if (/coster|maritim|costa|oleaje|galerna|rissag/.test(e)) return "coastal";
  if (/niebla|polvo|arena|calima/.test(e)) return "fog";
  return null;
}

// Los CAP de AEMET son UTF-8 (<?xml ... encoding="utf-8"?>); decodificar byte a
// byte rompía tildes y eñes ("Coruña" → "CoruÃ±a") y con ello el filtro de
// subzonas y el texto mostrado.
export function decodeTarText(bytes: Uint8Array): string {
  const text = new TextDecoder("utf-8").decode(bytes);
  // Si no era UTF-8 válido (U+FFFD), vuelve a la lectura byte a byte (Latin-1).
  if (text.includes("\uFFFD")) {
    let latin1 = "";
    for (let i = 0; i < bytes.length; i++) latin1 += String.fromCharCode(bytes[i]);
    return latin1;
  }
  return text;
}

function parseTar(buffer: ArrayBuffer): string[] {
  const bytes = new Uint8Array(buffer);
  const files: string[] = [];
  let offset = 0;

  while (offset + 512 <= bytes.length) {
    const header = bytes.slice(offset, offset + 512);

    if (header.every((b) => b === 0)) break;

    const sizeStr = String.fromCharCode(...header.slice(124, 136)).replace(/\0/g, "").trim();
    const size = parseInt(sizeStr, 8);
    if (isNaN(size) || size === 0) { offset += 512; continue; }

    const typeFlag = String.fromCharCode(header[156]);
    offset += 512;

    const paddedSize = Math.ceil(size / 512) * 512;

    if (typeFlag === "\0" || typeFlag === "0" || typeFlag === "") {
      if (offset + size > bytes.length) break;
      const data = bytes.slice(offset, offset + size);
      files.push(decodeTarText(data));
    }

    offset += paddedSize;
  }

  return files;
}

interface CAPArea {
  areaDesc?: string;
  /** "lat,lon lat,lon …" (CAP, WGS84); puede haber varios por zona */
  polygon?: string | string[];
}

export interface GeoPoint {
  lat: number;
  lon: number;
}

interface CAPAlertInfo {
  language?: string;
  event?: string;
  severity?: string;
  urgency?: string;
  certainty?: string;
  onset?: string;
  expires?: string;
  headline?: string;
  description?: string;
  area?: CAPArea | CAPArea[];
}

function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Match por palabra completa e insensible a acentos: "Oeste" hace match con
// "Sur, Vegas y Oeste" pero no con "Noroeste de Murcia".
function matchesSubzone(areaDescs: string[], patterns: string[]): boolean {
  return patterns.some((p) => {
    const pat = stripAccents(p).trim();
    if (!pat) return false;
    const re = new RegExp(`(^|[^a-z])${escapeRegExp(pat)}([^a-z]|$)`);
    return areaDescs.some((desc) => re.test(stripAccents(desc)));
  });
}

function parsePolygon(text: string): [number, number][] {
  return text
    .trim()
    .split(/\s+/)
    .map((pair) => pair.split(",").map(Number) as [number, number])
    .filter((p) => p.length === 2 && Number.isFinite(p[0]) && Number.isFinite(p[1]));
}

// Ray casting sobre (lat, lon). Los polígonos de AEMET llevan dos decimales
// (~1 km), así que una ciudad pegada al borde puede quedar fuera por redondeo.
export function pointInPolygon(point: GeoPoint, ring: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [yi, xi] = ring[i];
    const [yj, xj] = ring[j];
    if (yi > point.lat !== yj > point.lat && point.lon < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

// Margen de ~2 km alrededor de la ciudad: es mejor un aviso vecino que perder uno real.
const POLYGON_MARGIN_DEG = 0.02;

function areaContainsPoint(area: CAPArea, point: GeoPoint): boolean {
  const polygons = Array.isArray(area.polygon) ? area.polygon : area.polygon ? [area.polygon] : [];
  const probes: GeoPoint[] = [
    point,
    { lat: point.lat + POLYGON_MARGIN_DEG, lon: point.lon },
    { lat: point.lat - POLYGON_MARGIN_DEG, lon: point.lon },
    { lat: point.lat, lon: point.lon + POLYGON_MARGIN_DEG },
    { lat: point.lat, lon: point.lon - POLYGON_MARGIN_DEG },
  ];
  return polygons.some((text) => {
    const ring = parsePolygon(String(text));
    return ring.length >= 3 && probes.some((q) => pointInPolygon(q, ring));
  });
}

function hasPolygon(area: CAPArea): boolean {
  return Array.isArray(area.polygon) ? area.polygon.length > 0 : Boolean(area.polygon);
}

/**
 * Avisos de un fichero CAP. Un fichero puede traer varios bloques <info> en
 * español (un fenómeno o un tramo horario cada uno): sale un aviso por bloque.
 */
export function parseCAPAlerts(
  parsed: any,
  zonaCode: string,
  subzonePatterns?: string[],
  now: Date = new Date(),
  point?: GeoPoint
): WeatherAlert[] {
  const alert = parsed.alert || parsed["alert"] || parsed;
  if (!alert) return [];

  // Solo avisos reales y vigentes: ni pruebas, ni cancelaciones, ni caducados.
  if (alert.status && alert.status !== "Actual") return [];
  if (alert.msgType === "Cancel") return [];

  const infos: CAPAlertInfo[] = alert.info ? (Array.isArray(alert.info) ? alert.info : [alert.info]) : [];
  const spanish = infos.filter((i) => i.language && i.language.startsWith("es"));
  // Sin bloques marcados como español se usa el primero, como hasta ahora.
  const chosen = spanish.length > 0 ? spanish : infos.slice(0, 1);

  return chosen
    .map((info) => infoToAlert(info, zonaCode, subzonePatterns, now, point))
    .filter((a): a is WeatherAlert => a !== null);
}

/** Primer aviso del fichero, o null. */
export function parseCAPAlert(
  parsed: any,
  zonaCode: string,
  subzonePatterns?: string[],
  now: Date = new Date(),
  point?: GeoPoint
): WeatherAlert | null {
  return parseCAPAlerts(parsed, zonaCode, subzonePatterns, now, point)[0] ?? null;
}

function infoToAlert(
  info: CAPAlertInfo,
  zonaCode: string,
  subzonePatterns: string[] | undefined,
  now: Date,
  point: GeoPoint | undefined
): WeatherAlert | null {
  const event = info.event || "";
  const type = capEventToType(event);
  if (!type) return null;

  const capSeverity = info.severity || "";
  const severity = CAP_SEVERITY[capSeverity];
  if (!severity) return null;

  let areas = (Array.isArray(info.area) ? info.area : info.area ? [info.area] : []).filter(Boolean);

  // Con polígonos y coordenadas manda la geometría: solo cuentan las zonas que
  // contienen la ciudad. Sin polígonos (o sin coordenadas) se filtra por nombre.
  if (point && areas.some(hasPolygon)) {
    areas = areas.filter((a) => areaContainsPoint(a, point));
    if (areas.length === 0) return null;
  }

  const areaDescs = areas
    .map((a) => a?.areaDesc)
    .filter((d): d is string => Boolean(d));

  const usedPolygon = Boolean(point) && areas.some(hasPolygon);
  if (!usedPolygon && subzonePatterns && subzonePatterns.length > 0 && areaDescs.length > 0) {
    if (!matchesSubzone(areaDescs, subzonePatterns)) return null;
  }

  const onset = info.onset || now.toISOString();
  const expires = info.expires || new Date(now.getTime() + 24 * 3600000).toISOString();
  if (new Date(expires).getTime() <= now.getTime()) return null;
  const areaDesc = areaDescs.join("; ");
  // La zona va primero: es lo que distingue "Sierra de Madrid" de la capital y
  // es lo primero que se lee en la notificación.
  const description = [areaDesc, info.description].filter(Boolean).join("\n");

  // El slug del área distingue avisos del mismo tipo/severidad/día en subzonas
  // distintas; sin él colisionarían los ids y el dedup suprimiría avisos reales.
  const areaSlug = stripAccents(areaDesc).replace(/[^a-z0-9]/g, "").slice(0, 24);

  // "Aviso de lluvias de nivel amarillo. Suroeste de A Coruña" → "Aviso de lluvias":
  // el nivel lo dice el chip y la zona va en la descripción.
  const title = (info.headline || event)
    .replace(/\.\s.*$/, "")
    .replace(/\s+de nivel (amarillo|naranja|rojo)/i, "")
    .trim();

  const polygons = point
    ? areas
        .flatMap((a) => (Array.isArray(a.polygon) ? a.polygon : a.polygon ? [a.polygon] : []))
        .map((text) => parsePolygon(String(text)))
        .filter((ring) => ring.length >= 3)
    : [];

  return {
    id: `aemet-${zonaCode}-${type}-${severity}-${onset.slice(0, 10)}${areaSlug ? `-${areaSlug}` : ""}`,
    title,
    description,
    severity,
    type,
    startTime: onset,
    endTime: expires,
    source: "aemet",
    // Con el día de inicio: el aviso de hoy y el de mañana para la misma zona
    // son avisos distintos.
    key: `aemet-${zonaCode}-${type}-${onset.slice(0, 10)}${areaSlug ? `-${areaSlug}` : ""}`,
    zone: areaDescs.join(", ") || undefined,
    detail: info.description || undefined,
    polygons: polygons.length > 0 ? polygons : undefined,
    point: polygons.length > 0 ? point : undefined,
  };
}

/**
 * Avisos vigentes para la zona. Devuelve `null` si no se pudo consultar
 * (sin red, AEMET sin `datos`, tar ilegible): no es lo mismo que "no hay
 * avisos", y quien avisa de que un aviso termina necesita distinguirlo.
 */
export async function getAEMETAlerts(
  zonaCode: string,
  subzonePatterns?: string[],
  point?: GeoPoint
): Promise<WeatherAlert[] | null> {
  try {
    const ccaa = getCCAACode(zonaCode);
    if (!ccaa) return [];

    const res = await fetch(
      `${BASE_URL}/api/avisos_cap/ultimoelaborado/area/${ccaa}`,
      {
        headers: {
          api_key: config.apiKey,
          Accept: "application/json",
        },
      }
    );
    if (res.status === 404) return [];
    if (!res.ok) return null;

    const json = await res.json();
    // 404 de AEMET en el cuerpo: no hay avisos elaborados para la comunidad.
    if (json.estado === 404) return [];
    if (!json.datos) return null;

    const tarRes = await fetch(json.datos);
    if (!tarRes.ok) return null;

    const tarBuffer = await tarRes.arrayBuffer();

    const xmlFiles = parseTar(tarBuffer);
    if (xmlFiles.length === 0) return null;

    const parser = new XMLParser({ ignoreAttributes: true });
    // Un aviso y su actualización (msgType Update) comparten id: se queda el
    // que caduque más tarde.
    const byId = new Map<string, WeatherAlert>();

    for (const xml of xmlFiles) {
      try {
        const parsed = parser.parse(xml);
        for (const alert of parseCAPAlerts(parsed, zonaCode, subzonePatterns, new Date(), point)) {
          const prev = byId.get(alert.id);
          if (!prev || new Date(alert.endTime) > new Date(prev.endTime)) byId.set(alert.id, alert);
        }
      } catch {
        // skip malformed XML
      }
    }

    return [...byId.values()];
  } catch {
    return null;
  }
}

export async function getAEMETForecast(municipioCode: string) {
  return aemetFetch<any>(`/api/prediccion/especifica/municipio/diaria/${municipioCode}`);
}

export function isAEMETConfigured(): boolean {
  return config.apiKey !== "";
}

export async function getAEMETTides(puertoCode: string) {
  return aemetFetch<any>(`/api/prediccion/maritima/puerto/${puertoCode}`);
}
