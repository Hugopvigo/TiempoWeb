const SYNODIC_MONTH = 29.53058867;
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14, 0);

export interface LunarCalcResult {
  phaseIndex: number;
  phase: string;
  illumination: number;
}

const PHASE_NAMES = [
  "Luna nueva",
  "Creciente",
  "Cuarto creciente",
  "Gibosa creciente",
  "Luna llena",
  "Gibosa menguante",
  "Cuarto menguante",
  "Menguante",
];

export function calculateMoonPhase(date: Date): LunarCalcResult {
  const diffMs = date.getTime() - KNOWN_NEW_MOON;
  const diffDays = diffMs / 86400000;
  const age = ((diffDays % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;

  const phaseIndex = Math.floor((age / SYNODIC_MONTH) * 8) % 8;
  const illumination = Math.round((1 - Math.cos((2 * Math.PI * age) / SYNODIC_MONTH)) / 2 * 100);

  return {
    phaseIndex,
    phase: PHASE_NAMES[phaseIndex],
    illumination,
  };
}

export function calculateMoonTimes(
  date: Date,
  lat: number,
  lon: number
): { moonrise?: string; moonset?: string } {
  const rad = Math.PI / 180;

  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  const N = Math.floor(12.37 * (year - 2000) + ((month - 1) + day / 30.4) * 0.78);
  const theta0 = 218.3164 + 13.176396 * N;
  const alpha0 = 83.353 + 0.8833 * N;
  const thetaM = theta0 - alpha0;

  const sinDec = Math.sin(rad * thetaM) * 0.39779;
  const cosDec = Math.sqrt(1 - sinDec * sinDec);
  

  const cosH = (Math.sin(rad * -0.8333) - Math.sin(rad * lat) * sinDec) /
    (Math.cos(rad * lat) * cosDec);

  if (Math.abs(cosH) > 1) return {};

  const H0 = Math.acos(cosH) / rad;
  const T0 = (day + (lon / 360)) % 1;
  const transit = (T0 + H0 / 360) % 1;
  const rise = (T0 - H0 / 360 + 1) % 1;

  const formatTime = (fraction: number): string => {
    const totalMin = Math.round(fraction * 1440);
    const h = Math.floor(totalMin / 60) % 24;
    const m = totalMin % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  return {
    moonrise: formatTime(rise),
    moonset: formatTime(transit),
  };
}
