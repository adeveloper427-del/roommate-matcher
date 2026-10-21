import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/ui';
import { colors, gradients, radius, shadow, spacing, typography } from '../../src/constants/theme';

const SECRET_TAP_COUNT = 5;
const SECRET_TAP_WINDOW_MS = 2000;

export default function WelcomeScreen() {
  const router = useRouter();
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleHeroTap = () => {
    tapCount.current += 1;
    if (tapTimer.current) clearTimeout(tapTimer.current);

    if (tapCount.current >= SECRET_TAP_COUNT) {
      tapCount.current = 0;
      router.push('/(auth)/admin-login');
      return;
    }

    tapTimer.current = setTimeout(() => {
      tapCount.current = 0;
    }, SECRET_TAP_WINDOW_MS);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <Pressable onPress={handleHeroTap}>
          <LinearGradient colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.iconWrap, shadow.glow]}>
            <Text style={styles.monogram}>R</Text>
          </LinearGradient>
        </Pressable>
        <Text style={styles.title}>Find your perfect{'\n'}roommate & room</Text>
        <Text style={styles.subtitle}>
          Match with compatible roommates and discover verified accommodation — all in one place.
        </Text>
      </View>

      <View style={styles.features}>
        <FeatureRow icon="people-outline" text="Smart compatibility matching" />
        <FeatureRow icon="business-outline" text="Verified rooms from trusted organizations" />
        <FeatureRow icon="shield-checkmark-outline" text="Safe, transparent bookings" />
      </View>

      <View style={styles.actions}>
        <Button label="Get Started" onPress={() => router.push('/(auth)/select-account-type')} />
        <Button
          label="I already have an account"
          variant="ghost"
          onPress={() => router.push('/(auth)/login')}
        />
      </View>
    </SafeAreaView>
  );
}

function FeatureRow({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    justifyContent: 'space-between',
  },
  hero: {
    marginTop: spacing.xxl,
    alignItems: 'center',
  },
  iconWrap: {
    width: 84,
    height: 84,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  monogram: {
    fontSize: 42,
    fontWeight: '800',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, serif' }),
    color: colors.textInverse,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  features: {
    gap: spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  actions: {
    gap: spacing.md,
  },
});
