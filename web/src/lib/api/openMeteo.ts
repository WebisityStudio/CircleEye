/**
 * Open-Meteo API client
 * Free weather API - no API key required
 * https://open-meteo.com/en/docs
 */
import { fetchJson } from './http';

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';

/**
 * Current weather data from Open-Meteo
 */
export interface OpenMeteoCurrentWeather {
  time: string;
  temperature_2m: number;
  apparent_temperature: number;
  weather_code: number;
  wind_speed_10m: number;
  wind_gusts_10m: number;
  relative_humidity_2m: number;
  is_day: number;
}

/**
 * Full Open-Meteo API response
 */
export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units?: Record<string, string>;
  current?: OpenMeteoCurrentWeather;
}

/**
 * Fetch current weather conditions from Open-Meteo
 * @param lat Latitude
 * @param lng Longitude
 * @returns Current weather data
 */
export async function fetchCurrentWeather(
  lat: number,
  lng: number
): Promise<OpenMeteoResponse> {
  const url = new URL(OPEN_METEO_BASE);
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lng));
  url.searchParams.set(
    'current',
    [
      'temperature_2m',
      'apparent_temperature',
      'weather_code',
      'wind_speed_10m',
      'wind_gusts_10m',
      'relative_humidity_2m',
      'is_day',
    ].join(',')
  );
  url.searchParams.set('timezone', 'auto');

  return fetchJson<OpenMeteoResponse>(url.toString(), { timeoutMs: 15000 });
}

/**
 * Check if Open-Meteo response has valid current data
 */
export function hasCurrentData(response: OpenMeteoResponse): response is OpenMeteoResponse & {
  current: OpenMeteoCurrentWeather;
} {
  return response.current !== undefined && typeof response.current.weather_code === 'number';
}
