import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Thermometer, CloudRain, Wind, AlertTriangle, Filter, X } from 'lucide-react';
import { Header } from './Header';
import { Footer } from './Footer';
import { SEO } from './SEO';
import { fetchUnifiedWeatherAlerts, fetchSevereWeatherAlerts, type UnifiedWeatherAlert, type SevereWeatherAlert } from '../lib/api/weather';
import { getWeatherIcon, severityBandToColor } from '../lib/weather';

type AlertType = 'all' | 'weather' | 'flood';
type SeverityFilter = 'all' | 'Red' | 'Amber' | 'Yellow';

export function WeatherAlertsPage(): React.JSX.Element {
  const navigate = useNavigate();
  const [weatherAlerts, setWeatherAlerts] = useState<UnifiedWeatherAlert[]>([]);
  const [floodAlerts, setFloodAlerts] = useState<SevereWeatherAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Filters
  const [typeFilter, setTypeFilter] = useState<AlertType>('all');
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');

  useEffect(() => {
    const loadAlerts = async () => {
      setIsLoading(true);
      setError('');
      try {
        const lat = 51.5074;
        const lng = -0.1278;

        const [weatherResult, floodResult] = await Promise.all([
          fetchUnifiedWeatherAlerts(lat, lng, false),
          fetchSevereWeatherAlerts(100),
        ]);

        setWeatherAlerts(weatherResult.filter(a => a.id !== 'all-clear'));
        setFloodAlerts(floodResult.filter(a => a.id !== 'all-clear'));
      } catch (e: unknown) {
        setError((e as Error).message || 'Unable to load weather alerts');
      } finally {
        setIsLoading(false);
      }
    };
    loadAlerts();
  }, []);

  // Extract unique regions from flood alerts
  const regions = useMemo(() => {
    const uniqueRegions = new Set<string>();
    floodAlerts.forEach(alert => {
      if (alert.area) uniqueRegions.add(alert.area);
    });
    return Array.from(uniqueRegions).sort();
  }, [floodAlerts]);

  // Filter alerts
  const filteredWeatherAlerts = useMemo(() => {
    if (typeFilter === 'flood') return [];
    return weatherAlerts.filter(alert => {
      if (severityFilter !== 'all' && alert.severityBand !== severityFilter) return false;
      return true;
    });
  }, [weatherAlerts, typeFilter, severityFilter]);

  const filteredFloodAlerts = useMemo(() => {
    if (typeFilter === 'weather') return [];
    return floodAlerts.filter(alert => {
      if (severityFilter !== 'all' && alert.severityBand !== severityFilter) return false;
      if (regionFilter !== 'all' && alert.area !== regionFilter) return false;
      return true;
    });
  }, [floodAlerts, typeFilter, severityFilter, regionFilter]);

  const totalFiltered = filteredWeatherAlerts.length + filteredFloodAlerts.length;
  const hasActiveFilters = typeFilter !== 'all' || severityFilter !== 'all' || regionFilter !== 'all';

  const clearFilters = () => {
    setTypeFilter('all');
    setSeverityFilter('all');
    setRegionFilter('all');
  };

  const getSeverityBadgeClasses = (band: string) => {
    switch (band) {
      case 'Red':
        return 'bg-red-500 text-white';
      case 'Amber':
        return 'bg-amber-500 text-black';
      case 'Yellow':
        return 'bg-yellow-500 text-black';
      case 'Green':
      default:
        return 'bg-green-500 text-white';
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'open-meteo': return 'Open-Meteo';
      case 'environment-agency': return 'Environment Agency';
      case 'met-office': return 'Met Office';
      case 'derived': return 'Calculated';
      default: return source;
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Stats for summary
  const stats = useMemo(() => {
    const allAlerts = [...filteredFloodAlerts];
    return {
      total: totalFiltered,
      red: allAlerts.filter(a => a.severityBand === 'Red').length,
      amber: allAlerts.filter(a => a.severityBand === 'Amber').length,
      yellow: allAlerts.filter(a => a.severityBand === 'Yellow').length,
    };
  }, [filteredFloodAlerts, totalFiltered]);

  return (
    <div className="min-h-screen bg-brand-background flex flex-col">
      <SEO
        title="Weather Alerts"
        description="Live weather warnings and flood alerts for the United Kingdom from the Met Office and Environment Agency."
        noindex
      />
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          <div className="flex items-center gap-3">
            <Thermometer className="h-8 w-8 text-brand-secondary" />
            <h1 className="text-3xl font-bold text-white">Weather & Flood Alerts</h1>
          </div>
          <p className="text-gray-400 mt-2">Live weather conditions and flood warnings across the UK</p>
        </div>

        {/* Summary Stats */}
        {!isLoading && !error && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-xs text-gray-400">Total Alerts</div>
            </div>
            <div className="bg-gray-900 border border-red-500/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-400">{stats.red}</div>
              <div className="text-xs text-gray-400">Severe</div>
            </div>
            <div className="bg-gray-900 border border-amber-500/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-amber-400">{stats.amber}</div>
              <div className="text-xs text-gray-400">Warning</div>
            </div>
            <div className="bg-gray-900 border border-yellow-500/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">{stats.yellow}</div>
              <div className="text-xs text-gray-400">Alert</div>
            </div>
          </div>
        )}

        {/* Filters */}
        {!isLoading && !error && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-white">Filters</span>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-3 w-3" />
                  Clear all
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Type Filter */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as AlertType)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-primary"
                >
                  <option value="all">All Types</option>
                  <option value="weather">Weather Only</option>
                  <option value="flood">Flood Only</option>
                </select>
              </div>

              {/* Severity Filter */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Severity</label>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value as SeverityFilter)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-primary"
                >
                  <option value="all">All Severities</option>
                  <option value="Red">Severe (Red)</option>
                  <option value="Amber">Warning (Amber)</option>
                  <option value="Yellow">Alert (Yellow)</option>
                </select>
              </div>

              {/* Region Filter */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Region</label>
                <select
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-primary"
                >
                  <option value="all">All Regions</option>
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Content */}
        {!isLoading && !error && (
          <div className="space-y-6">
            {/* Weather Alerts */}
            {filteredWeatherAlerts.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Wind className="h-5 w-5 text-blue-400" />
                  <h2 className="text-lg font-semibold text-white">Current Weather</h2>
                  <span className="text-xs text-gray-400">({filteredWeatherAlerts.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredWeatherAlerts.map((alert) => {
                    const Icon = getWeatherIcon(alert.conditionType);
                    const color = severityBandToColor(alert.severityBand);

                    return (
                      <div
                        key={alert.id}
                        className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="p-2 rounded-lg bg-gray-800">
                            <Icon className="h-5 w-5" style={{ color }} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-white">{alert.title}</h3>
                              <span className={`text-xs px-2 py-0.5 rounded ${getSeverityBadgeClasses(alert.severityBand)}`}>
                                {alert.severityBand}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400 mt-1">{alert.description}</p>
                          </div>
                        </div>

                        <div className="text-xs text-gray-500 space-y-1 pt-3 border-t border-gray-800">
                          {alert.temperature !== undefined && (
                            <div className="flex items-center gap-2">
                              <Thermometer className="h-3 w-3" />
                              <span>
                                {Math.round(alert.temperature)}°C
                                {alert.feelsLike !== undefined && ` (feels like ${Math.round(alert.feelsLike)}°C)`}
                              </span>
                            </div>
                          )}
                          {alert.windSpeed !== undefined && (
                            <div className="flex items-center gap-2">
                              <Wind className="h-3 w-3" />
                              <span>{Math.round(alert.windSpeed)} km/h</span>
                            </div>
                          )}
                          <div>Source: {getSourceLabel(alert.source)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Flood Alerts */}
            {filteredFloodAlerts.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <CloudRain className="h-5 w-5 text-blue-400" />
                  <h2 className="text-lg font-semibold text-white">Flood Alerts</h2>
                  <span className="text-xs text-gray-400">({filteredFloodAlerts.length})</span>
                </div>
                <div className="space-y-3">
                  {filteredFloodAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-gray-800 flex-shrink-0">
                          <CloudRain className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="font-medium text-white">{alert.title}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded ${getSeverityBadgeClasses(alert.severityBand || 'Yellow')}`}>
                              {alert.severityBand || 'Warning'}
                            </span>
                            {alert.area && (
                              <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400">
                                {alert.area}
                              </span>
                            )}
                          </div>
                          {alert.message && (
                            <p className="text-sm text-gray-400 mb-2 line-clamp-2">{alert.message}</p>
                          )}
                          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                            {alert.riverOrSea && <span>River: {alert.riverOrSea}</span>}
                            {alert.updatedAt && <span>Updated: {formatDate(alert.updatedAt)}</span>}
                            <span>Source: {alert.source}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* No Results */}
            {totalFiltered === 0 && (
              <div className="text-center py-16 bg-gray-900 rounded-xl border border-gray-800">
                {hasActiveFilters ? (
                  <>
                    <Filter className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No alerts match your filters</h3>
                    <p className="text-gray-400 mb-4">Try adjusting your filter criteria</p>
                    <button
                      onClick={clearFilters}
                      className="text-brand-primary hover:text-brand-primary/80 text-sm font-medium"
                    >
                      Clear all filters
                    </button>
                  </>
                ) : (
                  <>
                    <div className="bg-green-500/20 p-4 rounded-full w-fit mx-auto mb-4">
                      <AlertTriangle className="h-12 w-12 text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">All Clear</h3>
                    <p className="text-gray-400">No active weather or flood alerts at this time.</p>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Data Sources Footer */}
        <div className="mt-8 pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-500 text-center">
            Weather data from Open-Meteo | Flood alerts from Environment Agency UK
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default WeatherAlertsPage;
