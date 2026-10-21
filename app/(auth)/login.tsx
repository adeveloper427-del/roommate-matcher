import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/domain';
import { Button, Input } from '../../src/components/ui';
import { colors, radius, spacing, typography } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';
import { logout } from '../../src/services/authService';
import { createOrganization, getMyOrganization } from '../../src/services/organizationService';
import { consumePendingOrgSetup } from '../../src/services/pendingOrgSetup';
import { isValidEmail } from '../../src/utils/validation';

export default function LoginScreen() {
  const router = useRouter();
  const { justRegistered } = useLocalSearchParams<{ justRegistered?: string }>();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const emailError = touched && !isValidEmail(email) ? 'Enter a valid email address' : undefined;
  const passwordError = touched && password.length === 0 ? 'Password is required' : undefined;
  const canSubmit = isValidEmail(email) && password.length > 0;

  const handleLogin = async () => {
    setTouched(true);
    setSubmitError(null);
    if (!canSubmit) return;

    try {
      const session = await login(email, password);

      if (session.role === 'admin') {
        await logout();
        setSubmitError('Admin accounts cannot sign in here. Use the Admin Access screen instead.');
        return;
      }

      if (session.role === 'organization') {
        const existingOrg = await getMyOrganization();
        if (!existingOrg) {
          const pending = await consumePendingOrgSetup();
          await createOrganization({
            name: pending?.name ?? 'My Organization',
            type: 'private',
            contactEmail: pending?.contactEmail ?? email,
            location: 'Not set',
          });
        }
        router.replace('/(organization)/dashboard');
      } else {
        router.replace('/(user)/home');
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not sign in. Please check your details.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Log In" showBack />
      <View style={styles.content}>
        {justRegistered === '1' && (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>Account created! Log in with your new email and password.</Text>
          </View>
        )}
        <Text style={styles.subtitle}>Welcome back — sign in to continue your search.</Text>

        <Input
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          error={emailError}
        />
        <Input
          label="Password"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          isPassword
          error={passwordError}
        />

        <Text style={styles.forgot} onPress={() => router.push('/(auth)/forgot-password')}>
          Forgot password?
        </Text>

        {submitError && <Text style={styles.errorText}>{submitError}</Text>}

        <Button
          label="Log In"
          onPress={handleLogin}
          loading={isLoading}
          disabled={touched && !canSubmit}
          style={styles.loginButton}
        />

        <Text style={styles.footer}>
          Don't have an account?{' '}
          <Text style={styles.link} onPress={() => router.push('/(auth)/select-account-type')}>
            Sign up
          </Text>
        </Text>
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
  successBanner: {
    backgroundColor: colors.successLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  successText: {
    ...typography.captionBold,
    color: colors.success,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  forgot: {
    ...typography.captionBold,
    color: colors.primary,
    textAlign: 'right',
    marginBottom: spacing.xl,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.md,
  },
  loginButton: {
    marginBottom: spacing.lg,
  },
  footer: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  link: {
    color: colors.primary,
    fontWeight: '700',
  },
});
