import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing, typography } from '../../constants/theme';

interface FilterButtonProps {
  label: string;
  active?: boolean;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function FilterButton({ label, active = false, onPress, icon }: FilterButtonProps) {
  return (
    <Pressable style={[styles.button, active && styles.buttonActive]} onPress={onPress}>
      {icon && <Ionicons name={icon} size={14} color={active ? colors.textInverse : colors.textSecondary} />}
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  buttonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.textInverse,
  },
});
