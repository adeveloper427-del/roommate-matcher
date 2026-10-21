import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/domain';
import { Badge, Button, Card, EmptyState, LoadingSpinner } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/constants/theme';
import { getBookingsForOrganization, updateBookingStatus } from '../../src/services/bookingService';
import { getMyOrganization } from '../../src/services/organizationService';
import { getPropertyById, getRoomById } from '../../src/services/roomService';
import { getUserById } from '../../src/services/userService';
import { Booking, Property, Room, UserProfile } from '../../src/types';

interface EnrichedBooking {
  booking: Booking;
  user?: UserProfile;
  room?: Room;
  property?: Property;
}

export default function BookingRequestsScreen() {
  const router = useRouter();
  const [items, setItems] = useState<EnrichedBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const org = await getMyOrganization();
    if (!org) {
      setItems([]);
      setLoading(false);
      return;
    }
    const bookings = await getBookingsForOrganization(org.id);
    const enriched = await Promise.all(
      bookings.map(async (booking) => {
        const [user, room, property] = await Promise.all([
          getUserById(booking.userId),
          getRoomById(booking.roomId),
          getPropertyById(booking.propertyId),
        ]);
        return { booking, user, room, property };
      })
    );
    setItems(enriched);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleUpdate = async (id: string, status: Booking['status']) => {
    await updateBookingStatus(id, status);
    load();
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading booking requests..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Booking Requests" />
      <FlatList
        data={items}
        keyExtractor={(item) => item.booking.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState icon="calendar-outline" title="No booking requests yet" message="Requests for your rooms will show up here." />
        }
        renderItem={({ item }) => {
          const { booking, user, room, property } = item;
          return (
            <Card style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.name}>{user?.fullName}</Text>
                <Badge
                  label={booking.status}
                  tone={booking.status === 'pending' ? 'warning' : booking.status === 'approved' ? 'success' : 'danger'}
                />
              </View>
              <Text style={styles.meta}>{room?.name}</Text>
              <Text style={styles.meta}>{property?.name}</Text>
              <Text style={styles.price}>
                {room?.currency} {room?.pricePerMonth.toLocaleString()}/month
              </Text>
              <Text
                style={styles.detailsLink}
                onPress={() => router.push({ pathname: '/(organization)/booking-details', params: { bookingId: booking.id } })}
              >
                View Details →
              </Text>
              {booking.status === 'pending' && (
                <View style={styles.actions}>
                  <Button
                    label="Reject"
                    variant="outline"
                    size="sm"
                    onPress={() => handleUpdate(booking.id, 'rejected')}
                    style={styles.actionButton}
                  />
                  <Button
                    label="Approve"
                    size="sm"
                    onPress={() => handleUpdate(booking.id, 'approved')}
                    style={styles.actionButton}
                  />
                </View>
              )}
            </Card>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.lg,
    gap: spacing.md,
    flexGrow: 1,
  },
  card: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  price: {
    ...typography.captionBold,
    color: colors.primary,
  },
  detailsLink: {
    ...typography.caption,
    color: colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
