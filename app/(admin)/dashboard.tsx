import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/domain';
import { LoadingSpinner, StatTile } from '../../src/components/ui';
import { colors, spacing } from '../../src/constants/theme';
import { getAllBookings } from '../../src/services/bookingService';
import { getOrganizations } from '../../src/services/organizationService';
import { getProperties } from '../../src/services/roomService';
import { getAllUsers } from '../../src/services/userService';

export default function AdminDashboardScreen() {
  const [userCount, setUserCount] = useState(0);
  const [orgCount, setOrgCount] = useState(0);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [propertyCount, setPropertyCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);
  const [pendingBookingCount, setPendingBookingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [users, organizations, properties, bookings] = await Promise.all([
          getAllUsers(),
          getOrganizations(),
          getProperties(),
          getAllBookings(),
        ]);
        setUserCount(users.length);
        setOrgCount(organizations.length);
        setVerifiedCount(organizations.filter((o) => o.verified).length);
        setPropertyCount(properties.length);
        setBookingCount(bookings.length);
        setPendingBookingCount(bookings.filter((b) => b.status === 'pending').length);
        setLoading(false);
      })();
    }, [])
  );

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading dashboard..." />;
  }

  const stats = [
    { label: 'Total Users', value: userCount, icon: 'people-outline' as const },
    { label: 'Organizations', value: orgCount, icon: 'business-outline' as const },
    { label: 'Properties', value: propertyCount, icon: 'home-outline' as const },
    { label: 'Total Bookings', value: bookingCount, icon: 'calendar-outline' as const },
    { label: 'Pending Bookings', value: pendingBookingCount, icon: 'time-outline' as const },
    { label: 'Verified Orgs', value: verifiedCount, icon: 'shield-checkmark-outline' as const },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Admin Dashboard" />
      <ScrollView contentContainerStyle={styles.grid}>
        {stats.map((stat) => (
          <StatTile key={stat.label} value={stat.value} label={stat.label} icon={stat.icon} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  grid: {
    padding: spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
});
