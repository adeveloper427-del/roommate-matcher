import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/ui';
import { colors, radius, spacing, typography } from '../../src/constants/theme';

export default function BookingConfirmationScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark-circle" size={48} color={colors.success} />
        </View>
        <Text style={styles.title}>Booking Request Sent</Text>
        <Text style={styles.subtitle}>
          Your request has been submitted and is pending approval from the organization. You'll be notified once
          it's reviewed.
        </Text>
      </View>
      <View style={styles.actions}>
        <Button label="View My Bookings" onPress={() => router.replace('/(user)/bookings')} />
        <Button label="Back to Home" variant="ghost" onPress={() => router.replace('/(user)/home')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    backgroundColor: colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actions: {
    gap: spacing.md,
  },
});
