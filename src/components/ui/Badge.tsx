import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../constants/theme';

type Tone = 'success' | 'warning' | 'danger' | 'neutral' | 'primary';

interface BadgeProps {
  label: string;
  tone?: Tone;
}

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  const toneStyle = toneStyles[tone];
  return (
    <View style={[styles.badge, { backgroundColor: toneStyle.bg }]}>
      <Text style={[styles.label, { color: toneStyle.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  label: {
    ...typography.captionBold,
  },
});

const toneStyles: Record<Tone, { bg: string; text: string }> = {
  success: { bg: colors.successLight, text: colors.success },
  warning: { bg: colors.warningLight, text: colors.warning },
  danger: { bg: colors.dangerLight, text: colors.danger },
  primary: { bg: colors.primaryLight, text: colors.primary },
  neutral: { bg: colors.border, text: colors.textSecondary },
};
