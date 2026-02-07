import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BellRing,
  ChevronRight,
  CloudRain,
  Search,
  ExternalLink,
  Info,
  Leaf,
  LocateFixed,
  MapPin,
  ShieldCheck,
  Siren,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { HubSpotChat } from './HubSpotChat';
import { PreciseLocation } from './PreciseLocation';
import { ThreatMeter } from './ThreatMeter';
import { fetchThreatLevel, type ThreatLevelInfo } from '../lib/api/threat';
import { fetchUnifiedCrimeSummary, getCoordinatesFromPostcode, type UnifiedCrimeSummary } from '../lib/crime';
import { fetchNearestEmergencyServices, type NearestServices } from '../lib/emergencyServices';
import { fetchUnifiedWeatherAlerts, type UnifiedWeatherAlert } from '../lib/api';

// Threat level descriptions matching the database values
const THREAT_DESCRIPTIONS: Record<string, string> = {
  'Low': 'An attack is highly unlikely.',
  'Moderate': 'An attack is possible but not likely.',
  'Substantial': 'An attack is likely.',
  'Severe': 'An attack is highly likely.',
  'Critical': 'An attack is highly likely in the near future.',
};

const THREAT_LEVEL_INDEX: Record<string, number> = {
  low: 0,
  moderate: 1,
  substantial: 2,
  severe: 3,
  critical: 4,
};

const CIRCLE_URLS = {
  home: 'https://circleukgroup.co.uk',
  safeCircle: 'https://circleukgroup.co.uk/safe-circle',
  requestGuard: 'https://circleukgroup.co.uk/#rapid-security-cover',
  threeWords: 'https://circleukgroup.co.uk/#3words-location',
  emergencyContacts: 'https://circleukgroup.co.uk/#emergency-contacts',
  guidance: 'https://circleukgroup.co.uk/#uk-security-status',
};

function toThreatIndex(level?: string, severityIndex?: number, maxScaleValue?: number): number {
  if (typeof severityIndex === 'number' && Number.isFinite(severityIndex)) {
    if (maxScaleValue === 5 && severityIndex >= 1 && severityIndex <= 5) {
      return severityIndex - 1;
    }
    if (severityIndex >= 0 && severityIndex <= 4) {
      return severityIndex;
    }
    if (typeof maxScaleValue === 'number' && maxScaleValue > 1) {
      const scaled = Math.round((severityIndex / (maxScaleValue - 1)) * 4);
      return Math.max(0, Math.min(4, scaled));
    }
  }

  const normalized = level?.trim().toLowerCase() ?? '';
  return THREAT_LEVEL_INDEX[normalized] ?? 0;
}

function saveToLocalStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

function loadFromLocalStorage<T>(key: string): T | null {
  try {
    const value = localStorage.getItem(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch (e) {
    console.error('Failed to load from localStorage:', e);
    return null;
  }
}

function getRiskColor(level: UnifiedCrimeSummary['riskLevel']) {
  switch (level) {
    case 'High':
      return 'bg-red-500/20 text-red-400 border border-red-500/30';
    case 'Medium-High':
      return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
    case 'Medium':
      return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
    case 'Low':
      return 'bg-green-500/20 text-green-400 border border-green-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
  }
}

export function Home() {
  const navigate = useNavigate();

  // Threat level state (from Supabase)
  const [threatInfo, setThreatInfo] = useState<ThreatLevelInfo | null>(null);
  const [threatError, setThreatError] = useState<string | null>(null);
  const [threatLoading, setThreatLoading] = useState(true);

  // Local risk state
  const [postcode, setPostcode] = useState<string>(() => loadFromLocalStorage<string>('crimeData_postcode') || '');
  const [crimeData, setCrimeData] = useState<UnifiedCrimeSummary | null>(() => loadFromLocalStorage<UnifiedCrimeSummary>('crimeData_crimeData'));
  const [emergencyServices, setEmergencyServices] = useState<NearestServices | null>(() => loadFromLocalStorage<NearestServices>('crimeData_emergencyServices'));
  const [riskLoading, setRiskLoading] = useState(false);
  const [riskError, setRiskError] = useState<string | null>(null);

  // Environmental alert state
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [environmentalAlert, setEnvironmentalAlert] = useState<UnifiedWeatherAlert | null>(null);
  const [environmentalLoading, setEnvironmentalLoading] = useState(true);
  const [environmentalError, setEnvironmentalError] = useState<string | null>(null);

  // Fetch threat level from Supabase with retry
  useEffect(() => {
    let isMounted = true;
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const loadThreat = async () => {
      setThreatLoading(true);
      let lastError: unknown = null;

      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const threat = await fetchThreatLevel();
          if (isMounted) {
            setThreatInfo(threat);
            setThreatError(null);
            lastError = null;
          }
          break;
        } catch (e) {
          lastError = e;
          await sleep(800);
        }
      }

      if (isMounted) {
        if (lastError) {
          setThreatError('Unable to load threat level');
        }
        setThreatLoading(false);
      }
    };

    loadThreat();
    return () => { isMounted = false; };
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (postcode.trim()) {
      saveToLocalStorage('crimeData_postcode', postcode);
    }
  }, [postcode]);

  useEffect(() => {
    if (crimeData) {
      saveToLocalStorage('crimeData_crimeData', crimeData);
    }
  }, [crimeData]);

  useEffect(() => {
    if (emergencyServices) {
      saveToLocalStorage('crimeData_emergencyServices', emergencyServices);
    }
  }, [emergencyServices]);

  // Fetch environmental alerts
  useEffect(() => {
    let isMounted = true;

    const loadEnvironmentalAlert = async () => {
      if (!alertsEnabled) {
        if (isMounted) {
          setEnvironmentalLoading(false);
          setEnvironmentalError(null);
          setEnvironmentalAlert(null);
        }
        return;
      }

      if (isMounted) {
        setEnvironmentalLoading(true);
        setEnvironmentalError(null);
      }

      try {
        let lat = 51.5074;
        let lng = -0.1278;

        if (postcode.trim()) {
          try {
            const coords = await getCoordinatesFromPostcode(postcode.trim());
            lat = coords.lat;
            lng = coords.lng;
          } catch {
            // Fall back to default UK location if postcode geocoding fails
          }
        }

        const alerts = await fetchUnifiedWeatherAlerts(lat, lng, true);
        const preferredAlert = alerts.find((alert) => alert.conditionType === 'flood') || alerts[0] || null;

        if (isMounted) {
          setEnvironmentalAlert(preferredAlert);
        }
      } catch (e: unknown) {
        if (isMounted) {
          setEnvironmentalError((e as Error)?.message || 'Unable to fetch environmental alerts');
          setEnvironmentalAlert(null);
        }
      } finally {
        if (isMounted) {
          setEnvironmentalLoading(false);
        }
      }
    };

    loadEnvironmentalAlert();

    return () => { isMounted = false; };
  }, [alertsEnabled, postcode]);

  // Compute threat display values
  const threatDisplay = useMemo(() => {
    if (threatLoading) {
      return { level: 'Loading...', description: 'Fetching latest official threat level...' };
    }
    if (threatError || !threatInfo?.nationalLevel) {
      return { level: threatError ? 'N/A' : 'Unknown', description: threatError || 'Threat level data unavailable' };
    }
    const level = threatInfo.nationalLevel;
    return {
      level,
      description: threatInfo.nationalDescription || THREAT_DESCRIPTIONS[level] || 'No description available.',
    };
  }, [threatInfo, threatLoading, threatError]);

  // Format last updated time
  const lastUpdated = useMemo(() => {
    if (threatInfo?.updatedAt) {
      return new Date(threatInfo.updatedAt).toLocaleString('en-GB', { timeZone: 'Europe/London' }) + ' GMT';
    }
    return new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' }) + ' GMT';
  }, [threatInfo]);

  const threatLevelForMeter = useMemo(
    () => toThreatIndex(threatInfo?.nationalLevel, threatInfo?.severityIndex, threatInfo?.maxScaleValue),
    [threatInfo]
  );

  const handleLookupRisk = useCallback(async () => {
    if (!postcode.trim()) return;
    setRiskLoading(true);
    setRiskError(null);

    try {
      const coords = await getCoordinatesFromPostcode(postcode.trim());

      const [riskResult, servicesResult] = await Promise.all([
        fetchUnifiedCrimeSummary(postcode.trim()),
        fetchNearestEmergencyServices(coords.lat, coords.lng),
      ]);

      setCrimeData(riskResult);
      setEmergencyServices(servicesResult);
    } catch (e: unknown) {
      const message = (e as Error)?.message || 'Unable to fetch location risk data';
      setRiskError(message);
      setCrimeData(null);
      setEmergencyServices(null);
    } finally {
      setRiskLoading(false);
    }
  }, [postcode]);

  const handlePostcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLookupRisk();
    }
  };

  const trendDisplay = useMemo(() => {
    if (!crimeData || crimeData.trend === '--') {
      return { direction: 'none' as const, value: '--', color: 'text-brand-textGrey' };
    }

    if (crimeData.trend.startsWith('+')) {
      return { direction: 'up' as const, value: crimeData.trend, color: 'text-red-400' };
    }

    if (crimeData.trend.startsWith('-')) {
      return { direction: 'down' as const, value: crimeData.trend, color: 'text-green-400' };
    }

    return { direction: 'none' as const, value: crimeData.trend, color: 'text-brand-textGrey' };
  }, [crimeData]);

  const localRiskSourceText = useMemo(() => {
    if (!crimeData) {
      return 'Data source: UK Police API / Scottish Government';
    }

    if (crimeData.dataSource === 'scottish-gov') {
      return `Data source: Scottish Government Statistics • ${crimeData.fiscalYear} fiscal year`;
    }

    return `Data source: UK Police API • ${crimeData.monthDisplay}`;
  }, [crimeData]);

  const environmentalArea = environmentalAlert?.area || 'Your area';
  const environmentalMessage = !alertsEnabled
    ? 'Alert monitoring is paused. Toggle to continue receiving environmental warnings.'
    : environmentalLoading
      ? 'Loading latest flood and weather warnings for your area.'
      : environmentalError
        ? environmentalError
        : environmentalAlert?.description ||
          'No active environmental alerts for your area.';

  const sidebarItems = [
    { label: 'Profile', to: '/settings/edit-profile' },
    { label: 'Settings', to: '/settings' },
    { label: 'Check Your Precise location 3words', href: '#precise-location' },
    { label: 'Nearest Emergency points', href: '#nearest-emergency-points' },
    { label: 'Emergency contacts', href: CIRCLE_URLS.emergencyContacts },
    { label: 'Upgrade*', href: CIRCLE_URLS.safeCircle },
  ];

  return (
    <div className="min-h-screen bg-brand-background flex flex-col">
      <Header />
      <HubSpotChat />

      <main className="flex-1 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-text mb-3">
            Your Risk &amp; Safety Overview
          </h1>
          <p className="text-base sm:text-lg text-brand-textGrey max-w-4xl mx-auto">
            Clear, trusted insight into security, crime, and environmental risks across the UK in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)] gap-6 items-start">
          {/* Sidebar */}
          <aside className="space-y-5 xl:sticky xl:top-24">
            <div className="card">
              <h2 className="text-brand-primary text-xl font-semibold mb-4">Menu</h2>
              <div className="space-y-3">
                {sidebarItems.map((item) =>
                  item.to ? (
                    <Link
                      key={item.label}
                      to={item.to}
                      className="block text-brand-text text-base hover:text-brand-primary transition-colors"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <a
                      key={item.label}
                      href={item.href}
                      target={item.href?.startsWith('http') ? '_blank' : undefined}
                      rel={item.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="block text-brand-text text-base hover:text-brand-primary transition-colors"
                    >
                      {item.label}
                    </a>
                  )
                )}
              </div>

              <div className="mt-6 rounded-xl bg-gradient-to-br from-cyan-700/90 to-teal-600/80 border border-cyan-300/30 p-4">
                <h3 className="text-white text-lg font-semibold mb-2">Rapid Security Cover</h3>
                <p className="text-cyan-50 text-sm mb-4">
                  Upgrade to request a trained man guard within the next 45 minutes to help protect people, property, and operations when it matters most.
                </p>
                <a
                  href={CIRCLE_URLS.requestGuard}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-white text-teal-900 font-semibold px-4 py-2 rounded-full hover:bg-cyan-50 transition-colors"
                >
                  Request a Man Guard
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              <div className="mt-6">
                <h3 className="text-brand-primary text-lg font-semibold mb-2">Trusted Data Sources</h3>
                <p className="text-brand-textGrey text-sm mb-3">
                  Information is aggregated from official UK authorities and verified public datasets.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-800 text-blue-200 border border-gray-700">
                    <ShieldCheck className="h-3 w-3" />
                    Security Service
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-800 text-sky-200 border border-gray-700">
                    <CloudRain className="h-3 w-3" />
                    Met Office
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-800 text-emerald-200 border border-gray-700">
                    <Leaf className="h-3 w-3" />
                    Environment Agency
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Local Risk Awareness */}
            <div className="card hover:border-brand-primary/30 transition-all">
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-primary/30 bg-brand-primary/10">
                  <MapPin className="h-4 w-4 text-brand-primary" />
                </span>
                <h3 className="text-brand-text text-xl font-semibold">Local Risk Awareness</h3>
              </div>
              <p className="text-brand-textGrey text-sm mb-4">
                Enter your postcode to see safety and crime information for your area.
              </p>

              <div className="flex items-center gap-2 rounded-full border border-gray-700 bg-brand-inputBackground px-3 py-2">
                <MapPin className="h-4 w-4 shrink-0 text-brand-primary" />
                <input
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  onKeyDown={handlePostcodeKeyDown}
                  placeholder="Enter postcode (e.g., SW1A 1AA)"
                  className="w-full bg-transparent text-sm text-brand-text outline-none placeholder:text-brand-textGrey"
                />
                <button
                  onClick={handleLookupRisk}
                  disabled={riskLoading}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-600 bg-brand-background text-brand-textGrey transition-colors hover:border-brand-primary hover:text-brand-primary disabled:opacity-60"
                  aria-label="Lookup local risk"
                >
                  <Search className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mt-3 min-h-10 text-sm text-brand-textGrey">
                {riskLoading && (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-primary/30 border-t-brand-primary" />
                    Checking local risk and nearest emergency points...
                  </span>
                )}
                {!riskLoading && riskError && (
                  <span className="flex items-center gap-2 text-red-400">
                    <AlertTriangle className="h-4 w-4" />
                    {riskError}
                  </span>
                )}
                {!riskLoading && !riskError && !crimeData && 'Enter a postcode to see local crime breakdown.'}
              </div>

              {!riskLoading && !riskError && crimeData && (
                <>
                  {crimeData.dataSource === 'scottish-gov' && (
                    <div className="mt-4 rounded-xl border border-blue-500/30 bg-blue-500/10 p-3">
                      <div className="flex items-start gap-2">
                        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" />
                        <div>
                          <p className="text-sm font-medium text-blue-200">Council Area Statistics</p>
                          <p className="mt-1 text-xs text-blue-100/90">
                            This shows crime data for the entire {crimeData.councilArea} council area, not just your immediate neighbourhood.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-gray-700 bg-brand-inputBackground p-3">
                      {crimeData.dataSource === 'scottish-gov' ? (
                        <>
                          <p className="text-2xl font-bold text-brand-text">{crimeData.crimeRate.toLocaleString()}</p>
                          <p className="text-xs text-brand-textGrey">Crimes per 10,000 residents</p>
                        </>
                      ) : (
                        <>
                          <p className="text-2xl font-bold text-brand-text">{crimeData.totalCrimes.toLocaleString()}</p>
                          <p className="text-xs text-brand-textGrey">
                            {crimeData.monthDisplay ? `Crimes (${crimeData.monthDisplay})` : 'Total crimes'}
                          </p>
                        </>
                      )}
                    </div>

                    <div className="rounded-xl border border-gray-700 bg-brand-inputBackground p-3">
                      <div className={`flex items-center gap-1 ${trendDisplay.color}`}>
                        {trendDisplay.direction === 'up' && <TrendingUp className="h-4 w-4" />}
                        {trendDisplay.direction === 'down' && <TrendingDown className="h-4 w-4" />}
                        <span className="text-2xl font-bold">{trendDisplay.value}</span>
                      </div>
                      <p className="text-xs text-brand-textGrey">
                        {crimeData.dataSource === 'scottish-gov' ? 'vs Previous Year' : 'vs Previous Month'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {crimeData.topCrimes.length > 0 ? (
                      crimeData.topCrimes.map((crime, index) => (
                        <div key={`${crime.type}-${index}`} className="flex items-center justify-between gap-2">
                          <span className="mr-2 flex-1 text-sm text-brand-text">{crime.type}</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-20 overflow-hidden rounded-full bg-brand-inputBackground border border-gray-700">
                              <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                  width: `${Math.min(100, crime.percentage * 2)}%`,
                                  backgroundColor: crime.colour,
                                }}
                              />
                            </div>
                            <span className="w-10 text-right text-sm text-brand-text">{crime.count}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-brand-textGrey">No category breakdown available for this area.</p>
                    )}
                  </div>

                  <div className="mt-4 border-t border-gray-800 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-brand-textGrey">Area Risk Level*:</span>
                      <span className={`rounded-md px-2 py-1 text-sm font-medium ${getRiskColor(crimeData.riskLevel)}`}>
                        {crimeData.riskLevel}
                      </span>
                    </div>
                    <p className="mt-2 text-[11px] leading-relaxed text-brand-textGrey/70">
                      {crimeData.dataSource === 'scottish-gov'
                        ? '* Risk level is based on crimes per 10,000 residents across the council area. Low (<200), Medium (200–399), Medium-High (400–599), High (600+).'
                        : '* Risk level is based on total recorded crimes within approximately 1 mile of the postcode. Low (<200), Medium (200–499), Medium-High (500–999), High (1,000+).'}
                    </p>
                  </div>
                </>
              )}
              <div className="mt-4 border-t border-gray-800 pt-2.5 text-xs text-brand-textGrey">
                {localRiskSourceText}
              </div>
            </div>

            {/* Report Incidents */}
            <div className="card hover:border-brand-primary/30 transition-all">
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-primary/30 bg-brand-primary/10">
                  <Siren className="h-4 w-4 text-brand-primary" />
                </span>
                <h3 className="text-brand-primary text-xl font-semibold">Report Incidents</h3>
              </div>
              <p className="text-brand-textGrey text-sm mb-4">
                Choose the type of incident to share what's happening in your area.
              </p>

              <button
                onClick={() => navigate('/app')}
                className="inline-flex items-center justify-center rounded-full bg-amber-500 hover:bg-amber-400 px-6 py-2 text-sm font-semibold text-gray-900 transition-colors"
              >
                Report Incident
              </button>
              <div className="mt-auto border-t border-gray-800 pt-3 mt-4 text-xs text-brand-textGrey">
                Community-powered incident reporting
              </div>
            </div>

            {/* Environmental Risks */}
            <div className="card lg:col-span-2 hover:border-brand-primary/30 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-primary/30 bg-brand-primary/10">
                    <CloudRain className="h-4 w-4 text-brand-primary" />
                  </span>
                  <h3 className="text-brand-primary text-xl font-semibold">Environmental Risks</h3>
                </div>
                <button
                  onClick={() => setAlertsEnabled((value) => !value)}
                  className={`relative h-8 w-14 rounded-full border transition-all duration-300 ${alertsEnabled
                    ? 'border-amber-600 bg-gradient-to-r from-amber-700 to-amber-600'
                    : 'border-gray-600 bg-gray-800'}`}
                  aria-label="Toggle environmental monitoring"
                >
                  <span
                    className={`absolute top-1 h-6 w-6 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 shadow-lg transition-all duration-300 ${alertsEnabled ? 'left-7' : 'left-1'}`}
                  />
                </button>
              </div>

              <p className="mt-3 text-base font-semibold text-amber-500">{environmentalArea}</p>
              <p className="mt-1 text-sm text-brand-textGrey">{environmentalMessage}</p>

              <button
                onClick={() => navigate('/weather-alerts')}
                className="mt-4 inline-flex items-center justify-center rounded-full bg-brand-primary hover:bg-brand-darkBlue px-6 py-2 text-sm font-semibold text-white transition-colors"
              >
                View All Alerts
              </button>
              <div className="mt-4 border-t border-gray-800 pt-2.5 text-right text-xs text-brand-textGrey">
                Data source: Met Office / Environment Agency
              </div>
            </div>

            {/* UK Security Status */}
            <div className="card lg:col-span-2 hover:border-brand-primary/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-brand-primary" />
                  <h3 className="text-brand-text text-xl font-semibold">UK Security Status</h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-brand-textGrey">
                  <ShieldCheck className="h-4 w-4 text-brand-primary" />
                  Live Data
                </div>
              </div>

              <p className="text-brand-textGrey text-sm mb-4">
                Current national security status from official UK threat intelligence sources.
              </p>

              <ThreatMeter
                level={threatLevelForMeter}
                levelLabel={threatDisplay.level}
                heading="ThreatMeter"
                isLoading={threatLoading}
              />

              <div className="mt-4 pt-4 border-t border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
                <span className="text-brand-textGrey">
                  {threatDisplay.description}
                </span>
                <div className="flex items-center gap-3">
                  <a
                    href={CIRCLE_URLS.guidance}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-primary hover:text-brand-secondary transition-colors"
                  >
                    Learn more
                  </a>
                  <span className="text-xs text-brand-textGrey">Updated: {lastUpdated}</span>
                </div>
              </div>
            </div>

            {/* National Crime & Safety Updates */}
            <div className="card hover:border-brand-primary/30 transition-all">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-brand-primary/30 bg-brand-primary/10">
                  <BellRing className="h-5 w-5 text-brand-primary" />
                </span>
                <div>
                  <h3 className="text-brand-text text-xl font-semibold">National Crime & Safety Updates</h3>
                  <p className="mt-2 text-sm text-brand-textGrey">
                    View the latest crime and public safety updates from trusted UK sources.
                  </p>
                </div>
              </div>
              <Link
                to="/news"
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-primary hover:text-brand-secondary transition-colors"
              >
                View News
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Nearest Emergency Points */}
            <div id="nearest-emergency-points" className="card hover:border-brand-primary/30 transition-all">
              <div className="flex items-start gap-3 mb-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-brand-primary/30 bg-brand-primary/10">
                  <LocateFixed className="h-5 w-5 text-brand-primary" />
                </span>
                <div>
                  <h3 className="text-brand-text text-xl font-semibold">Nearest Emergency Points</h3>
                  <p className="mt-2 text-sm text-brand-textGrey">
                    Find nearby emergency services and important safety locations.
                  </p>
                </div>
              </div>

              {emergencyServices && (
                <div className="space-y-2 rounded-xl border border-gray-700 bg-brand-inputBackground p-3 mb-4">
                  {emergencyServices.hospital && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${emergencyServices.hospital.lat},${emergencyServices.hospital.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-3 rounded-lg border border-gray-700 bg-brand-background px-3 py-2 text-sm hover:border-brand-primary/50 transition-colors group"
                    >
                      <span className="text-brand-text">🏥 Hospital: {emergencyServices.hospital.name}</span>
                      <span className="flex items-center gap-1 shrink-0 text-xs text-brand-primary">
                        {emergencyServices.hospital.distance}
                        <ChevronRight className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                      </span>
                    </a>
                  )}
                  {emergencyServices.police && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${emergencyServices.police.lat},${emergencyServices.police.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-3 rounded-lg border border-gray-700 bg-brand-background px-3 py-2 text-sm hover:border-brand-primary/50 transition-colors group"
                    >
                      <span className="text-brand-text">👮 Police: {emergencyServices.police.name}</span>
                      <span className="flex items-center gap-1 shrink-0 text-xs text-brand-primary">
                        {emergencyServices.police.distance}
                        <ChevronRight className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                      </span>
                    </a>
                  )}
                  {emergencyServices.fireStation && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${emergencyServices.fireStation.lat},${emergencyServices.fireStation.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-3 rounded-lg border border-gray-700 bg-brand-background px-3 py-2 text-sm hover:border-brand-primary/50 transition-colors group"
                    >
                      <span className="text-brand-text">🚒 Fire: {emergencyServices.fireStation.name}</span>
                      <span className="flex items-center gap-1 shrink-0 text-xs text-brand-primary">
                        {emergencyServices.fireStation.distance}
                        <ChevronRight className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                      </span>
                    </a>
                  )}
                  {emergencyServices.ambulance && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${emergencyServices.ambulance.lat},${emergencyServices.ambulance.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-3 rounded-lg border border-gray-700 bg-brand-background px-3 py-2 text-sm hover:border-brand-primary/50 transition-colors group"
                    >
                      <span className="text-brand-text">🚑 Ambulance: {emergencyServices.ambulance.name}</span>
                      <span className="flex items-center gap-1 shrink-0 text-xs text-brand-primary">
                        {emergencyServices.ambulance.distance}
                        <ChevronRight className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                      </span>
                    </a>
                  )}
                  <p className="text-[11px] text-brand-textGrey/60 pt-1">Tap to open directions in Google Maps</p>
                </div>
              )}

              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center justify-between bg-gray-800/60 rounded-lg px-3 py-2">
                  <span className="text-brand-text">Emergency (Police, Fire, Ambulance)</span>
                  <span className="text-brand-primary font-semibold">999</span>
                </div>
                <div className="flex items-center justify-between bg-gray-800/60 rounded-lg px-3 py-2">
                  <span className="text-brand-text">Police non-emergency</span>
                  <span className="text-brand-primary font-semibold">101</span>
                </div>
                <div className="flex items-center justify-between bg-gray-800/60 rounded-lg px-3 py-2">
                  <span className="text-brand-text">NHS non-emergency</span>
                  <span className="text-brand-primary font-semibold">111</span>
                </div>
              </div>

              <div className="space-y-2">
                <Link
                  to="/app"
                  className="w-full inline-flex items-center justify-center bg-brand-primary hover:bg-brand-darkBlue text-white rounded-lg px-4 py-2 font-medium transition-colors"
                >
                  Check nearest emergency points
                </Link>
                <a
                  href={CIRCLE_URLS.home}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 border border-brand-primary/40 text-brand-text rounded-lg px-4 py-2 font-medium hover:border-brand-primary hover:text-brand-primary transition-colors"
                >
                  circleukgroup.co.uk
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Precise Location (what3words) */}
            <PreciseLocation />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
