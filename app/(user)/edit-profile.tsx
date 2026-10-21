import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/domain';
import {
  BasicInfoStep,
  emptyProfileForm,
  LifestyleEssentialsStep,
  LifestyleExtrasStep,
  PersonalityStep,
  profileFormFromUser,
  profileFormToUpdates,
  ProfileFormState,
} from '../../src/components/profile/ProfileFormSteps';
import { Button, LoadingSpinner } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/constants/theme';
import { getCurrentUser, updateUserProfile } from '../../src/services/userService';
import { LifestylePreferences } from '../../src/types';

export default function EditProfileScreen() {
  const router = useRouter();
  const [form, setForm] = useState<ProfileFormState>(emptyProfileForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const user = await getCurrentUser();
      setForm(profileFormFromUser(user));
      setLoading(false);
    })();
  }, []);

  const updateField = <K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateLifestyle = <K extends keyof LifestylePreferences>(key: K, value: LifestylePreferences[K]) => {
    setForm((prev) => ({ ...prev, lifestyle: { ...prev.lifestyle, [key]: value } }));
  };

  const handleSave = async () => {
    setSaving(true);
    await updateUserProfile(profileFormToUpdates(form, true));
    setSaving(false);
    router.back();
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading your profile..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Edit Profile" showBack />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content}>
          <SectionTitle title="Basic Info" />
          <BasicInfoStep form={form} updateField={updateField} showName />

          <SectionTitle title="Daily Rhythm" />
          <LifestyleEssentialsStep lifestyle={form.lifestyle} updateLifestyle={updateLifestyle} />

          <SectionTitle title="Habits & Preferences" />
          <LifestyleExtrasStep lifestyle={form.lifestyle} updateLifestyle={updateLifestyle} />

          <SectionTitle title="Personality & Hobbies" />
          <PersonalityStep lifestyle={form.lifestyle} updateLifestyle={updateLifestyle} />
        </ScrollView>

        <View style={styles.footer}>
          <Button label="Save Changes" onPress={handleSave} loading={saving} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
