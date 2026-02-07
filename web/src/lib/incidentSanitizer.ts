/**
 * Input sanitization for incident descriptions.
 * Keeps it simple for MVP: length limits, strip PII patterns.
 */

const MAX_DESCRIPTION_LENGTH = 200;

// Patterns to strip for privacy/safety
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_PATTERN = /(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g;
const URL_PATTERN = /https?:\/\/[^\s]+/gi;
const HANDLE_PATTERN = /@[a-zA-Z0-9_]+/g;

// Ultra-risky terms to flag (keep this short to avoid false positives)
const RISKY_TERMS = [
  'kill',
  'murder',
  'terrorist',
  'bomb',
  'shoot',
  'stab',
];

export interface SanitizationResult {
  isValid: boolean;
  sanitized: string;
  errors: string[];
  warnings: string[];
}

/**
 * Sanitize and validate incident description input.
 */
export function sanitizeDescription(input: string): SanitizationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Trim and collapse whitespace
  let sanitized = input.trim().replace(/\s+/g, ' ');

  // Check length before any processing
  if (sanitized.length === 0) {
    errors.push('Description cannot be empty');
    return { isValid: false, sanitized: '', errors, warnings };
  }

  // Strip emails
  if (EMAIL_PATTERN.test(sanitized)) {
    sanitized = sanitized.replace(EMAIL_PATTERN, '[removed]');
    warnings.push('Email addresses have been removed');
  }

  // Strip phone numbers
  if (PHONE_PATTERN.test(sanitized)) {
    sanitized = sanitized.replace(PHONE_PATTERN, '[removed]');
    warnings.push('Phone numbers have been removed');
  }

  // Strip URLs
  if (URL_PATTERN.test(sanitized)) {
    sanitized = sanitized.replace(URL_PATTERN, '[removed]');
    warnings.push('URLs have been removed');
  }

  // Strip @handles
  if (HANDLE_PATTERN.test(sanitized)) {
    sanitized = sanitized.replace(HANDLE_PATTERN, '[removed]');
    warnings.push('@handles have been removed');
  }

  // Check for risky terms (warn but don't block for MVP)
  const lowerInput = sanitized.toLowerCase();
  for (const term of RISKY_TERMS) {
    if (lowerInput.includes(term)) {
      warnings.push('Please avoid using accusatory or violent language');
      break;
    }
  }

  // Enforce length limit
  if (sanitized.length > MAX_DESCRIPTION_LENGTH) {
    sanitized = sanitized.slice(0, MAX_DESCRIPTION_LENGTH);
    warnings.push(`Description truncated to ${MAX_DESCRIPTION_LENGTH} characters`);
  }

  return {
    isValid: true,
    sanitized,
    errors,
    warnings,
  };
}

/**
 * Get remaining character count for description.
 */
export function getDescriptionCharCount(input: string): {
  current: number;
  max: number;
  remaining: number;
} {
  const current = input.trim().replace(/\s+/g, ' ').length;
  return {
    current,
    max: MAX_DESCRIPTION_LENGTH,
    remaining: MAX_DESCRIPTION_LENGTH - current,
  };
}

/**
 * Category labels for display (observational, not interpretive).
 * Order matters for UI - place "Unusual situation" last to de-emphasize.
 */
export const INCIDENT_CATEGORY_LABELS: Record<string, string> = {
  noise: 'Noise',
  road_incident: 'Road Incident',
  disturbance: 'Disturbance',
  property_damage: 'Property Damage',
  fly_tipping: 'Fly Tipping',
  vandalism: 'Vandalism',
  travellers_in_area: 'Travellers in the Area',
  fire: 'Fire',
  other: 'Other',
  suspicious_activity: 'Unusual Situation', // Neutral label, placed last
};

/**
 * Auto-generated descriptions per category (for no-typing reporting).
 * Used when description is not provided.
 */
export const INCIDENT_AUTO_DESCRIPTIONS: Record<string, string> = {
  noise: 'Noise reported in this area',
  road_incident: 'Road incident reported in this area',
  disturbance: 'Disturbance reported in this area',
  property_damage: 'Property damage reported in this area',
  fly_tipping: 'Fly tipping reported in this area',
  vandalism: 'Vandalism reported in this area',
  travellers_in_area: 'Travellers reported in this area',
  fire: 'Fire reported in this area',
  other: 'Incident reported in this area',
  suspicious_activity: 'Unusual situation reported in this area',
};

/**
 * Get all available categories in display order.
 */
export function getIncidentCategories(): { value: string; label: string }[] {
  // Return in the order defined in INCIDENT_CATEGORY_LABELS
  return Object.entries(INCIDENT_CATEGORY_LABELS).map(([value, label]) => ({
    value,
    label,
  }));
}




