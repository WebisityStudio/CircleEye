/**
 * Incident service module for community-reported incidents.
 * Handles CRUD operations, real-time subscriptions, and likes.
 */

import { supabase } from './client';
import type { Incident, IncidentInsert, IncidentCategory } from './database.types';
import { encodeGeohash, roundCoordinates, getBoundingBox } from '../lib/geohash';
import { sanitizeDescription, INCIDENT_AUTO_DESCRIPTIONS } from '../lib/incidentSanitizer';

// Re-export types for convenience
export type { Incident, IncidentCategory };

export interface CreateIncidentInput {
  lat: number;
  lng: number;
  category: IncidentCategory;
  description?: string; // Optional - auto-generated if not provided
}

export interface IncidentQueryOptions {
  lat: number;
  lng: number;
  radiusKm?: number;
  category?: IncidentCategory;
  limit?: number;
}

export interface BoundsQueryOptions {
  latMin: number;
  latMax: number;
  lngMin: number;
  lngMax: number;
  category?: IncidentCategory;
  limit?: number;
}

export interface IncidentWithLiked extends Incident {
  hasLiked?: boolean;
}

/**
 * Create a new incident report.
 * Coordinates are rounded for privacy, geohash computed automatically.
 * If description is not provided, uses an auto-generated neutral description.
 */
export async function createIncident(input: CreateIncidentInput): Promise<{
  data: Incident | null;
  error: string | null;
}> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: 'You must be logged in to report an incident' };
    }

    // Use auto-generated description if none provided (no-typing reporting)
    let finalDescription = input.description?.trim();
    if (!finalDescription) {
      finalDescription = INCIDENT_AUTO_DESCRIPTIONS[input.category] || 'Incident reported in this area';
    } else {
      // Sanitize provided description
      const sanitization = sanitizeDescription(finalDescription);
      if (!sanitization.isValid) {
        return { data: null, error: sanitization.errors.join(', ') };
      }
      finalDescription = sanitization.sanitized;
    }

    // Round coordinates for privacy
    const { lat, lng } = roundCoordinates(input.lat, input.lng);

    // Compute geohash (precision 6 for ~1km cells)
    const geohash = encodeGeohash(lat, lng, 6);

    const insertData: IncidentInsert = {
      lat,
      lng,
      geohash,
      category: input.category,
      description: finalDescription,
      created_by_user_id: user.id,
    };

    const { data, error } = await supabase
      .from('incidents')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      // Check for rate limit error (RLS policy violation)
      if (error.code === '42501' || error.message.includes('policy')) {
        return { data: null, error: 'Daily report limit exceeded. You can submit up to 5 reports per 24 hours. Please try again later.' };
      }
      console.error('Error creating incident:', error);
      return { data: null, error: 'Failed to create incident report' };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error creating incident:', err);
    return { data: null, error: 'An unexpected error occurred' };
  }
}

/**
 * Get active incidents near a location.
 * Uses bounding box filtering for MVP.
 */
export async function getActiveIncidentsNearby(
  options: IncidentQueryOptions
): Promise<{ data: IncidentWithLiked[]; error: string | null }> {
  try {
    const { lat, lng, radiusKm = 5, category, limit = 20 } = options;

    // Calculate bounding box
    const bbox = getBoundingBox(lat, lng, radiusKm);

    // Get current user for liked status
    const { data: { user } } = await supabase.auth.getUser();

    // Build query
    let query = supabase
      .from('incidents')
      .select('*')
      .eq('is_active', true)
      .is('archived_at', null)
      .gt('expires_at', new Date().toISOString())
      .gte('lat', bbox.latMin)
      .lte('lat', bbox.latMax)
      .gte('lng', bbox.lngMin)
      .lte('lng', bbox.lngMax)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching incidents:', error);
      return { data: [], error: 'Failed to load incidents' };
    }

    // If user is logged in, check which incidents they've liked
    let likedIncidentIds: Set<string> = new Set();
    if (user && data && data.length > 0) {
      const { data: likes } = await supabase
        .from('incident_likes')
        .select('incident_id')
        .eq('user_id', user.id)
        .in('incident_id', data.map(i => i.id));

      if (likes) {
        likedIncidentIds = new Set(likes.map(l => l.incident_id));
      }
    }

    // Merge liked status
    const incidentsWithLiked: IncidentWithLiked[] = (data || []).map(incident => ({
      ...incident,
      hasLiked: likedIncidentIds.has(incident.id),
    }));

    return { data: incidentsWithLiked, error: null };
  } catch (err) {
    console.error('Unexpected error fetching incidents:', err);
    return { data: [], error: 'An unexpected error occurred' };
  }
}

/**
 * Get active incidents within map bounds (for viewport-driven fetching).
 * Future-friendly: API is stable for clustering/heatmap swap-in.
 */
export async function getActiveIncidentsInBounds(
  options: BoundsQueryOptions
): Promise<{ data: IncidentWithLiked[]; error: string | null }> {
  try {
    const { latMin, latMax, lngMin, lngMax, category, limit = 50 } = options;

    // Get current user for liked status
    const { data: { user } } = await supabase.auth.getUser();

    // Build query
    let query = supabase
      .from('incidents')
      .select('*')
      .eq('is_active', true)
      .is('archived_at', null)
      .gt('expires_at', new Date().toISOString())
      .gte('lat', latMin)
      .lte('lat', latMax)
      .gte('lng', lngMin)
      .lte('lng', lngMax)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching incidents in bounds:', error);
      return { data: [], error: 'Failed to load incidents' };
    }

    // If user is logged in, check which incidents they've liked
    let likedIncidentIds: Set<string> = new Set();
    if (user && data && data.length > 0) {
      const { data: likes } = await supabase
        .from('incident_likes')
        .select('incident_id')
        .eq('user_id', user.id)
        .in('incident_id', data.map(i => i.id));

      if (likes) {
        likedIncidentIds = new Set(likes.map(l => l.incident_id));
      }
    }

    // Merge liked status
    const incidentsWithLiked: IncidentWithLiked[] = (data || []).map(incident => ({
      ...incident,
      hasLiked: likedIncidentIds.has(incident.id),
    }));

    return { data: incidentsWithLiked, error: null };
  } catch (err) {
    console.error('Unexpected error fetching incidents in bounds:', err);
    return { data: [], error: 'An unexpected error occurred' };
  }
}

/**
 * Like an incident. Handles duplicate likes gracefully.
 */
export async function likeIncident(incidentId: string): Promise<{
  success: boolean;
  error: string | null;
  alreadyLiked?: boolean;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'You must be logged in to like an incident' };
    }

    const { error } = await supabase
      .from('incident_likes')
      .insert({
        incident_id: incidentId,
        user_id: user.id,
      });

    if (error) {
      // Unique constraint violation = already liked
      if (error.code === '23505') {
        return { success: true, error: null, alreadyLiked: true };
      }
      console.error('Error liking incident:', error);
      return { success: false, error: 'Failed to like incident' };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Unexpected error liking incident:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Subscribe to real-time incident updates.
 * Returns an unsubscribe function.
 */
export function subscribeToIncidents(
  onInsert: (incident: Incident) => void,
  onUpdate: (incident: Incident) => void
): () => void {
  const channel = supabase
    .channel('incidents-realtime')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'incidents',
      },
      (payload) => {
        const incident = payload.new as Incident;
        // Only process if active and not expired
        if (incident.is_active && !incident.archived_at && new Date(incident.expires_at) > new Date()) {
          onInsert(incident);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'incidents',
      },
      (payload) => {
        const incident = payload.new as Incident;
        onUpdate(incident);
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Format time ago string for display.
 */
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

/**
 * Format approximate location for display (no exact addresses).
 */
export function formatApproximateLocation(lat: number, lng: number): string {
  // For MVP, just show rounded coordinates as "area"
  // In production, reverse geocode to nearest locality/postcode
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(2)}°${latDir}, ${Math.abs(lng).toFixed(2)}°${lngDir}`;
}




