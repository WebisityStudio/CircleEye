/**
 * Scottish Crime Data Business Logic
 * Transforms SPARQL API data into CrimeSummary format
 */

import type { CrimeSummary, CrimeSummaryItem } from './crime';
import {
  fetchScottishCrimeDataWithTrend,
  type ScottishCrimeResult,
} from './api/scottishCrime';
import { getPostcodeInfo } from './postcodeRegion';
import { getCouncilAreaByName } from '../data/scottishCouncilAreas';

// Color palette matching the main crime.ts
const COLOUR_PALETTE = [
  '#D90429',
  '#F97B22',
  '#F6C833',
  '#88C100',
  '#15CC3D',
  '#0077B6',
];

/**
 * Maps Scottish crime categories to unified display names
 * Groups similar crime types together
 */
const SCOTTISH_CATEGORY_MAPPING: Record<string, string> = {
  // Violent crimes
  'common assault': 'Violent Crime',
  'serious assault': 'Violent Crime',
  'murder': 'Violent Crime',
  'attempted murder': 'Violent Crime',
  'culpable homicide': 'Violent Crime',
  'robbery': 'Robbery',

  // Property crimes
  'theft by housebreaking': 'Burglary',
  'housebreaking': 'Burglary',
  'domestic housebreaking': 'Burglary',
  'shoplifting': 'Shoplifting',
  'theft of a motor vehicle': 'Vehicle Crime',
  'theft from a motor vehicle': 'Vehicle Crime',
  'theft by opening lockfast places': 'Other Theft',
  'other theft': 'Other Theft',

  // Drugs
  'drugs - possession': 'Drugs',
  'drugs - supply': 'Drugs',
  'production, manufacture or cultivation of drugs': 'Drugs',

  // Damage
  'vandalism': 'Criminal Damage',
  'malicious mischief': 'Criminal Damage',
  'fire-raising': 'Criminal Damage',

  // Sexual offences
  'sexual assault': 'Sexual Offences',
  'rape': 'Sexual Offences',
  'other sexual crimes': 'Sexual Offences',

  // Fraud
  'fraud': 'Fraud',
  'other crimes of dishonesty': 'Fraud',

  // Public order
  'threatening and abusive behaviour': 'Public Order',
  'breach of the peace': 'Public Order',
  'racially aggravated harassment': 'Public Order',

  // Weapons
  'carrying offensive weapons': 'Weapons',
  'handling offensive weapons': 'Weapons',
};

/**
 * Groups and normalizes Scottish crime categories
 */
function groupScottishCategories(
  categories: ScottishCrimeResult['categories']
): CrimeSummaryItem[] {
  const grouped: Record<string, { count: number; rate: number }> = {};

  for (const cat of categories) {
    const normalizedLabel = cat.crimeLabel.toLowerCase().trim();
    const mappedName =
      SCOTTISH_CATEGORY_MAPPING[normalizedLabel] || 'Other Crime';

    if (!grouped[mappedName]) {
      grouped[mappedName] = { count: 0, rate: 0 };
    }
    grouped[mappedName].count += cat.count;
    grouped[mappedName].rate += cat.rate;
  }

  // Calculate total for percentages
  const totalCount = Object.values(grouped).reduce(
    (sum, g) => sum + g.count,
    0
  );

  // Convert to CrimeSummaryItem array
  return Object.entries(grouped)
    .map(([type, data]) => ({
      type,
      count: data.count,
      percentage: totalCount ? Math.round((data.count / totalCount) * 100) : 0,
      colour: '', // Assigned below
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map((item, index) => ({
      ...item,
      colour: COLOUR_PALETTE[index % COLOUR_PALETTE.length],
    }));
}

/**
 * Calculates risk level based on per-capita crime rate
 * Thresholds adjusted for council area level data
 */
function riskFromRate(ratePerTenThousand: number): CrimeSummary['riskLevel'] {
  if (ratePerTenThousand >= 600) return 'High';
  if (ratePerTenThousand >= 400) return 'Medium-High';
  if (ratePerTenThousand >= 200) return 'Medium';
  return 'Low';
}

/**
 * Extended CrimeSummary for Scottish data
 * Includes additional fields for UI differentiation
 */
export interface ScottishCrimeSummary extends CrimeSummary {
  dataSource: 'scottish-gov';
  isAreaLevel: true;
  councilArea: string;
  crimeRate: number; // Per 10,000 residents
  fiscalYear: string;
  population: number;
}

/**
 * Fetches crime summary for a Scottish postcode
 * Returns data in extended CrimeSummary format
 */
export async function fetchScottishCrimeSummary(
  postcode: string
): Promise<ScottishCrimeSummary> {
  // Get postcode info including admin district
  const postcodeInfo = await getPostcodeInfo(postcode);

  if (postcodeInfo.country !== 'Scotland') {
    throw new Error('Postcode is not in Scotland');
  }

  // Get council area from admin district
  const councilArea = getCouncilAreaByName(postcodeInfo.adminDistrict);

  if (!councilArea) {
    throw new Error(
      `Could not find council area for: ${postcodeInfo.adminDistrict}`
    );
  }

  // Fetch crime data with trend
  const { current, previous } = await fetchScottishCrimeDataWithTrend(
    councilArea.uri,
    councilArea.name
  );

  if (!current) {
    throw new Error('No crime data available for this council area');
  }

  // Calculate trend (year-over-year)
  let trend = '--';
  if (previous && previous.totalRate > 0) {
    const trendPct = Math.round(
      ((current.totalRate - previous.totalRate) / previous.totalRate) * 100
    );
    trend = `${trendPct >= 0 ? '+' : ''}${trendPct}%`;
  }

  // Group categories
  const topCrimes = groupScottishCategories(current.categories);

  return {
    // Standard CrimeSummary fields
    totalCrimes: current.totalCrimes,
    trend,
    riskLevel: riskFromRate(current.totalRate),
    topCrimes,
    month: current.fiscalYear, // Using fiscal year as "month" for compatibility
    monthDisplay: `${current.fiscalYear} fiscal year`,

    // Scottish-specific fields
    dataSource: 'scottish-gov',
    isAreaLevel: true,
    councilArea: councilArea.name,
    crimeRate: Math.round(current.totalRate),
    fiscalYear: current.fiscalYear,
    population: councilArea.population,
  };
}
