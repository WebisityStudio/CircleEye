import type { LucideIcon } from 'lucide-react';
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  AlertTriangle,
  Sun,
  Snowflake,
  Wind,
  Waves,
  Thermometer,
} from 'lucide-react';
import type { WeatherConditionType } from './types';

/**
 * Map weather condition types to lucide-react icons
 */
export const WEATHER_ICONS: Record<WeatherConditionType, LucideIcon> = {
  clear: Sun,
  cloudy: Cloud,
  fog: CloudFog,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  heavy_rain: CloudRain,
  thunderstorm: CloudLightning,
  snow: CloudSnow,
  heavy_snow: CloudSnow,
  blizzard: CloudSnow,
  freezing: Thermometer,
  frost: Snowflake,
  ice: Snowflake,
  heatwave: Thermometer,
  high_winds: Wind,
  gale: Wind,
  flood: Waves,
  extreme: AlertTriangle,
  unknown: Cloud,
};

/**
 * Get the appropriate icon for a weather condition
 * @param condition Weather condition type
 * @returns Lucide icon component
 */
export function getWeatherIcon(condition: WeatherConditionType): LucideIcon {
  return WEATHER_ICONS[condition] ?? Cloud;
}

/**
 * Icon name strings for contexts where component imports aren't available
 */
export const WEATHER_ICON_NAMES: Record<WeatherConditionType, string> = {
  clear: 'Sun',
  cloudy: 'Cloud',
  fog: 'CloudFog',
  drizzle: 'CloudDrizzle',
  rain: 'CloudRain',
  heavy_rain: 'CloudRain',
  thunderstorm: 'CloudLightning',
  snow: 'CloudSnow',
  heavy_snow: 'CloudSnow',
  blizzard: 'CloudSnow',
  freezing: 'Thermometer',
  frost: 'Snowflake',
  ice: 'Snowflake',
  heatwave: 'Thermometer',
  high_winds: 'Wind',
  gale: 'Wind',
  flood: 'Waves',
  extreme: 'AlertTriangle',
  unknown: 'Cloud',
};
