import * as Location from 'expo-location';
import { LOCATION_CONFIG } from '../config/constants';
import type { SessionLocation } from '../types/session';

/**
 * Request location permissions
 * Returns true if permission granted
 */
export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

/**
 * Check if location permission is granted
 */
export async function hasLocationPermission(): Promise<boolean> {
  const { status } = await Location.getForegroundPermissionsAsync();
  return status === 'granted';
}

/**
 * Get current location with reverse geocoding
 */
export async function getCurrentLocation(): Promise<SessionLocation> {
  // Check permission
  const hasPermission = await hasLocationPermission();
  if (!hasPermission) {
    const granted = await requestLocationPermission();
    if (!granted) {
      throw new Error('Location permission denied');
    }
  }

  // Get current position
  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
    timeInterval: LOCATION_CONFIG.timeoutMs,
    mayShowUserSettingsDialog: true,
  });

  const { latitude, longitude, accuracy } = location.coords;

  // Reverse geocode to get address
  let address: string | undefined;
  let city: string | undefined;
  let country: string | undefined;

  try {
    const [geocodeResult] = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (geocodeResult) {
      // Build full address
      const parts: string[] = [];
      if (geocodeResult.streetNumber) parts.push(geocodeResult.streetNumber);
      if (geocodeResult.street) parts.push(geocodeResult.street);
      if (geocodeResult.city) parts.push(geocodeResult.city);
      if (geocodeResult.postalCode) parts.push(geocodeResult.postalCode);

      address = parts.join(', ') || undefined;
      city = geocodeResult.city || undefined;
      country = geocodeResult.country || undefined;
    }
  } catch (error) {
    // Geocoding failed, but we still have coordinates
    console.warn('Reverse geocoding failed:', error);
  }

  return {
    latitude,
    longitude,
    accuracy: accuracy || 0,
    address,
    city,
    country,
  };
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(6)}${latDir}, ${Math.abs(lon).toFixed(6)}${lonDir}`;
}

/**
 * Calculate distance between two points in meters
 * Uses Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
