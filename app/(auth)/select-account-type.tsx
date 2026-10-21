import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/domain';
import { Button } from '../../src/components/ui';
import { colors, radius, spacing, typography } from '../../src/constants/theme';
import { UserRole } from '../../src/types';

const options: { role: UserRole; title: string; description: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  {
    role: 'user',
    title: 'I need a room or roommate',
    description: 'Find compatible roommates and browse verified accommodation.',
    icon: 'person-outline',
  },
  {
    role: 'organization',
    title: "I'm an organization",
    description: 'List rooms, manage properties, and handle booking requests.',
    icon: 'business-outline',
  },
];

export default function SelectAccountTypeScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<UserRole | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Choose account type" showBack />
      <View style={styles.content}>
        {options.map((option) => (
          <Pressable
            key={option.role}
            style={[styles.option, selected === option.role && styles.optionSelected]}
            onPress={() => setSelected(option.role)}
          >
            <View style={styles.optionIcon}>
              <Ionicons name={option.icon} size={24} color={colors.primary} />
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </View>
            {selected === option.role && <Ionicons name="checkmark-circle" size={22} color={colors.primary} />}
          </Pressable>
        ))}

        <Button
          label="Continue"
          onPress={() => router.push({ pathname: '/(auth)/register', params: { role: selected ?? 'user' } })}
          disabled={!selected}
          style={styles.continueButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  optionDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  continueButton: {
    marginTop: spacing.lg,
  },
});
