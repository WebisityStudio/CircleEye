import { getPostcodeInfo, getRegionFromCountry } from './postcodeRegion';
import {
  fetchScottishCrimeSummary,
  type ScottishCrimeSummary,
} from './scottishCrime';

export interface CrimeSummaryItem {
  type: string;
  count: number;
  percentage: number;
  colour: string;
}

export interface CrimeSummary {
  totalCrimes: number;
  trend: string; // e.g., +12% or -5%
  riskLevel: 'Low' | 'Medium' | 'Medium-High' | 'High';
  topCrimes: CrimeSummaryItem[];
  month: string; // The actual month of data (YYYY-MM format)
  monthDisplay: string; // Human readable month (e.g., "October 2024")
}

/**
 * Extended CrimeSummary for England/Wales data
 */
export interface EnglandWalesCrimeSummary extends CrimeSummary {
  dataSource: 'police-uk';
  isAreaLevel: false;
}

/**
 * Union type for all crime summaries
 */
export type UnifiedCrimeSummary = EnglandWalesCrimeSummary | ScottishCrimeSummary;

// Re-export Scottish types for convenience
export type { ScottishCrimeSummary } from './scottishCrime';

// Police API crime record
interface CrimeRecord {
  category: string;
  [key: string]: unknown;
}

// API Base URLs from environment with sensible defaults
const POSTCODES_API_BASE = import.meta.env.VITE_POSTCODES_BASE || 'https://api.postcodes.io';
const POLICE_API_BASE = import.meta.env.VITE_POLICE_API_BASE || 'https://data.police.uk/api';

// Color palette matching the Expo app
const COLOUR_PALETTE = ['#D90429', '#F97B22', '#F6C833', '#88C100', '#15CC3D', '#0077B6'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function normalizePostcode(input: string): string {
  // Postcodes.io accepts postcodes with or without spaces
  return input.toUpperCase().trim();
}

export async function getCoordinatesFromPostcode(postcode: string): Promise<{ lat: number; lng: number }> {
  const pc = normalizePostcode(postcode);

  // Use Postcodes.io - free, no API key required for UK postcodes
  const url = `${POSTCODES_API_BASE}/postcodes/${encodeURIComponent(pc)}`;

  const res = await fetch(url);

  if (res.status === 404) {
    throw new Error('Postcode not found');
  }

  if (!res.ok) {
    throw new Error('Failed to geocode postcode');
  }

  const data = await res.json();

  if (data.status !== 200 || !data.result) {
    throw new Error('Postcode not found');
  }

  return {
    lat: data.result.latitude,
    lng: data.result.longitude
  };
}

function monthKey(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function formatMonthDisplay(yyyymm: string): string {
  const [year, month] = yyyymm.split('-');
  const monthIndex = parseInt(month, 10) - 1;
  if (Number.isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    return yyyymm;
  }
  return `${MONTH_NAMES[monthIndex]} ${year}`;
}

async function fetchCrimesAt(lat: number, lng: number, yyyymm: string): Promise<CrimeRecord[]> {
  const url = `${POLICE_API_BASE}/crimes-street/all-crime?lat=${lat}&lng=${lng}&date=${yyyymm}`;
  const res = await fetch(url);

  // Police API returns 404 when no data available for that month
  if (res.status === 404) {
    return [];
  }

  if (!res.ok) {
    throw new Error('Failed to fetch crime data');
  }

  return (await res.json()) as CrimeRecord[];
}

function summarize(crimes: CrimeRecord[]): { total: number; byCategory: Record<string, number> } {
  const byCategory: Record<string, number> = {};
  for (const c of crimes) {
    const k = c.category || 'unknown';
    byCategory[k] = (byCategory[k] || 0) + 1;
  }
  const total = crimes.length;
  return { total, byCategory };
}

function riskFromTotal(total: number): CrimeSummary['riskLevel'] {
  if (total >= 1000) return 'High';
  if (total >= 500) return 'Medium-High';
  if (total >= 200) return 'Medium';
  return 'Low';
}

function titleCase(s: string): string {
  return s.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
}

export async function fetchCrimeSummaryByPostcode(postcode: string): Promise<EnglandWalesCrimeSummary> {
  const { lat, lng } = await getCoordinatesFromPostcode(postcode);
  const now = new Date();

  // Police API data is typically 2-3 months behind
  // Try multiple months until we find data
  let curCrimes: CrimeRecord[] = [];
  let usedMonth = '';

  for (let monthsBack = 2; monthsBack <= 6; monthsBack++) {
    const targetMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsBack, 1));
    const monthStr = monthKey(targetMonth);

    try {
      const crimes = await fetchCrimesAt(lat, lng, monthStr);
      if (crimes.length > 0) {
        curCrimes = crimes;
        usedMonth = monthStr;
        break;
      }
    } catch {
      // Continue to next month
    }
  }

  if (curCrimes.length === 0) {
    throw new Error('No crime data available for this area. The Police API may not have recent data.');
  }

  // Get previous month for trend comparison
  const [year, month] = usedMonth.split('-');
  const prevMonthDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 2, 1));
  const prevMonthStr = monthKey(prevMonthDate);

  let prevCrimes: CrimeRecord[] = [];
  try {
    prevCrimes = await fetchCrimesAt(lat, lng, prevMonthStr);
  } catch {
    // If previous month fails, we just won't show trend
  }

  const cur = summarize(curCrimes);
  const prev = summarize(prevCrimes);

  // Get top 6 crime categories with colors (matching Expo app)
  const entries: CrimeSummaryItem[] = Object.entries(cur.byCategory)
    .map(([type, count]) => ({
      type: titleCase(type.replace(/-/g, ' ')),
      count,
      percentage: cur.total ? Math.round((count / cur.total) * 100) : 0,
      colour: '', // Will be assigned below
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map((item, index) => ({
      ...item,
      colour: COLOUR_PALETTE[index % COLOUR_PALETTE.length],
    }));

  const trendPct = prev.total ? Math.round(((cur.total - prev.total) / prev.total) * 100) : 0;
  const trend = prev.total ? `${trendPct >= 0 ? '+' : ''}${trendPct}%` : '--';

  return {
    totalCrimes: cur.total,
    trend,
    riskLevel: riskFromTotal(cur.total),
    topCrimes: entries,
    month: usedMonth,
    monthDisplay: formatMonthDisplay(usedMonth),
    dataSource: 'police-uk' as const,
    isAreaLevel: false as const,
  };
}

/**
 * Unified crime summary fetcher
 * Automatically routes to the correct API based on postcode region
 */
export async function fetchUnifiedCrimeSummary(
  postcode: string
): Promise<UnifiedCrimeSummary> {
  // Get postcode info to determine region
  const postcodeInfo = await getPostcodeInfo(postcode);
  const region = getRegionFromCountry(postcodeInfo.country);

  if (region === 'scotland') {
    // Use Scottish Government SPARQL API
    return fetchScottishCrimeSummary(postcode);
  }

  if (region === 'northern-ireland') {
    throw new Error(
      'Crime data for Northern Ireland is not yet available. We currently support England, Wales, and Scotland.'
    );
  }

  // Default to Police UK API for England/Wales
  return fetchCrimeSummaryByPostcode(postcode);
}
