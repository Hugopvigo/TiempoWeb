const RAINVIEWER_API = "https://api.rainviewer.com/public/weather-maps.json";

export interface RainViewerData {
  host: string;
  radarPast: { time: number; path: string }[];
  radarNowcast: { time: number; path: string }[];
  satelliteInfrared: { time: number; path: string }[];
}

let cached: RainViewerData | null = null;
let cacheTime = 0;
const CACHE_TTL = 10 * 60 * 1000;

export async function getRainViewerData(): Promise<RainViewerData | null> {
  if (cached && Date.now() - cacheTime < CACHE_TTL) return cached;
  try {
    const res = await fetch(RAINVIEWER_API);
    if (!res.ok) return cached;
    const json = await res.json();
    cached = {
      host: json.host,
      radarPast: json.radar?.past ?? [],
      radarNowcast: json.radar?.nowcast ?? [],
      satelliteInfrared: json.satellite?.infrared ?? [],
    };
    cacheTime = Date.now();
    return cached;
  } catch {
    return cached;
  }
}

export function getRadarTileUrl(data: RainViewerData, frameIndex?: number): string | null {
  const frames = [...data.radarPast, ...data.radarNowcast];
  if (frames.length === 0) return null;
  const idx = frameIndex ?? frames.length - 1;
  const frame = frames[Math.min(idx, frames.length - 1)];
  return `${data.host}${frame.path}/256/{z}/{x}/{y}/6/1_1.png`;
}

export function getSatelliteTileUrl(data: RainViewerData, frameIndex?: number): string | null {
  const frames = data.satelliteInfrared;
  if (frames.length === 0) {
    return `${data.host}/v2/satellite/infrared/256/{z}/{x}/{y}/0/0_0.png`;
  }
  const idx = frameIndex ?? frames.length - 1;
  const frame = frames[Math.min(idx, frames.length - 1)];
  return `${data.host}${frame.path}/256/{z}/{x}/{y}/0/0_0.png`;
}

export function getOpenWeatherMapTileUrl(layer: string, apiKey: string): string | null {
  if (!apiKey) return null;
  return `https://tile.openweathermap.org/map/${layer}/{z}/{x}/{y}.png?appid=${apiKey}`;
}

export function getOpenWeatherMapV2TileUrl(operation: string, apiKey: string): string | null {
  if (!apiKey) return null;
  return `https://maps.openweathermap.org/maps/2.0/weather/${operation}/{z}/{x}/{y}?appid=${apiKey}`;
}

export function getRadarTimestamps(data: RainViewerData): number[] {
  return [...data.radarPast, ...data.radarNowcast].map((f) => f.time);
}
