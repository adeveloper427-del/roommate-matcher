import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/domain';
import { Avatar, Badge, LoadingSpinner } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';
import { getMyOrganization } from '../../src/services/organizationService';
import { Organization } from '../../src/types';

export default function OrganizationProfileScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const [org, setOrg] = useState<Organization | null>(null);

  useFocusEffect(
    useCallback(() => {
      (async () => setOrg((await getMyOrganization()) ?? null))();
    }, [])
  );

  if (!org) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Organization Profile" />
      <View style={styles.content}>
        <Avatar uri={org.logoUrl} name={org.name} size={80} />
        <Text style={styles.name}>{org.name}</Text>
        {org.verified && <Badge label="Verified" tone="success" />}
        <Text style={styles.description}>{org.description}</Text>
        <Text style={styles.meta}>{org.location}</Text>
        <Text style={styles.meta}>{org.contactEmail}</Text>

        <Pressable
          style={styles.logout}
          onPress={async () => {
            await logout();
            router.replace('/(auth)/welcome');
          }}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>
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
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  meta: {
    ...typography.caption,
    color: colors.textMuted,
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  logoutText: {
    ...typography.bodyBold,
    color: colors.danger,
  },
});
