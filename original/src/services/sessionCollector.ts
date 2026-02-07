/**
 * Session Data Collector
 *
 * Collects all patrol data during a live inspection for hand-off to Gemini 3 Pro.
 * The "Scout" (Gemini 2.5 Flash Live) tags hazards and this collector stores:
 * - High-resolution snapshots
 * - Timestamps
 * - AI observations
 * - Guard confirmations
 *
 * This data is then bundled and sent to the "Judge" (Gemini 3 Pro) for
 * deep compliance analysis.
 */

import type { SessionFinding, FindingCategory, FindingSeverity } from '../types/session';

export interface TaggedHazard {
  id: string;
  timestamp: Date;
  timestampSeconds: number; // Seconds since patrol start
  category: FindingCategory;
  severity: FindingSeverity;
  title: string;
  description: string;
  locationHint: string | null;
  aiObservation: string; // What Scout said when tagging
  guardConfirmation: string | null; // What guard said in response
  snapshotBase64: string | null; // High-res image at time of tagging
  followUpQuestions: string[]; // Questions Scout asked
  followUpAnswers: string[]; // Guard's responses
  aiConfidence: number;
}

export interface PatrolTranscript {
  timestamp: Date;
  speaker: 'scout' | 'guard';
  text: string;
}

export interface SessionData {
  sessionId: string;
  siteName: string;
  siteAddress: string | null;
  startTime: Date;
  endTime: Date | null;
  durationSeconds: number;
  taggedHazards: TaggedHazard[];
  transcript: PatrolTranscript[];
  keyFrames: Array<{
    timestamp: Date;
    timestampSeconds: number;
    base64: string;
    description: string;
  }>;
  summary: {
    totalHazards: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    areasInspected: string[];
  };
}

/**
 * Session Collector - Manages patrol data collection
 */
export class SessionCollector {
  private sessionId: string;
  private siteName: string;
  private siteAddress: string | null;
  private startTime: Date;
  private taggedHazards: TaggedHazard[] = [];
  private transcript: PatrolTranscript[] = [];
  private keyFrames: Array<{
    timestamp: Date;
    timestampSeconds: number;
    base64: string;
    description: string;
  }> = [];
  private areasInspected: Set<string> = new Set();
  private currentHazardId: number = 0;

  constructor(sessionId: string, siteName: string, siteAddress: string | null = null) {
    this.sessionId = sessionId;
    this.siteName = siteName;
    this.siteAddress = siteAddress;
    this.startTime = new Date();
    console.log('SessionCollector: Started for', siteName);
  }

  /**
   * Get seconds since patrol started
   */
  private getElapsedSeconds(): number {
    return Math.floor((Date.now() - this.startTime.getTime()) / 1000);
  }

  /**
   * Generate unique hazard ID
   */
  private generateHazardId(): string {
    this.currentHazardId++;
    return `hazard_${this.sessionId}_${this.currentHazardId}`;
  }

  /**
   * Add a tagged hazard (called when Scout uses report_finding)
   */
  tagHazard(
    finding: Partial<SessionFinding>,
    aiObservation: string,
    snapshotBase64: string | null = null
  ): TaggedHazard {
    const hazard: TaggedHazard = {
      id: this.generateHazardId(),
      timestamp: new Date(),
      timestampSeconds: this.getElapsedSeconds(),
      category: finding.category || 'safety',
      severity: finding.severity || 'medium',
      title: finding.title || 'Unspecified Hazard',
      description: finding.description || '',
      locationHint: finding.location_hint || null,
      aiObservation,
      guardConfirmation: null,
      snapshotBase64,
      followUpQuestions: [],
      followUpAnswers: [],
      aiConfidence: finding.ai_confidence || 0.8,
    };

    this.taggedHazards.push(hazard);
    console.log('SessionCollector: Tagged hazard', hazard.title);
    return hazard;
  }

  /**
   * Add guard confirmation to the most recent hazard
   */
  addGuardConfirmation(confirmation: string): void {
    if (this.taggedHazards.length > 0) {
      const lastHazard = this.taggedHazards[this.taggedHazards.length - 1];
      lastHazard.guardConfirmation = confirmation;
      console.log('SessionCollector: Added guard confirmation to', lastHazard.title);
    }
  }

  /**
   * Add follow-up Q&A to the most recent hazard
   */
  addFollowUp(question: string, answer: string | null = null): void {
    if (this.taggedHazards.length > 0) {
      const lastHazard = this.taggedHazards[this.taggedHazards.length - 1];
      lastHazard.followUpQuestions.push(question);
      if (answer) {
        lastHazard.followUpAnswers.push(answer);
      }
    }
  }

  /**
   * Add to conversation transcript
   */
  addTranscript(speaker: 'scout' | 'guard', text: string): void {
    this.transcript.push({
      timestamp: new Date(),
      speaker,
      text,
    });

    // Extract area mentions for summary
    const areaKeywords = [
      'entrance',
      'exit',
      'stairwell',
      'corridor',
      'lobby',
      'reception',
      'parking',
      'loading bay',
      'storage',
      'office',
      'bathroom',
      'kitchen',
      'break room',
      'server room',
      'electrical',
      'rooftop',
      'basement',
    ];
    const lowerText = text.toLowerCase();
    for (const area of areaKeywords) {
      if (lowerText.includes(area)) {
        this.areasInspected.add(area);
      }
    }
  }

  /**
   * Save a key frame (high-res snapshot at important moments)
   */
  saveKeyFrame(base64: string, description: string): void {
    this.keyFrames.push({
      timestamp: new Date(),
      timestampSeconds: this.getElapsedSeconds(),
      base64,
      description,
    });
    console.log('SessionCollector: Saved key frame -', description);
  }

  /**
   * Get the complete session data for hand-off to Gemini 3 Pro
   */
  getSessionData(): SessionData {
    const criticalCount = this.taggedHazards.filter((h) => h.severity === 'critical').length;
    const highCount = this.taggedHazards.filter((h) => h.severity === 'high').length;
    const mediumCount = this.taggedHazards.filter((h) => h.severity === 'medium').length;
    const lowCount = this.taggedHazards.filter((h) => h.severity === 'low').length;

    return {
      sessionId: this.sessionId,
      siteName: this.siteName,
      siteAddress: this.siteAddress,
      startTime: this.startTime,
      endTime: new Date(),
      durationSeconds: this.getElapsedSeconds(),
      taggedHazards: this.taggedHazards,
      transcript: this.transcript,
      keyFrames: this.keyFrames,
      summary: {
        totalHazards: this.taggedHazards.length,
        criticalCount,
        highCount,
        mediumCount,
        lowCount,
        areasInspected: Array.from(this.areasInspected),
      },
    };
  }

  /**
   * Get hazards formatted for Gemini 3 Pro analysis
   */
  getHazardsForAnalysis(): string {
    if (this.taggedHazards.length === 0) {
      return 'No hazards were tagged during this patrol.';
    }

    return this.taggedHazards
      .map(
        (h, i) => `
HAZARD #${i + 1}: ${h.title}
- Severity: ${h.severity.toUpperCase()}
- Category: ${h.category}
- Time: ${Math.floor(h.timestampSeconds / 60)}:${String(h.timestampSeconds % 60).padStart(2, '0')} into patrol
- Location: ${h.locationHint || 'Not specified'}
- AI Observation: "${h.aiObservation}"
- Guard Confirmed: ${h.guardConfirmation || 'No confirmation recorded'}
- Description: ${h.description}
${h.followUpQuestions.length > 0 ? `- Follow-up Evidence:\n${h.followUpQuestions.map((q, qi) => `  Q: ${q}\n  A: ${h.followUpAnswers[qi] || 'No response'}`).join('\n')}` : ''}
`
      )
      .join('\n---\n');
  }

  /**
   * Get transcript formatted for Gemini 3 Pro
   */
  getTranscriptForAnalysis(): string {
    if (this.transcript.length === 0) {
      return 'No conversation transcript available.';
    }

    return this.transcript
      .map((t) => {
        const time = new Date(t.timestamp);
        const timeStr = time.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        return `[${timeStr}] ${t.speaker === 'scout' ? 'AI Scout' : 'Guard'}: ${t.text}`;
      })
      .join('\n');
  }

  /**
   * Get summary stats
   */
  getSummary(): SessionData['summary'] {
    return this.getSessionData().summary;
  }

  /**
   * Get the most recent hazard (for adding confirmations/follow-ups)
   */
  getLastHazard(): TaggedHazard | null {
    return this.taggedHazards.length > 0
      ? this.taggedHazards[this.taggedHazards.length - 1]
      : null;
  }

  /**
   * Get all tagged hazards
   */
  getTaggedHazards(): TaggedHazard[] {
    return this.taggedHazards;
  }

  /**
   * Get count of hazards
   */
  getHazardCount(): number {
    return this.taggedHazards.length;
  }

  /**
   * Reset the collector (for new patrol)
   */
  reset(): void {
    this.taggedHazards = [];
    this.transcript = [];
    this.keyFrames = [];
    this.areasInspected.clear();
    this.currentHazardId = 0;
    this.startTime = new Date();
    console.log('SessionCollector: Reset');
  }
}

/**
 * Create a new session collector
 */
export function createSessionCollector(
  sessionId: string,
  siteName: string,
  siteAddress: string | null = null
): SessionCollector {
  return new SessionCollector(sessionId, siteName, siteAddress);
}
