import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/domain';
import { Button, Input } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';
import { logout } from '../../src/services/authService';
import { savePendingOrgSetup } from '../../src/services/pendingOrgSetup';
import { UserRole } from '../../src/types';
import { isValidEmail, isStrongPassword, passwordStrengthMessage } from '../../src/utils/validation';

export default function RegisterScreen() {
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role?: UserRole }>();
  const { register, isLoading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const resolvedRole: UserRole = role === 'organization' ? 'organization' : 'user';

  const nameError = touched && fullName.trim().length === 0 ? 'Full name is required' : undefined;
  const emailError = touched && !isValidEmail(email) ? 'Enter a valid email address' : undefined;
  const passwordError = touched ? passwordStrengthMessage(password) : undefined;
  const confirmError = touched && confirmPassword !== password ? 'Passwords do not match' : undefined;
  const canSubmit =
    fullName.trim().length > 0 && isValidEmail(email) && isStrongPassword(password) && confirmPassword === password;

  const handleRegister = async () => {
    setTouched(true);
    setSubmitError(null);
    if (!canSubmit) return;

    try {
      await register(email, password, resolvedRole, fullName.trim());

      if (resolvedRole === 'organization') {
        await savePendingOrgSetup({ name: fullName.trim(), contactEmail: email });
      }

      // Registration establishes a session automatically, but we want people
      // to actually sign in with their new credentials rather than being
      // silently carried into the app — so drop the session and send them
      // to Login instead.
      await logout();
      router.replace({ pathname: '/(auth)/login', params: { justRegistered: '1' } });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Create Account" showBack />
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          {resolvedRole === 'organization'
            ? 'Set up your organization account to start listing rooms.'
            : 'Create your account to start finding roommates and rooms.'}
        </Text>

        <Input label="Full name" placeholder="Jane Doe" value={fullName} onChangeText={setFullName} error={nameError} />
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
          placeholder="At least 8 characters, 1 letter, 1 number"
          value={password}
          onChangeText={setPassword}
          isPassword
          error={passwordError}
        />
        <Input
          label="Confirm Password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          isPassword
          error={confirmError}
        />

        {submitError && <Text style={styles.errorText}>{submitError}</Text>}

        <Button
          label="Create Account"
          onPress={handleRegister}
          loading={isLoading}
          disabled={touched && !canSubmit}
          style={styles.registerButton}
        />

        <Text style={styles.footer}>
          Already have an account?{' '}
          <Text style={styles.link} onPress={() => router.push('/(auth)/login')}>
            Log in
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
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.md,
  },
  registerButton: {
    marginTop: spacing.sm,
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
