import type { WeatherConditionType, WeatherSeverity } from './types';

/**
 * Temperature thresholds in Celsius
 */
export const TEMPERATURE_THRESHOLDS = {
  // Cold conditions
  FROST_WARNING: 2, // Frost likely
  FREEZING: 0, // At or below freezing
  SEVERE_COLD: -5, // Severe cold
  EXTREME_COLD: -10, // Dangerous cold

  // Heat conditions
  WARM: 25, // Warm
  HOT: 30, // Hot
  HEATWAVE: 32, // Heatwave threshold
  EXTREME_HEAT: 35, // Dangerous heat
} as const;

/**
 * Wind thresholds in km/h
 */
export const WIND_THRESHOLDS = {
  BREEZY: 30, // Noticeable wind
  HIGH_WINDS: 50, // High winds
  VERY_HIGH: 65, // Very high winds
  GALE: 80, // Gale force gusts
  STORM: 100, // Storm force
} as const;

export interface DerivedAlert {
  condition: WeatherConditionType;
  severity: WeatherSeverity;
  title: string;
  description: string;
}

/**
 * Derive temperature-based weather alerts
 * @param tempCelsius Current temperature in Celsius
 * @param feelsLike Apparent/feels-like temperature (optional)
 * @returns Derived alert or null if no alert warranted
 */
export function deriveTemperatureAlert(
  tempCelsius: number,
  feelsLike?: number
): DerivedAlert | null {
  const effectiveTemp = feelsLike ?? tempCelsius;

  // Extreme cold
  if (effectiveTemp <= TEMPERATURE_THRESHOLDS.EXTREME_COLD) {
    return {
      condition: 'freezing',
      severity: 'severe',
      title: 'Extreme Cold Warning',
      description: `Dangerously cold: ${Math.round(tempCelsius)}°C${feelsLike !== undefined ? ` (feels like ${Math.round(feelsLike)}°C)` : ''}`,
    };
  }

  // Severe cold
  if (effectiveTemp <= TEMPERATURE_THRESHOLDS.SEVERE_COLD) {
    return {
      condition: 'freezing',
      severity: 'high',
      title: 'Severe Cold',
      description: `Very cold conditions: ${Math.round(tempCelsius)}°C${feelsLike !== undefined ? ` (feels like ${Math.round(feelsLike)}°C)` : ''}`,
    };
  }

  // Freezing
  if (effectiveTemp <= TEMPERATURE_THRESHOLDS.FREEZING) {
    return {
      condition: 'freezing',
      severity: 'moderate',
      title: 'Freezing Conditions',
      description: `Temperature at or below freezing: ${Math.round(tempCelsius)}°C`,
    };
  }

  // Frost warning
  if (effectiveTemp <= TEMPERATURE_THRESHOLDS.FROST_WARNING) {
    return {
      condition: 'frost',
      severity: 'low',
      title: 'Frost Possible',
      description: `Frost likely: ${Math.round(tempCelsius)}°C`,
    };
  }

  // Extreme heat
  if (effectiveTemp >= TEMPERATURE_THRESHOLDS.EXTREME_HEAT) {
    return {
      condition: 'heatwave',
      severity: 'severe',
      title: 'Extreme Heat Warning',
      description: `Dangerously hot: ${Math.round(tempCelsius)}°C${feelsLike !== undefined ? ` (feels like ${Math.round(feelsLike)}°C)` : ''}`,
    };
  }

  // Heatwave
  if (effectiveTemp >= TEMPERATURE_THRESHOLDS.HEATWAVE) {
    return {
      condition: 'heatwave',
      severity: 'high',
      title: 'Heatwave',
      description: `Very hot conditions: ${Math.round(tempCelsius)}°C${feelsLike !== undefined ? ` (feels like ${Math.round(feelsLike)}°C)` : ''}`,
    };
  }

  // Hot
  if (effectiveTemp >= TEMPERATURE_THRESHOLDS.HOT) {
    return {
      condition: 'heatwave',
      severity: 'moderate',
      title: 'Hot Weather',
      description: `Hot conditions: ${Math.round(tempCelsius)}°C`,
    };
  }

  return null; // No temperature-based alert
}

/**
 * Derive wind-based weather alerts
 * @param windSpeedKmh Wind speed in km/h
 * @param gustsKmh Wind gusts in km/h (optional)
 * @returns Derived alert or null if no alert warranted
 */
export function deriveWindAlert(
  windSpeedKmh: number,
  gustsKmh?: number
): DerivedAlert | null {
  const maxWind = Math.max(windSpeedKmh, gustsKmh ?? 0);

  // Storm force
  if (maxWind >= WIND_THRESHOLDS.STORM) {
    return {
      condition: 'gale',
      severity: 'severe',
      title: 'Storm Force Winds',
      description: `Extremely dangerous winds up to ${Math.round(maxWind)} km/h`,
    };
  }

  // Gale force
  if (maxWind >= WIND_THRESHOLDS.GALE) {
    return {
      condition: 'gale',
      severity: 'high',
      title: 'Gale Force Winds',
      description: `Wind gusts up to ${Math.round(maxWind)} km/h`,
    };
  }

  // Very high winds
  if (maxWind >= WIND_THRESHOLDS.VERY_HIGH) {
    return {
      condition: 'high_winds',
      severity: 'moderate',
      title: 'Very High Winds',
      description: `Wind speeds up to ${Math.round(maxWind)} km/h`,
    };
  }

  // High winds
  if (maxWind >= WIND_THRESHOLDS.HIGH_WINDS) {
    return {
      condition: 'high_winds',
      severity: 'low',
      title: 'High Winds',
      description: `Windy conditions: ${Math.round(windSpeedKmh)} km/h`,
    };
  }

  return null; // No wind-based alert
}

/**
 * Check if conditions qualify as a blizzard
 * (heavy snow + high winds + low visibility implied)
 */
export function isBlizzardCondition(
  wmoCode: number,
  windSpeedKmh: number,
  tempCelsius: number
): boolean {
  // Heavy snow (75, 86) or snow (71, 73, 85) with high winds and freezing temps
  const isSnowCode = [71, 73, 75, 85, 86].includes(wmoCode);
  const isHighWind = windSpeedKmh >= WIND_THRESHOLDS.HIGH_WINDS;
  const isFreezing = tempCelsius <= TEMPERATURE_THRESHOLDS.FREEZING;

  return isSnowCode && isHighWind && isFreezing;
}
