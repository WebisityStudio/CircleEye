import { GEMINI_CONFIG } from '../config/constants';
import type { SessionFinding, InspectionSession } from '../types/session';
import type { SessionData, TaggedHazard } from './sessionCollector';

/**
 * Gemini 3 Pro Service - THE JUDGE
 *
 * Receives the hand-off from the Scout (Gemini 2.5 Flash Live) and performs:
 * - Deep compliance analysis against UK HSE & ISO 45001
 * - Cross-referencing of evidence
 * - Formal incident report generation
 * - Risk scoring and prioritization
 *
 * This is the "Brain" of the Agentic Hand-off Pattern.
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

// The Judge's system prompt - Senior H&S Inspector
const JUDGE_SYSTEM_PROMPT = `You are a Senior Health & Safety Compliance Inspector reviewing patrol data collected by an AI Scout during a site walkthrough.

YOUR ROLE: THE JUDGE
You receive tagged hazards, patrol transcripts, and evidence images from a real-time AI patrol companion. Your job is to:

1. ANALYZE each tagged hazard against UK safety regulations
2. CROSS-REFERENCE with specific legal standards:
   - UK Health and Safety at Work Act 1974
   - Management of Health and Safety at Work Regulations 1999
   - Regulatory Reform (Fire Safety) Order 2005
   - ISO 45001 Occupational Health and Safety
   - HSE Approved Codes of Practice (ACOPs)
   - RIDDOR, COSHH, and relevant sector guidelines

3. ASSESS the quality of evidence gathered
4. PRIORITIZE remediation actions with legal justification
5. GENERATE a formal compliance report

YOUR ANALYSIS MUST INCLUDE:
- Specific regulation/section that applies to each finding
- Legal consequences if not addressed
- Clear timeline for remediation (Immediate/24hrs/1 week/1 month)
- Assignment of responsibility (Site Manager, H&S Officer, Contractor, etc.)
- Risk score (0-100) based on likelihood and severity

BE THOROUGH AND SPECIFIC. You are creating a legally defensible document.`;

export interface ComplianceAnalysis {
  executiveSummary: string;
  overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  keyFindings: AnalyzedFinding[];
  recommendations: Recommendation[];
  regulatoryReferences: RegulatoryReference[];
  nextSteps: string[];
  legalWarnings: string[];
}

export interface AnalyzedFinding {
  originalFinding: SessionFinding;
  hazardData: TaggedHazard | null;
  complianceImpact: string;
  relevantStandard: string;
  specificSection: string;
  remediationPriority: 'immediate' | 'urgent' | 'soon' | 'scheduled';
  estimatedRemediationTime: string;
  potentialConsequences: string;
  legalExposure: string;
  evidenceQuality: 'strong' | 'adequate' | 'weak';
}

export interface Recommendation {
  priority: number;
  action: string;
  responsibility: string;
  timeline: string;
  standard: string;
  legalBasis: string;
}

export interface RegulatoryReference {
  regulation: string;
  section: string;
  relevance: string;
  penalties: string;
}

/**
 * THE HAND-OFF: Receive patrol data from Scout and generate compliance analysis
 */
export async function analyzePatrolHandoff(
  sessionData: SessionData
): Promise<ComplianceAnalysis> {
  const apiKey = GEMINI_CONFIG.apiKey;
  const url = `${GEMINI_API_URL}/${GEMINI_CONFIG.proModel}:generateContent?key=${apiKey}`;

  // Build the comprehensive hand-off prompt
  const handoffPrompt = buildHandoffPrompt(sessionData);

  try {
    console.log('Gemini 3 Pro (THE JUDGE): Analyzing patrol hand-off...');
    console.log(`- Site: ${sessionData.siteName}`);
    console.log(`- Duration: ${Math.floor(sessionData.durationSeconds / 60)} minutes`);
    console.log(`- Tagged Hazards: ${sessionData.taggedHazards.length}`);
    console.log(`- Transcript Entries: ${sessionData.transcript.length}`);

    const startTime = Date.now();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: handoffPrompt }],
          },
        ],
        systemInstruction: {
          parts: [{ text: JUDGE_SYSTEM_PROMPT }],
        },
        generationConfig: {
          temperature: 0.2, // Low temperature for consistent, factual output
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192, // Allow long, detailed reports
          responseMimeType: 'application/json',
        },
      }),
    });

    const latency = Date.now() - startTime;
    console.log(`Gemini 3 Pro: Analysis complete in ${latency}ms`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini 3 Pro: API error:', errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response from Gemini 3 Pro');
    }

    const analysisText = data.candidates[0].content.parts[0].text;
    const analysis = JSON.parse(analysisText);

    // Map the response, linking back to original hazards
    return mapAnalysisResponse(analysis, sessionData);
  } catch (error: any) {
    console.error('Gemini 3 Pro: Analysis error:', error);
    return generateFallbackAnalysis(sessionData);
  }
}

/**
 * Build the hand-off prompt from session data
 */
function buildHandoffPrompt(sessionData: SessionData): string {
  const hazardsText =
    sessionData.taggedHazards.length > 0
      ? sessionData.taggedHazards
          .map(
            (h, i) => `
TAGGED HAZARD #${i + 1}
====================
Title: ${h.title}
Severity: ${h.severity.toUpperCase()}
Category: ${h.category}
Time Detected: ${Math.floor(h.timestampSeconds / 60)}:${String(h.timestampSeconds % 60).padStart(2, '0')}
Location: ${h.locationHint || 'Not specified'}

AI Scout Observation:
"${h.aiObservation}"

Guard Confirmation:
${h.guardConfirmation || 'None recorded'}

Description:
${h.description}

${
  h.followUpQuestions.length > 0
    ? `Follow-up Evidence Gathered:
${h.followUpQuestions.map((q, qi) => `Q: "${q}"\nA: "${h.followUpAnswers[qi] || 'No response'}"`).join('\n\n')}`
    : 'No follow-up questions were asked.'
}

Evidence Image: ${h.snapshotBase64 ? 'High-resolution snapshot available' : 'No snapshot captured'}
AI Confidence: ${(h.aiConfidence * 100).toFixed(0)}%
`
          )
          .join('\n---\n')
      : 'No hazards were tagged during this patrol.';

  const transcriptText =
    sessionData.transcript.length > 0
      ? sessionData.transcript
          .slice(-50) // Last 50 entries for context
          .map((t) => {
            const mins = Math.floor(
              (new Date(t.timestamp).getTime() - sessionData.startTime.getTime()) / 60000
            );
            return `[${mins}min] ${t.speaker === 'scout' ? 'AI SCOUT' : 'GUARD'}: ${t.text}`;
          })
          .join('\n')
      : 'No transcript available.';

  return `
PATROL HAND-OFF REPORT
======================
This is a formal hand-off from the AI Scout (Gemini 2.5 Flash Live) to you, the Compliance Judge (Gemini 3 Pro).

SITE INFORMATION
================
Site Name: ${sessionData.siteName}
Site Address: ${sessionData.siteAddress || 'Not specified'}
Patrol Date: ${sessionData.startTime.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
Start Time: ${sessionData.startTime.toLocaleTimeString('en-GB')}
Duration: ${Math.floor(sessionData.durationSeconds / 60)} minutes ${sessionData.durationSeconds % 60} seconds
Areas Inspected: ${sessionData.summary.areasInspected.join(', ') || 'Not tracked'}

PATROL SUMMARY
==============
Total Hazards Tagged: ${sessionData.summary.totalHazards}
- Critical: ${sessionData.summary.criticalCount}
- High: ${sessionData.summary.highCount}
- Medium: ${sessionData.summary.mediumCount}
- Low: ${sessionData.summary.lowCount}

TAGGED HAZARDS (DETAILED)
=========================
${hazardsText}

PATROL TRANSCRIPT (LAST 50 ENTRIES)
===================================
${transcriptText}

YOUR TASK
=========
Analyze the above patrol data and generate a comprehensive compliance analysis in JSON format:

{
  "executiveSummary": "2-3 sentence professional summary of findings and overall risk",
  "overallRiskLevel": "low|medium|high|critical",
  "riskScore": 0-100,
  "keyFindings": [
    {
      "hazardIndex": 1,
      "complianceImpact": "How this violates regulations",
      "relevantStandard": "e.g., Health and Safety at Work Act 1974",
      "specificSection": "e.g., Section 2(1) - General duties",
      "remediationPriority": "immediate|urgent|soon|scheduled",
      "estimatedRemediationTime": "e.g., Within 24 hours",
      "potentialConsequences": "What could happen if not addressed",
      "legalExposure": "Potential fines/prosecution risk",
      "evidenceQuality": "strong|adequate|weak"
    }
  ],
  "recommendations": [
    {
      "priority": 1,
      "action": "Specific action required",
      "responsibility": "Who should do this",
      "timeline": "When it must be completed",
      "standard": "Relevant regulation",
      "legalBasis": "Why this is legally required"
    }
  ],
  "regulatoryReferences": [
    {
      "regulation": "Full name of regulation",
      "section": "Specific section",
      "relevance": "How it applies to findings",
      "penalties": "Potential penalties for non-compliance"
    }
  ],
  "nextSteps": ["Step 1", "Step 2", "Step 3"],
  "legalWarnings": ["Any urgent legal concerns"]
}

Be specific about UK regulations. This document may be used for legal compliance purposes.
`;
}

/**
 * Map the API response to our interface
 */
function mapAnalysisResponse(
  analysis: any,
  sessionData: SessionData
): ComplianceAnalysis {
  return {
    executiveSummary: analysis.executiveSummary || 'Analysis complete.',
    overallRiskLevel: analysis.overallRiskLevel || 'medium',
    riskScore: analysis.riskScore || 50,
    keyFindings: (analysis.keyFindings || []).map((kf: any) => {
      const hazardIndex = (kf.hazardIndex || 1) - 1;
      const hazard = sessionData.taggedHazards[hazardIndex] || null;
      return {
        originalFinding: hazard
          ? {
              id: hazard.id,
              session_id: sessionData.sessionId,
              timestamp_seconds: hazard.timestampSeconds,
              category: hazard.category,
              severity: hazard.severity,
              title: hazard.title,
              description: hazard.description,
              location_hint: hazard.locationHint,
              ai_confidence: hazard.aiConfidence,
              created_at: hazard.timestamp.toISOString(),
            }
          : ({} as SessionFinding),
        hazardData: hazard,
        complianceImpact: kf.complianceImpact || '',
        relevantStandard: kf.relevantStandard || '',
        specificSection: kf.specificSection || '',
        remediationPriority: kf.remediationPriority || 'soon',
        estimatedRemediationTime: kf.estimatedRemediationTime || '1 week',
        potentialConsequences: kf.potentialConsequences || '',
        legalExposure: kf.legalExposure || '',
        evidenceQuality: kf.evidenceQuality || 'adequate',
      };
    }),
    recommendations: analysis.recommendations || [],
    regulatoryReferences: analysis.regulatoryReferences || [],
    nextSteps: analysis.nextSteps || [],
    legalWarnings: analysis.legalWarnings || [],
  };
}

/**
 * Generate fallback analysis if API fails
 */
function generateFallbackAnalysis(sessionData: SessionData): ComplianceAnalysis {
  const { summary, taggedHazards } = sessionData;

  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  let riskScore = 20;

  if (summary.criticalCount > 0) {
    riskLevel = 'critical';
    riskScore = 90;
  } else if (summary.highCount > 0) {
    riskLevel = 'high';
    riskScore = 70;
  } else if (summary.totalHazards > 3) {
    riskLevel = 'medium';
    riskScore = 50;
  }

  return {
    executiveSummary: `Site inspection of ${sessionData.siteName} identified ${summary.totalHazards} hazard(s). ${summary.criticalCount > 0 ? 'IMMEDIATE ACTION REQUIRED for critical safety issues.' : summary.highCount > 0 ? 'Prompt attention required for high-priority items.' : 'No critical issues identified.'}`,
    overallRiskLevel: riskLevel,
    riskScore,
    keyFindings: taggedHazards.map((h) => ({
      originalFinding: {
        id: h.id,
        session_id: sessionData.sessionId,
        timestamp_seconds: h.timestampSeconds,
        category: h.category,
        severity: h.severity,
        title: h.title,
        description: h.description,
        location_hint: h.locationHint,
        ai_confidence: h.aiConfidence,
        created_at: h.timestamp.toISOString(),
      },
      hazardData: h,
      complianceImpact: `${h.category} violation requiring attention`,
      relevantStandard: 'Health and Safety at Work Act 1974',
      specificSection: 'Section 2 - General duties of employers',
      remediationPriority:
        h.severity === 'critical'
          ? 'immediate'
          : h.severity === 'high'
            ? 'urgent'
            : 'soon',
      estimatedRemediationTime:
        h.severity === 'critical' ? 'Within 24 hours' : '1-2 weeks',
      potentialConsequences: 'Risk of injury, regulatory action, or prosecution',
      legalExposure:
        h.severity === 'critical'
          ? 'High - Potential HSE prosecution'
          : 'Moderate - Improvement notice likely',
      evidenceQuality: h.snapshotBase64 ? 'strong' : 'adequate',
    })),
    recommendations: taggedHazards.slice(0, 5).map((h, i) => ({
      priority: i + 1,
      action: `Address: ${h.title}`,
      responsibility: 'Site Manager',
      timeline: h.severity === 'critical' ? 'Immediate' : '1 week',
      standard: 'HSWA 1974',
      legalBasis: 'Employer duty of care',
    })),
    regulatoryReferences: [
      {
        regulation: 'Health and Safety at Work Act 1974',
        section: 'Section 2',
        relevance: 'General duties of employers to employees',
        penalties: 'Up to £20,000 (Magistrates) or unlimited (Crown Court)',
      },
      {
        regulation: 'Management of Health and Safety at Work Regulations 1999',
        section: 'Regulation 3',
        relevance: 'Risk assessment requirements',
        penalties: 'Up to £20,000 fine per breach',
      },
    ],
    nextSteps: [
      'Review all findings with site management immediately',
      'Prioritize and assign remediation tasks',
      'Document corrective actions taken',
      'Schedule follow-up inspection within 30 days',
    ],
    legalWarnings:
      summary.criticalCount > 0
        ? [
            'Critical hazards detected - immediate action required to avoid potential HSE enforcement action',
          ]
        : [],
  };
}

// Legacy function for backward compatibility
export async function generateComplianceAnalysis(
  session: InspectionSession,
  findings: SessionFinding[]
): Promise<ComplianceAnalysis> {
  // Convert to session data format
  const sessionData: SessionData = {
    sessionId: session.id,
    siteName: session.site_name,
    siteAddress: session.site_address,
    startTime: new Date(session.started_at),
    endTime: session.ended_at ? new Date(session.ended_at) : new Date(),
    durationSeconds: session.duration_seconds || 0,
    taggedHazards: findings.map((f, i) => ({
      id: f.id,
      timestamp: new Date(f.created_at),
      timestampSeconds: f.timestamp_seconds,
      category: f.category,
      severity: f.severity,
      title: f.title,
      description: f.description || '',
      locationHint: f.location_hint,
      aiObservation: f.description || f.title,
      guardConfirmation: null,
      snapshotBase64: null,
      followUpQuestions: [],
      followUpAnswers: [],
      aiConfidence: f.ai_confidence || 0.8,
    })),
    transcript: [],
    keyFrames: [],
    summary: {
      totalHazards: findings.length,
      criticalCount: findings.filter((f) => f.severity === 'critical').length,
      highCount: findings.filter((f) => f.severity === 'high').length,
      mediumCount: findings.filter((f) => f.severity === 'medium').length,
      lowCount: findings.filter((f) => f.severity === 'low').length,
      areasInspected: [],
    },
  };

  return analyzePatrolHandoff(sessionData);
}

/**
 * Analyze a single finding (for real-time analysis during patrol)
 */
export async function analyzeSingleFinding(finding: SessionFinding): Promise<AnalyzedFinding> {
  const apiKey = GEMINI_CONFIG.apiKey;
  const url = `${GEMINI_API_URL}/${GEMINI_CONFIG.proModel}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Analyze this UK site safety finding:
Category: ${finding.category}
Severity: ${finding.severity}
Title: ${finding.title}
Description: ${finding.description || 'N/A'}
Location: ${finding.location_hint || 'N/A'}

Return JSON with: complianceImpact, relevantStandard, specificSection, remediationPriority, estimatedRemediationTime, potentialConsequences, legalExposure, evidenceQuality`,
              },
            ],
          },
        ],
        systemInstruction: { parts: [{ text: JUDGE_SYSTEM_PROMPT }] },
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();
    const analysis = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || '{}');

    return {
      originalFinding: finding,
      hazardData: null,
      complianceImpact: analysis.complianceImpact || '',
      relevantStandard: analysis.relevantStandard || 'HSWA 1974',
      specificSection: analysis.specificSection || '',
      remediationPriority: analysis.remediationPriority || 'soon',
      estimatedRemediationTime: analysis.estimatedRemediationTime || '1 week',
      potentialConsequences: analysis.potentialConsequences || '',
      legalExposure: analysis.legalExposure || '',
      evidenceQuality: analysis.evidenceQuality || 'adequate',
    };
  } catch (error) {
    console.error('Gemini 3 Pro: Single finding analysis error:', error);
    return {
      originalFinding: finding,
      hazardData: null,
      complianceImpact: `${finding.category} issue requiring attention`,
      relevantStandard: 'Health and Safety at Work Act 1974',
      specificSection: 'Section 2',
      remediationPriority:
        finding.severity === 'critical'
          ? 'immediate'
          : finding.severity === 'high'
            ? 'urgent'
            : 'soon',
      estimatedRemediationTime: finding.severity === 'critical' ? '24 hours' : '1 week',
      potentialConsequences: 'Potential safety risk',
      legalExposure: 'Moderate',
      evidenceQuality: 'adequate',
    };
  }
}
