import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BellRing,
  CircleDot,
  CloudRain,
  Edit3,
  ExternalLink,
  LayoutDashboard,
  Leaf,
  LocateFixed,
  LogOut,
  MapPin,
  ShieldCheck,
  Siren,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { HubSpotChat } from './HubSpotChat';
import { useAuth } from '../auth/AuthProvider';
import { signOut } from '../supabase/authService';
import { getUserProfile } from '../supabase/db';
import type { UserProfile } from '../supabase/database.types';
import { fetchThreatLevel, type ThreatLevelInfo } from '../lib/api/threat';
import { fetchUnifiedCrimeSummary, getCoordinatesFromPostcode, type UnifiedCrimeSummary } from '../lib/crime';
import { fetchNearestEmergencyServices, type NearestServices } from '../lib/emergencyServices';
import { fetchUnifiedWeatherAlerts, type UnifiedWeatherAlert } from '../lib/api';
import { ThreatMeter, threatLevelToIndex } from './ThreatMeter';

// Threat level descriptions matching the database values
const THREAT_DESCRIPTIONS: Record<string, string> = {
  'Low': 'An attack is highly unlikely.',
  'Moderate': 'An attack is possible but not likely.',
  'Substantial': 'An attack is likely.',
  'Severe': 'An attack is highly likely.',
  'Critical': 'An attack is highly likely in the near future.',
};

// Map threat level to color class
function threatColor(level: string): string {
  const normalized = level?.toLowerCase() ?? '';
  if (normalized === 'low') return '#22c55e';
  if (normalized === 'moderate') return '#eab308';
  if (normalized === 'substantial') return '#f59e0b';
  if (normalized === 'severe') return '#ef4444';
  if (normalized === 'critical') return '#b91c1c';
  return '#6b7280';
}

export function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

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

  const loadUserProfile = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await getUserProfile();
      if (data) {
        setUserProfile(data);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user, loadUserProfile]);

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
      return { level: 'Loading...', description: 'Fetching latest official threat level...', color: '#6b7280' };
    }
    if (threatError || !threatInfo?.nationalLevel) {
      return { level: threatError ? 'N/A' : 'Unknown', description: threatError || 'Threat level data unavailable', color: '#6b7280' };
    }
    const level = threatInfo.nationalLevel;
    return {
      level,
      description: threatInfo.nationalDescription || THREAT_DESCRIPTIONS[level] || 'No description available.',
      color: threatColor(level),
    };
  }, [threatInfo, threatLoading, threatError]);

  // Format last updated time
  const lastUpdated = useMemo(() => {
    if (threatInfo?.updatedAt) {
      return new Date(threatInfo.updatedAt).toLocaleString('en-GB', { timeZone: 'Europe/London' }) + ' GMT';
    }
    return new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' }) + ' GMT';
  }, [threatInfo]);

  const displayName = useMemo(() => {
    if (userProfile?.first_name) {
      return userProfile.first_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  }, [user, userProfile]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const handleLookupRisk = async () => {
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
  };

  const handlePostcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLookupRisk();
    }
  };

  const localRiskSummary = useMemo(() => {
    if (!crimeData) {
      return 'Enter your postcode to see safety and crime information for your area.';
    }

    const monthlyValue = crimeData.dataSource === 'scottish-gov'
      ? `${crimeData.crimeRate.toLocaleString()} crimes per 10,000 residents`
      : `${crimeData.totalCrimes.toLocaleString()} recorded incidents (${crimeData.monthDisplay})`;

    return `${crimeData.riskLevel} risk level. ${monthlyValue}.`;
  }, [crimeData]);

  const environmentalArea = environmentalAlert?.area || 'Upper Bristol Avon area';
  const environmentalMessage = !alertsEnabled
    ? 'Alert monitoring is paused. Toggle to continue receiving environmental warnings.'
    : environmentalLoading
      ? 'Loading latest flood and weather warnings for your area.'
      : environmentalError
        ? environmentalError
        : environmentalAlert?.description ||
          'River levels are rising at the Great Somerford gauge. Flooding is forecast to affect locations near the Bristol Avon, Tetbury Avon, Sherston Avon, Dauntsey Brook, with low lying land and roads.';

  const panelClass = 'rounded-2xl border border-[#1f2a3d] bg-[#0f172a]/85';
  const linkClass = 'text-[#00bcd4] hover:text-[#31d4e8] transition-colors';

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <HubSpotChat />

      <header className="border-b border-[#1f2a3d] bg-[#0d121e]">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2">
              <CircleDot className="h-6 w-6 text-white" />
              <span className="text-lg font-semibold text-white">Circle</span>
            </Link>
            <Link to="/dashboard" className="flex items-center gap-2 text-sm font-semibold text-[#00bcd4]">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="hidden items-center gap-2 text-gray-300 sm:flex">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Online
            </div>
            <span className="hidden text-gray-300 md:block">Hi, {displayName}</span>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-xl border border-[#2a354c] bg-[#121a2b] px-4 py-2 text-sm text-white transition-colors hover:border-[#00bcd4]/40 hover:text-[#00bcd4]"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 pb-8 pt-10 sm:px-6 lg:px-8">
        <section className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
            Your Risk & Safety Overview
          </h1>
          <p className="mx-auto mt-4 max-w-4xl text-base text-gray-300 md:text-xl">
            Clear, trusted insight into security, crime, and environmental risks across the UK in one place.
          </p>
        </section>

        <section className="flex flex-col gap-6 lg:flex-row">
          <aside className="h-fit w-full lg:sticky lg:top-6 lg:w-[280px] lg:flex-shrink-0">
            <div className="rounded-[26px] border border-[#2b3850] bg-[#0c1527]/95 p-6 shadow-[0_18px_50px_rgba(2,8,23,0.55)] backdrop-blur-sm">
              <div className="mb-4 text-lg font-semibold tracking-wide text-[#00bcd4]">Menu</div>
              <nav className="space-y-3.5 text-[17px] leading-tight">
                <button onClick={() => navigate('/settings/edit-profile')} className="block w-full text-left text-white transition-colors duration-200 hover:text-[#00bcd4]">Profile</button>
                <button onClick={() => navigate('/settings')} className="block w-full text-left text-white transition-colors duration-200 hover:text-[#00bcd4]">Settings</button>
                <button onClick={() => navigate('/app')} className="block w-full text-left text-white transition-colors duration-200 hover:text-[#00bcd4]">Check Your Precise location 3words</button>
                <button onClick={() => document.getElementById('nearest-emergency-points')?.scrollIntoView({ behavior: 'smooth' })} className="block w-full text-left text-white transition-colors duration-200 hover:text-[#00bcd4]">Nearest Emergency points</button>
                <button onClick={() => navigate('/settings/about')} className="block w-full text-left text-white transition-colors duration-200 hover:text-[#00bcd4]">Emergency contacts</button>
                <a href="https://circleukgroup.co.uk/safe-circle" target="_blank" rel="noopener noreferrer" className="block w-full text-left text-white transition-colors duration-200 hover:text-[#00bcd4]">Upgrade*</a>
              </nav>

              <div className="mt-7 rounded-2xl border border-[#2d567a] bg-[#15456f]/75 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <h3 className="text-[27px] font-semibold leading-tight text-white">Rapid Security Cover</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-300">
                  Upgrade to request a trained man guard within the next 45 minutes to help protect people, property, and operations when it matters most.
                </p>
                <button
                  onClick={() => navigate('/app')}
                  className="mt-4 w-full rounded-full bg-[#f59e0b] px-4 py-2.5 font-semibold text-[#111827] transition-colors duration-200 hover:bg-[#fbbf24]"
                >
                  Request a Man Guard
                </button>
              </div>

              <div className="mt-6">
                <h4 className="text-base font-semibold text-[#00bcd4]">Trusted Data Sources</h4>
                <p className="mt-2 text-sm text-gray-400">
                  Information is aggregated from official UK authorities and verified public sources.
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2.5">
                  <div className="rounded-lg border border-[#30425d] bg-[#0f1b2f]/90 px-2 py-2.5 text-center text-[10.5px] leading-snug text-gray-300">
                    <ShieldCheck className="mx-auto mb-1 h-3.5 w-3.5 text-[#00bcd4]" />
                    Security Service
                  </div>
                  <div className="rounded-lg border border-[#30425d] bg-[#0f1b2f]/90 px-2 py-2.5 text-center text-[10.5px] leading-snug text-gray-300">
                    <CloudRain className="mx-auto mb-1 h-3.5 w-3.5 text-[#00bcd4]" />
                    Met Office
                  </div>
                  <div className="rounded-lg border border-[#30425d] bg-[#0f1b2f]/90 px-2 py-2.5 text-center text-[10.5px] leading-snug text-gray-300">
                    <Leaf className="mx-auto mb-1 h-3.5 w-3.5 text-[#00bcd4]" />
                    Environment Agency
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="grid flex-1 grid-cols-1 gap-4 xl:grid-cols-2">
            <article className={`${panelClass} p-5`}>
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#1e4762] bg-[#0a2438]">
                  <MapPin className="h-4 w-4 text-[#3cdaf5]" />
                </span>
                <h2 className="text-2xl font-semibold text-white">Local Risk Awareness</h2>
              </div>
              <p className="text-sm leading-relaxed text-gray-300">Enter your postcode to see safety and crime information for your area.</p>

              <div className="mt-4 flex items-center gap-2 rounded-full border border-[#2e3f59] bg-[#091223] px-2.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <MapPin className="ml-1 h-4 w-4 shrink-0 text-[#4ad8f1]" />
                <input
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  onKeyDown={handlePostcodeKeyDown}
                  placeholder="Enter postcode (e.g., SW1A 1AA)"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                />
                <button
                  onClick={handleLookupRisk}
                  disabled={riskLoading}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#415275] bg-[#0f1c31] text-gray-200 transition-colors hover:border-[#3cdaf5] hover:text-white disabled:opacity-60"
                  aria-label="Lookup local risk"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mt-3 min-h-10 px-1 text-sm leading-relaxed text-gray-300">
                {riskLoading && 'Checking local risk and nearest emergency points...'}
                {!riskLoading && riskError && (
                  <span className="flex items-center gap-2 text-red-400">
                    <AlertTriangle className="h-4 w-4" />
                    {riskError}
                  </span>
                )}
                {!riskLoading && !riskError && localRiskSummary}
              </div>
              <div className="mt-4 border-t border-[#1f2a3d] pt-2.5 text-[11px] tracking-wide text-gray-500">Data source: scottish Council</div>
            </article>

            <article className={`${panelClass} flex h-full flex-col p-5`}>
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#1e4762] bg-[#0a2438]">
                  <Siren className="h-[18px] w-[18px] text-[#38d7f2]" />
                </span>
                <h2 className="text-2xl font-semibold text-[#30c8e9]">Report Incidents</h2>
              </div>
              <p className="max-w-[34ch] text-sm leading-relaxed text-gray-300">
                Choose the type of incident to share what&apos;s happening in your area.
              </p>

              <button
                onClick={() => navigate('/app')}
                className="mt-5 inline-flex w-fit items-center justify-center rounded-full border border-[#d68600] bg-[#f59e0b] px-6 py-2 text-sm font-semibold text-[#101827] transition-colors hover:bg-[#fbbf24]"
              >
                Report Incident
              </button>
              <div className="mt-auto border-t border-[#1f2a3d] pt-3 text-[11px] tracking-wide text-gray-500">Data source: scottish Council</div>
            </article>

            <article className={`${panelClass} p-5 xl:col-span-2`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2.5 text-[#38dff6]">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#1f6072] bg-[#0b2535]">
                    <CloudRain className="h-5 w-5" />
                  </span>
                  <h2 className="text-2xl font-semibold text-[#50e6ff]">Environmental Risks</h2>
                </div>
                <button
                  onClick={() => setAlertsEnabled((value) => !value)}
                  className={`relative h-8 w-14 rounded-full border transition-all duration-300 ${alertsEnabled
                    ? 'border-[#9f7713] bg-gradient-to-r from-[#594313] to-[#7a5a14]'
                    : 'border-[#2d384b] bg-[#1a2435]'}`}
                  aria-label="Toggle environmental monitoring"
                >
                  <span
                    className={`absolute top-1 h-6 w-6 rounded-full bg-gradient-to-b from-[#facc15] to-[#d97706] shadow-[0_2px_8px_rgba(0,0,0,0.45)] transition-all duration-300 ${alertsEnabled ? 'left-7' : 'left-1'}`}
                  />
                </button>
              </div>

              <p className="mt-3 text-base font-semibold text-[#f59e0b]">{environmentalArea}</p>
              <p className="mt-1 max-w-[95ch] text-sm leading-relaxed text-gray-300">{environmentalMessage}</p>

              <button
                onClick={() => navigate('/weather-alerts')}
                className="mt-4 inline-flex items-center justify-center rounded-full border border-[#39d9ed] bg-[#00bcd4] px-6 py-2 text-sm font-semibold text-[#0b1220] shadow-[0_8px_24px_rgba(0,188,212,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#31d4e8]"
              >
                View All alerts
              </button>
              <div className="mt-4 border-t border-[#1f2a3d] pt-2.5 text-right text-[11px] tracking-wide text-gray-500">Data source: scottish Council</div>
            </article>

            <article className={`${panelClass} p-5 xl:col-span-2`}>
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-[#00bcd4]">
                    <ShieldCheck className="h-5 w-5" />
                    <h2 className="text-2xl font-semibold">UK Security Status</h2>
                  </div>
                  <p className="text-sm text-gray-300">Current national security status.</p>
                  <p className="mt-1 text-sm text-gray-400">{threatDisplay.description}</p>
                  <a
                    href="https://www.mi5.gov.uk/threat-levels"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-2 inline-flex items-center gap-1 text-sm ${linkClass}`}
                  >
                    Learn more
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <p className="mt-2 text-xs text-gray-500">Updated: {lastUpdated}</p>
                </div>

                <div className="rounded-xl border border-[#27364f] bg-[#10172a] px-4 py-3">
                  <ThreatMeter
                    level={threatLevelToIndex(threatDisplay.level)}
                    levelLabel={threatDisplay.level}
                    isLoading={threatLoading}
                    compact
                  />
                </div>
              </div>
            </article>

            <article className={`${panelClass} p-5`}>
              <div className="flex h-full flex-col">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#1f6072] bg-[#0a2230] text-[#4befff]">
                    <BellRing className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-2xl font-semibold leading-tight text-[#d9faff]">National Crime & Safety Updates</h2>
                    <p className="mt-2 text-sm leading-relaxed text-gray-300">
                      View the latest crime and public safety updates from trusted UK sources.
                    </p>
                  </div>
                </div>
                <Link to="/news" className={`mt-4 inline-flex items-center gap-1 text-sm font-medium ${linkClass}`}>
                  Learn more
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>

            <article id="nearest-emergency-points" className={`${panelClass} p-5`}>
              <div className="flex h-full flex-col">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#1f6072] bg-[#0a2230] text-[#4befff]">
                    <LocateFixed className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-2xl font-semibold leading-tight text-[#d9faff]">Nearest Emergency Points</h2>
                    <p className="mt-2 text-sm leading-relaxed text-gray-300">
                      Find nearby emergency services and important safety locations.
                    </p>
                  </div>
                </div>

                {emergencyServices && (
                  <div className="mt-4 space-y-2 rounded-xl border border-[#20314a] bg-[#0a1528]/90 p-3">
                    {emergencyServices.hospital && (
                      <div className="flex items-start justify-between gap-3 rounded-lg border border-[#233957] bg-[#0e1a30] px-3 py-2 text-sm">
                        <span className="text-gray-200">Hospital: {emergencyServices.hospital.name}</span>
                        <span className="shrink-0 text-xs text-[#89eaf7]">{emergencyServices.hospital.distance}</span>
                      </div>
                    )}
                    {emergencyServices.police && (
                      <div className="flex items-start justify-between gap-3 rounded-lg border border-[#233957] bg-[#0e1a30] px-3 py-2 text-sm">
                        <span className="text-gray-200">Police: {emergencyServices.police.name}</span>
                        <span className="shrink-0 text-xs text-[#89eaf7]">{emergencyServices.police.distance}</span>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={() => navigate('/app')}
                  className={`mt-4 inline-flex items-center gap-1 text-sm font-medium ${linkClass}`}
                >
                  Check your nearest emergency points
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
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
