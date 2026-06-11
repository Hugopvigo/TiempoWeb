import type { WeatherData, MarineData, AirQualityData } from "../types/weather";
import { weatherCodeToCondition, conditionToDescription, conditionToIcon } from "../constants/weather";

const BASE_URL = "https://api.open-meteo.com/v1";
const AQ_BASE_URL = "https://air-quality-api.open-meteo.com/v1";

interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    uv_index: number;
    pressure_msl: number;
    visibility: number;
    is_day: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    precipitation_probability: number[];
    is_day: number[];
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
    precipitation_probability_max: number[];
    sunrise: string[];
    sunset: string[];
  };
}

export async function getWeather(lat: number, lon: number, cityName: string): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "weather_code",
      "wind_speed_10m",
      "wind_direction_10m",
      "uv_index",
      "pressure_msl",
      "visibility",
      "is_day",
    ].join(","),
    hourly: [
      "temperature_2m",
      "weather_code",
      "precipitation_probability",
      "is_day",
    ].join(","),
    daily: [
      "temperature_2m_max",
      "temperature_2m_min",
      "weather_code",
      "precipitation_probability_max",
      "sunrise",
      "sunset",
    ].join(","),
    timezone: "auto",
    forecast_days: "7",
  });

  const res = await fetch(`${BASE_URL}/forecast?${params}`);
  if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`);

  const data: OpenMeteoResponse = await res.json();
  const current = data.current;
  const isDay = current.is_day === 1;

  // current.time viene en la zona horaria de la ciudad, igual que hourly.time
  const currentHourPrefix = (current.time ?? "").slice(0, 13);
  const currentHourIndex = data.hourly.time.findIndex(
    (t) => t.slice(0, 13) === currentHourPrefix
  );
  const fallbackHourIndex = currentHourIndex >= 0 ? currentHourIndex : 0;

  return {
    current: {
      temperature: current.temperature_2m,
      feelsLike: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      windDirection: current.wind_direction_10m,
      uvIndex: current.uv_index,
      pressure: current.pressure_msl,
      visibility: current.visibility,
      condition: weatherCodeToCondition(current.weather_code, isDay),
      description: conditionToDescription[weatherCodeToCondition(current.weather_code, isDay)],
      icon: conditionToIcon[weatherCodeToCondition(current.weather_code, isDay)],
    },
    hourly: data.hourly.time.slice(fallbackHourIndex, fallbackHourIndex + 24).map((time, i) => {
      const idx = fallbackHourIndex + i;
      const cond = weatherCodeToCondition(
        data.hourly.weather_code[idx],
        data.hourly.is_day[idx] === 1
      );
      return {
        time,
        temperature: data.hourly.temperature_2m[idx],
        condition: cond,
        icon: conditionToIcon[cond],
        precipitationChance: data.hourly.precipitation_probability[idx],
      };
    }),
    daily: data.daily.time.map((date, i) => {
      const cond = weatherCodeToCondition(data.daily.weather_code[i], true);
      return {
        date,
        tempMax: data.daily.temperature_2m_max[i],
        tempMin: data.daily.temperature_2m_min[i],
        condition: cond,
        icon: conditionToIcon[cond],
        precipitationChance: data.daily.precipitation_probability_max[i],
        sunrise: data.daily.sunrise[i],
        sunset: data.daily.sunset[i],
      };
    }),
    lat,
    lon,
    cityName,
    updatedAt: Date.now(),
  };
}

export async function searchCities(query: string, signal?: AbortSignal) {
  const params = new URLSearchParams({
    name: query,
    count: "10",
    language: "es",
    format: "json",
  });

  const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`, { signal });
  if (!res.ok) throw new Error(`Geocoding error: ${res.status}`);

  const data = await res.json();
  if (!data.results) return [];

  return data.results.map((r: any) => ({
    id: `${r.id ?? `${Math.round(r.latitude * 100)}-${Math.round(r.longitude * 100)}`}`,
    name: r.name,
    country: r.country ?? "",
    admin1: r.admin1 ?? "",
    lat: Math.round(r.latitude * 10000) / 10000,
    lon: Math.round(r.longitude * 10000) / 10000,
  }));
}

interface MarineApiResponse {
  latitude: number;
  longitude: number;
  hourly: {
    time: string[];
    wave_height: number[];
    wave_direction: number[];
    wave_period: number[];
    sea_level_height_msl: number[];
  };
  daily: {
    time: string[];
    wave_height_max: number[];
    wave_direction_dominant: number[];
    wave_period_max: number[];
  };
}

export async function getMarineWeather(lat: number, lon: number): Promise<MarineData> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    hourly: "wave_height,wave_direction,wave_period,sea_level_height_msl",
    daily: "wave_height_max,wave_direction_dominant,wave_period_max",
    timezone: "auto",
    forecast_days: "7",
  });

  const res = await fetch(`https://marine-api.open-meteo.com/v1/marine?${params}`);
  if (!res.ok) throw new Error(`Marine API error: ${res.status}`);

  const data: MarineApiResponse = await res.json();

  return {
    hourly: {
      time: data.hourly.time,
      waveHeight: data.hourly.wave_height,
      waveDirection: data.hourly.wave_direction,
      wavePeriod: data.hourly.wave_period,
      seaLevelHeight: data.hourly.sea_level_height_msl,
    },
    daily: {
      date: data.daily.time,
      waveHeightMax: data.daily.wave_height_max,
      waveDirectionDominant: data.daily.wave_direction_dominant,
      wavePeriodMax: data.daily.wave_period_max,
    },
  };
}

interface AirQualityApiResponse {
  latitude: number;
  longitude: number;
  current: {
    pm2_5: number;
    pm10: number;
    ozone: number;
    nitrogen_dioxide: number;
    european_aqi: number;
    grass_pollen: number | null;
    olive_pollen: number | null;
    birch_pollen: number | null;
  };
  hourly: {
    time: string[];
    european_aqi: number[];
    pm2_5: number[];
    pm10: number[];
    ozone: number[];
    nitrogen_dioxide: number[];
  };
}

export async function getAirQuality(lat: number, lon: number): Promise<AirQualityData> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: "pm2_5,pm10,ozone,nitrogen_dioxide,european_aqi,grass_pollen,olive_pollen,birch_pollen",
    hourly: "european_aqi,pm2_5,pm10,ozone,nitrogen_dioxide",
    timezone: "auto",
    forecast_days: "1",
  });

  const res = await fetch(`${AQ_BASE_URL}/air-quality?${params}`);
  if (!res.ok) throw new Error(`Air Quality API error: ${res.status}`);

  const data: AirQualityApiResponse = await res.json();

  return {
    current: {
      europeanAqi: data.current.european_aqi,
      pm25: data.current.pm2_5,
      pm10: data.current.pm10,
      ozone: data.current.ozone,
      nitrogenDioxide: data.current.nitrogen_dioxide,
      grassPollen: data.current.grass_pollen,
      olivePollen: data.current.olive_pollen,
      birchPollen: data.current.birch_pollen,
    },
    hourly: {
      time: data.hourly.time,
      europeanAqi: data.hourly.european_aqi,
      pm25: data.hourly.pm2_5,
      pm10: data.hourly.pm10,
    },
  };
}
