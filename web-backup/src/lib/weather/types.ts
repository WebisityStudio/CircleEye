/**
 * Weather condition types - controlled vocabulary for all weather states
 */
export type WeatherConditionType =
  | 'clear'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'heavy_rain'
  | 'thunderstorm'
  | 'snow'
  | 'heavy_snow'
  | 'blizzard'
  | 'freezing'
  | 'frost'
  | 'ice'
  | 'heatwave'
  | 'high_winds'
  | 'gale'
  | 'flood'
  | 'extreme'
  | 'unknown';

/**
 * Weather severity levels
 */
export type WeatherSeverity = 'info' | 'low' | 'moderate' | 'high' | 'severe';

/**
 * Severity band colors matching existing UI
 */
export type SeverityBand = 'Red' | 'Amber' | 'Yellow' | 'Green';

/**
 * Unified weather alert combining all sources
 */
export interface UnifiedWeatherAlert {
  id: string;
  conditionType: WeatherConditionType;
  severity: WeatherSeverity;
  severityBand: SeverityBand;

  // Display properties
  title: string;
  description: string;
  guidanceText?: string;

  // Location
  area?: string;
  lat?: number;
  lng?: number;

  // Temperature data (for freezing/heat detection)
  temperature?: number;
  feelsLike?: number;

  // Wind data
  windSpeed?: number;
  windGusts?: number;

  // Metadata
  source: 'open-meteo' | 'environment-agency' | 'met-office' | 'derived';
  updatedAt: string;
  expiresAt?: string;
}

/**
 * Severity ordering for sorting (higher = more severe)
 */
export const SEVERITY_ORDER: Record<WeatherSeverity, number> = {
  info: 0,
  low: 1,
  moderate: 2,
  high: 3,
  severe: 4,
};

/**
 * Map severity level to severity band color
 */
export function severityToBand(severity: WeatherSeverity): SeverityBand {
  switch (severity) {
    case 'severe':
      return 'Red';
    case 'high':
      return 'Amber';
    case 'moderate':
      return 'Yellow';
    case 'low':
    case 'info':
    default:
      return 'Green';
  }
}

/**
 * Map severity band to hex color
 */
export function severityBandToColor(band: SeverityBand): string {
  switch (band) {
    case 'Red':
      return '#D90429';
    case 'Amber':
      return '#F97B22';
    case 'Yellow':
      return '#F6C833';
    case 'Green':
    default:
      return '#15CC3D';
  }
}
