import { supabase } from '../config/supabase';
import type {
  InspectionSession,
  SessionFinding,
  InspectionReport,
  SessionLocation,
} from '../types/session';

/**
 * Create a new inspection session
 */
export async function createSession(
  userId: string,
  siteName: string,
  location: SessionLocation
): Promise<InspectionSession> {
  const { data, error } = await supabase
    .from('inspection_sessions')
    .insert({
      user_id: userId,
      site_name: siteName,
      site_address: location.address,
      site_latitude: location.latitude,
      site_longitude: location.longitude,
      status: 'active',
      findings_count: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update session status
 */
export async function updateSessionStatus(
  sessionId: string,
  status: 'active' | 'completed' | 'cancelled',
  durationSeconds?: number
): Promise<InspectionSession> {
  const updateData: Record<string, unknown> = { status };

  if (status === 'completed' || status === 'cancelled') {
    updateData.ended_at = new Date().toISOString();
    if (durationSeconds !== undefined) {
      updateData.duration_seconds = durationSeconds;
    }
  }

  const { data, error } = await supabase
    .from('inspection_sessions')
    .update(updateData)
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Add a finding to a session
 */
export async function addFinding(
  sessionId: string,
  finding: Omit<SessionFinding, 'id' | 'session_id' | 'created_at'>
): Promise<SessionFinding> {
  const { data, error } = await supabase
    .from('session_findings')
    .insert({
      session_id: sessionId,
      ...finding,
    })
    .select()
    .single();

  if (error) throw error;

  // Update findings count
  await supabase.rpc('increment_findings_count', { session_id: sessionId });

  return data;
}

/**
 * Get all findings for a session
 */
export async function getSessionFindings(sessionId: string): Promise<SessionFinding[]> {
  const { data, error } = await supabase
    .from('session_findings')
    .select('*')
    .eq('session_id', sessionId)
    .order('timestamp_seconds', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Get a session by ID
 */
export async function getSession(sessionId: string): Promise<InspectionSession> {
  const { data, error } = await supabase
    .from('inspection_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get user's inspection history
 */
export async function getSessionHistory(
  userId: string,
  limit = 50
): Promise<InspectionSession[]> {
  const { data, error } = await supabase
    .from('inspection_sessions')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['completed', 'cancelled'])
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Save inspection report
 */
export async function saveReport(
  report: Omit<InspectionReport, 'id' | 'created_at'>
): Promise<InspectionReport> {
  const { data, error } = await supabase
    .from('inspection_reports')
    .insert(report)
    .select()
    .single();

  if (error) throw error;

  // Update session with report ID
  await supabase
    .from('inspection_sessions')
    .update({ report_id: data.id })
    .eq('id', report.session_id);

  return data;
}

/**
 * Get report for a session
 */
export async function getSessionReport(sessionId: string): Promise<InspectionReport | null> {
  const { data, error } = await supabase
    .from('inspection_reports')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
  return data;
}

/**
 * Update report with PDF path and email info
 */
export async function updateReportDelivery(
  reportId: string,
  pdfPath: string,
  emailSentTo: string[]
): Promise<void> {
  const { error } = await supabase
    .from('inspection_reports')
    .update({
      pdf_storage_path: pdfPath,
      email_sent_to: emailSentTo,
      email_sent_at: new Date().toISOString(),
    })
    .eq('id', reportId);

  if (error) throw error;
}
