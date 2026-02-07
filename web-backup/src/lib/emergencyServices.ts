export interface EmergencyService {
  type: 'hospital' | 'police' | 'fire_station' | 'ambulance';
  name: string;
  distance: string; // e.g., "0.8 mi"
  address?: string;
  lat: number;
  lng: number;
}

export interface NearestServices {
  hospital: EmergencyService | null;
  police: EmergencyService | null;
  fireStation: EmergencyService | null;
  ambulance: EmergencyService | null;
}

// Multiple Overpass API endpoints for fallback
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

function formatDistance(miles: number): string {
  if (miles < 0.1) {
    return '< 0.1 mi';
  }
  return `${miles.toFixed(1)} mi`;
}

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: {
    name?: string;
    'addr:street'?: string;
    'addr:housenumber'?: string;
    'addr:city'?: string;
    'addr:postcode'?: string;
    amenity?: string;
    emergency?: string;
    healthcare?: string;
  };
}

function getCoordinates(el: OverpassElement): { lat: number; lon: number } | null {
  // Nodes have lat/lon directly
  if (el.lat !== undefined && el.lon !== undefined) {
    return { lat: el.lat, lon: el.lon };
  }
  // Ways and relations have center coordinates when using "out center"
  if (el.center?.lat !== undefined && el.center?.lon !== undefined) {
    return { lat: el.center.lat, lon: el.center.lon };
  }
  return null;
}

function findNearest(
  elements: OverpassElement[],
  originLat: number,
  originLng: number,
  type: EmergencyService['type']
): EmergencyService | null {
  if (elements.length === 0) return null;

  let nearest: OverpassElement | null = null;
  let nearestCoords: { lat: number; lon: number } | null = null;
  let minDistance = Infinity;

  for (const el of elements) {
    const coords = getCoordinates(el);
    if (!coords) continue;

    const dist = calculateDistance(originLat, originLng, coords.lat, coords.lon);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = el;
      nearestCoords = coords;
    }
  }

  if (!nearest || !nearestCoords) return null;

  // Build address from available tags
  let address: string | undefined;
  if (nearest.tags) {
    const parts: string[] = [];
    if (nearest.tags['addr:housenumber'] && nearest.tags['addr:street']) {
      parts.push(`${nearest.tags['addr:housenumber']} ${nearest.tags['addr:street']}`);
    } else if (nearest.tags['addr:street']) {
      parts.push(nearest.tags['addr:street']);
    }
    if (nearest.tags['addr:city']) {
      parts.push(nearest.tags['addr:city']);
    }
    if (parts.length > 0) {
      address = parts.join(', ');
    }
  }

  return {
    type,
    name: nearest.tags?.name || getDefaultName(type),
    distance: formatDistance(minDistance),
    address,
    lat: nearestCoords.lat,
    lng: nearestCoords.lon,
  };
}

function getDefaultName(type: EmergencyService['type']): string {
  switch (type) {
    case 'hospital':
      return 'Hospital';
    case 'police':
      return 'Police Station';
    case 'fire_station':
      return 'Fire Station';
    case 'ambulance':
      return 'Ambulance Station';
  }
}

async function queryOverpass(endpoint: string, query: string): Promise<OverpassElement[]> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!response.ok) {
    throw new Error(`Overpass API error: ${response.status}`);
  }

  const data = await response.json();
  return data.elements || [];
}

export async function fetchNearestEmergencyServices(
  lat: number,
  lng: number
): Promise<NearestServices> {
  // Search within 50km radius (about 30 miles) to cover rural areas
  const radius = 50000;

  // Overpass QL query - using nwr (node, way, relation) for comprehensive results
  const query = `
[out:json][timeout:25];
(
  nwr["amenity"="hospital"](around:${radius},${lat},${lng});
  nwr["healthcare"="hospital"](around:${radius},${lat},${lng});
  nwr["amenity"="police"](around:${radius},${lat},${lng});
  nwr["amenity"="fire_station"](around:${radius},${lat},${lng});
  nwr["emergency"="ambulance_station"](around:${radius},${lat},${lng});
);
out center tags;
`;

  let elements: OverpassElement[] = [];

  // Try each endpoint until one works
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      elements = await queryOverpass(endpoint, query);
      if (elements.length > 0) {
        break;
      }
    } catch (error) {
      console.warn(`Overpass endpoint ${endpoint} failed:`, error);
      continue;
    }
  }

  // Separate elements by type
  const hospitals: OverpassElement[] = [];
  const policeStations: OverpassElement[] = [];
  const fireStations: OverpassElement[] = [];
  const ambulanceStations: OverpassElement[] = [];

  for (const el of elements) {
    const tags = el.tags;
    if (!tags) continue;

    if (tags.amenity === 'hospital' || tags.healthcare === 'hospital') {
      hospitals.push(el);
    } else if (tags.amenity === 'police') {
      policeStations.push(el);
    } else if (tags.amenity === 'fire_station') {
      fireStations.push(el);
    } else if (tags.emergency === 'ambulance_station') {
      ambulanceStations.push(el);
    }
  }

  console.log('Emergency services found:', {
    hospitals: hospitals.length,
    police: policeStations.length,
    fire: fireStations.length,
    ambulance: ambulanceStations.length,
  });

  return {
    hospital: findNearest(hospitals, lat, lng, 'hospital'),
    police: findNearest(policeStations, lat, lng, 'police'),
    fireStation: findNearest(fireStations, lat, lng, 'fire_station'),
    ambulance: findNearest(ambulanceStations, lat, lng, 'ambulance'),
  };
}
