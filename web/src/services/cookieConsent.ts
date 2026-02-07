const CONSENT_KEY = 'circleoverwatch_cookie_consent';
const CONSENT_TIMESTAMP_KEY = 'circleoverwatch_cookie_consent_timestamp';

export type ConsentStatus = 'accepted' | 'rejected' | null;

export function getConsentStatus(): ConsentStatus {
  const value = localStorage.getItem(CONSENT_KEY);
  if (value === 'accepted' || value === 'rejected') {
    return value;
  }
  return null;
}

export function setConsent(status: 'accepted' | 'rejected'): void {
  localStorage.setItem(CONSENT_KEY, status);
  localStorage.setItem(CONSENT_TIMESTAMP_KEY, new Date().toISOString());
}

export function hasUserResponded(): boolean {
  return getConsentStatus() !== null;
}

export function clearConsent(): void {
  localStorage.removeItem(CONSENT_KEY);
  localStorage.removeItem(CONSENT_TIMESTAMP_KEY);
}
