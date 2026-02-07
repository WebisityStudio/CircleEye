import type { WeatherConditionType, WeatherSeverity } from './types';

/**
 * WMO Weather interpretation codes (WW)
 * https://open-meteo.com/en/docs - see "WMO Weather interpretation codes"
 */
export interface WmoCodeInfo {
  condition: WeatherConditionType;
  label: string;
  severity: WeatherSeverity;
}

/**
 * Complete mapping of WMO codes (0-99) to weather conditions
 */
export const WMO_CODE_MAP: Record<number, WmoCodeInfo> = {
  // Clear / Partly Cloudy
  0: { condition: 'clear', label: 'Clear sky', severity: 'info' },
  1: { condition: 'clear', label: 'Mainly clear', severity: 'info' },
  2: { condition: 'cloudy', label: 'Partly cloudy', severity: 'info' },
  3: { condition: 'cloudy', label: 'Overcast', severity: 'info' },

  // Fog
  45: { condition: 'fog', label: 'Fog', severity: 'moderate' },
  48: { condition: 'fog', label: 'Depositing rime fog', severity: 'moderate' },

  // Drizzle
  51: { condition: 'drizzle', label: 'Light drizzle', severity: 'low' },
  53: { condition: 'drizzle', label: 'Moderate drizzle', severity: 'low' },
  55: { condition: 'drizzle', label: 'Dense drizzle', severity: 'low' },

  // Freezing drizzle
  56: { condition: 'freezing', label: 'Light freezing drizzle', severity: 'moderate' },
  57: { condition: 'freezing', label: 'Dense freezing drizzle', severity: 'high' },

  // Rain
  61: { condition: 'rain', label: 'Slight rain', severity: 'low' },
  63: { condition: 'rain', label: 'Moderate rain', severity: 'low' },
  65: { condition: 'heavy_rain', label: 'Heavy rain', severity: 'moderate' },

  // Freezing rain
  66: { condition: 'freezing', label: 'Light freezing rain', severity: 'high' },
  67: { condition: 'ice', label: 'Heavy freezing rain', severity: 'severe' },

  // Snow fall
  71: { condition: 'snow', label: 'Slight snow fall', severity: 'moderate' },
  73: { condition: 'snow', label: 'Moderate snow fall', severity: 'moderate' },
  75: { condition: 'heavy_snow', label: 'Heavy snow fall', severity: 'high' },

  // Snow grains
  77: { condition: 'snow', label: 'Snow grains', severity: 'low' },

  // Rain showers
  80: { condition: 'rain', label: 'Slight rain showers', severity: 'low' },
  81: { condition: 'rain', label: 'Moderate rain showers', severity: 'low' },
  82: { condition: 'heavy_rain', label: 'Violent rain showers', severity: 'high' },

  // Snow showers
  85: { condition: 'snow', label: 'Slight snow showers', severity: 'moderate' },
  86: { condition: 'heavy_snow', label: 'Heavy snow showers', severity: 'high' },

  // Thunderstorm
  95: { condition: 'thunderstorm', label: 'Thunderstorm', severity: 'high' },
  96: { condition: 'thunderstorm', label: 'Thunderstorm with slight hail', severity: 'severe' },
  99: { condition: 'thunderstorm', label: 'Thunderstorm with heavy hail', severity: 'severe' },
};

/**
 * Default fallback for unknown WMO codes
 */
const UNKNOWN_CODE: WmoCodeInfo = {
  condition: 'unknown',
  label: 'Unknown conditions',
  severity: 'info',
};

/**
 * Map a WMO weather code to condition info
 * @param code WMO weather interpretation code (0-99)
 * @returns Condition info with type, label, and severity
 */
export function mapWmoCode(code: number): WmoCodeInfo {
  return WMO_CODE_MAP[code] ?? UNKNOWN_CODE;
}

/**
 * Check if a WMO code represents precipitation
 */
export function isPrecipitation(code: number): boolean {
  // Drizzle: 51-57, Rain: 61-67, Snow: 71-77, Showers: 80-86, Thunderstorm: 95-99
  return (
    (code >= 51 && code <= 57) ||
    (code >= 61 && code <= 67) ||
    (code >= 71 && code <= 77) ||
    (code >= 80 && code <= 86) ||
    (code >= 95 && code <= 99)
  );
}

/**
 * Check if a WMO code represents frozen precipitation
 */
export function isFrozenPrecipitation(code: number): boolean {
  // Freezing drizzle: 56-57, Freezing rain: 66-67, Snow: 71-77, 85-86
  return (
    code === 56 ||
    code === 57 ||
    code === 66 ||
    code === 67 ||
    (code >= 71 && code <= 77) ||
    code === 85 ||
    code === 86
  );
}

/**
 * Check if a WMO code represents dangerous conditions
 */
export function isDangerous(code: number): boolean {
  const info = mapWmoCode(code);
  return info.severity === 'high' || info.severity === 'severe';
}

/**
 * Get all supported WMO codes
 */
export function getSupportedWmoCodes(): number[] {
  return Object.keys(WMO_CODE_MAP).map(Number);
}
