// Threat level API matching Expo app implementation
import { supabase } from '../../supabase/client';

export interface ThreatLevelInfo {
  nationalLevel?: string;
  northernIrelandLevel?: string;
  nationalDescription?: string;
  northernIrelandDescription?: string;
  updatedAt?: string;
  source: string;
  // Backend-driven scale information for the meter UI
  severityIndex?: number;
  maxScaleValue?: number;
}

interface ThreatLevel {
  id: string;
  level_key: string;
  display_name: string;
  description: string | null;
  guidance_url: string | null;
  additional_guidance: string | null;
  severity_index: number;
  max_scale_value: number;
}

interface CurrentThreatStatus {
  id: string;
  scope: string;
  threat_level_id: string;
  threat_level_key: string;
  severity_index: number;
  max_scale_value: number;
  source: string | null;
  notes: string | null;
  last_updated_at: string;
}

export async function fetchThreatLevel(): Promise<ThreatLevelInfo> {
  const { data, error } = await supabase
    .from('current_threat_status')
    .select(
      `
      *,
      threat_level:threat_levels (
        id,
        level_key,
        display_name,
        description,
        guidance_url,
        additional_guidance,
        severity_index,
        max_scale_value
      )
    `
    )
    .eq('scope', 'uk-national')
    .maybeSingle<CurrentThreatStatus & { threat_level: ThreatLevel | null }>();

  if (error) {
    console.error('Failed to fetch current threat status from Supabase', error);
    throw error;
  }

  if (!data || !data.threat_level) {
    return {
      nationalLevel: undefined,
      northernIrelandLevel: undefined,
      nationalDescription: undefined,
      northernIrelandDescription: undefined,
      updatedAt: undefined,
      source: 'Supabase (no data)',
      severityIndex: undefined,
      maxScaleValue: undefined,
    };
  }

  const tl = data.threat_level;

  return {
    nationalLevel: tl.display_name,
    northernIrelandLevel: undefined,
    nationalDescription: tl.description ?? tl.additional_guidance ?? undefined,
    northernIrelandDescription: undefined,
    updatedAt: data.last_updated_at,
    source: data.source ?? 'Supabase',
    severityIndex: data.severity_index ?? tl.severity_index,
    maxScaleValue: data.max_scale_value ?? tl.max_scale_value,
  };
}
