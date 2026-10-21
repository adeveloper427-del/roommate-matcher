import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/domain';
import { Avatar, Card, LoadingSpinner } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';
import { getCurrentUser } from '../../src/services/userService';
import { UserProfile } from '../../src/types';

type ProfileRoute = '/(user)/edit-profile' | '/(user)/connections' | '/(user)/notifications' | '/(user)/settings';

const menuItems: { icon: keyof typeof Ionicons.glyphMap; label: string; route?: ProfileRoute }[] = [
  { icon: 'create-outline', label: 'Edit Profile', route: '/(user)/edit-profile' },
  { icon: 'options-outline', label: 'Lifestyle Preferences', route: '/(user)/edit-profile' },
  { icon: 'people-outline', label: 'Connections', route: '/(user)/connections' },
  { icon: 'notifications-outline', label: 'Notifications', route: '/(user)/notifications' },
  { icon: 'settings-outline', label: 'Settings', route: '/(user)/settings' },
  { icon: 'help-circle-outline', label: 'Help & Support' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);

  useFocusEffect(
    useCallback(() => {
      (async () => setUser(await getCurrentUser()))();
    }, [])
  );

  if (!user) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Profile" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileHeader}>
          <Avatar uri={user.profilePictureUrl} name={user.fullName} size={80} />
          <Text style={styles.name}>{user.fullName}</Text>
          <Text style={styles.subtitle}>{user.university}</Text>
        </View>

        <Card style={styles.menu} padded={false}>
          {menuItems.map((item, index) => (
            <Pressable
              key={item.label}
              style={[styles.menuRow, index !== menuItems.length - 1 && styles.menuRowBorder]}
              onPress={item.route ? () => router.push(item.route!) : undefined}
            >
              <Ionicons name={item.icon} size={20} color={colors.textSecondary} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          ))}
        </Card>

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
  menu: {
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuLabel: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  logoutText: {
    ...typography.bodyBold,
    color: colors.danger,
  },
});
