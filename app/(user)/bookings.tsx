import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookingCard, Header } from '../../src/components/domain';
import { EmptyState, LoadingSpinner } from '../../src/components/ui';
import { colors, spacing } from '../../src/constants/theme';
import { getBookingsForUser } from '../../src/services/bookingService';
import { getPropertyById, getRoomById } from '../../src/services/roomService';
import { getCurrentUser } from '../../src/services/userService';
import { Booking, Property, Room } from '../../src/types';

interface EnrichedBooking {
  booking: Booking;
  property?: Property;
  room?: Room;
}

export default function MyBookingsScreen() {
  const [items, setItems] = useState<EnrichedBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const currentUser = await getCurrentUser();
        const bookings = await getBookingsForUser(currentUser.id);
        const enriched = await Promise.all(
          bookings.map(async (booking) => {
            const [property, room] = await Promise.all([
              getPropertyById(booking.propertyId),
              getRoomById(booking.roomId),
            ]);
            return { booking, property, room };
          })
        );
        setItems(enriched);
        setLoading(false);
      })();
    }, [])
  );

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading your bookings..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="My Bookings" />
      <FlatList
        data={items}
        keyExtractor={(item) => item.booking.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState icon="calendar-outline" title="No bookings yet" message="Rooms you book will show up here." />
        }
        renderItem={({ item }) => <BookingCard booking={item.booking} property={item.property} room={item.room} />}
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
  },
});
