import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, Card } from '../../src/components/ui';
import { getCurrentLocation, formatCoordinates } from '../../src/services/location';
import { createSession } from '../../src/services/sessions';
import { useAuthStore } from '../../src/stores/authStore';
import { useSessionStore } from '../../src/stores/sessionStore';
import { COLORS, SPACING, TYPOGRAPHY } from '../../src/config/constants';
import type { SessionLocation } from '../../src/types/session';

export default function NewInspectionScreen() {
  const { user } = useAuthStore();
  const { startSession } = useSessionStore();

  const [siteName, setSiteName] = useState('');
  const [location, setLocation] = useState<SessionLocation | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocation = async () => {
    setLoadingLocation(true);
    setError(null);

    try {
      const loc = await getCurrentLocation();
      setLocation(loc);
    } catch (err: any) {
      setError(err.message || 'Failed to get location');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleStartInspection = async () => {
    if (!siteName.trim()) {
      Alert.alert('Site Name Required', 'Please enter a site name or number.');
      return;
    }

    if (!location) {
      Alert.alert('Location Required', 'Unable to get your location. Please try again.');
      return;
    }

    if (!user) {
      Alert.alert('Not Signed In', 'Please sign in to start an inspection.');
      return;
    }

    setCreating(true);
    try {
      const session = await createSession(user.id, siteName.trim(), location);

      // Update local state
      startSession(session.id, siteName.trim(), location);

      // Navigate to live inspection
      router.replace(`/inspection/${session.id}`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create inspection session.');
      setCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <Text style={styles.title}>New Inspection</Text>
        <Text style={styles.subtitle}>
          Enter site details to begin your AI-powered inspection
        </Text>

        <Card variant="elevated" style={styles.card}>
          <Input
            label="Site Name or Number"
            value={siteName}
            onChangeText={setSiteName}
            placeholder="e.g., Building A, Site 123"
            autoCapitalize="words"
          />

          <View style={styles.locationSection}>
            <Text style={styles.label}>Current Location</Text>

            {loadingLocation ? (
              <View style={styles.loadingLocation}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingText}>Getting your location...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorLocation}>
                <Text style={styles.errorText}>{error}</Text>
                <Button
                  title="Retry"
                  onPress={fetchLocation}
                  variant="outline"
                  size="sm"
                />
              </View>
            ) : location ? (
              <View style={styles.locationInfo}>
                {location.address && (
                  <Text style={styles.address}>{location.address}</Text>
                )}
                <Text style={styles.coordinates}>
                  {formatCoordinates(location.latitude, location.longitude)}
                </Text>
                <Text style={styles.accuracy}>
                  Accuracy: ±{Math.round(location.accuracy)}m
                </Text>
              </View>
            ) : null}
          </View>
        </Card>

        <Card variant="outlined" style={styles.infoCard}>
          <Text style={styles.infoTitle}>What happens next?</Text>
          <View style={styles.infoList}>
            <InfoItem text="Your camera will stream to AI for real-time analysis" />
            <InfoItem text="AI will speak findings as you walk through the site" />
            <InfoItem text="You can ask questions hands-free using voice" />
            <InfoItem text="A PDF report will be generated when you finish" />
          </View>
        </Card>

        <View style={styles.actions}>
          <Button
            title="Start Inspection"
            onPress={handleStartInspection}
            loading={creating}
            disabled={!location || loadingLocation}
            fullWidth
            size="lg"
          />
          <Button
            title="Cancel"
            onPress={() => router.back()}
            variant="ghost"
            fullWidth
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function InfoItem({ text }: { text: string }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoBullet}>•</Text>
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  card: {
    marginBottom: SPACING.md,
  },

  // Location section
  locationSection: {
    marginTop: SPACING.md,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  loadingLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 8,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  errorLocation: {
    padding: SPACING.md,
    backgroundColor: `${COLORS.error}10`,
    borderRadius: 8,
    gap: SPACING.sm,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.error,
  },
  locationInfo: {
    padding: SPACING.md,
    backgroundColor: `${COLORS.success}10`,
    borderRadius: 8,
  },
  address: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  coordinates: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontFamily: 'monospace',
  },
  accuracy: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  // Info card
  infoCard: {
    marginBottom: SPACING.lg,
  },
  infoTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  infoList: {
    gap: SPACING.xs,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoBullet: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    marginRight: SPACING.sm,
    lineHeight: 20,
  },
  infoText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  // Actions
  actions: {
    gap: SPACING.sm,
    marginTop: 'auto',
  },
});
