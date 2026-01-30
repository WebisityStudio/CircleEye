import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../config/constants';
import type { FindingSeverity, FindingCategory } from '../../types/session';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export function Badge({
  label,
  variant = 'default',
  size = 'md',
  style,
}: BadgeProps) {
  return (
    <View style={[styles.base, styles[`variant_${variant}`], styles[`size_${size}`], style]}>
      <Text style={[styles.text, styles[`text_${variant}`], styles[`text_${size}`]]}>
        {label}
      </Text>
    </View>
  );
}

// Specialized badges for severity and category
export function SeverityBadge({ severity }: { severity: FindingSeverity }) {
  const config = {
    critical: { label: 'Critical', variant: 'error' as const },
    high: { label: 'High', variant: 'warning' as const },
    medium: { label: 'Medium', variant: 'info' as const },
    low: { label: 'Low', variant: 'success' as const },
  };

  const { label, variant } = config[severity];
  return <Badge label={label} variant={variant} size="sm" />;
}

export function CategoryBadge({ category }: { category: FindingCategory }) {
  const config = {
    safety: { label: 'Safety', color: COLORS.safety },
    security: { label: 'Security', color: '#7C3AED' },
    compliance: { label: 'Compliance', color: COLORS.compliance },
    maintenance: { label: 'Maintenance', color: COLORS.maintenance },
  };

  const { label, color } = config[category];

  return (
    <View style={[styles.base, styles.size_sm, { backgroundColor: `${color}15` }]}>
      <Text style={[styles.text, styles.text_sm, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },

  // Sizes
  size_sm: {
    paddingVertical: 2,
    paddingHorizontal: SPACING.sm,
  },
  size_md: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },

  // Variants
  variant_default: {
    backgroundColor: COLORS.surfaceSecondary,
  },
  variant_success: {
    backgroundColor: `${COLORS.success}20`,
  },
  variant_warning: {
    backgroundColor: `${COLORS.warning}20`,
  },
  variant_error: {
    backgroundColor: `${COLORS.error}20`,
  },
  variant_info: {
    backgroundColor: `${COLORS.info}20`,
  },

  // Text
  text: {
    fontWeight: '600',
  },
  text_sm: {
    fontSize: TYPOGRAPHY.fontSize.xs,
  },
  text_md: {
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  text_default: {
    color: COLORS.textSecondary,
  },
  text_success: {
    color: COLORS.success,
  },
  text_warning: {
    color: COLORS.warning,
  },
  text_error: {
    color: COLORS.error,
  },
  text_info: {
    color: COLORS.info,
  },
});
