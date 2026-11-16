import type { WeatherData, WeatherAlert } from "../types/weather";

type Severity = WeatherAlert["severity"];
type Thresholds = readonly [yellow: number, orange: number, red: number];

// Umbrales del Plan Meteoalerta de AEMET (Anexo 1, "Umbrales y niveles de
// aviso", v1 31-may-2022). Varían por zona; estos son los valores más
// frecuentes del anexo (entre el 65 % y el 85 % de las 182 zonas) y sirven
// cuando la app no tiene aviso oficial para ese fenómeno. Zonas de montaña y
// litoral mediterráneo tienen umbrales distintos: ahí el aviso local puede
// quedarse corto o pasarse; el oficial de AEMET siempre manda.
export const UMBRAL = {
  tempMax: [36, 39, 42] as Thresholds,         // °C, máxima del día
  tempMin: [-4, -8, -12] as Thresholds,        // °C, mínima del día
  racha: [70, 90, 130] as Thresholds,          // km/h, racha máxima
  lluvia1h: [15, 30, 60] as Thresholds,        // mm en 1 h
  lluvia12h: [40, 80, 120] as Thresholds,      // mm en 12 h
  nieve24h: [2, 5, 20] as Thresholds,          // cm en 24 h
};

function levelAbove(value: number, [y, o, r]: Thresholds): Severity | null {
  if (value >= r) return "red";
  if (value >= o) return "orange";
  if (value >= y) return "yellow";
  return null;
}

function levelBelow(value: number, [y, o, r]: Thresholds): Severity | null {
  if (value <= r) return "red";
  if (value <= o) return "orange";
  if (value <= y) return "yellow";
  return null;
}

function maxWindowSum(values: number[], window: number): number {
  let best = 0;
  for (let i = 0; i < values.length; i++) {
    let sum = 0;
    for (let j = i; j < Math.min(i + window, values.length); j++) sum += values[j];
    if (sum > best) best = sum;
  }
  return best;
}

export function generateAlerts(weather: WeatherData): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  const today = weather.daily[0];
  if (!today) return alerts;

  const dateStr = new Date().toISOString().slice(0, 10);
  const next24 = weather.hourly.slice(0, 24);
  const push = (type: WeatherAlert["type"], severity: Severity | null, detail: string) => {
    if (severity) alerts.push(makeAlert(type, severity, detail, weather, dateStr));
  };

  const maxGust = Math.max(0, ...next24.map((h) => h.windGusts));
  push("wind", levelAbove(maxGust, UMBRAL.racha), `Rachas de hasta ${Math.round(maxGust)} km/h`);

  push("heat", levelAbove(today.tempMax, UMBRAL.tempMax), `Máxima prevista de ${Math.round(today.tempMax)} °C`);
  push("cold", levelBelow(today.tempMin, UMBRAL.tempMin), `Mínima prevista de ${Math.round(today.tempMin)} °C`);

  const max1h = Math.max(0, ...next24.map((h) => h.precipitation));
  const max12h = maxWindowSum(next24.map((h) => h.precipitation), 12);
  const rain1h = levelAbove(max1h, UMBRAL.lluvia1h);
  const rain12h = levelAbove(max12h, UMBRAL.lluvia12h);
  const rainSev = worst(rain1h, rain12h);
  push(
    "rain",
    rainSev,
    rainSev === rain1h
      ? `Hasta ${Math.round(max1h)} mm en una hora`
      : `Hasta ${Math.round(max12h)} mm acumulados en 12 horas`
  );

  const snow24h = next24.reduce((acc, h) => acc + h.snowfall, 0);
  push("snow", levelAbove(snow24h, UMBRAL.nieve24h), `Hasta ${snow24h.toFixed(snow24h < 10 ? 1 : 0)} cm de nieve en 24 horas`);

  // Tormentas: Meteoalerta no fija un umbral numérico ("múltiples" variables).
  if (next24.some((h) => h.condition === "storm")) {
    push("storm", "yellow", "Tormentas previstas en las próximas horas");
  }

  if (weather.current.condition === "fog" || weather.current.visibility < 1000) {
    push("fog", "yellow", `Visibilidad de ${Math.round(weather.current.visibility)} m`);
  }

  alerts.sort((a, b) => severityOrder(a.severity) - severityOrder(b.severity));
  return alerts;
}

function worst(a: Severity | null, b: Severity | null): Severity | null {
  if (!a) return b;
  if (!b) return a;
  return severityOrder(a) <= severityOrder(b) ? a : b;
}

const TITLES: Record<WeatherAlert["type"], Record<Severity, string>> = {
  rain: { yellow: "Lluvias", orange: "Lluvias intensas", red: "Lluvias torrenciales" },
  storm: { yellow: "Tormentas", orange: "Tormentas fuertes", red: "Tormentas muy fuertes" },
  snow: { yellow: "Nevadas", orange: "Nevadas intensas", red: "Nevadas muy intensas" },
  wind: { yellow: "Viento fuerte", orange: "Viento muy fuerte", red: "Viento huracanado" },
  heat: { yellow: "Calor intenso", orange: "Calor muy intenso", red: "Calor extremo" },
  cold: { yellow: "Frío intenso", orange: "Frío muy intenso", red: "Frío extremo" },
  coastal: { yellow: "Fenómenos costeros", orange: "Fenómenos costeros importantes", red: "Fenómenos costeros extremos" },
  fog: { yellow: "Niebla densa", orange: "Niebla muy densa", red: "Niebla extrema" },
};

const ADVICE: Record<WeatherAlert["type"], string> = {
  rain: "Posibles acumulaciones de agua y crecidas en cauces pequeños.",
  storm: "Evita zonas abiertas y resguarda objetos que pueda arrastrar el viento.",
  snow: "Las carreteras pueden verse afectadas. Consulta el estado de la red viaria.",
  wind: "Precaución con objetos sueltos, andamios y arbolado.",
  heat: "Hidrátate y evita la exposición al sol en las horas centrales.",
  cold: "Riesgo de heladas. Protege tuberías y cultivos.",
  coastal: "Precaución en paseos marítimos y actividades en el mar.",
  fog: "Extrema la precaución al conducir.",
};

function makeAlert(
  type: WeatherAlert["type"],
  severity: Severity,
  detail: string,
  weather: WeatherData,
  dateStr: string
): WeatherAlert {
  return {
    id: `local-${type}-${severity}-${weather.lat}-${weather.lon}-${dateStr}`,
    title: TITLES[type][severity],
    description: `${detail} en ${weather.cityName}. ${ADVICE[type]}`,
    severity,
    type,
    startTime: new Date().toISOString(),
    // Misma ventana que se evalúa (las próximas 24 h). Antes era la puesta de
    // sol de hoy y de noche el banner decía "Hasta las 18:00" ya pasadas.
    endTime: new Date(Date.now() + 24 * 3600000).toISOString(),
    source: "local",
    key: `local-${type}-${weather.lat}-${weather.lon}`,
    zone: weather.cityName,
    detail: `${detail}.`,
  };
}

function severityOrder(s: Severity): number {
  return s === "red" ? 0 : s === "orange" ? 1 : 2;
}
