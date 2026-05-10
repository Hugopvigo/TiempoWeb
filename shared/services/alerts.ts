import type { WeatherData, WeatherAlert, WeatherCondition } from "../types/weather";

const STORM_CODES = new Set([95, 96, 99]);
const SNOW_CODES = new Set([71, 73, 75, 77, 85, 86]);
const FOG_CODES = new Set([45, 48]);

export function generateAlerts(weather: WeatherData): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  const today = weather.daily[0];
  if (!today) return alerts;

  const dateStr = new Date().toISOString().slice(0, 10);

  if (weather.current.windSpeed >= 90) {
    alerts.push(makeAlert("wind", "red", weather, dateStr));
  } else if (weather.current.windSpeed >= 65) {
    alerts.push(makeAlert("wind", "orange", weather, dateStr));
  } else if (weather.current.windSpeed >= 50) {
    alerts.push(makeAlert("wind", "yellow", weather, dateStr));
  }

  let heatSev: WeatherAlert["severity"] | null = null;
  if (weather.current.uvIndex >= 12) heatSev = "red";
  else if (weather.current.uvIndex >= 10) heatSev = "orange";
  else if (weather.current.uvIndex >= 8) heatSev = "yellow";

  if (weather.current.temperature >= 44) {
    if (heatSev !== "red") heatSev = "red";
  } else if (weather.current.temperature >= 40) {
    if (heatSev === null || heatSev === "yellow") heatSev = "orange";
  }

  if (heatSev) {
    alerts.push(makeAlert("heat", heatSev, weather, dateStr));
  }

  const hasStorm = weather.hourly.some((h) =>
    STORM_CODES.has(getWeatherCodeFromCondition(h.condition))
  );
  if (hasStorm) {
    alerts.push(makeAlert("storm", "orange", weather, dateStr));
  }

  const maxPrecip = Math.max(...weather.hourly.map((h) => h.precipitationChance));
  if (maxPrecip >= 95) {
    alerts.push(makeAlert("rain", "red", weather, dateStr));
  } else if (maxPrecip >= 90) {
    alerts.push(makeAlert("rain", "orange", weather, dateStr));
  } else if (maxPrecip >= 70) {
    alerts.push(makeAlert("rain", "yellow", weather, dateStr));
  }

  const hasSnow = weather.hourly.some((h) =>
    SNOW_CODES.has(getWeatherCodeFromCondition(h.condition))
  );
  if (hasSnow) {
    alerts.push(makeAlert("snow", "yellow", weather, dateStr));
  }

  if (weather.current.temperature <= -20) {
    alerts.push(makeAlert("cold", "red", weather, dateStr));
  } else if (weather.current.temperature <= -10) {
    alerts.push(makeAlert("cold", "orange", weather, dateStr));
  } else if (weather.current.temperature <= -5) {
    alerts.push(makeAlert("cold", "yellow", weather, dateStr));
  }

  const hasFog = FOG_CODES.has(getWeatherCodeFromCondition(weather.current.condition))
    || weather.current.visibility < 1000;
  if (hasFog) {
    alerts.push(makeAlert("fog", "yellow", weather, dateStr));
  }

  alerts.sort((a, b) => severityOrder(a.severity) - severityOrder(b.severity));

  return alerts;
}

function makeAlert(
  type: WeatherAlert["type"],
  severity: WeatherAlert["severity"],
  weather: WeatherData,
  dateStr: string
): WeatherAlert {
  const titles: Record<WeatherAlert["type"], Record<WeatherAlert["severity"], string>> = {
    rain: {
      yellow: "Lluvia significativa",
      orange: "Lluvia intensa",
      red: "Lluvia torrencial",
    },
    storm: {
      yellow: "Tormenta leve",
      orange: "Tormenta fuerte",
      red: "Tormenta extrema",
    },
    snow: {
      yellow: "Nevada",
      orange: "Nevada intensa",
      red: "Nevada extrema",
    },
    wind: {
      yellow: "Viento fuerte",
      orange: "Viento muy fuerte",
      red: "Viento extremo",
    },
    heat: {
      yellow: "UV alto / calor intenso",
      orange: "UV muy alto / ola de calor",
      red: "UV extremo / ola de calor extrema",
    },
    cold: {
      yellow: "Frío intenso",
      orange: "Ola de frío",
      red: "Frío extremo",
    },
    coastal: {
      yellow: "Aviso costero",
      orange: "Alerta costera",
      red: "Alerta costera extrema",
    },
    fog: {
      yellow: "Niebla densa",
      orange: "Niebla muy densa",
      red: "Niebla extrema",
    },
  };

  const descriptions: Record<WeatherAlert["type"], string> = {
    rain: `Probabilidad alta de precipitación en ${weather.cityName}. Consulta la previsión horaria para más detalle.`,
    storm: `Se prevén tormentas eléctricas en ${weather.cityName}. Extrema precaución y evita zonas expuestas.`,
    snow: `Se esperan nevadas en ${weather.cityName}. Las carreteras pueden verse afectadas.`,
    wind: `Rachas de viento de hasta ${Math.round(weather.current.windSpeed)} km/h en ${weather.cityName}. Toma precauciones.`,
    heat: weather.current.uvIndex >= 8
      ? `Índice UV de ${weather.current.uvIndex} en ${weather.cityName}. Usa protección solar y evita la exposición prolongada.`
      : `Temperaturas extremas en ${weather.cityName}. Mantente hidratado y evita la exposición al sol.`,
    cold: `Temperaturas bajo cero en ${weather.cityName}. Protege tuberías y toma medidas ante heladas.`,
    coastal: `Condiciones adversas en la costa de ${weather.cityName}. Consulta el estado del mar.`,
    fog: `Visibilidad reducida por niebla en ${weather.cityName}. Extrema precaución al conducir.`,
  };

  return {
    id: `local-${type}-${severity}-${weather.lat}-${weather.lon}-${dateStr}`,
    title: titles[type][severity],
    description: descriptions[type],
    severity,
    type,
    startTime: new Date().toISOString(),
    endTime: weather.daily[0]?.sunset ?? new Date(Date.now() + 12 * 3600000).toISOString(),
  };
}

function getWeatherCodeFromCondition(condition: WeatherCondition): number {
  const map: Record<WeatherCondition, number> = {
    clear: 0,
    partly_cloudy: 2,
    cloudy: 3,
    fog: 45,
    rain: 61,
    storm: 95,
    snow: 71,
    night_clear: 0,
    night_cloudy: 3,
  };
  return map[condition] ?? 0;
}

function severityOrder(s: WeatherAlert["severity"]): number {
  return s === "red" ? 0 : s === "orange" ? 1 : 2;
}
