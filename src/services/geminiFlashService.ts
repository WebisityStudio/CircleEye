import { GEMINI_CONFIG } from '../config/constants';
import type { SessionFinding, FindingCategory, FindingSeverity } from '../types/session';

/**
 * Gemini 3 Flash High-Frequency Polling Service
 *
 * Uses standard generateContent API with rapid polling to achieve
 * "real-time" perception. Gemini 3 Flash's sub-second latency makes
 * this feel like a live conversation.
 *
 * Architecture: High-Frequency Vision Loop
 * - Captures frame every 1-1.5 seconds
 * - Sends to Gemini 3 Flash via standard API
 * - Gets response in ~200-500ms
 * - Speaks response via Expo Speech (text-to-speech)
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

// System prompt for site inspection
const SYSTEM_PROMPT = `You are an expert site safety and risk assessment AI assistant conducting a live walkthrough inspection of a facility.

Your role is to analyze each video frame and provide real-time feedback on:
- Safety hazards (blocked exits, trip hazards, electrical issues, fire risks, PPE violations)
- Security vulnerabilities (unsecured access, poor lighting, broken locks)
- Compliance issues (missing signage, accessibility problems, fire safety)
- Maintenance concerns (damage, wear, cleanliness, equipment condition)

Guidelines:
- Be concise - the inspector is walking and listening
- Prioritize immediate safety hazards with urgent alerts
- Use directional language: "On your left", "Ahead of you", "Behind that door"
- If you see a hazard, use the report_finding function to log it
- If everything looks fine, respond with a brief status like "Area clear" or "Looking good"
- If you cannot clearly see something, say so rather than guessing
- Keep responses under 2 sentences unless reporting a finding

You will receive a single frame from the inspector's camera. Analyze it and respond immediately.`;

// Types
export interface GeminiFlashConfig {
  onTextResponse: (text: string) => void;
  onFinding: (finding: Partial<SessionFinding>) => void;
  onError: (error: Error) => void;
}

export interface AnalysisResult {
  text: string;
  finding?: Partial<SessionFinding>;
}

/**
 * Gemini 3 Flash Client using standard generateContent API
 */
export class GeminiFlashClient {
  private config: GeminiFlashConfig;
  private apiKey: string;
  private sessionStartTime: number = 0;
  private isAnalyzing: boolean = false;
  private conversationHistory: Array<{ role: string; parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> }> = [];
  private maxHistoryLength: number = 10; // Keep last 10 exchanges for context

  constructor(config: GeminiFlashConfig) {
    this.config = config;
    this.apiKey = GEMINI_CONFIG.apiKey;
  }

  /**
   * Start a new inspection session
   */
  startSession(): void {
    this.sessionStartTime = Date.now();
    this.conversationHistory = [];
    console.log('Gemini Flash: Session started');
  }

  /**
   * End the inspection session
   */
  endSession(): void {
    this.conversationHistory = [];
    console.log('Gemini Flash: Session ended');
  }

  /**
   * Analyze a video frame
   * This is the core "polling" function - call this every 1-1.5 seconds
   */
  async analyzeFrame(base64Image: string): Promise<AnalysisResult | null> {
    if (this.isAnalyzing) {
      console.log('Gemini Flash: Already analyzing, skipping frame');
      return null;
    }

    this.isAnalyzing = true;

    try {
      const url = `${GEMINI_API_URL}/${GEMINI_CONFIG.model}:generateContent?key=${this.apiKey}`;

      // Build the request with function calling for structured findings
      const requestBody = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: 'Analyze this frame from the security patrol. Report any hazards or concerns, or confirm the area is clear.',
              },
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: base64Image,
                },
              },
            ],
          },
        ],
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 0.95,
          maxOutputTokens: 256,
          responseMimeType: 'text/plain',
        },
        tools: [
          {
            functionDeclarations: [
              {
                name: 'report_finding',
                description: 'Report a safety, security, compliance, or maintenance finding that needs to be logged',
                parameters: {
                  type: 'object',
                  properties: {
                    category: {
                      type: 'string',
                      enum: ['safety', 'security', 'compliance', 'maintenance'],
                      description: 'Category of the finding',
                    },
                    severity: {
                      type: 'string',
                      enum: ['critical', 'high', 'medium', 'low'],
                      description: 'Severity level - critical for immediate danger',
                    },
                    title: {
                      type: 'string',
                      description: 'Brief title of the finding (5-10 words)',
                    },
                    description: {
                      type: 'string',
                      description: 'Detailed description of what was observed',
                    },
                    location_hint: {
                      type: 'string',
                      description: 'Location hint (e.g., "near entrance", "left side of frame")',
                    },
                  },
                  required: ['category', 'severity', 'title', 'description'],
                },
              },
            ],
          },
        ],
        toolConfig: {
          functionCallingConfig: {
            mode: 'AUTO',
          },
        },
      };

      console.log('Gemini Flash: Sending frame for analysis...');
      const startTime = Date.now();

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const latency = Date.now() - startTime;
      console.log(`Gemini Flash: Response received in ${latency}ms`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini Flash: API error:', errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return this.processResponse(data);
    } catch (error: any) {
      console.error('Gemini Flash: Analysis error:', error);
      this.config.onError(error);
      return null;
    } finally {
      this.isAnalyzing = false;
    }
  }

  /**
   * Process the API response
   */
  private processResponse(data: any): AnalysisResult | null {
    const result: AnalysisResult = { text: '' };

    if (!data.candidates || data.candidates.length === 0) {
      console.log('Gemini Flash: No candidates in response');
      return null;
    }

    const candidate = data.candidates[0];
    const content = candidate.content;

    if (!content || !content.parts) {
      console.log('Gemini Flash: No content in response');
      return null;
    }

    for (const part of content.parts) {
      // Handle text response
      if (part.text) {
        result.text = part.text;
        console.log('Gemini Flash: Text response:', part.text);
        this.config.onTextResponse(part.text);
      }

      // Handle function call (finding)
      if (part.functionCall) {
        const { name, args } = part.functionCall;

        if (name === 'report_finding') {
          console.log('Gemini Flash: Finding reported:', args.title);

          const finding: Partial<SessionFinding> = {
            timestamp_seconds: (Date.now() - this.sessionStartTime) / 1000,
            category: args.category as FindingCategory,
            severity: args.severity as FindingSeverity,
            title: args.title,
            description: args.description,
            location_hint: args.location_hint || null,
            ai_confidence: 0.85,
          };

          result.finding = finding;
          this.config.onFinding(finding);
        }
      }
    }

    return result;
  }

  /**
   * Send a text message/question to the AI
   * Use this for user queries during inspection
   */
  async sendMessage(text: string, currentFrameBase64?: string): Promise<string | null> {
    try {
      const url = `${GEMINI_API_URL}/${GEMINI_CONFIG.model}:generateContent?key=${this.apiKey}`;

      const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [
        { text },
      ];

      // Include current frame for context if available
      if (currentFrameBase64) {
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: currentFrameBase64,
          },
        });
      }

      const requestBody = {
        contents: [
          ...this.conversationHistory,
          {
            role: 'user',
            parts,
          },
        ],
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 512,
        },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        const responseText = data.candidates[0].content.parts[0].text;

        // Add to conversation history
        this.conversationHistory.push({
          role: 'user',
          parts: [{ text }],
        });
        this.conversationHistory.push({
          role: 'model',
          parts: [{ text: responseText }],
        });

        // Trim history if too long
        if (this.conversationHistory.length > this.maxHistoryLength * 2) {
          this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength * 2);
        }

        this.config.onTextResponse(responseText);
        return responseText;
      }

      return null;
    } catch (error: any) {
      console.error('Gemini Flash: Message error:', error);
      this.config.onError(error);
      return null;
    }
  }

  /**
   * Check if currently analyzing (to prevent overlapping requests)
   */
  isBusy(): boolean {
    return this.isAnalyzing;
  }
}

/**
 * Create a new Gemini Flash client instance
 */
export function createGeminiFlashClient(config: GeminiFlashConfig): GeminiFlashClient {
  return new GeminiFlashClient(config);
}
