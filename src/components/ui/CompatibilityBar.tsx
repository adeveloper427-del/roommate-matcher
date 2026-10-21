import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../constants/theme';

interface CompatibilityBarProps {
  label: string;
  percentage: number;
}

export function CompatibilityBar({ label, percentage }: CompatibilityBarProps) {
  const clamped = Math.max(0, Math.min(100, percentage));
  const barColor = clamped >= 85 ? colors.success : clamped >= 60 ? colors.warning : colors.danger;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.percentage}>{clamped}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: barColor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  percentage: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  track: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.full,
  },
});
