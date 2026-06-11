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

function capEventToType(event: string): WeatherAlert["type"] | null {
  const lower = event.toLowerCase();
  if (/lluvia|precipitaci/.test(lower)) return "rain";
  if (/tormenta|rayos|eléctrica/.test(lower)) return "storm";
  if (/nieve|nevada/.test(lower)) return "snow";
  if (/viento/.test(lower)) return "wind";
  if (/calor|temperatura.*máxima|temperatura.*max/.test(lower)) return "heat";
  if (/frío|frío|temperatura.*mínima|temperatura.*min|hielo|deshielo/.test(lower)) return "cold";
  if (/costera|marítimo|marítima|costa|oleaje/.test(lower)) return "coastal";
  if (/niebla/.test(lower)) return "fog";
  if (/polvo|arena|calima/.test(lower)) return "fog";
  return null;
}

function bytesToString(bytes: Uint8Array): string {
  return new TextDecoder("utf-8").decode(bytes);
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
      files.push(bytesToString(data));
    }

    offset += paddedSize;
  }

  return files;
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
  area?: { areaDesc?: string };
}

function parseCAPAlert(parsed: any, zonaCode: string, subzonePatterns?: string[]): WeatherAlert | null {
  const alert = parsed.alert || parsed["alert"] || parsed;
  if (!alert) return null;

  let infos: CAPAlertInfo[] = [];
  if (alert.info) {
    infos = Array.isArray(alert.info) ? alert.info : [alert.info];
  }
  if (infos.length === 0) return null;

  const esInfo = infos.find((i) => i.language && i.language.startsWith("es"));
  const info = esInfo || infos[0];

  const event = info.event || "";
  const type = capEventToType(event);
  if (!type) return null;

  const capSeverity = info.severity || "";
  const severity = CAP_SEVERITY[capSeverity];
  if (!severity) return null;

  const areaDesc = info.area?.areaDesc || "";

  if (subzonePatterns && subzonePatterns.length > 0 && areaDesc) {
    const descLower = areaDesc.toLowerCase();
    const matchesSubzone = subzonePatterns.some((p) =>
      descLower.includes(p.toLowerCase())
    );
    if (!matchesSubzone) return null;

    const adminPattern = subzonePatterns[0];
    if (adminPattern && !descLower.includes(adminPattern.toLowerCase())) {
      return null;
    }
  }

  const onset = info.onset || new Date().toISOString();
  const expires = info.expires || new Date(Date.now() + 24 * 3600000).toISOString();
  const description = [info.description, areaDesc].filter(Boolean).join("\n");

  return {
    id: `aemet-${zonaCode}-${type}-${severity}-${onset.slice(0, 10)}`,
    title: info.headline || event,
    description,
    severity,
    type,
    startTime: onset,
    endTime: expires,
  };
}

export async function getAEMETAlerts(
  zonaCode: string,
  subzonePatterns?: string[]
): Promise<WeatherAlert[]> {
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
    if (!res.ok) return [];

    const json = await res.json();
    if (!json.datos) return [];

    const tarRes = await fetch(json.datos);
    if (!tarRes.ok) return [];

    const tarBuffer = await tarRes.arrayBuffer();

    const xmlFiles = parseTar(tarBuffer);
    if (xmlFiles.length === 0) return [];

    const parser = new XMLParser({ ignoreAttributes: true });
    const alerts: WeatherAlert[] = [];

    for (const xml of xmlFiles) {
      try {
        const parsed = parser.parse(xml);
        const alert = parseCAPAlert(parsed, zonaCode, subzonePatterns);
        if (alert) alerts.push(alert);
      } catch {
        // skip malformed XML
      }
    }

    return alerts;
  } catch {
    return [];
  }
}

export async function getAEMETForecast(municipioCode: string) {
  return aemetFetch<any>(`/api/prediccion/especifica/municipio/diaria/${municipioCode}`);
}

export async function getAEMETTides(puertoCode: string) {
  return aemetFetch<any>(`/api/prediccion/maritima/puerto/${puertoCode}`);
}

export function isAEMETConfigured(): boolean {
  return config.apiKey !== "";
}
