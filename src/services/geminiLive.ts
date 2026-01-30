import { GEMINI_CONFIG } from '../config/constants';
import type { SessionFinding, FindingCategory, FindingSeverity } from '../types/session';

// Gemini Live API WebSocket URL
const GEMINI_LIVE_WS_URL = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent';

// System prompt for site inspection
const SYSTEM_PROMPT = `You are an expert site safety and risk assessment AI assistant conducting a live walkthrough inspection of a facility.

Your role is to analyze the live video feed and provide real-time feedback on:
- Safety hazards (blocked exits, trip hazards, electrical issues, fire risks, PPE violations)
- Security vulnerabilities (unsecured access, poor lighting, broken locks)
- Compliance issues (missing signage, accessibility problems, fire safety)
- Maintenance concerns (damage, wear, cleanliness, equipment condition)

Guidelines:
- Speak concisely and clearly - the inspector is walking
- Prioritize immediate safety hazards with urgent alerts
- Use directional language: "On your left", "Ahead of you", "Behind that door"
- Rate each finding by severity: Critical (immediate danger), High, Medium, Low
- When asked questions, provide expert-level, helpful answers
- Be thorough but not alarmist - focus on actionable observations
- If you cannot clearly see something, say so rather than guessing

For each finding you identify, mentally note:
1. Category (safety/security/compliance/maintenance)
2. Severity (critical/high/medium/low)
3. Brief title
4. Description with location hint

You will receive video frames from the inspector's camera. Analyze each frame and speak your findings aloud in a natural, conversational way.`;

interface GeminiLiveConfig {
  apiKey: string;
  onTextResponse: (text: string) => void;
  onAudioResponse: (audioData: ArrayBuffer) => void;
  onFinding: (finding: Partial<SessionFinding>) => void;
  onConnectionChange: (connected: boolean) => void;
  onError: (error: Error) => void;
}

interface GeminiMessage {
  client_content?: {
    turns: Array<{
      role: string;
      parts: Array<{
        text?: string;
        inline_data?: {
          mime_type: string;
          data: string;
        };
      }>;
    }>;
    turn_complete?: boolean;
  };
  realtime_input?: {
    media_chunks: Array<{
      mime_type: string;
      data: string;
    }>;
  };
  setup?: {
    model: string;
    generation_config?: {
      response_modalities: string[];
      speech_config?: {
        voice_config?: {
          prebuilt_voice_config?: {
            voice_name: string;
          };
        };
      };
    };
    system_instruction?: {
      parts: Array<{ text: string }>;
    };
    tools?: Array<{
      function_declarations: Array<{
        name: string;
        description: string;
        parameters: object;
      }>;
    }>;
  };
}

/**
 * Gemini Live API Client
 * Handles WebSocket connection for real-time video/audio streaming
 */
export class GeminiLiveClient {
  private ws: WebSocket | null = null;
  private config: GeminiLiveConfig;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private sessionStartTime: number = 0;

  constructor(config: GeminiLiveConfig) {
    this.config = config;
  }

  /**
   * Connect to Gemini Live API
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = `${GEMINI_LIVE_WS_URL}?key=${this.config.apiKey}`;

      try {
        this.ws = new WebSocket(url);
        this.sessionStartTime = Date.now();

        this.ws.onopen = () => {
          console.log('Gemini Live: WebSocket connected');
          this.sendSetupMessage();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error) => {
          console.error('Gemini Live: WebSocket error', error);
          this.config.onError(new Error('WebSocket connection error'));
          reject(error);
        };

        this.ws.onclose = (event) => {
          console.log('Gemini Live: WebSocket closed', event.code, event.reason);
          this.isConnected = false;
          this.config.onConnectionChange(false);

          // Attempt reconnect if unexpected close
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => this.connect(), 2000);
          }
        };

        // Resolve after setup is sent
        setTimeout(() => {
          if (this.ws?.readyState === WebSocket.OPEN) {
            resolve();
          }
        }, 1000);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Send initial setup message with system prompt
   */
  private sendSetupMessage(): void {
    const setupMessage: GeminiMessage = {
      setup: {
        model: `models/${GEMINI_CONFIG.model}`,
        generation_config: {
          response_modalities: ['AUDIO', 'TEXT'],
          speech_config: {
            voice_config: {
              prebuilt_voice_config: {
                voice_name: 'Aoede', // Clear, professional voice
              },
            },
          },
        },
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        // Define function for structured findings
        tools: [
          {
            function_declarations: [
              {
                name: 'report_finding',
                description: 'Report a safety, security, compliance, or maintenance finding',
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
                      description: 'Severity level',
                    },
                    title: {
                      type: 'string',
                      description: 'Brief title of the finding',
                    },
                    description: {
                      type: 'string',
                      description: 'Detailed description',
                    },
                    location_hint: {
                      type: 'string',
                      description: 'Location hint (e.g., "near entrance", "left side")',
                    },
                  },
                  required: ['category', 'severity', 'title', 'description'],
                },
              },
            ],
          },
        ],
      },
    };

    this.send(setupMessage);
    this.isConnected = true;
    this.config.onConnectionChange(true);
  }

  /**
   * Handle incoming messages from Gemini
   */
  private handleMessage(data: string | ArrayBuffer): void {
    try {
      if (typeof data === 'string') {
        const message = JSON.parse(data);

        // Handle server content (text/audio responses)
        if (message.serverContent) {
          const parts = message.serverContent.modelTurn?.parts || [];

          for (const part of parts) {
            // Text response
            if (part.text) {
              this.config.onTextResponse(part.text);
            }

            // Audio response
            if (part.inlineData?.mimeType?.startsWith('audio/')) {
              const audioData = this.base64ToArrayBuffer(part.inlineData.data);
              this.config.onAudioResponse(audioData);
            }
          }
        }

        // Handle tool calls (findings)
        if (message.toolCall) {
          const functionCalls = message.toolCall.functionCalls || [];

          for (const call of functionCalls) {
            if (call.name === 'report_finding') {
              const finding: Partial<SessionFinding> = {
                timestamp_seconds: (Date.now() - this.sessionStartTime) / 1000,
                category: call.args.category as FindingCategory,
                severity: call.args.severity as FindingSeverity,
                title: call.args.title,
                description: call.args.description,
                location_hint: call.args.location_hint,
                ai_confidence: 0.8, // Default confidence
              };
              this.config.onFinding(finding);

              // Send tool response to acknowledge
              this.sendToolResponse(call.id, { acknowledged: true });
            }
          }
        }

        // Handle setup complete
        if (message.setupComplete) {
          console.log('Gemini Live: Setup complete');
        }
      } else {
        // Binary audio data
        this.config.onAudioResponse(data);
      }
    } catch (error) {
      console.error('Gemini Live: Error parsing message', error);
    }
  }

  /**
   * Send video frame for analysis
   */
  sendVideoFrame(base64Data: string): void {
    if (!this.isConnected || !this.ws) return;

    const message: GeminiMessage = {
      realtime_input: {
        media_chunks: [
          {
            mime_type: 'image/jpeg',
            data: base64Data,
          },
        ],
      },
    };

    this.send(message);
  }

  /**
   * Send audio chunk for voice input
   */
  sendAudioChunk(base64Data: string): void {
    if (!this.isConnected || !this.ws) return;

    const message: GeminiMessage = {
      realtime_input: {
        media_chunks: [
          {
            mime_type: 'audio/pcm',
            data: base64Data,
          },
        ],
      },
    };

    this.send(message);
  }

  /**
   * Send text message (user question)
   */
  sendTextMessage(text: string): void {
    if (!this.isConnected || !this.ws) return;

    const message: GeminiMessage = {
      client_content: {
        turns: [
          {
            role: 'user',
            parts: [{ text }],
          },
        ],
        turn_complete: true,
      },
    };

    this.send(message);
  }

  /**
   * Send tool response
   */
  private sendToolResponse(callId: string, result: object): void {
    const message = {
      toolResponse: {
        functionResponses: [
          {
            id: callId,
            name: 'report_finding',
            response: result,
          },
        ],
      },
    };

    this.send(message);
  }

  /**
   * Send message through WebSocket
   */
  private send(message: object): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Disconnect from Gemini Live API
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Session ended');
      this.ws = null;
    }
    this.isConnected = false;
    this.reconnectAttempts = 0;
  }

  /**
   * Check if connected
   */
  getIsConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Convert base64 to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

/**
 * Create a new Gemini Live client instance
 */
export function createGeminiLiveClient(config: Omit<GeminiLiveConfig, 'apiKey'>): GeminiLiveClient {
  return new GeminiLiveClient({
    ...config,
    apiKey: GEMINI_CONFIG.apiKey,
  });
}
