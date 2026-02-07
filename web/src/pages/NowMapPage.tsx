import { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X, Plus, ThumbsUp, Loader2 } from 'lucide-react';
import { Header } from '../components/Header';
import { SEO } from '../components/SEO';
import {
  getActiveIncidentsInBounds,
  createIncident,
  likeIncident,
  subscribeToIncidents,
  formatTimeAgo,
  type Incident,
  type IncidentWithLiked,
  type IncidentCategory,
} from '../supabase/incidents';
import { INCIDENT_CATEGORY_LABELS, getIncidentCategories } from '../lib/incidentSanitizer';
import { roundCoordinates } from '../lib/geohash';

// Default center (London)
const DEFAULT_CENTER: [number, number] = [51.5074, -0.1278];
const DEFAULT_ZOOM = 13;

// Category icons - neutral colors, no alarmist visuals
const CATEGORY_ICONS: Record<string, { emoji: string; color: string }> = {
  noise: { emoji: '🔊', color: '#6366f1' },
  road_incident: { emoji: '🚗', color: '#f59e0b' },
  disturbance: { emoji: '⚠️', color: '#ef4444' },
  property_damage: { emoji: '🏠', color: '#8b5cf6' },
  fly_tipping: { emoji: '🗑️', color: '#84cc16' },
  vandalism: { emoji: '🔨', color: '#ec4899' },
  travellers_in_area: { emoji: '🚐', color: '#14b8a6' },
  fire: { emoji: '🔥', color: '#f97316' },
  other: { emoji: '📍', color: '#6b7280' },
  suspicious_activity: { emoji: '👁️', color: '#64748b' },
};

function createCategoryIcon(category: string): L.DivIcon {
  const config = CATEGORY_ICONS[category] || CATEGORY_ICONS.other;
  return L.divIcon({
    className: 'custom-incident-marker',
    html: `<div style="
      background: ${config.color};
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      border: 2px solid white;
    ">${config.emoji}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
}

// Pin icon for report mode
const reportPinIcon = L.divIcon({
  className: 'report-pin-marker',
  html: `<div style="
    background: #1785d1;
    width: 40px;
    height: 40px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(23,133,209,0.5);
    border: 3px solid white;
  "><span style="transform: rotate(45deg); font-size: 18px;">📍</span></div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

// Map event handler component
function MapEventHandler({
  isReportMode,
  onMapClick,
  onBoundsChange,
}: {
  isReportMode: boolean;
  onMapClick: (lat: number, lng: number) => void;
  onBoundsChange: (bounds: L.LatLngBounds) => void;
}) {
  const map = useMapEvents({
    click: (e) => {
      if (isReportMode) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
    moveend: () => {
      onBoundsChange(map.getBounds());
    },
    zoomend: () => {
      onBoundsChange(map.getBounds());
    },
  });

  // Initial bounds
  useEffect(() => {
    onBoundsChange(map.getBounds());
  }, [map, onBoundsChange]);

  return null;
}

// Center map on location
function MapCenterer({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, DEFAULT_ZOOM);
  }, [center, map]);
  return null;
}

export function NowMapPage() {
  const [userLocation, setUserLocation] = useState<[number, number]>(DEFAULT_CENTER);
  const [incidents, setIncidents] = useState<IncidentWithLiked[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReportMode, setIsReportMode] = useState(false);
  const [reportPin, setReportPin] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<IncidentCategory | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likingIds, setLikingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const boundsRef = useRef<L.LatLngBounds | null>(null);
  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const categories = getIncidentCategories();

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        () => {
          // Keep default London location
        },
        { enableHighAccuracy: false, timeout: 10000 }
      );
    }
  }, []);

  // Fetch incidents for current bounds with debounce
  const fetchIncidentsForBounds = useCallback(async (bounds: L.LatLngBounds) => {
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    const result = await getActiveIncidentsInBounds({
      latMin: sw.lat,
      latMax: ne.lat,
      lngMin: sw.lng,
      lngMax: ne.lng,
      limit: 100,
    });

    setIsLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setIncidents(result.data);
    setError(null);
  }, []);

  const handleBoundsChange = useCallback((bounds: L.LatLngBounds) => {
    boundsRef.current = bounds;

    // Debounce fetch
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    fetchTimeoutRef.current = setTimeout(() => {
      fetchIncidentsForBounds(bounds);
    }, 300);
  }, [fetchIncidentsForBounds]);

  // Realtime subscription
  useEffect(() => {
    const unsubscribe = subscribeToIncidents(
      // On insert
      (newIncident: Incident) => {
        // Check if in current bounds
        if (boundsRef.current) {
          const bounds = boundsRef.current;
          if (
            newIncident.lat >= bounds.getSouthWest().lat &&
            newIncident.lat <= bounds.getNorthEast().lat &&
            newIncident.lng >= bounds.getSouthWest().lng &&
            newIncident.lng <= bounds.getNorthEast().lng
          ) {
            setIncidents((prev) => {
              if (prev.some((i) => i.id === newIncident.id)) return prev;
              return [{ ...newIncident, hasLiked: false }, ...prev];
            });
          }
        }
      },
      // On update
      (updatedIncident: Incident) => {
        setIncidents((prev) =>
          prev
            .map((i) =>
              i.id === updatedIncident.id
                ? { ...updatedIncident, hasLiked: i.hasLiked }
                : i
            )
            .filter(
              (i) =>
                i.is_active &&
                !i.archived_at &&
                new Date(i.expires_at) > new Date()
            )
        );
      }
    );

    return unsubscribe;
  }, []);

  // Handle map click in report mode
  const handleMapClick = (lat: number, lng: number) => {
    const rounded = roundCoordinates(lat, lng);
    setReportPin(rounded);
  };

  // Cancel report mode
  const handleCancelReport = () => {
    setIsReportMode(false);
    setReportPin(null);
    setSelectedCategory('');
    setError(null);
  };

  // Submit report
  const handleSubmitReport = async () => {
    if (!reportPin || !selectedCategory) return;

    setIsSubmitting(true);
    setError(null);

    const result = await createIncident({
      lat: reportPin.lat,
      lng: reportPin.lng,
      category: selectedCategory as IncidentCategory,
    });

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    // Optimistically add to map
    if (result.data) {
      setIncidents((prev) => [{ ...result.data!, hasLiked: false }, ...prev]);
    }

    handleCancelReport();
  };

  // Handle like
  const handleLike = async (incidentId: string) => {
    setIncidents((prev) =>
      prev.map((i) =>
        i.id === incidentId
          ? { ...i, like_count: i.like_count + 1, hasLiked: true }
          : i
      )
    );
    setLikingIds((prev) => new Set(prev).add(incidentId));

    const result = await likeIncident(incidentId);

    setLikingIds((prev) => {
      const next = new Set(prev);
      next.delete(incidentId);
      return next;
    });

    if (!result.success && !result.alreadyLiked) {
      // Revert on error
      setIncidents((prev) =>
        prev.map((i) =>
          i.id === incidentId
            ? { ...i, like_count: i.like_count - 1, hasLiked: false }
            : i
        )
      );
    }
  };

  return (
    <>
      <SEO title="Live Map" noindex />
      <div className="h-screen bg-brand-background flex flex-col overflow-hidden">
        <Header />

      <main className="flex-1 relative min-h-0">
        {/* Map container - full height */}
        <div className="absolute inset-0">
          <MapContainer
            center={userLocation}
            zoom={DEFAULT_ZOOM}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapCenterer center={userLocation} />
            <MapEventHandler
              isReportMode={isReportMode}
              onMapClick={handleMapClick}
              onBoundsChange={handleBoundsChange}
            />

            {/* Incident markers */}
            {incidents.map((incident) => (
              <Marker
                key={incident.id}
                position={[incident.lat, incident.lng]}
                icon={createCategoryIcon(incident.category)}
              >
                <Popup>
                  <div className="min-w-48 p-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                        {INCIDENT_CATEGORY_LABELS[incident.category] || incident.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(incident.created_at)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleLike(incident.id)}
                      disabled={incident.hasLiked || likingIds.has(incident.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors w-full justify-center ${
                        incident.hasLiked
                          ? 'bg-blue-100 text-blue-600 cursor-default'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span>{incident.like_count} helpful</span>
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Report pin */}
            {reportPin && (
              <Marker
                position={[reportPin.lat, reportPin.lng]}
                icon={reportPinIcon}
              />
            )}
          </MapContainer>
        </div>

        {/* Persistent disclaimer banner */}
        <div className="absolute top-4 left-4 z-[1000] max-w-[calc(100vw-200px)] md:max-w-none">
          <div className="bg-amber-900/90 backdrop-blur-sm text-amber-200 text-xs sm:text-sm px-3 py-2 sm:px-4 rounded-lg text-center whitespace-nowrap">
            Community Reporting
          </div>
        </div>

        {/* Report mode overlay */}
        {isReportMode && !reportPin && (
          <div className="absolute top-20 left-4 right-4 z-[1000]">
            <div className="bg-brand-primary/90 backdrop-blur-sm text-white text-sm px-4 py-3 rounded-lg text-center max-w-lg mx-auto">
              Tap the map where the incident occurred. No names or personal details.
            </div>
          </div>
        )}

        {/* Report button */}
        {!isReportMode && !reportPin && (
          <button
            onClick={() => setIsReportMode(true)}
            className="absolute top-4 right-4 z-[1000] flex items-center gap-2 sm:gap-3 px-4 py-3 sm:px-8 sm:py-4 bg-brand-primary hover:bg-[#1470b8] text-white text-base sm:text-lg font-semibold rounded-full shadow-lg transition-colors"
          >
            <Plus className="h-5 w-5 sm:h-7 sm:w-7" />
            <span className="hidden sm:inline">Report</span>
            <span className="sm:hidden">Report</span>
          </button>
        )}

        {/* Cancel report mode button */}
        {isReportMode && !reportPin && (
          <button
            onClick={handleCancelReport}
            className="absolute top-4 right-4 z-[1000] flex items-center gap-2 sm:gap-3 px-4 py-3 sm:px-8 sm:py-4 bg-gray-700 hover:bg-gray-600 text-white text-base sm:text-lg font-semibold rounded-full shadow-lg transition-colors"
          >
            <X className="h-5 w-5 sm:h-7 sm:w-7" />
            <span className="hidden sm:inline">Cancel</span>
            <span className="sm:hidden">Cancel</span>
          </button>
        )}

        {/* Category selection bottom sheet */}
        {reportPin && (
          <div className="absolute bottom-0 left-0 right-0 z-[1000] bg-gray-900 border-t border-gray-800 rounded-t-2xl shadow-2xl">
            <div className="max-w-lg mx-auto p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Select Category</h3>
                <button
                  onClick={handleCancelReport}
                  className="p-1 text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Category grid */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {categories.map((cat) => {
                  const config = CATEGORY_ICONS[cat.value] || CATEGORY_ICONS.other;
                  const isSelected = selectedCategory === cat.value;
                  return (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value as IncidentCategory)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-brand-primary/20 border-2 border-brand-primary'
                          : 'bg-gray-800 border-2 border-transparent hover:bg-gray-700'
                      }`}
                    >
                      <span className="text-2xl">{config.emoji}</span>
                      <span className={`text-xs text-center ${isSelected ? 'text-brand-primary' : 'text-gray-300'}`}>
                        {cat.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Error display */}
              {error && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              {/* Confirm button */}
              <button
                onClick={handleSubmitReport}
                disabled={!selectedCategory || isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-primary hover:bg-[#1470b8] disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Reporting...
                  </>
                ) : (
                  'Confirm Report'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000]">
            <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg p-4">
              <Loader2 className="h-8 w-8 text-brand-primary animate-spin" />
            </div>
          </div>
        )}
        </main>
      </div>
    </>
  );
}

