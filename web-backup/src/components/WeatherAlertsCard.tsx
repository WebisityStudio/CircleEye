import React, { useEffect, useState } from 'react';
import { Cloud, Thermometer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchUnifiedWeatherAlerts, type UnifiedWeatherAlert } from '../lib/api';
import { getWeatherIcon, severityBandToColor } from '../lib/weather';

interface WeatherAlertsCardProps {
  /** User's latitude for weather data */
  lat?: number;
  /** User's longitude for weather data */
  lng?: number;
}

export function WeatherAlertsCard({ lat, lng }: WeatherAlertsCardProps) {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<UnifiedWeatherAlert[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Use provided location or default to London
        const latitude = lat ?? 51.5074;
        const longitude = lng ?? -0.1278;

        const result = await fetchUnifiedWeatherAlerts(latitude, longitude, true);
        setAlerts(result);
        setUpdatedAt(new Date().toLocaleTimeString('en-GB', { timeZone: 'Europe/London' }));
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Unable to fetch weather alerts';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [lat, lng]);

  const getSeverityClasses = (band: UnifiedWeatherAlert['severityBand']) => {
    switch (band) {
      case 'Red':
        return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'Amber':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Yellow':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'Green':
      default:
        return 'bg-green-500/20 text-green-500 border-green-500/30';
    }
  };

  const getSourceLabel = (source: UnifiedWeatherAlert['source']) => {
    switch (source) {
      case 'open-meteo':
        return 'Open-Meteo';
      case 'environment-agency':
        return 'Environment Agency';
      case 'met-office':
        return 'Met Office';
      case 'derived':
        return 'Calculated';
      default:
        return source;
    }
  };

  return (
    <div className="card hover:border-brand-primary/30 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-brand-text text-lg font-semibold">Weather & Flood Alerts</h3>
        <Thermometer className="h-6 w-6 text-brand-secondary" />
      </div>

      <div className="space-y-4 max-h-80 overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
          </div>
        )}

        {error && <div className="text-brand-error text-sm">{error}</div>}

        {!isLoading && !error && alerts.length > 0
          ? alerts.slice(0, 5).map((alert) => {
              const Icon = getWeatherIcon(alert.conditionType);
              const color = severityBandToColor(alert.severityBand);

              return (
                <div
                  key={alert.id}
                  className={`border rounded-lg p-4 ${getSeverityClasses(alert.severityBand)}`}
                >
                  <div className="flex items-start space-x-3">
                    <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{alert.title}</h4>
                        <span className="text-xs px-2 py-1 rounded bg-current/20">
                          {alert.severityBand}
                        </span>
                      </div>
                      <p className="text-sm opacity-90 mb-2">{alert.description}</p>

                      {/* Guidance text */}
                      {alert.guidanceText && (
                        <p className="text-xs opacity-75 italic mb-2">{alert.guidanceText}</p>
                      )}

                      <div className="text-xs opacity-75 space-y-1">
                        {/* Temperature info */}
                        {alert.temperature !== undefined && (
                          <div>
                            Temp: {Math.round(alert.temperature)}°C
                            {alert.feelsLike !== undefined &&
                              ` (feels like ${Math.round(alert.feelsLike)}°C)`}
                          </div>
                        )}

                        {/* Wind info */}
                        {alert.windSpeed !== undefined && (
                          <div>
                            Wind: {Math.round(alert.windSpeed)} km/h
                            {alert.windGusts !== undefined &&
                              ` (gusts ${Math.round(alert.windGusts)} km/h)`}
                          </div>
                        )}

                        {/* Area */}
                        {alert.area && <div>Area: {alert.area}</div>}

                        {/* Updated time */}
                        {alert.updatedAt && (
                          <div>Updated: {new Date(alert.updatedAt).toLocaleString('en-GB')}</div>
                        )}

                        {/* Source */}
                        <div className="text-xs opacity-50">
                          Source: {getSourceLabel(alert.source)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          : !isLoading &&
            !error && (
              <div className="text-center py-8">
                <Cloud className="h-12 w-12 text-brand-textGrey mx-auto mb-3" />
                <p className="text-brand-textGrey">No active alerts detected</p>
              </div>
            )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-800">
        <div className="flex items-center justify-between text-xs text-brand-textGrey mb-3">
          <span>Data: Open-Meteo + Environment Agency (UK)</span>
          <span>Updated: {updatedAt || '—'}</span>
        </div>
        <button
          onClick={() => navigate('/weather-alerts')}
          className="w-full bg-brand-secondary hover:bg-brand-secondary/80 text-white py-2 rounded-lg text-sm font-medium transition-colors"
        >
          View All Alerts
        </button>
      </div>
    </div>
  );
}
