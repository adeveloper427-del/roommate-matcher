import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/domain';
import { Button, Input } from '../../src/components/ui';
import { colors, radius, spacing, typography } from '../../src/constants/theme';
import { useAuth } from '../../src/context/AuthContext';
import { isValidEmail } from '../../src/utils/validation';

export default function AdminLoginScreen() {
  const router = useRouter();
  const { login, logout, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const emailError = touched && !isValidEmail(email) ? 'Enter a valid email address' : undefined;
  const canSubmit = isValidEmail(email) && password.length > 0;

  const handleLogin = async () => {
    setTouched(true);
    setSubmitError(null);
    if (!canSubmit) return;

    try {
      const session = await login(email, password);
      if (session.role !== 'admin') {
        await logout();
        setSubmitError('This account does not have admin access.');
        return;
      }
      router.replace('/(admin)/dashboard');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not sign in.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Admin Access" showBack />
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="shield-checkmark-outline" size={28} color={colors.primary} />
        </View>
        <Text style={styles.subtitle}>Restricted area — administrator credentials only.</Text>

        <Input
          label="Email"
          placeholder="admin@example.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          error={emailError}
        />
        <Input label="Password" placeholder="••••••••" value={password} onChangeText={setPassword} isPassword />

        {submitError && <Text style={styles.errorText}>{submitError}</Text>}

        <Button label="Sign In as Admin" onPress={handleLogin} loading={isLoading} disabled={touched && !canSubmit} />
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
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
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
});
