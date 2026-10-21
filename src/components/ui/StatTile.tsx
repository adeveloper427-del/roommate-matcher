import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from '../../constants/theme';

interface StatTileProps {
  value: string | number;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
}

export function StatTile({ value, label, icon, style }: StatTileProps) {
  return (
    <View style={[styles.tile, style]}>
      {icon && (
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={16} color={colors.primaryDark} />
        </View>
      )}
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  value: {
    ...typography.h1,
    color: colors.primaryDark,
  },
  label: {
    ...typography.caption,
    color: colors.secondary,
    textAlign: 'center',
  },
});
