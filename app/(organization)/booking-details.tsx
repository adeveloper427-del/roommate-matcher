import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/domain';
import { Badge, Button, Card, LoadingSpinner } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/constants/theme';
import { getBookingById, updateBookingStatus } from '../../src/services/bookingService';
import { getPropertyById, getRoomById } from '../../src/services/roomService';
import { getUserById } from '../../src/services/userService';
import { Booking, Property, Room, UserProfile } from '../../src/types';
import { ProfileCard } from '../../src/components/domain';

const statusTone: Record<Booking['status'], 'success' | 'warning' | 'danger' | 'neutral'> = {
  approved: 'success',
  pending: 'warning',
  rejected: 'danger',
  cancelled: 'neutral',
};

export default function OrganizationBookingDetailsScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [applicant, setApplicant] = useState<UserProfile | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async () => {
    const found = (await getBookingById(bookingId)) ?? null;
    setBooking(found);
    if (found) {
      const [applicantProfile, roomRow, propertyRow] = await Promise.all([
        getUserById(found.userId),
        getRoomById(found.roomId),
        getPropertyById(found.propertyId),
      ]);
      setApplicant(applicantProfile ?? null);
      setRoom(roomRow ?? null);
      setProperty(propertyRow ?? null);
    }
    setLoading(false);
  }, [bookingId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleUpdate = async (status: Booking['status']) => {
    setUpdating(true);
    await updateBookingStatus(bookingId, status);
    await load();
    setUpdating(false);
  };

  if (loading || !booking) {
    return <LoadingSpinner fullScreen message="Loading booking..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Booking Details" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        {applicant && <ProfileCard user={applicant} />}

        <Card style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.sectionTitle}>Request Status</Text>
            <Badge label={booking.status} tone={statusTone[booking.status]} />
          </View>
          <Text style={styles.meta}>{property?.name}</Text>
          <Text style={styles.meta}>{room?.name}</Text>
          <Text style={styles.price}>
            {room?.currency} {room?.pricePerMonth.toLocaleString()}/month
          </Text>
          <Text style={styles.meta}>Move-in: {booking.moveInDate}</Text>
          {booking.notes && <Text style={styles.notes}>"{booking.notes}"</Text>}
        </Card>

        {booking.status === 'pending' && (
          <View style={styles.actions}>
            <Button
              label="Reject"
              variant="outline"
              onPress={() => handleUpdate('rejected')}
              loading={updating}
              style={styles.actionButton}
            />
            <Button label="Approve" onPress={() => handleUpdate('approved')} loading={updating} style={styles.actionButton} />
          </View>
        )}
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
  section: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  meta: {
    ...typography.body,
    color: colors.textSecondary,
  },
  price: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  notes: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
