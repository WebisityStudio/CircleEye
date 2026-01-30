export type SessionStatus = 'active' | 'completed' | 'cancelled';

export type FindingCategory = 'safety' | 'security' | 'compliance' | 'maintenance';

export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface SessionLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
  city?: string;
  country?: string;
}

export interface InspectionSession {
  id: string;
  user_id: string;

  // Site info
  site_name: string;
  site_address: string | null;
  site_latitude: number;
  site_longitude: number;

  // Timing
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;

  // Status
  status: SessionStatus;
  findings_count: number;

  // Report
  report_id: string | null;

  created_at: string;
}

export interface SessionFinding {
  id: string;
  session_id: string;
  timestamp_seconds: number;
  category: FindingCategory;
  severity: FindingSeverity;
  title: string;
  description: string | null;
  location_hint: string | null;
  ai_confidence: number | null;
  created_at: string;
}

export interface InspectionReport {
  id: string;
  session_id: string;

  // Inspector accountability
  inspector_name: string;
  inspector_email: string;
  inspector_acknowledged: boolean;

  // Site info (denormalized for report)
  site_name: string;
  site_address: string | null;
  site_coordinates: {
    latitude: number;
    longitude: number;
  };
  inspection_date: string;
  duration_seconds: number;

  // Report content
  summary: ReportSummary;
  findings: ReportFinding[];
  recommendations: ReportRecommendations;
  disclaimer: ReportDisclaimer;

  // Metadata
  pdf_storage_path: string | null;
  email_sent_to: string[] | null;
  email_sent_at: string | null;

  created_at: string;
}

export interface ReportSummary {
  overall_risk_level: RiskLevel;
  total_findings: number;
  critical_findings: number;
  high_findings: number;
  medium_findings: number;
  low_findings: number;
  overview: string;
  areas_inspected: string[];
}

export interface ReportFinding {
  id: string;
  timestamp: string;
  category: FindingCategory;
  severity: FindingSeverity;
  title: string;
  description: string;
  location_hint?: string;
  recommendation?: string;
  ai_confidence?: number;
}

export interface ReportRecommendations {
  immediate_actions: string[];
  short_term_improvements: string[];
  long_term_considerations: string[];
}

export interface ReportDisclaimer {
  scope: string;
  limitations: string[];
  not_a_substitute_for: string[];
}

// Live session state for real-time updates
export interface LiveSessionState {
  isActive: boolean;
  sessionId: string | null;
  siteName: string | null;
  location: SessionLocation | null;
  startTime: Date | null;
  elapsedSeconds: number;
  findings: SessionFinding[];
  isConnectedToAI: boolean;
  lastAIMessage: string | null;
  error: string | null;
}
