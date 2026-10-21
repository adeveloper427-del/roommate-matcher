import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../constants/theme';

interface OptionItem<T extends string> {
  value: T;
  label: string;
  description?: string;
}

interface SingleChoiceGroupProps<T extends string> {
  options: OptionItem<T>[];
  value?: T;
  onChange: (value: T) => void;
}

export function SingleChoiceGroup<T extends string>({ options, value, onChange }: SingleChoiceGroupProps<T>) {
  return (
    <View style={styles.group}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            style={[styles.optionCard, selected && styles.optionCardSelected]}
            onPress={() => onChange(option.value)}
          >
            <View style={styles.optionText}>
              <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{option.label}</Text>
              {option.description && <Text style={styles.optionDescription}>{option.description}</Text>}
            </View>
            {selected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
          </Pressable>
        );
      })}
    </View>
  );
}

interface MultiChoiceChipsProps {
  options: string[];
  values: string[];
  onChange: (values: string[]) => void;
}

export function MultiChoiceChips({ options, values, onChange }: MultiChoiceChipsProps) {
  const toggle = (option: string) => {
    onChange(values.includes(option) ? values.filter((v) => v !== option) : [...values, option]);
  };

  return (
    <View style={styles.chipRow}>
      {options.map((option) => {
        const selected = values.includes(option);
        return (
          <Pressable key={option} style={[styles.chip, selected && styles.chipSelected]} onPress={() => toggle(option)}>
            <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: spacing.sm,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  optionLabelSelected: {
    color: colors.primaryDark,
  },
  optionDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  chipLabelSelected: {
    color: colors.textInverse,
  },
});
