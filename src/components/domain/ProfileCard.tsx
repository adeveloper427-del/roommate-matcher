import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../constants/theme';
import { UserProfile } from '../../types';
import { Avatar, Card } from '../ui';

interface ProfileCardProps {
  user: UserProfile;
  onPress?: () => void;
}

export function ProfileCard({ user }: ProfileCardProps) {
  return (
    <Card style={styles.card}>
      <Avatar uri={user.profilePictureUrl} name={user.fullName} size={64} />
      <View style={styles.info}>
        <Text style={styles.name}>{user.fullName}</Text>
        <Text style={styles.detail}>
          {user.age ? `${user.age} · ` : ''}
          {user.university}
        </Text>
        <Text style={styles.detail}>{user.course}</Text>
        {user.location && <Text style={styles.detail}>{user.location}</Text>}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  detail: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
