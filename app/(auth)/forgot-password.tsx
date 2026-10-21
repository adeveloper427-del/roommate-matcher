import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/domain';
import { Button, Input } from '../../src/components/ui';
import { colors, radius, spacing, typography } from '../../src/constants/theme';
import { requestPasswordReset } from '../../src/services/authService';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await requestPasswordReset(email);
    setLoading(false);
    setSent(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Forgot Password" showBack />
      <View style={styles.content}>
        {sent ? (
          <View style={styles.confirmation}>
            <View style={styles.iconWrap}>
              <Ionicons name="mail-outline" size={28} color={colors.success} />
            </View>
            <Text style={styles.confirmTitle}>Check your email</Text>
            <Text style={styles.subtitle}>
              If an account exists for {email}, we've sent a link to reset your password.
            </Text>
            <Button label="Back to Login" onPress={() => router.replace('/(auth)/login')} />
          </View>
        ) : (
          <>
            <Text style={styles.subtitle}>
              Enter the email associated with your account and we'll send you a reset link.
            </Text>
            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Button label="Send Reset Link" onPress={handleSubmit} loading={loading} disabled={!email} />
          </>
        )}
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
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  confirmation: {
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  confirmTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
});
