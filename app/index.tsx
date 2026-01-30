import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../src/stores/authStore';
import { Button, Card } from '../src/components/ui';
import { COLORS, SPACING, TYPOGRAPHY, APP_CONFIG } from '../src/config/constants';

export default function HomeScreen() {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.heroSection}>
            <Text style={styles.logo}>Circle Eye</Text>
            <Text style={styles.tagline}>AI Site Risk Assessment</Text>
            <Text style={styles.description}>
              Point your camera. Walk your site.{'\n'}
              Get your risk assessment. Done.
            </Text>
          </View>

          <View style={styles.featuresSection}>
            <FeatureItem
              icon="🎥"
              title="Live AI Analysis"
              description="Real-time safety and risk detection as you walk"
            />
            <FeatureItem
              icon="🎤"
              title="Voice Interaction"
              description="Hands-free operation with voice commands"
            />
            <FeatureItem
              icon="📋"
              title="Instant Reports"
              description="Professional PDF reports generated automatically"
            />
          </View>

          <View style={styles.authSection}>
            <Button
              title="Sign In"
              onPress={() => router.push('/auth/login')}
              fullWidth
            />
            <Button
              title="Create Account"
              onPress={() => router.push('/auth/register')}
              variant="outline"
              fullWidth
            />
          </View>

          <Text style={styles.footerText}>
            Powered by {APP_CONFIG.company}
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Authenticated home screen
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            Welcome back, {user?.full_name || 'Inspector'}
          </Text>
          <Text style={styles.welcomeSubtext}>
            Ready to start a new inspection?
          </Text>
        </View>

        <Card variant="elevated" style={styles.actionCard}>
          <Text style={styles.cardTitle}>Start New Inspection</Text>
          <Text style={styles.cardDescription}>
            Begin a live AI-powered site inspection with real-time hazard detection
          </Text>
          <Button
            title="Start Inspection"
            onPress={() => router.push('/inspection/new')}
            fullWidth
            size="lg"
          />
        </Card>

        <Card variant="outlined" style={styles.actionCard}>
          <Text style={styles.cardTitle}>View History</Text>
          <Text style={styles.cardDescription}>
            Access your past inspections and reports
          </Text>
          <Button
            title="View History"
            onPress={() => router.push('/history')}
            variant="outline"
            fullWidth
          />
        </Card>

        <View style={styles.quickStats}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.statsRow}>
            <QuickAction
              icon="⚙️"
              label="Settings"
              onPress={() => {/* TODO */}}
            />
            <QuickAction
              icon="❓"
              label="Help"
              onPress={() => {/* TODO */}}
            />
            <QuickAction
              icon="🚪"
              label="Sign Out"
              onPress={() => {
                // Sign out logic
                import('../src/services/auth').then(({ signOut }) => signOut());
              }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Button
      title={`${icon} ${label}`}
      onPress={onPress}
      variant="ghost"
      size="sm"
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
  },

  // Hero section (unauthenticated)
  heroSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingTop: SPACING.xl,
  },
  logo: {
    fontSize: TYPOGRAPHY.fontSize['4xl'],
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  tagline: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.md,
    lineHeight: 24,
  },

  // Features section
  featuresSection: {
    marginBottom: SPACING.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  featureIcon: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  featureDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Auth section
  authSection: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  footerText: {
    textAlign: 'center',
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },

  // Authenticated home
  welcomeSection: {
    marginBottom: SPACING.lg,
  },
  welcomeText: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  welcomeSubtext: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },

  // Action cards
  actionCard: {
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  cardDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },

  // Quick stats
  quickStats: {
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});
