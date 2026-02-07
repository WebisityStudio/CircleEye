// Crime statistics API matching Expo app implementation
import { fetchJson, HttpError } from './http';
import { apiConfig } from './config';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

interface PoliceCrimeRecord {
  category: string;
  id: number | string;
  month: string;
  location: {
    latitude: string;
    longitude: string;
    street: {
      id: number;
      name: string;
    };
  };
}

export interface CrimeCategoryStat {
  category: string;
  label: string;
  count: number;
  colour?: string;
}

export interface CrimeStatsResult {
  total: number;
  categories: CrimeCategoryStat[];
  month: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  'anti-social-behaviour': 'Anti-social Behaviour',
  'bicycle-theft': 'Bicycle Theft',
  'burglary': 'Burglary',
  'criminal-damage-arson': 'Criminal Damage & Arson',
  'drugs': 'Drugs',
  'other-theft': 'Other Theft',
  'public-order': 'Public Order',
  'robbery': 'Robbery',
  'shoplifting': 'Shoplifting',
  'theft-from-the-person': 'Theft from the Person',
  'vehicle-crime': 'Vehicle Crime',
  'violent-crime': 'Violent Crime',
  'possession-of-weapons': 'Weapons Possession',
};

const COLOUR_PALETTE = ['#D90429', '#F97B22', '#F6C833', '#88C100', '#15CC3D', '#0077B6'];

function formatCategoryLabel(category: string): string {
  if (CATEGORY_LABELS[category]) {
    return CATEGORY_LABELS[category];
  }

  return category
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function formatDateForApi(date: Date): string {
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  return year + '-' + month;
}

async function fetchCrimeData(coords: Coordinates, date: string): Promise<PoliceCrimeRecord[]> {
  const base = apiConfig.POLICE_API_BASE ?? 'https://data.police.uk/api';
  const params = new URLSearchParams({
    lat: coords.latitude.toString(),
    lng: coords.longitude.toString(),
    date,
  });

  const url = base.replace(/\/$/, '') + '/crimes-street/all-crime?' + params.toString();
  return fetchJson<PoliceCrimeRecord[]>(url, { timeoutMs: 20000 });
}

export async function fetchCrimeStats(coords: Coordinates): Promise<CrimeStatsResult | null> {
  const now = new Date();
  let attempt = 0;
  let crimeData: PoliceCrimeRecord[] = [];
  let usedDate = formatDateForApi(now);

  while (attempt < 6) {
    usedDate = formatDateForApi(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - attempt, 1)));
    try {
      crimeData = await fetchCrimeData(coords, usedDate);
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) {
        crimeData = [];
      } else {
        throw error;
      }
    }

    if (crimeData.length > 0) {
      break;
    }
    attempt += 1;
  }

  if (!crimeData.length) {
    return null;
  }

  const counts = new Map<string, number>();
  for (const record of crimeData) {
    const current = counts.get(record.category) ?? 0;
    counts.set(record.category, current + 1);
  }

  const categories = Array.from(counts.entries())
    .map(([category, count]) => ({
      category,
      label: formatCategoryLabel(category),
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const topCategories = categories.slice(0, 6).map((item, index) => ({
    ...item,
    colour: COLOUR_PALETTE[index % COLOUR_PALETTE.length],
  }));

  return {
    total: crimeData.length,
    categories: topCategories,
    month: usedDate,
  };
}
