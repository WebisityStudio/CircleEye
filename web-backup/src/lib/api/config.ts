// API configuration matching Expo app structure
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const POLICE_API_BASE = import.meta.env.VITE_POLICE_API_BASE ?? 'https://data.police.uk/api';
const POSTCODES_API_BASE = import.meta.env.VITE_POSTCODES_BASE ?? 'https://api.postcodes.io';
const ENV_AGENCY_FLOOD_ENDPOINT = import.meta.env.VITE_ENV_AGENCY_FLOOD_ENDPOINT ?? 'https://environment.data.gov.uk/flood-monitoring/id/floods';

export const apiConfig = {
  GOOGLE_MAPS_API_KEY,
  POLICE_API_BASE,
  POSTCODES_API_BASE,
  ENV_AGENCY_FLOOD_ENDPOINT,
};

export type ApiConfig = typeof apiConfig;
