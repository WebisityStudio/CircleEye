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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSessionStore } from '../../src/stores/sessionStore';
import { useAuthStore } from '../../src/stores/authStore';
import { createGeminiLiveClient, GeminiLiveClient } from '../../src/services/geminiLive';
import { addFinding, updateSessionStatus, getSessionFindings } from '../../src/services/sessions';
import { Button, Badge, SeverityBadge, CategoryBadge } from '../../src/components/ui';
import { COLORS, SPACING, TYPOGRAPHY, GEMINI_CONFIG } from '../../src/config/constants';
import type { SessionFinding } from '../../src/types/session';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  const [isRecording, setIsRecording] = useState(false);
  const [showFindingToast, setShowFindingToast] = useState(false);
  const [latestFinding, setLatestFinding] = useState<SessionFinding | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);

  const cameraRef = useRef<CameraView>(null);
  const geminiClientRef = useRef<GeminiLiveClient | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const toastAnimation = useRef(new Animated.Value(0)).current;

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

      // Request audio permission
      const { granted: audioGranted } = await Audio.requestPermissionsAsync();
      if (!audioGranted) {
        Alert.alert(
          'Microphone Permission Required',
          'Please enable microphone access for voice interaction.',
          [{ text: 'OK' }]
        );
      }

      // Initialize Gemini client
      initializeGemini();

      // Start timer
      timerRef.current = setInterval(() => {
        updateElapsedTime(Math.floor((Date.now() - (useSessionStore.getState().startTime?.getTime() || Date.now())) / 1000));
      }, 1000);
    };

    init();

    return () => {
      cleanup();
    };
  }, []);

  const initializeGemini = useCallback(async () => {
    if (!GEMINI_CONFIG.apiKey) {
      console.warn('Gemini API key not configured');
      setConnectionError('AI service not configured. Please add EXPO_PUBLIC_GEMINI_API_KEY to your .env file.');
      setIsConnecting(false);
      return;
    }

    console.log('Initializing Gemini with API key:', GEMINI_CONFIG.apiKey.substring(0, 10) + '...');
    setIsConnecting(true);
    setConnectionError(null);

    try {
      geminiClientRef.current = createGeminiLiveClient({
        onTextResponse: (text) => {
          console.log('AI Text Response:', text);
          setLastAIMessage(text);
        },
        onAudioResponse: (audioData) => {
          // Play audio response
          playAudioResponse(audioData);
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
        onConnectionChange: (connected) => {
          console.log('Connection change:', connected);
          setConnectedToAI(connected);
          setIsConnecting(false);
          if (connected) {
            setConnectionError(null);
            startFrameCapture();
          } else {
            stopFrameCapture();
          }
        },
        onError: (error) => {
          console.error('Gemini error:', error);
          setConnectionError(error.message);
          setIsConnecting(false);
          setError(error.message);
        },
      });

      console.log('Connecting to Gemini Live API...');
      await geminiClientRef.current.connect();
      console.log('Gemini connection successful');
    } catch (err: any) {
      console.error('Failed to initialize Gemini:', err);
      setConnectionError(err.message || 'Failed to connect to AI service');
      setIsConnecting(false);
      setError('Failed to connect to AI service');
    }
  }, [sessionId]);

  const startFrameCapture = useCallback(() => {
    console.log('Starting frame capture at', GEMINI_CONFIG.frameCaptureFPS, 'FPS');
    // Capture frames at configured FPS
    frameIntervalRef.current = setInterval(async () => {
      if (cameraRef.current && geminiClientRef.current?.isReady()) {
        try {
          const photo = await cameraRef.current.takePictureAsync({
            quality: GEMINI_CONFIG.frameQuality,
            base64: true,
            skipProcessing: true,
          });

          if (photo?.base64) {
            console.log('Sending frame, size:', Math.round(photo.base64.length / 1024), 'KB');
            geminiClientRef.current.sendVideoFrame(photo.base64);
          }
        } catch (err) {
          // Ignore capture errors during rapid capture
        }
      }
    }, 1000 / GEMINI_CONFIG.frameCaptureFPS);
  }, []);

  const stopFrameCapture = useCallback(() => {
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
  }, []);

  const playAudioResponse = async (audioData: ArrayBuffer) => {
    // TODO: Implement audio playback
    // This requires converting PCM to a playable format
    console.log('Audio response received:', audioData.byteLength, 'bytes');
  };

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
      Animated.delay(3000),
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
    stopFrameCapture();
    geminiClientRef.current?.disconnect();
  };

  const handleEndInspection = async () => {
    Alert.alert(
      'End Inspection?',
      'This will stop the AI analysis and generate your report.',
      [
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
      ]
    );
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
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
      >
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
              <View style={[
                styles.connectionDot,
                isConnectedToAI && styles.connectionDotConnected,
                connectionError && styles.connectionDotError
              ]} />
              <Text style={styles.connectionText}>
                {connectionError ? 'Error' : isConnectedToAI ? 'AI Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
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
                  📍 {latestFinding.location_hint}
                </Text>
              )}
            </View>
          </Animated.View>
        )}

        {/* Connection Error Overlay */}
        {connectionError && (
          <View style={styles.errorOverlay}>
            <Text style={styles.errorText}>⚠️ {connectionError}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => initializeGemini()}
            >
              <Text style={styles.retryButtonText}>Retry Connection</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* AI Message Overlay */}
        {lastAIMessage && !connectionError && (
          <View style={styles.aiMessageOverlay}>
            <Text style={styles.aiMessageText} numberOfLines={3}>
              🤖 {lastAIMessage}
            </Text>
          </View>
        )}

        {/* Bottom Controls */}
        <SafeAreaView style={styles.bottomOverlay} edges={['bottom']}>
          <View style={styles.findingsCounter}>
            <Text style={styles.findingsCount}>{findings.length}</Text>
            <Text style={styles.findingsLabel}>Findings</Text>
          </View>

          <TouchableOpacity
            style={styles.endButton}
            onPress={handleEndInspection}
          >
            <View style={styles.endButtonInner}>
              <Text style={styles.endButtonText}>End</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.flipButton}
            onPress={() => setFacing(f => f === 'back' ? 'front' : 'back')}
          >
            <Text style={styles.flipButtonText}>🔄</Text>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.warning,
  },
  connectionDotConnected: {
    backgroundColor: COLORS.success,
  },
  connectionDotError: {
    backgroundColor: COLORS.error,
  },
  connectionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: '#FFF',
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
    backgroundColor: 'rgba(0,0,0,0.85)',
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
  aiMessageText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: '#FFF',
    backgroundColor: 'rgba(30, 58, 95, 0.9)',
    padding: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
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
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    fontSize: 24,
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
