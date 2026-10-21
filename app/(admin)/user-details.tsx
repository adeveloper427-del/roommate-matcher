import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/domain';
import { Avatar, Badge, Button, Card, EmptyState, LoadingSpinner } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/constants/theme';
import { getUserById } from '../../src/services/userService';
import { UserProfile } from '../../src/types';

const lifestyleLabels: Record<string, string> = {
  sleepSchedule: 'Sleep Schedule',
  cleanliness: 'Cleanliness',
  noiseTolerance: 'Noise Tolerance',
  studyHabits: 'Study Habits',
  smoking: 'Smoking',
  pets: 'Pets',
  cooking: 'Cooking',
  socialLifestyle: 'Social Lifestyle',
  guests: 'Guests',
};

export default function AdminUserDetailsScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [suspended, setSuspended] = useState(false);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setUser((await getUserById(userId)) ?? null);
        setLoading(false);
      })();
    }, [userId])
  );

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading user..." />;
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="User" showBack />
        <EmptyState icon="person-outline" title="User not found" />
      </SafeAreaView>
    );
  }

  const lifestyleEntries = Object.entries(user.lifestyle).filter(([key]) => lifestyleLabels[key]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="User Details" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileHeader}>
          <Avatar uri={user.profilePictureUrl} name={user.fullName} size={80} />
          <Text style={styles.name}>{user.fullName}</Text>
          <Text style={styles.subtitle}>{user.university}</Text>
          <Text style={styles.subtitle}>{user.course}</Text>
          {suspended && <Badge label="Suspended" tone="danger" />}
        </View>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Info</Text>
          <InfoRow label="Age" value={user.age?.toString()} />
          <InfoRow label="Location" value={user.location} />
          <InfoRow label="Budget" value={user.budgetMin && user.budgetMax ? `KSh ${user.budgetMin} - ${user.budgetMax}` : undefined} />
          <InfoRow label="Preferred Location" value={user.preferredLocation} />
        </Card>

        {lifestyleEntries.length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Lifestyle</Text>
            {lifestyleEntries.map(([key, value]) => (
              <InfoRow key={key} label={lifestyleLabels[key]} value={String(value).replace(/_/g, ' ')} />
            ))}
          </Card>
        )}

        <Button
          label={suspended ? 'Reinstate User' : 'Suspend User'}
          variant={suspended ? 'outline' : 'danger'}
          onPress={() => setSuspended((s) => !s)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  profileHeader: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  name: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  section: {
    gap: spacing.xs,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  infoValue: {
    ...typography.captionBold,
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
});
