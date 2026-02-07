// Weather/Flood alerts API matching Expo app implementation
import { apiConfig } from './config';
import { fetchJson } from './http';
import { fetchCurrentWeather, hasCurrentData } from './openMeteo';
import {
  mapWmoCode,
  deriveTemperatureAlert,
  deriveWindAlert,
  isBlizzardCondition,
  getConditionDescription,
  getConditionGuidance,
  severityToBand,
  SEVERITY_ORDER,
} from '../weather';
import type { UnifiedWeatherAlert, WeatherSeverity } from '../weather';

interface FloodAreaInfo {
  label?: string;
  county?: string;
  riverOrSea?: string;
  easting?: number;
  northing?: number;
  lat?: number;
  long?: number;
}

interface FloodAlertItem {
  '@id'?: string;
  description?: string;
  severity?: string;
  severityLevel?: number;
  message?: string;
  timeRaised?: string;
  timeMessageChanged?: string;
  timeSeverityChanged?: string;
  floodArea?: FloodAreaInfo;
  qaStatus?: string;
  eaAreaName?: string;
  eaRegionName?: string;
}

interface FloodApiResponse {
  items?: FloodAlertItem[];
}

export interface SevereWeatherAlert {
  id: string;
  title: string;
  severityLevel: number;
  severity: string;
  severityBand?: 'Red' | 'Amber' | 'Yellow';
  area?: string;
  riverOrSea?: string;
  message?: string;
  updatedAt?: string;
  source: string;
}

const DEFAULT_LIMIT = 5;

function severityLevelToBand(level?: number): 'Red' | 'Amber' | 'Yellow' {
  // EA levels: 1=Severe Flood Warning, 2=Flood Warning, 3=Flood Alert, 4=Warning no longer in force
  if (level === 1) return 'Red';
  if (level === 2) return 'Amber';
  return 'Yellow';
}

function normaliseId(id?: string): string {
  if (!id) {
    return '' + Math.random().toString(36).slice(2);
  }
  return id.split('/').pop() ?? id;
}

export async function fetchSevereWeatherAlerts(limit: number = DEFAULT_LIMIT): Promise<SevereWeatherAlert[]> {
  try {
    const baseEndpoint = apiConfig.ENV_AGENCY_FLOOD_ENDPOINT ?? 'https://environment.data.gov.uk/flood-monitoring/id/floods';
    const url = new URL(baseEndpoint);
    url.searchParams.set('_limit', String(limit));

    const response = await fetchJson<FloodApiResponse>(url.toString(), { timeoutMs: 20000 });

    const items = response.items ?? [];
    if (!items.length) {
      // Synthetic friendly fallback so UI still shows an informative card
      return [
        {
          id: 'all-clear',
          title: 'All Clear',
          severityLevel: 4,
          severity: 'No Active Alerts',
          severityBand: 'Yellow',
          area: 'UK',
          message: 'No active weather or flood alerts detected',
          updatedAt: new Date().toISOString(),
          source: 'Environment Agency',
        },
      ];
    }

    const eligible = items.filter((item) => typeof item.severityLevel === 'number' && (item.severityLevel as number) <= 3);

    const selected = eligible.length
      ? eligible.slice(0, limit)
      : // Fallback: show the most recent informational item (e.g., "warning no longer in force")
        items
          .filter((item) => typeof item.severityLevel === 'number')
          .slice(0, 1);

    return selected
      .map((item) => ({
        id: normaliseId(item['@id']),
        title: item.floodArea?.label ?? item.description ?? 'Severe weather alert',
        severityLevel: item.severityLevel ?? 0,
        severity: item.severity ?? 'Unknown',
        severityBand: severityLevelToBand(item.severityLevel ?? 0),
        area: item.floodArea?.county ?? item.eaRegionName ?? item.eaAreaName,
        riverOrSea: item.floodArea?.riverOrSea,
        message: item.message ?? item.description,
        updatedAt: item.timeMessageChanged ?? item.timeSeverityChanged ?? item.timeRaised,
        source: 'Environment Agency',
      }))
      .sort((a, b) => (a.severityLevel || 99) - (b.severityLevel || 99));
  } catch {
    // Gracefully degrade to empty array so UI shows the empty message
    return [];
  }
}

/**
 * Map flood severity level (1-4) to our severity type
 */
function floodSeverityToSeverity(level: number): WeatherSeverity {
  if (level === 1) return 'severe';
  if (level === 2) return 'high';
  if (level === 3) return 'moderate';
  return 'info';
}

/**
 * Fetch unified weather alerts combining Open-Meteo conditions with Environment Agency flood alerts
 * @param lat Latitude for weather data
 * @param lng Longitude for weather data
 * @param includeFloodAlerts Whether to include flood alerts (default: true)
 * @returns Array of unified weather alerts sorted by severity
 */
export async function fetchUnifiedWeatherAlerts(
  lat: number,
  lng: number,
  includeFloodAlerts = true
): Promise<UnifiedWeatherAlert[]> {
  const alerts: UnifiedWeatherAlert[] = [];
  const now = new Date().toISOString();

  // 1. Fetch current conditions from Open-Meteo
  try {
    const response = await fetchCurrentWeather(lat, lng);

    if (hasCurrentData(response)) {
      const current = response.current;
      const wmoInfo = mapWmoCode(current.weather_code);

      // Check for blizzard conditions (snow + high winds + freezing)
      const isBlizzard = isBlizzardCondition(
        current.weather_code,
        current.wind_speed_10m,
        current.temperature_2m
      );

      if (isBlizzard) {
        alerts.push({
          id: `blizzard-${Date.now()}`,
          conditionType: 'blizzard',
          severity: 'severe',
          severityBand: 'Red',
          title: 'Blizzard Conditions',
          description: 'Heavy snow with high winds and freezing temperatures.',
          guidanceText: getConditionGuidance('blizzard'),
          temperature: current.temperature_2m,
          feelsLike: current.apparent_temperature,
          windSpeed: current.wind_speed_10m,
          windGusts: current.wind_gusts_10m,
          source: 'open-meteo',
          updatedAt: current.time,
        });
      } else if (wmoInfo.severity !== 'info') {
        // Add weather condition alert if notable (not just clear/cloudy)
        alerts.push({
          id: `weather-${current.weather_code}-${Date.now()}`,
          conditionType: wmoInfo.condition,
          severity: wmoInfo.severity,
          severityBand: severityToBand(wmoInfo.severity),
          title: wmoInfo.label,
          description: getConditionDescription(wmoInfo.condition),
          guidanceText: getConditionGuidance(wmoInfo.condition),
          temperature: current.temperature_2m,
          feelsLike: current.apparent_temperature,
          windSpeed: current.wind_speed_10m,
          windGusts: current.wind_gusts_10m,
          source: 'open-meteo',
          updatedAt: current.time,
        });
      }

      // 2. Check for temperature-based alerts
      const tempAlert = deriveTemperatureAlert(
        current.temperature_2m,
        current.apparent_temperature
      );
      if (tempAlert) {
        alerts.push({
          id: `temp-${tempAlert.condition}-${Date.now()}`,
          conditionType: tempAlert.condition,
          severity: tempAlert.severity,
          severityBand: severityToBand(tempAlert.severity),
          title: tempAlert.title,
          description: tempAlert.description,
          guidanceText: getConditionGuidance(tempAlert.condition),
          temperature: current.temperature_2m,
          feelsLike: current.apparent_temperature,
          source: 'derived',
          updatedAt: current.time,
        });
      }

      // 3. Check for wind-based alerts
      const windAlert = deriveWindAlert(current.wind_speed_10m, current.wind_gusts_10m);
      if (windAlert) {
        alerts.push({
          id: `wind-${windAlert.condition}-${Date.now()}`,
          conditionType: windAlert.condition,
          severity: windAlert.severity,
          severityBand: severityToBand(windAlert.severity),
          title: windAlert.title,
          description: windAlert.description,
          guidanceText: getConditionGuidance(windAlert.condition),
          windSpeed: current.wind_speed_10m,
          windGusts: current.wind_gusts_10m,
          source: 'derived',
          updatedAt: current.time,
        });
      }
    }
  } catch (err) {
    console.warn('Open-Meteo fetch failed, continuing with flood alerts only', err);
  }

  // 4. Fetch existing flood alerts if enabled
  if (includeFloodAlerts) {
    try {
      const floodAlerts = await fetchSevereWeatherAlerts(5);
      for (const flood of floodAlerts) {
        if (flood.id !== 'all-clear') {
          alerts.push({
            id: flood.id,
            conditionType: 'flood',
            severity: floodSeverityToSeverity(flood.severityLevel),
            severityBand: flood.severityBand ?? 'Yellow',
            title: flood.title,
            description: flood.message ?? flood.severity,
            area: flood.area,
            source: 'environment-agency',
            updatedAt: flood.updatedAt ?? now,
          });
        }
      }
    } catch (err) {
      console.warn('Flood alerts fetch failed', err);
    }
  }

  // 5. If no alerts, return all-clear
  if (alerts.length === 0) {
    return [
      {
        id: 'all-clear',
        conditionType: 'clear',
        severity: 'info',
        severityBand: 'Green',
        title: 'All Clear',
        description: 'No active weather alerts detected.',
        guidanceText: 'Enjoy the weather!',
        source: 'derived',
        updatedAt: now,
      },
    ];
  }

  // Sort by severity (most severe first)
  return alerts.sort((a, b) => SEVERITY_ORDER[b.severity] - SEVERITY_ORDER[a.severity]);
}

// Re-export unified types for convenience
export type { UnifiedWeatherAlert } from '../weather';
