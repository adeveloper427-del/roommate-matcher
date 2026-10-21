import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../constants/theme';

interface RatingProps {
  value: number;
  reviewCount?: number;
  size?: number;
}

export function Rating({ value, reviewCount, size = 14 }: RatingProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="star" size={size} color={colors.warning} />
      <Text style={styles.value}>{value.toFixed(1)}</Text>
      {reviewCount !== undefined && <Text style={styles.count}>({reviewCount})</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  value: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  count: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
