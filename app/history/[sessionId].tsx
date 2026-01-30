import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Share,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSession, getSessionFindings, getSessionReport } from '../../src/services/sessions';
import { generateReportPDF } from '../../src/utils/reportExport';
import { useAuthStore } from '../../src/stores/authStore';
import { Button, Card, SeverityBadge, CategoryBadge } from '../../src/components/ui';
import { COLORS, SPACING, TYPOGRAPHY } from '../../src/config/constants';
import type { InspectionSession, SessionFinding, InspectionReport } from '../../src/types/session';

export default function SessionReportScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { user } = useAuthStore();

  const [session, setSession] = useState<InspectionSession | null>(null);
  const [findings, setFindings] = useState<SessionFinding[]>([]);
  const [report, setReport] = useState<InspectionReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadData();
  }, [sessionId]);

  const loadData = async () => {
    if (!sessionId) return;

    try {
      const [sessionData, findingsData, reportData] = await Promise.all([
        getSession(sessionId),
        getSessionFindings(sessionId),
        getSessionReport(sessionId),
      ]);

      setSession(sessionData);
      setFindings(findingsData);
      setReport(reportData);
    } catch (error) {
      console.error('Failed to load session data:', error);
      Alert.alert('Error', 'Failed to load inspection data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!session || !user) return;

    setExporting(true);
    try {
      const pdfUri = await generateReportPDF({
        session,
        findings,
        report,
        inspectorName: user.full_name || user.email,
        inspectorEmail: user.email,
      });

      await Share.share({
        url: pdfUri,
        title: `Inspection Report - ${session.site_name}`,
      });
    } catch (error: any) {
      Alert.alert('Export Failed', error.message || 'Failed to generate PDF');
    } finally {
      setExporting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} minutes ${secs} seconds`;
  };

  const getSeverityCount = (severity: string) => {
    return findings.filter((f) => f.severity === severity).length;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading report...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Session not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Card variant="elevated" style={styles.headerCard}>
          <Text style={styles.siteName}>{session.site_name}</Text>
          {session.site_address && (
            <Text style={styles.address}>📍 {session.site_address}</Text>
          )}
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              📅 {formatDate(session.started_at)}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              ⏱️ Duration: {formatDuration(session.duration_seconds)}
            </Text>
          </View>
        </Card>

        {/* Summary */}
        <Card variant="outlined" style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.statsGrid}>
            <StatBox
              value={findings.length}
              label="Total Findings"
              color={COLORS.primary}
            />
            <StatBox
              value={getSeverityCount('critical')}
              label="Critical"
              color={COLORS.critical}
            />
            <StatBox
              value={getSeverityCount('high')}
              label="High"
              color={COLORS.high}
            />
            <StatBox
              value={getSeverityCount('medium')}
              label="Medium"
              color={COLORS.medium}
            />
          </View>
        </Card>

        {/* Findings */}
        <Text style={styles.sectionTitle}>Findings</Text>
        {findings.length === 0 ? (
          <Card variant="outlined" style={styles.emptyFindings}>
            <Text style={styles.emptyText}>
              No findings recorded during this inspection
            </Text>
          </Card>
        ) : (
          findings.map((finding, index) => (
            <Card key={finding.id} variant="outlined" style={styles.findingCard}>
              <View style={styles.findingHeader}>
                <Text style={styles.findingNumber}>#{index + 1}</Text>
                <SeverityBadge severity={finding.severity} />
                <CategoryBadge category={finding.category} />
              </View>
              <Text style={styles.findingTitle}>{finding.title}</Text>
              {finding.description && (
                <Text style={styles.findingDescription}>
                  {finding.description}
                </Text>
              )}
              {finding.location_hint && (
                <Text style={styles.findingLocation}>
                  📍 {finding.location_hint}
                </Text>
              )}
              <Text style={styles.findingTimestamp}>
                @ {Math.floor(finding.timestamp_seconds / 60)}:
                {String(Math.floor(finding.timestamp_seconds % 60)).padStart(2, '0')}
              </Text>
            </Card>
          ))
        )}

        {/* Disclaimer */}
        <Card variant="outlined" style={styles.disclaimerCard}>
          <Text style={styles.disclaimerTitle}>Disclaimer</Text>
          <Text style={styles.disclaimerText}>
            This report is based solely on AI visual analysis of the live video
            feed during the inspection walkthrough. It cannot assess hidden
            conditions, verify compliance with local regulations, or substitute
            for professional assessments by qualified personnel.
          </Text>
        </Card>

        {/* Export Button */}
        <View style={styles.exportSection}>
          <Button
            title={exporting ? 'Generating PDF...' : 'Export PDF Report'}
            onPress={handleExportPDF}
            loading={exporting}
            fullWidth
            size="lg"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.error,
  },

  // Header
  headerCard: {
    marginBottom: SPACING.md,
  },
  siteName: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  address: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  metaRow: {
    marginTop: SPACING.xs,
  },
  metaText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },

  // Summary
  summaryCard: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  statBox: {
    flex: 1,
    minWidth: 80,
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 8,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Findings
  findingCard: {
    marginBottom: SPACING.sm,
  },
  findingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  findingNumber: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  findingTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  findingDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  findingLocation: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  findingTimestamp: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    marginTop: SPACING.xs,
  },
  emptyFindings: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textMuted,
  },

  // Disclaimer
  disclaimerCard: {
    marginTop: SPACING.lg,
    backgroundColor: `${COLORS.warning}10`,
  },
  disclaimerTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: COLORS.warning,
    marginBottom: SPACING.xs,
  },
  disclaimerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  // Export
  exportSection: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
});
