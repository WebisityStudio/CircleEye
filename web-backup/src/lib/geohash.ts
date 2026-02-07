/**
 * Simple geohash encoding for privacy-preserving location bucketing.
 * Precision 5-6 gives roughly 1-5km cells which is good for privacy.
 */

const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

/**
 * Encode latitude and longitude to a geohash string.
 * @param lat Latitude
 * @param lng Longitude
 * @param precision Geohash precision (default 6 for ~1.2km x 0.6km cells)
 */
export function encodeGeohash(lat: number, lng: number, precision: number = 6): string {
  const latRange: [number, number] = [-90, 90];
  const lngRange: [number, number] = [-180, 180];
  let hash = '';
  let bit = 0;
  let ch = 0;
  let isLng = true;

  while (hash.length < precision) {
    if (isLng) {
      const mid = (lngRange[0] + lngRange[1]) / 2;
      if (lng >= mid) {
        ch |= 1 << (4 - bit);
        lngRange[0] = mid;
      } else {
        lngRange[1] = mid;
      }
    } else {
      const mid = (latRange[0] + latRange[1]) / 2;
      if (lat >= mid) {
        ch |= 1 << (4 - bit);
        latRange[0] = mid;
      } else {
        latRange[1] = mid;
      }
    }

    isLng = !isLng;
    bit++;

    if (bit === 5) {
      hash += BASE32[ch];
      bit = 0;
      ch = 0;
    }
  }

  return hash;
}

/**
 * Round coordinates to ~100m precision for privacy.
 * 3 decimal places ≈ 111m latitude, ~70m longitude at UK latitudes.
 */
export function roundCoordinates(lat: number, lng: number): { lat: number; lng: number } {
  return {
    lat: Math.round(lat * 1000) / 1000,
    lng: Math.round(lng * 1000) / 1000,
  };
}

/**
 * Calculate bounding box for proximity queries.
 * @param lat Center latitude
 * @param lng Center longitude
 * @param radiusKm Radius in kilometers
 */
export function getBoundingBox(lat: number, lng: number, radiusKm: number): {
  latMin: number;
  latMax: number;
  lngMin: number;
  lngMax: number;
} {
  // Approximate: 1 degree latitude ≈ 111km
  const latDelta = radiusKm / 111;
  // Longitude varies by latitude, at UK latitudes (~52°) it's about 69km per degree
  const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

  return {
    latMin: lat - latDelta,
    latMax: lat + latDelta,
    lngMin: lng - lngDelta,
    lngMax: lng + lngDelta,
  };
}
















