/**
 * what3words API integration
 *
 * what3words divides the world into a grid of 3m × 3m squares and assigns
 * each one a unique combination of three words.
 *
 * API docs: https://developer.what3words.com/public-api
 */

const W3W_API_BASE = 'https://api.what3words.com/v3';

function getApiKey(): string {
  return import.meta.env.VITE_W3W_API_KEY || '';
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface W3WCoordinates {
  lat: number;
  lng: number;
}

export interface W3WSquare {
  southwest: W3WCoordinates;
  northeast: W3WCoordinates;
}

export interface W3WConvertResponse {
  /** The three-word address, e.g. "filled.count.soap" */
  words: string;
  /** ISO 639-1 language code */
  language: string;
  /** The coordinates of the square centre */
  coordinates: W3WCoordinates;
  /** The bounding box of the 3m × 3m square */
  square: W3WSquare;
  /** Country ISO 3166-1 alpha-2 code */
  country: string;
  /** Nearest place / locality name */
  nearestPlace: string;
  /** Link to the what3words map */
  map: string;
}

export interface W3WErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function w3wFetch<T>(path: string, params: Record<string, string>): Promise<T> {
  const key = getApiKey();
  if (!key) {
    throw new Error('what3words API key is not configured. Set VITE_W3W_API_KEY in your environment.');
  }

  const url = new URL(`${W3W_API_BASE}${path}`);
  url.searchParams.set('key', key);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString());

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as W3WErrorResponse | null;
    throw new Error(
      body?.error?.message ?? `what3words API error (HTTP ${res.status})`,
    );
  }

  const data = (await res.json()) as T | W3WErrorResponse;

  if ('error' in data && (data as W3WErrorResponse).error) {
    throw new Error((data as W3WErrorResponse).error.message);
  }

  return data as T;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Convert latitude / longitude to a what3words address.
 */
export async function convertToThreeWords(
  lat: number,
  lng: number,
  language = 'en',
): Promise<W3WConvertResponse> {
  return w3wFetch<W3WConvertResponse>('/convert-to-3wa', {
    coordinates: `${lat},${lng}`,
    language,
  });
}

/**
 * Convert a what3words address to coordinates.
 *
 * @param words - Three-word address, e.g. "filled.count.soap"
 */
export async function convertToCoordinates(
  words: string,
): Promise<W3WConvertResponse> {
  return w3wFetch<W3WConvertResponse>('/convert-to-coordinates', {
    words: words.replace(/^\/\/\//, '').trim(),
  });
}
