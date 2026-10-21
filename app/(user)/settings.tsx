import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/domain';
import { Card } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';

export default function UserSettingsScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [matchAlerts, setMatchAlerts] = useState(true);
  const [showProfilePublicly, setShowProfilePublicly] = useState(true);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Settings" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <Card style={styles.card} padded={false}>
          <ToggleRow label="Push Notifications" value={pushEnabled} onChange={setPushEnabled} />
          <ToggleRow label="Email Notifications" value={emailEnabled} onChange={setEmailEnabled} border />
          <ToggleRow label="New Match Alerts" value={matchAlerts} onChange={setMatchAlerts} />
        </Card>

        <Text style={styles.sectionTitle}>Privacy</Text>
        <Card style={styles.card} padded={false}>
          <ToggleRow label="Show my profile to other users" value={showProfilePublicly} onChange={setShowProfilePublicly} />
        </Card>

        <Text style={styles.sectionTitle}>Account</Text>
        <Card style={styles.card} padded={false}>
          <Pressable style={styles.linkRow}>
            <Ionicons name="help-circle-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.linkLabel}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
          <Pressable style={[styles.linkRow, styles.linkRowBorder]}>
            <Ionicons name="document-text-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.linkLabel}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
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

function ToggleRow({
  label,
  value,
  onChange,
  border,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  border?: boolean;
}) {
  return (
    <View style={[styles.toggleRow, border && styles.linkRowBorder]}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.surface}
      />
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
    gap: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.captionBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  card: {
    overflow: 'hidden',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  toggleLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  linkRowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  linkLabel: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    marginTop: spacing.lg,
  },
  logoutText: {
    ...typography.bodyBold,
    color: colors.danger,
  },
});
