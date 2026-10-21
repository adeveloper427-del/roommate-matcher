import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/domain';
import { colors, spacing, typography } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';

export default function AdminSettingsScreen() {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Settings" />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
  },
  logoutText: {
    ...typography.bodyBold,
    color: colors.danger,
  },
});
