import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/domain';
import { Avatar, Button, Card, CompatibilityBar, LoadingSpinner } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/constants/theme';
import { getCompatibilityDetail } from '../../src/services/compatibilityService';
import { createConnectionRequest, getConnectionsForUser } from '../../src/services/connectionService';
import { getCurrentUser, getUserById } from '../../src/services/userService';
import { CompatibilityResult, UserProfile } from '../../src/types';

export default function MatchDetailsScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [matchedUser, setMatchedUser] = useState<UserProfile | null>(null);
  const [compatibility, setCompatibility] = useState<CompatibilityResult | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const user = await getCurrentUser();
      const [matched, detail, connections] = await Promise.all([
        getUserById(userId),
        getCompatibilityDetail(user.id, userId),
        getConnectionsForUser(user.id),
      ]);
      setCurrentUser(user);
      setMatchedUser(matched ?? null);
      setCompatibility(detail ?? null);
      setConnected(connections.some((c) => c.fromUserId === userId || c.toUserId === userId));
      setLoading(false);
    })();
  }, [userId]);

  const handleConnect = async () => {
    if (!currentUser) return;
    setConnecting(true);
    await createConnectionRequest(currentUser.id, userId);
    setConnected(true);
    setConnecting(false);
  };

  if (loading || !matchedUser || !compatibility) {
    return <LoadingSpinner fullScreen message="Loading match details..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Match Details" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profile}>
          <Avatar uri={matchedUser.profilePictureUrl} name={matchedUser.fullName} size={88} />
          <Text style={styles.name}>{matchedUser.fullName}</Text>
          <Text style={styles.subtitle}>
            {matchedUser.age ? `${matchedUser.age} · ` : ''}
            {matchedUser.university}
          </Text>
          <Text style={styles.subtitle}>{matchedUser.course}</Text>
          <Text style={styles.score}>{compatibility.compatibilityScore}% Compatible</Text>
        </View>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Compatibility Breakdown</Text>
          <CompatibilityBar label="Sleep Schedule" percentage={compatibility.breakdown.sleepSchedule} />
          <CompatibilityBar label="Cleanliness" percentage={compatibility.breakdown.cleanliness} />
          <CompatibilityBar label="Study Habits" percentage={compatibility.breakdown.studyHabits} />
          <CompatibilityBar label="Social Lifestyle" percentage={compatibility.breakdown.socialLifestyle} />
          <CompatibilityBar label="Noise Preference" percentage={compatibility.breakdown.noisePreference} />
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Why You Match</Text>
          {compatibility.strengths.map((s) => (
            <View key={s} style={styles.reasonRow}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.reasonText}>{s}</Text>
            </View>
          ))}
          {compatibility.potentialConflicts.map((c) => (
            <View key={c} style={styles.reasonRow}>
              <Ionicons name="warning-outline" size={16} color={colors.warning} />
              <Text style={styles.reasonText}>{c}</Text>
            </View>
          ))}
          <Text style={styles.recommendation}>{compatibility.recommendation}</Text>
        </Card>

        <Button label={connected ? 'Requested' : 'Connect'} onPress={handleConnect} loading={connecting} disabled={connected} />
      </ScrollView>
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
    gap: spacing.lg,
  },
  profile: {
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
  score: {
    ...typography.h3,
    color: colors.success,
    marginTop: spacing.sm,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  reasonText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  recommendation: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
});
