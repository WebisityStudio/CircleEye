import React from 'react';
import type { SevereWeatherAlert } from '../lib/api/weather';
import type { UnifiedWeatherAlert } from '../lib/weather';
import { getWeatherIcon, severityBandToColor } from '../lib/weather';

interface WeatherAlertCardProps {
  /** Legacy alert type (backwards compatible) */
  alert?: SevereWeatherAlert | null;
  /** New unified alert type */
  unifiedAlert?: UnifiedWeatherAlert | null;
  isLoading?: boolean;
  title?: string;
  emptyMessage?: string;
  onFindOutMore?: () => void;
}

function severityToColour(level?: number): string {
  if (level === 1) return '#D90429'; // Red - Severe Flood Warning
  if (level === 2) return '#F97B22'; // Orange - Flood Warning
  if (level === 3) return '#F6C833'; // Yellow - Flood Alert
  return '#15CC3D'; // Green - All Clear
}

export function WeatherAlertCard({
  alert,
  unifiedAlert,
  isLoading = false,
  title = 'Weather Alert',
  emptyMessage = 'No severe weather alerts across the UK right now.',
  onFindOutMore,
}: WeatherAlertCardProps) {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      );
    }

    // Handle unified alert (new type)
    if (unifiedAlert) {
      const Icon = getWeatherIcon(unifiedAlert.conditionType);
      const color = severityBandToColor(unifiedAlert.severityBand);

      return (
        <div
          className="relative h-48 rounded-xl bg-cover bg-center overflow-hidden"
          style={{
            backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url("/weather-bg.jpg")',
            backgroundColor: '#1d2939',
          }}
        >
          <div className="absolute inset-0 p-4 flex flex-col">
            {/* Icon, severity indicator and title */}
            <div className="flex items-center gap-2">
              <Icon className="w-5 h-5 text-white" />
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-white font-bold text-lg">{unifiedAlert.title}</span>
            </div>

            {/* Description */}
            <p className="text-gray-200 text-sm mt-2 line-clamp-2">{unifiedAlert.description}</p>

            {/* Guidance text if available */}
            {unifiedAlert.guidanceText && (
              <p className="text-gray-300 text-xs mt-1 italic">{unifiedAlert.guidanceText}</p>
            )}

            {/* Find out more link */}
            {onFindOutMore && (
              <button
                onClick={onFindOutMore}
                className="text-brand-primary underline text-sm font-semibold mt-2 self-start hover:text-brand-secondary transition-colors"
              >
                Find out more
              </button>
            )}

            {/* Footer with temperature/area and source */}
            <div className="mt-auto flex justify-between items-end">
              <div>
                {unifiedAlert.temperature !== undefined && (
                  <>
                    <p className="text-white text-sm font-medium">Temperature</p>
                    <p className="text-white font-bold">
                      {Math.round(unifiedAlert.temperature)}°C
                      {unifiedAlert.feelsLike !== undefined && (
                        <span className="text-gray-300 text-sm font-normal ml-1">
                          (feels {Math.round(unifiedAlert.feelsLike)}°C)
                        </span>
                      )}
                    </p>
                  </>
                )}
                {!unifiedAlert.temperature && unifiedAlert.area && (
                  <>
                    <p className="text-white text-sm font-medium">Region</p>
                    <p className="text-white font-bold">{unifiedAlert.area}</p>
                  </>
                )}
              </div>
              <p className="text-gray-400 text-xs">Source: {unifiedAlert.source}</p>
            </div>
          </div>
        </div>
      );
    }

    // Handle legacy alert type
    if (!alert) {
      return (
        <div className="flex items-center justify-center py-12">
          <p className="text-brand-textGrey text-sm text-center px-6">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div
        className="relative h-48 rounded-xl bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url("/weather-bg.jpg")',
          backgroundColor: '#1d2939',
        }}
      >
        <div className="absolute inset-0 p-4 flex flex-col">
          {/* Severity indicator and title */}
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: severityToColour(alert.severityLevel) }}
            />
            <span className="text-white font-bold text-lg">{alert.severity}</span>
          </div>

          {/* Find out more link */}
          {onFindOutMore && (
            <button
              onClick={onFindOutMore}
              className="text-brand-primary underline text-sm font-semibold mt-2 self-start hover:text-brand-secondary transition-colors"
            >
              Find out more
            </button>
          )}

          {/* Footer with region and source */}
          <div className="mt-auto flex justify-between items-end">
            <div>
              <p className="text-white text-sm font-medium">Region</p>
              <p className="text-white font-bold">{alert.area ?? 'UK'}</p>
            </div>
            <p className="text-gray-400 text-xs">Source: {alert.source}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-brand-inputBackground rounded-2xl overflow-hidden">
      <div className="p-4">
        {renderContent()}
      </div>
      <h3 className="text-center text-xl font-bold text-brand-text py-4">{title}</h3>
    </div>
  );
}

export default WeatherAlertCard;
