import type { WeatherConditionType } from './types';

/**
 * Short descriptions for each weather condition
 */
export const CONDITION_DESCRIPTIONS: Record<WeatherConditionType, string> = {
  clear: 'Clear conditions with good visibility.',
  cloudy: 'Cloudy skies but no precipitation expected.',
  fog: 'Reduced visibility due to fog. Take care on roads.',
  drizzle: 'Light drizzle. Roads may be slippery.',
  rain: 'Rain expected. Carry an umbrella.',
  heavy_rain: 'Heavy rain may cause surface water and localised flooding.',
  thunderstorm: 'Thunderstorms expected. Avoid exposed areas.',
  snow: 'Snow expected. Travel may be affected.',
  heavy_snow: 'Heavy snow likely. Consider postponing travel.',
  blizzard: 'Blizzard conditions. Stay indoors if possible.',
  freezing: 'Freezing conditions. Watch for ice on roads and paths.',
  frost: 'Frost likely overnight. Protect vulnerable plants.',
  ice: 'Icy conditions. Extreme care needed on roads and pavements.',
  heatwave: 'High temperatures. Stay hydrated and avoid prolonged sun exposure.',
  high_winds: 'High winds expected. Secure loose objects.',
  gale: 'Gale force winds. Avoid unnecessary travel.',
  flood: 'Flood warning in effect. Avoid flood water.',
  extreme: 'Extreme weather conditions. Follow official advice.',
  unknown: 'Weather conditions uncertain. Check official services.',
};

/**
 * Safety guidance for each weather condition
 */
export const CONDITION_GUIDANCE: Record<WeatherConditionType, string> = {
  clear: 'Enjoy the weather!',
  cloudy: 'No special precautions needed.',
  fog: 'Use headlights when driving. Allow extra time for journeys.',
  drizzle: 'Waterproof clothing recommended.',
  rain: 'Waterproof jacket and umbrella advised.',
  heavy_rain: 'Avoid driving through standing water. Watch for flash floods.',
  thunderstorm: 'Stay indoors. Unplug sensitive electronics. Avoid trees.',
  snow: 'Clear paths and driveways. Check on vulnerable neighbours.',
  heavy_snow: 'Only travel if essential. Keep emergency supplies.',
  blizzard: 'Do not travel. Keep warm and stay informed.',
  freezing: 'Dress in layers. Check pipes for freezing.',
  frost: 'De-ice car windows before driving. Drive carefully.',
  ice: 'Walk carefully with small steps. Consider grit/salt for paths.',
  heatwave: 'Drink plenty of water. Check on elderly neighbours. Avoid midday sun.',
  high_winds: 'Secure garden furniture and bins. Take care when driving.',
  gale: 'Stay indoors if possible. Watch for falling debris and trees.',
  flood: 'Never walk or drive through flood water. Move valuables upstairs.',
  extreme: 'Follow local authority and emergency service guidance.',
  unknown: 'Check official weather services for updates.',
};

/**
 * Get the description for a weather condition
 */
export function getConditionDescription(condition: WeatherConditionType): string {
  return CONDITION_DESCRIPTIONS[condition] ?? CONDITION_DESCRIPTIONS.unknown;
}

/**
 * Get the guidance text for a weather condition
 */
export function getConditionGuidance(condition: WeatherConditionType): string {
  return CONDITION_GUIDANCE[condition] ?? CONDITION_GUIDANCE.unknown;
}

/**
 * Get both description and guidance combined
 */
export function getFullConditionInfo(condition: WeatherConditionType): {
  description: string;
  guidance: string;
} {
  return {
    description: getConditionDescription(condition),
    guidance: getConditionGuidance(condition),
  };
}
