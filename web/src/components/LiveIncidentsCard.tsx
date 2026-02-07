import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, ThumbsUp, Plus, MapPin, Clock, Loader2, RefreshCw } from 'lucide-react';
import {
  getActiveIncidentsNearby,
  likeIncident,
  subscribeToIncidents,
  formatTimeAgo,
  type Incident,
  type IncidentWithLiked,
} from '../supabase/incidents';
import { INCIDENT_CATEGORY_LABELS } from '../lib/incidentSanitizer';
import { ReportIncidentModal } from './ReportIncidentModal';
import { getBoundingBox } from '../lib/geohash';

interface LiveIncidentsCardProps {
  userLocation?: { lat: number; lng: number } | null;
}

export function LiveIncidentsCard({ userLocation }: LiveIncidentsCardProps) {
  const [incidents, setIncidents] = useState<IncidentWithLiked[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [likingIds, setLikingIds] = useState<Set<string>>(new Set());

  // Default location (London) if user location not available
  const location = userLocation || { lat: 51.5074, lng: -0.1278 };

  const loadIncidents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await getActiveIncidentsNearby({
      lat: location.lat,
      lng: location.lng,
      radiusKm: 10,
      limit: 5,
    });

    setIsLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setIncidents(result.data);
  }, [location.lat, location.lng]);

  // Initial load
  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  // Real-time subscription
  useEffect(() => {
    const bbox = getBoundingBox(location.lat, location.lng, 10);

    const unsubscribe = subscribeToIncidents(
      // On insert
      (newIncident: Incident) => {
        // Check if within our bounding box
        if (
          newIncident.lat >= bbox.latMin &&
          newIncident.lat <= bbox.latMax &&
          newIncident.lng >= bbox.lngMin &&
          newIncident.lng <= bbox.lngMax
        ) {
          setIncidents((prev) => {
            // Avoid duplicates
            if (prev.some((i) => i.id === newIncident.id)) return prev;
            // Add to top, limit to 5
            return [{ ...newIncident, hasLiked: false }, ...prev].slice(0, 5);
          });
        }
      },
      // On update
      (updatedIncident: Incident) => {
        setIncidents((prev) =>
          prev.map((i) =>
            i.id === updatedIncident.id
              ? { ...updatedIncident, hasLiked: i.hasLiked }
              : i
          ).filter((i) => i.is_active && !i.archived_at && new Date(i.expires_at) > new Date())
        );
      }
    );

    return unsubscribe;
  }, [location.lat, location.lng]);

  const handleLike = async (incidentId: string) => {
    // Optimistic update
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

  const handleReportSuccess = () => {
    loadIncidents();
  };

  return (
    <>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-[#1785d1]/30 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h3 className="text-white text-lg font-semibold">What's Happening Now</h3>
          </div>
          <button
            onClick={() => loadIncidents()}
            className="p-1.5 text-gray-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-500 mb-4 pb-3 border-b border-gray-800">
          Community-reported incidents only. These reports are unverified and not confirmed crimes.
        </p>

        {/* Content */}
        {isLoading && incidents.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 text-gray-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <p className="text-gray-400 text-sm">{error}</p>
            <button
              onClick={loadIncidents}
              className="mt-2 text-[#1785d1] hover:text-[#1470b8] text-sm"
            >
              Try again
            </button>
          </div>
        ) : incidents.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-400 text-sm">No recent reports in your area</p>
            <p className="text-gray-500 text-xs mt-1">Be the first to report something</p>
          </div>
        ) : (
          <div className="space-y-3">
            {incidents.map((incident) => (
              <div
                key={incident.id}
                className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {/* Category badge */}
                    <span className="inline-block px-2 py-0.5 bg-amber-900/50 text-amber-300 text-xs font-medium rounded mb-1.5">
                      {INCIDENT_CATEGORY_LABELS[incident.category] || incident.category}
                    </span>
                    {/* Description */}
                    <p className="text-gray-200 text-sm line-clamp-2">{incident.description}</p>
                    {/* Meta info */}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(incident.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Nearby
                      </span>
                    </div>
                  </div>
                  {/* Like button */}
                  <button
                    onClick={() => handleLike(incident.id)}
                    disabled={incident.hasLiked || likingIds.has(incident.id)}
                    className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                      incident.hasLiked
                        ? 'bg-[#1785d1]/20 text-[#1785d1] cursor-default'
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'
                    }`}
                    title={incident.hasLiked ? 'Already marked helpful' : 'Mark as helpful'}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">{incident.like_count}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Report button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1785d1] hover:bg-[#1470b8] text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          Report an Incident
        </button>
      </div>

      {/* Report Modal */}
      <ReportIncidentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleReportSuccess}
        userLocation={location}
      />
    </>
  );
}
















