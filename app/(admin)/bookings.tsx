import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/domain';
import { Badge, Card, LoadingSpinner } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/constants/theme';
import { getAllBookings } from '../../src/services/bookingService';
import { getProperties } from '../../src/services/roomService';
import { getAllUsers } from '../../src/services/userService';
import { Booking, Property, UserProfile } from '../../src/types';

const statusTone: Record<Booking['status'], 'success' | 'warning' | 'danger' | 'neutral'> = {
  approved: 'success',
  pending: 'warning',
  rejected: 'danger',
  cancelled: 'neutral',
};

export default function AdminBookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [usersById, setUsersById] = useState<Record<string, UserProfile>>({});
  const [propertiesById, setPropertiesById] = useState<Record<string, Property>>({});
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [allBookings, users, properties] = await Promise.all([
          getAllBookings(),
          getAllUsers(),
          getProperties(),
        ]);
        setBookings(allBookings);
        setUsersById(Object.fromEntries(users.map((u) => [u.id, u])));
        setPropertiesById(Object.fromEntries(properties.map((p) => [p.id, p])));
        setLoading(false);
      })();
    }, [])
  );

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading bookings..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Bookings" />
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const user = usersById[item.userId];
          const property = propertiesById[item.propertyId];
          return (
            <Card style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.name}>{user?.fullName}</Text>
                <Badge label={item.status} tone={statusTone[item.status]} />
              </View>
              <Text style={styles.meta}>{property?.name}</Text>
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
  },
  card: {
    gap: spacing.xs,
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
});
