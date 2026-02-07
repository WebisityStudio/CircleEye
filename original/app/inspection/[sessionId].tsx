import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSessionStore } from '../../src/stores/sessionStore';
import { useAuthStore } from '../../src/stores/authStore';
import { createGeminiFlashClient, GeminiFlashClient } from '../../src/services/geminiFlashService';
import { addFinding, updateSessionStatus } from '../../src/services/sessions';
import { Button, SeverityBadge, CategoryBadge } from '../../src/components/ui';
import { COLORS, SPACING, TYPOGRAPHY, GEMINI_CONFIG } from '../../src/config/constants';
import type { SessionFinding } from '../../src/types/session';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Polling interval in milliseconds (1.5 seconds for "real-time" feel)
const ANALYSIS_INTERVAL_MS = 1500;

export default function LiveInspectionScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { user } = useAuthStore();
  const {
    isActive,
    siteName,
    location,
    elapsedSeconds,
    findings,
    isConnectedToAI,
    lastAIMessage,
    addFinding: addFindingToStore,
    setConnectedToAI,
    setLastAIMessage,
    setError,
    updateElapsedTime,
    endSession,
    reset,
  } = useSessionStore();

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [showFindingToast, setShowFindingToast] = useState(false);
  const [latestFinding, setLatestFinding] = useState<SessionFinding | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [analysisCount, setAnalysisCount] = useState(0);

  const cameraRef = useRef<CameraView>(null);
  const geminiClientRef = useRef<GeminiFlashClient | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analysisIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const toastAnimation = useRef(new Animated.Value(0)).current;
  const lastFrameRef = useRef<string | null>(null);

  // Request permissions and initialize
  useEffect(() => {
    const init = async () => {
      // Request camera permission
      if (!cameraPermission?.granted) {
        const result = await requestCameraPermission();
        if (!result.granted) {
          Alert.alert(
            'Camera Permission Required',
            'Please enable camera access to use the inspection feature.',
            [{ text: 'OK', onPress: () => router.back() }]
          );
          return;
        }
      }

      // Request audio permission (for potential future voice input)
      const { granted: audioGranted } = await Audio.requestPermissionsAsync();
      if (!audioGranted) {
        Alert.alert(
          'Microphone Permission Required',
          'Please enable microphone access for voice interaction.',
          [{ text: 'OK' }]
        );
      }

      // Initialize Gemini Flash client
      initializeGemini();

      // Start elapsed time timer
      timerRef.current = setInterval(() => {
        updateElapsedTime(
          Math.floor(
            (Date.now() - (useSessionStore.getState().startTime?.getTime() || Date.now())) / 1000
          )
        );
      }, 1000);
    };

    init();

    return () => {
      cleanup();
    };
  }, []);

  const initializeGemini = useCallback(() => {
    if (!GEMINI_CONFIG.apiKey) {
      console.warn('Gemini API key not configured');
      setConnectionError(
        'AI service not configured. Please add EXPO_PUBLIC_GEMINI_API_KEY to your .env file.'
      );
      return;
    }

    console.log('Initializing Gemini 3 Flash client...');
    setConnectionError(null);

    geminiClientRef.current = createGeminiFlashClient({
      onTextResponse: (text) => {
        console.log('AI Response:', text);
        setLastAIMessage(text);
        // Speak the response using text-to-speech
        speakResponse(text);
      },
      onFinding: async (findingData) => {
        // Save finding to database
        if (sessionId) {
          try {
            const savedFinding = await addFinding(sessionId, {
              timestamp_seconds: findingData.timestamp_seconds || 0,
              category: findingData.category!,
              severity: findingData.severity!,
              title: findingData.title!,
              description: findingData.description || null,
              location_hint: findingData.location_hint || null,
              ai_confidence: findingData.ai_confidence || null,
            });

            // Update local state
            addFindingToStore(savedFinding);
            showFindingNotification(savedFinding);
          } catch (err) {
            console.error('Failed to save finding:', err);
          }
        }
      },
      onError: (error) => {
        console.error('Gemini error:', error);
        setConnectionError(error.message);
        setError(error.message);
      },
    });

    // Start the session
    geminiClientRef.current.startSession();
    setConnectedToAI(true);

    // Start the high-frequency analysis loop
    startAnalysisLoop();
  }, [sessionId]);

  /**
   * Speak AI response using Expo Speech (text-to-speech)
   * This is more secure - only the user can hear via earbuds
   */
  const speakResponse = async (text: string) => {
    // Skip trivial responses like "Area clear" to reduce noise
    const skipPhrases = ['area clear', 'looking good', 'all clear', 'no issues'];
    const lowerText = text.toLowerCase();

    // Always speak findings and warnings
    const isImportant =
      text.length > 50 ||
      lowerText.includes('hazard') ||
      lowerText.includes('warning') ||
      lowerText.includes('caution') ||
      lowerText.includes('danger') ||
      lowerText.includes('blocked') ||
      lowerText.includes('risk');

    if (!isImportant && skipPhrases.some((phrase) => lowerText.includes(phrase))) {
      console.log('Skipping TTS for trivial response');
      return;
    }

    // Stop any ongoing speech
    if (isSpeaking) {
      await Speech.stop();
    }

    setIsSpeaking(true);

    try {
      await Speech.speak(text, {
        language: 'en-GB', // British English for UK compliance context
        pitch: 1.0,
        rate: 1.1, // Slightly faster for efficiency
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch (error) {
      console.error('Speech error:', error);
      setIsSpeaking(false);
    }
  };

  /**
   * Start the high-frequency analysis loop
   * This polls Gemini 3 Flash every 1.5 seconds for "real-time" perception
   */
  const startAnalysisLoop = useCallback(() => {
    console.log('Starting Gemini 3 Flash analysis loop...');

    analysisIntervalRef.current = setInterval(async () => {
      if (!cameraRef.current || !geminiClientRef.current) return;
      if (geminiClientRef.current.isBusy()) return;

      try {
        setIsAnalyzing(true);

        // Capture frame
        const photo = await cameraRef.current.takePictureAsync({
          quality: GEMINI_CONFIG.frameQuality,
          base64: true,
          skipProcessing: true,
        });

        if (photo?.base64) {
          lastFrameRef.current = photo.base64;
          console.log('Sending frame to Gemini 3 Flash, size:', Math.round(photo.base64.length / 1024), 'KB');

          // Analyze with Gemini 3 Flash
          await geminiClientRef.current.analyzeFrame(photo.base64);
          setAnalysisCount((prev) => prev + 1);
        }
      } catch (err) {
        // Ignore capture errors during rapid capture
        console.log('Frame capture error (non-critical):', err);
      } finally {
        setIsAnalyzing(false);
      }
    }, ANALYSIS_INTERVAL_MS);
  }, []);

  const stopAnalysisLoop = useCallback(() => {
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
  }, []);

  const showFindingNotification = (finding: SessionFinding) => {
    setLatestFinding(finding);
    setShowFindingToast(true);

    // Animate toast
    Animated.sequence([
      Animated.timing(toastAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(4000), // Show longer for findings
      Animated.timing(toastAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowFindingToast(false);
    });
  };

  const cleanup = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    stopAnalysisLoop();
    geminiClientRef.current?.endSession();
    Speech.stop();
  };

  const handleEndInspection = async () => {
    Alert.alert('End Inspection?', 'This will stop the AI analysis and generate your report.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End & Generate Report',
        onPress: async () => {
          cleanup();
          endSession();

          if (sessionId) {
            await updateSessionStatus(sessionId, 'completed', elapsedSeconds);
          }

          // Navigate to report
          router.replace(`/history/${sessionId}`);
        },
      },
    ]);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!cameraPermission?.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Camera permission required</Text>
          <Button title="Grant Permission" onPress={requestCameraPermission} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        {/* Header Overlay */}
        <SafeAreaView style={styles.headerOverlay}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.siteName} numberOfLines={1}>
                {siteName}
              </Text>
              <Text style={styles.duration}>{formatTime(elapsedSeconds)}</Text>
            </View>
            <View style={styles.headerRight}>
              <View
                style={[
                  styles.connectionDot,
                  isConnectedToAI && styles.connectionDotConnected,
                  connectionError && styles.connectionDotError,
                  isAnalyzing && styles.connectionDotAnalyzing,
                ]}
              />
              <Text style={styles.connectionText}>
                {connectionError
                  ? 'Error'
                  : isAnalyzing
                  ? 'Analyzing...'
                  : isConnectedToAI
                  ? 'Gemini 3 Active'
                  : 'Initializing'}
              </Text>
            </View>
          </View>
        </SafeAreaView>

        {/* Finding Toast */}
        {showFindingToast && latestFinding && (
          <Animated.View
            style={[
              styles.findingToast,
              {
                opacity: toastAnimation,
                transform: [
                  {
                    translateY: toastAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.findingToastContent}>
              <View style={styles.findingToastHeader}>
                <SeverityBadge severity={latestFinding.severity} />
                <CategoryBadge category={latestFinding.category} />
              </View>
              <Text style={styles.findingToastTitle}>{latestFinding.title}</Text>
              {latestFinding.location_hint && (
                <Text style={styles.findingToastLocation}>
                  {latestFinding.location_hint}
                </Text>
              )}
            </View>
          </Animated.View>
        )}

        {/* Connection Error Overlay */}
        {connectionError && (
          <View style={styles.errorOverlay}>
            <Text style={styles.errorText}>{connectionError}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => initializeGemini()}>
              <Text style={styles.retryButtonText}>Retry Connection</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* AI Message Overlay */}
        {lastAIMessage && !connectionError && (
          <View style={styles.aiMessageOverlay}>
            <View style={styles.aiMessageContainer}>
              {isSpeaking && <Text style={styles.speakingIndicator}>Speaking...</Text>}
              <Text style={styles.aiMessageText} numberOfLines={3}>
                {lastAIMessage}
              </Text>
            </View>
          </View>
        )}

        {/* Bottom Controls */}
        <SafeAreaView style={styles.bottomOverlay} edges={['bottom']}>
          <View style={styles.findingsCounter}>
            <Text style={styles.findingsCount}>{findings.length}</Text>
            <Text style={styles.findingsLabel}>Findings</Text>
          </View>

          <TouchableOpacity style={styles.endButton} onPress={handleEndInspection}>
            <View style={styles.endButtonInner}>
              <Text style={styles.endButtonText}>End</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.flipButton}
            onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}
          >
            <Text style={styles.flipButtonText}>Flip</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  permissionText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textOnPrimary,
    marginBottom: SPACING.md,
  },

  // Header
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  headerLeft: {
    flex: 1,
  },
  siteName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: '#FFF',
  },
  duration: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'monospace',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  connectionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.warning,
  },
  connectionDotConnected: {
    backgroundColor: COLORS.success,
  },
  connectionDotError: {
    backgroundColor: COLORS.error,
  },
  connectionDotAnalyzing: {
    backgroundColor: COLORS.info,
  },
  connectionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#FFF',
    fontWeight: '500',
  },

  // Finding Toast
  findingToast: {
    position: 'absolute',
    top: 100,
    left: SPACING.md,
    right: SPACING.md,
    zIndex: 20,
  },
  findingToastContent: {
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderRadius: 12,
    padding: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  findingToastHeader: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  findingToastTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: '#FFF',
  },
  findingToastLocation: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },

  // AI Message
  aiMessageOverlay: {
    position: 'absolute',
    bottom: 150,
    left: SPACING.md,
    right: SPACING.md,
    zIndex: 15,
  },
  aiMessageContainer: {
    backgroundColor: 'rgba(30, 58, 95, 0.95)',
    padding: SPACING.md,
    borderRadius: 12,
  },
  speakingIndicator: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.success,
    marginBottom: 4,
    fontWeight: '600',
  },
  aiMessageText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: '#FFF',
    lineHeight: 22,
  },

  // Bottom Controls
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  findingsCounter: {
    alignItems: 'center',
    minWidth: 60,
  },
  findingsCount: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: 'bold',
    color: '#FFF',
  },
  findingsLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: 'rgba(255,255,255,0.7)',
  },
  endButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  endButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  endButtonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: '#FFF',
  },
  flipButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#FFF',
    fontWeight: '500',
  },

  // Error Overlay
  errorOverlay: {
    position: 'absolute',
    top: '30%',
    left: SPACING.md,
    right: SPACING.md,
    zIndex: 25,
    backgroundColor: 'rgba(220, 38, 38, 0.95)',
    padding: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  retryButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.error,
  },
});
