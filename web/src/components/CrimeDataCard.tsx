import React, { useState, useEffect } from 'react';
import { MapPin, TrendingUp, TrendingDown, Search, Building2, Shield, Flame, Ambulance, Info } from 'lucide-react';
import { fetchUnifiedCrimeSummary, getCoordinatesFromPostcode, type UnifiedCrimeSummary } from '../lib/crime';
import { fetchNearestEmergencyServices, type NearestServices } from '../lib/emergencyServices';

// LocalStorage keys
const STORAGE_KEYS = {
  POSTCODE: 'crimeData_postcode',
  CRIME_DATA: 'crimeData_crimeData',
  EMERGENCY_SERVICES: 'crimeData_emergencyServices',
};

// Type guard to check if data is Scottish
function isScottishData(data: UnifiedCrimeSummary): data is UnifiedCrimeSummary & { dataSource: 'scottish-gov' } {
  return data.dataSource === 'scottish-gov';
}

// Helper functions for localStorage
function saveToLocalStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

function loadFromLocalStorage<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    console.error('Failed to load from localStorage:', e);
    return null;
  }
}

export function CrimeDataCard() {
  const [postcode, setPostcode] = useState(() => loadFromLocalStorage<string>(STORAGE_KEYS.POSTCODE) || '');
  const [crimeData, setCrimeData] = useState<UnifiedCrimeSummary | null>(() => loadFromLocalStorage<UnifiedCrimeSummary>(STORAGE_KEYS.CRIME_DATA));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emergencyServices, setEmergencyServices] = useState<NearestServices | null>(() => loadFromLocalStorage<NearestServices>(STORAGE_KEYS.EMERGENCY_SERVICES));
  const [servicesLoading, setServicesLoading] = useState(false);

  // Persist postcode to localStorage whenever it changes
  useEffect(() => {
    if (postcode) {
      saveToLocalStorage(STORAGE_KEYS.POSTCODE, postcode);
    }
  }, [postcode]);

  // Persist crime data to localStorage whenever it changes
  useEffect(() => {
    if (crimeData) {
      saveToLocalStorage(STORAGE_KEYS.CRIME_DATA, crimeData);
    }
  }, [crimeData]);

  // Persist emergency services to localStorage whenever it changes
  useEffect(() => {
    if (emergencyServices) {
      saveToLocalStorage(STORAGE_KEYS.EMERGENCY_SERVICES, emergencyServices);
    }
  }, [emergencyServices]);

  const handleSearch = async () => {
    if (!postcode.trim()) return;
    setLoading(true);
    setServicesLoading(true);
    setError(null);
    setEmergencyServices(null);

    try {
      // Get coordinates first for emergency services lookup
      const coords = await getCoordinatesFromPostcode(postcode.trim());

      // Fetch crime data and emergency services in parallel
      const [crimeResult, servicesResult] = await Promise.allSettled([
        fetchUnifiedCrimeSummary(postcode.trim()),
        fetchNearestEmergencyServices(coords.lat, coords.lng),
      ]);

      // Handle crime data result
      if (crimeResult.status === 'fulfilled') {
        setCrimeData(crimeResult.value);
      } else {
        setError(crimeResult.reason?.message || 'Failed to fetch crime data');
        setCrimeData(null);
      }

      // Handle emergency services result
      if (servicesResult.status === 'fulfilled') {
        setEmergencyServices(servicesResult.value);
      }
    } catch (e: unknown) {
      setError((e as Error)?.message || 'Failed to fetch data');
      setCrimeData(null);
    } finally {
      setLoading(false);
      setServicesLoading(false);
    }
  };

  const handlePostcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPostcode = e.target.value;
    setPostcode(newPostcode);
    
    // If postcode is cleared, clear all data
    if (!newPostcode.trim()) {
      setCrimeData(null);
      setEmergencyServices(null);
      setError(null);
      try {
        localStorage.removeItem(STORAGE_KEYS.POSTCODE);
        localStorage.removeItem(STORAGE_KEYS.CRIME_DATA);
        localStorage.removeItem(STORAGE_KEYS.EMERGENCY_SERVICES);
      } catch (e) {
        console.error('Failed to clear localStorage:', e);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Get risk level color
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'High': return 'bg-red-500/20 text-red-500';
      case 'Medium-High': return 'bg-orange-500/20 text-orange-500';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-500';
      case 'Low': return 'bg-green-500/20 text-green-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  // Get trend icon and color
  const getTrendDisplay = () => {
    if (!crimeData || crimeData.trend === '--') {
      return { icon: null, color: 'text-gray-400', value: '--' };
    }
    const isPositive = crimeData.trend.startsWith('+');
    const isNegative = crimeData.trend.startsWith('-');

    if (isPositive) {
      return {
        icon: <TrendingUp className="h-4 w-4 mr-1" />,
        color: 'text-red-500',
        value: crimeData.trend
      };
    }
    if (isNegative) {
      return {
        icon: <TrendingDown className="h-4 w-4 mr-1" />,
        color: 'text-green-500',
        value: crimeData.trend
      };
    }
    return { icon: null, color: 'text-gray-400', value: crimeData.trend };
  };

  const trendDisplay = getTrendDisplay();

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-[#1785d1]/30 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-lg font-semibold">Crime Risk Analysis</h3>
        <MapPin className="h-6 w-6 text-[#1785d1]" />
      </div>

      {/* Postcode Search */}
      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          placeholder="Enter postcode (e.g., SW1A 1AA)"
          value={postcode}
          onChange={handlePostcodeChange}
          onKeyPress={handleKeyPress}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:border-[#1785d1] focus:outline-none"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-[#1785d1] hover:bg-[#126aa7] disabled:opacity-60 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-red-400 text-sm mb-3">{error}</div>
      )}

      {/* Scottish Council Area Banner */}
      {crimeData && isScottishData(crimeData) && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4">
          <div className="flex items-start space-x-2">
            <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-blue-400 text-sm font-medium">Council Area Statistics</div>
              <div className="text-blue-300/80 text-xs mt-1">
                This shows crime data for the entire {crimeData.councilArea} council area, not just your immediate neighbourhood.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-800 rounded-lg p-3">
          {crimeData && isScottishData(crimeData) ? (
            <>
              <div className="text-2xl font-bold text-white">
                {loading ? '...' : crimeData.crimeRate.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">
                per 10,000 residents
              </div>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold text-white">
                {loading ? '...' : (crimeData?.totalCrimes.toLocaleString() ?? '—')}
              </div>
              <div className="text-xs text-gray-400">
                {crimeData?.monthDisplay ? `Crimes (${crimeData.monthDisplay})` : 'Total Crimes'}
              </div>
            </>
          )}
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
          <div className={`flex items-center ${trendDisplay.color}`}>
            {trendDisplay.icon}
            <span className="text-2xl font-bold">{loading ? '...' : trendDisplay.value}</span>
          </div>
          <div className="text-xs text-gray-400">
            {crimeData && isScottishData(crimeData) ? 'vs Previous Year' : 'vs Previous Month'}
          </div>
        </div>
      </div>

      {/* Crime Breakdown - Matching Expo App Style */}
      <div className="space-y-3">
        {loading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1785d1]"></div>
            <span className="text-gray-400 text-sm ml-2">Fetching crime data...</span>
          </div>
        )}

        {!loading && crimeData && crimeData.topCrimes.length > 0 && (
          <>
            {crimeData.topCrimes.map((crime, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-300 text-sm flex-1 mr-2">{crime.type}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-800 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, crime.percentage * 2)}%`,
                        backgroundColor: crime.colour,
                      }}
                    />
                  </div>
                  <span className="text-white text-sm w-10 text-right">{crime.count}</span>
                </div>
              </div>
            ))}
          </>
        )}

        {!loading && !error && !crimeData && (
          <div className="text-gray-400 text-sm text-center py-2">
            Enter a postcode to see local crime breakdown.
          </div>
        )}
      </div>

      {/* Risk Level Footer */}
      <div className="mt-4 pt-4 border-t border-gray-800">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Area Risk Level:</span>
          <span className={`px-2 py-1 rounded text-sm font-medium ${crimeData ? getRiskColor(crimeData.riskLevel) : 'bg-gray-500/20 text-gray-500'}`}>
            {loading ? '...' : (crimeData?.riskLevel ?? '—')}
          </span>
        </div>
        {crimeData && (
          <div className="text-xs text-gray-500 mt-2">
            {isScottishData(crimeData) ? (
              <>Data source: Scottish Government Statistics • {crimeData.fiscalYear} fiscal year</>
            ) : (
              <>Data source: UK Police API • {crimeData.monthDisplay}</>
            )}
          </div>
        )}
      </div>

      {/* Nearest Emergency Services */}
      {(servicesLoading || emergencyServices) && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <h4 className="text-white text-sm font-semibold mb-3">Nearest Emergency Services</h4>

          {servicesLoading && (
            <div className="flex items-center py-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#1785d1]"></div>
              <span className="text-gray-400 text-sm ml-2">Finding nearby services...</span>
            </div>
          )}

          {!servicesLoading && emergencyServices && (
            <div className="space-y-2">
              {/* Hospital */}
              <div className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2">
                <div className="flex items-center">
                  <Building2 className="h-4 w-4 text-red-400 mr-2" />
                  <div>
                    <div className="text-white text-sm">Hospital</div>
                    <div className="text-gray-400 text-xs">
                      {emergencyServices.hospital?.name || 'Not found nearby'}
                    </div>
                  </div>
                </div>
                {emergencyServices.hospital && (
                  <span className="text-gray-300 text-sm">{emergencyServices.hospital.distance}</span>
                )}
              </div>

              {/* Police Station */}
              <div className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 text-blue-400 mr-2" />
                  <div>
                    <div className="text-white text-sm">Police Station</div>
                    <div className="text-gray-400 text-xs">
                      {emergencyServices.police?.name || 'Not found nearby'}
                    </div>
                  </div>
                </div>
                {emergencyServices.police && (
                  <span className="text-gray-300 text-sm">{emergencyServices.police.distance}</span>
                )}
              </div>

              {/* Fire Station */}
              <div className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2">
                <div className="flex items-center">
                  <Flame className="h-4 w-4 text-orange-400 mr-2" />
                  <div>
                    <div className="text-white text-sm">Fire Station</div>
                    <div className="text-gray-400 text-xs">
                      {emergencyServices.fireStation?.name || 'Not found nearby'}
                    </div>
                  </div>
                </div>
                {emergencyServices.fireStation && (
                  <span className="text-gray-300 text-sm">{emergencyServices.fireStation.distance}</span>
                )}
              </div>

              {/* Ambulance Station */}
              <div className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2">
                <div className="flex items-center">
                  <Ambulance className="h-4 w-4 text-green-400 mr-2" />
                  <div>
                    <div className="text-white text-sm">Ambulance Station</div>
                    <div className="text-gray-400 text-xs">
                      {emergencyServices.ambulance?.name || 'Not found nearby'}
                    </div>
                  </div>
                </div>
                {emergencyServices.ambulance && (
                  <span className="text-gray-300 text-sm">{emergencyServices.ambulance.distance}</span>
                )}
              </div>

              <div className="text-xs text-gray-500 mt-2">
                Data source: OpenStreetMap
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
