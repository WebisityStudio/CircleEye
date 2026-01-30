// App configuration constants

export const APP_CONFIG = {
  name: 'Circle Eye',
  version: '1.0.0',
  company: 'Circle UK Group',
  supportEmail: 'support@circleukgroup.co.uk',
  websiteUrl: 'https://circleukgroup.co.uk',
};

// Gemini API configuration - Agentic Hand-off Pattern
// Two models working together: Scout (Live) + Judge (Pro)
export const GEMINI_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY || '',

  // ============================================
  // THE SCOUT: Gemini 2.5 Flash Live
  // Role: Real-time companion, data collection
  // ============================================
  // Fast, conversational, interruptible
  // Asks follow-up questions for better evidence
  liveModel: 'gemini-2.5-flash-preview-native-audio-dialog',

  // ============================================
  // THE JUDGE: Gemini 3 Pro
  // Role: Deep reasoning, compliance analysis
  // ============================================
  // Slow, thorough, massive context
  // Cross-references UK HSE & ISO 45001
  proModel: 'gemini-3-pro-preview',

  // Legacy alias (points to live model for backward compat)
  model: 'gemini-2.5-flash-preview-native-audio-dialog',

  // Frame capture settings (for high-res snapshots on hazard detection)
  frameCaptureFPS: 1, // 1 frame per second for live analysis
  frameQuality: 0.5, // JPEG quality for streaming (0-1)
  snapshotQuality: 0.9, // High quality for tagged hazards
  frameMaxWidth: 1280,

  // Audio settings
  audioSampleRate: 16000, // 16kHz for input
  audioOutputSampleRate: 24000, // 24kHz for output
};

// Location settings
export const LOCATION_CONFIG = {
  accuracy: 'high' as const,
  timeoutMs: 15000,
  maximumAgeMs: 10000,
};

// Session settings
export const SESSION_CONFIG = {
  maxDurationMinutes: 60,
  autoSaveIntervalSeconds: 30,
  minFindingsForReport: 0, // Allow reports with no findings
};

// Report settings
export const REPORT_CONFIG = {
  defaultDisclaimer: {
    scope:
      'This report is based solely on AI visual analysis of the live video feed during the inspection walkthrough.',
    limitations: [
      'Cannot assess hidden conditions (behind walls, under floors, in ceilings)',
      'Cannot verify compliance with local building codes or regulations',
      'Cannot evaluate structural integrity without visible evidence',
      'Analysis limited to areas shown during the inspection',
      'AI analysis may miss or misidentify certain hazards',
    ],
    not_a_substitute_for: [
      'Professional health and safety inspection',
      'Certified risk assessment by qualified personnel',
      'Structural engineering evaluation',
      'Fire safety assessment by certified inspector',
      'Compliance audit by regulatory authority',
    ],
  },
};

// Colors following React Native best practices
export const COLORS = {
  // Primary brand colors
  primary: '#1E3A5F',
  primaryLight: '#2E5A8F',
  primaryDark: '#0E2A4F',

  // Secondary
  secondary: '#4A90D9',
  secondaryLight: '#6AA8E9',

  // Severity colors
  critical: '#DC2626',
  high: '#EA580C',
  medium: '#F59E0B',
  low: '#22C55E',

  // Category colors
  safety: '#DC2626',
  security: '#7C3AED',
  compliance: '#2563EB',
  maintenance: '#059669',

  // UI colors
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSecondary: '#F1F5F9',
  border: '#E2E8F0',

  // Text
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textOnPrimary: '#FFFFFF',

  // Status
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Dark mode variants
  dark: {
    background: '#0F172A',
    surface: '#1E293B',
    surfaceSecondary: '#334155',
    border: '#475569',
    textPrimary: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#64748B',
  },
};

// Typography
export const TYPOGRAPHY = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
};

// Border radius
export const RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};
