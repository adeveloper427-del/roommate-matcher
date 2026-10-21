import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, ProgressSteps } from '../../src/components/ui';
import {
  BasicInfoStep,
  emptyProfileForm,
  LifestyleEssentialsStep,
  LifestyleExtrasStep,
  PersonalityStep,
  profileFormToUpdates,
  ProfileFormState,
} from '../../src/components/profile/ProfileFormSteps';
import { colors, spacing, typography } from '../../src/constants/theme';
import { updateUserProfile } from '../../src/services/userService';
import { LifestylePreferences } from '../../src/types';

const TOTAL_STEPS = 4;
const stepLabels = ['Basic Info', 'Lifestyle', 'More Lifestyle', 'Personality (Optional)'];

export default function CompleteProfileScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<ProfileFormState>(emptyProfileForm);
  const [saving, setSaving] = useState(false);

  const updateField = <K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateLifestyle = <K extends keyof LifestylePreferences>(key: K, value: LifestylePreferences[K]) => {
    setForm((prev) => ({ ...prev, lifestyle: { ...prev.lifestyle, [key]: value } }));
  };

  const finish = async (skipRest: boolean) => {
    setSaving(true);
    await updateUserProfile(profileFormToUpdates(form, !skipRest));
    setSaving(false);
    router.replace('/(user)/home');
  };

  const goNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      finish(false);
    }
  };

  const goBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <View style={styles.progressWrap}>
          <ProgressSteps step={step} totalSteps={TOTAL_STEPS} label={stepLabels[step - 1]} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {step === 1 && (
            <>
              <Text style={styles.title}>Tell us about yourself</Text>
              <Text style={styles.subtitle}>This helps us match you with the right roommates and rooms.</Text>
              <BasicInfoStep form={form} updateField={updateField} />
            </>
          )}
          {step === 2 && (
            <>
              <Text style={styles.title}>Your daily rhythm</Text>
              <Text style={styles.subtitle}>These matter most for day-to-day compatibility.</Text>
              <LifestyleEssentialsStep lifestyle={form.lifestyle} updateLifestyle={updateLifestyle} />
            </>
          )}
          {step === 3 && (
            <>
              <Text style={styles.title}>Habits & preferences</Text>
              <Text style={styles.subtitle}>Helps us flag potential friction points early.</Text>
              <LifestyleExtrasStep lifestyle={form.lifestyle} updateLifestyle={updateLifestyle} />
            </>
          )}
          {step === 4 && (
            <>
              <Text style={styles.title}>Personality & hobbies</Text>
              <Text style={styles.subtitle}>Optional — skip anything you'd rather not share.</Text>
              <PersonalityStep lifestyle={form.lifestyle} updateLifestyle={updateLifestyle} />
            </>
          )}
        </ScrollView>

        <View style={styles.footer}>
          {step === 1 ? (
            <Text style={styles.skipLink} onPress={() => finish(true)}>
              Skip for now
            </Text>
          ) : (
            <Button label="Back" variant="outline" size="md" onPress={goBack} fullWidth={false} style={styles.backButton} />
          )}
          <Button
            label={step === TOTAL_STEPS ? 'Finish' : 'Continue'}
            onPress={goNext}
            loading={saving}
            style={styles.nextButton}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  progressWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  backButton: {
    minWidth: 90,
  },
  nextButton: {
    flex: 1,
  },
  skipLink: {
    ...typography.captionBold,
    color: colors.textSecondary,
    minWidth: 90,
  },
});
