import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../constants/theme';

interface ProgressStepsProps {
  step: number;
  totalSteps: number;
  label?: string;
}

export function ProgressSteps({ step, totalSteps, label }: ProgressStepsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.stepText}>
          Step {step} of {totalSteps}
        </Text>
        {label && <Text style={styles.label}>{label}</Text>}
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${(step / totalSteps) * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  label: {
    ...typography.captionBold,
    color: colors.primary,
  },
  track: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
});
