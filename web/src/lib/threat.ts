export type ThreatLevel = 'LOW' | 'MODERATE' | 'SUBSTANTIAL' | 'SEVERE' | 'CRITICAL';

export interface ThreatData {
  level: ThreatLevel;
  lastUpdated: string; // ISO string
  source?: string;
}

export const THREAT_DESCRIPTIONS: Record<ThreatLevel, string> = {
  LOW: 'An attack is highly unlikely.',
  MODERATE: 'An attack is possible but not likely.',
  SUBSTANTIAL: 'An attack is likely.',
  SEVERE: 'An attack is highly likely.',
  CRITICAL: 'An attack is highly likely in the near future.',
};

export function threatColor(level: ThreatLevel): string {
  switch (level) {
    case 'LOW':
      return 'bg-green-500';
    case 'MODERATE':
      return 'bg-yellow-500';
    case 'SUBSTANTIAL':
      return 'bg-brand-secondary';
    case 'SEVERE':
      return 'bg-red-500';
    case 'CRITICAL':
      return 'bg-red-700';
    default:
      return 'bg-gray-500';
  }
}

// Optional: Use GOV.UK API endpoint if configured
// Falls back to local JSON file for development/testing
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const THREAT_ENDPOINT = import.meta.env.VITE_GOVUK_THREAT_ENDPOINT;

export async function fetchThreatLevel(): Promise<ThreatData> {
  // For now, use the local JSON file as the GOV.UK API requires more complex parsing
  // In production, you might want to implement a backend proxy to handle the API
  const res = await fetch('/threat-level.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error('Failed to load threat level');
  const json = (await res.json()) as Partial<ThreatData> & { level: string };
  const level = (json.level || 'SUBSTANTIAL').toUpperCase() as ThreatLevel;
  return {
    level,
    lastUpdated: json.lastUpdated || new Date().toISOString(),
    source: json.source || 'Official source',
  };
}
