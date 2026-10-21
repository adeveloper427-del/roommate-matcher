import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, gradients, radius, spacing, typography } from '../../constants/theme';
import { UserProfile } from '../../types';
import { Avatar, Button, Card } from '../ui';

interface MatchCardProps {
  user: UserProfile;
  compatibilityScore: number;
  strengths: string[];
  onViewProfile: () => void;
  onConnect: () => void;
  connected?: boolean;
}

export function MatchCard({ user, compatibilityScore, strengths, onViewProfile, onConnect, connected = false }: MatchCardProps) {
  return (
    <Card style={styles.card} padded={false}>
      <View style={styles.header}>
        <Avatar uri={user.profilePictureUrl} name={user.fullName} size={56} />
        <View style={styles.headerText}>
          <Text style={styles.name}>{user.fullName}</Text>
          <Text style={styles.subtitle}>{user.university}</Text>
          <Text style={styles.subtitle}>{user.course}</Text>
        </View>
        <LinearGradient colors={gradients.primary} style={styles.scoreBadge}>
          <Text style={styles.scoreValue}>{compatibilityScore}%</Text>
          <Text style={styles.scoreLabel}>Match</Text>
        </LinearGradient>
      </View>

      <View style={styles.strengths}>
        {strengths.slice(0, 3).map((s) => (
          <View key={s} style={styles.strengthRow}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.strengthText}>{s}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Button label="View Profile" variant="outline" size="sm" onPress={onViewProfile} style={styles.actionButton} />
        <Button
          label={connected ? 'Requested' : 'Connect'}
          size="sm"
          onPress={onConnect}
          disabled={connected}
          style={styles.actionButton}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
    overflow: 'hidden',
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  name: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  scoreBadge: {
    width: 60,
    height: 60,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    ...typography.captionBold,
    color: colors.textInverse,
    fontSize: 15,
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
  },
  strengths: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  strengthText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
