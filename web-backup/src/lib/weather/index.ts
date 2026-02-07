// Types
export type {
  WeatherConditionType,
  WeatherSeverity,
  SeverityBand,
  UnifiedWeatherAlert,
} from './types';

export { SEVERITY_ORDER, severityToBand, severityBandToColor } from './types';

// WMO Code Mapping
export type { WmoCodeInfo } from './wmoCodeMapper';
export {
  WMO_CODE_MAP,
  mapWmoCode,
  isPrecipitation,
  isFrozenPrecipitation,
  isDangerous,
  getSupportedWmoCodes,
} from './wmoCodeMapper';

// Temperature & Wind Thresholds
export {
  TEMPERATURE_THRESHOLDS,
  WIND_THRESHOLDS,
  deriveTemperatureAlert,
  deriveWindAlert,
  isBlizzardCondition,
} from './temperatureThresholds';
export type { DerivedAlert } from './temperatureThresholds';

// Icons
export { WEATHER_ICONS, WEATHER_ICON_NAMES, getWeatherIcon } from './icons';

// Guidance
export {
  CONDITION_DESCRIPTIONS,
  CONDITION_GUIDANCE,
  getConditionDescription,
  getConditionGuidance,
  getFullConditionInfo,
} from './guidance';
