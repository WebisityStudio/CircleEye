/**
 * Postcode region detection utilities
 * Uses Postcodes.io to determine the country for a UK postcode
 */

export interface PostcodeInfo {
  postcode: string;
  country: 'England' | 'Wales' | 'Scotland' | 'Northern Ireland';
  latitude: number;
  longitude: number;
  adminDistrict: string; // Council area name for Scotland
}

export type Region = 'scotland' | 'england-wales' | 'northern-ireland';

/**
 * Fetches postcode information from Postcodes.io API
 * Returns country, coordinates, and admin district
 */
export async function getPostcodeInfo(postcode: string): Promise<PostcodeInfo> {
  const normalizedPostcode = postcode.replace(/\s+/g, '').toUpperCase();

  const response = await fetch(
    `https://api.postcodes.io/postcodes/${encodeURIComponent(normalizedPostcode)}`
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Postcode not found');
    }
    throw new Error('Failed to lookup postcode');
  }

  const data = await response.json();

  if (!data.result) {
    throw new Error('Invalid postcode response');
  }

  return {
    postcode: data.result.postcode,
    country: data.result.country as PostcodeInfo['country'],
    latitude: data.result.latitude,
    longitude: data.result.longitude,
    adminDistrict: data.result.admin_district || '',
  };
}

/**
 * Determines the region from a country name
 * Used to route to the appropriate crime data API
 */
export function getRegionFromCountry(country: string): Region {
  switch (country) {
    case 'Scotland':
      return 'scotland';
    case 'Northern Ireland':
      return 'northern-ireland';
    case 'England':
    case 'Wales':
    default:
      return 'england-wales';
  }
}

/**
 * Checks if a postcode is in Scotland
 * Uses the Postcodes.io API for accurate determination
 */
export async function isScottishPostcode(postcode: string): Promise<boolean> {
  const info = await getPostcodeInfo(postcode);
  return info.country === 'Scotland';
}
