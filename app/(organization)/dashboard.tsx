import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/domain';
import { LoadingSpinner, StatTile } from '../../src/components/ui';
import { colors, spacing } from '../../src/constants/theme';
import { getDashboardStats, getMyOrganization, OrgDashboardStats } from '../../src/services/organizationService';

const STAT_LABELS: {
  key: keyof OrgDashboardStats;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: '/(organization)/properties' | '/(organization)/rooms' | '/(organization)/bookings';
}[] = [
  { key: 'totalProperties', label: 'Total Properties', icon: 'business-outline', route: '/(organization)/properties' },
  { key: 'totalRooms', label: 'Total Rooms', icon: 'bed-outline', route: '/(organization)/rooms' },
  { key: 'availableRooms', label: 'Available Rooms', icon: 'checkmark-circle-outline', route: '/(organization)/rooms' },
  { key: 'occupiedRooms', label: 'Occupied Rooms', icon: 'people-outline', route: '/(organization)/rooms' },
  { key: 'pendingBookings', label: 'Pending Bookings', icon: 'time-outline', route: '/(organization)/bookings' },
  { key: 'approvedBookings', label: 'Approved Bookings', icon: 'calendar-outline', route: '/(organization)/bookings' },
];

export default function OrganizationDashboardScreen() {
  const router = useRouter();
  const [stats, setStats] = useState<OrgDashboardStats | null>(null);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const org = await getMyOrganization();
        setStats(
          org
            ? await getDashboardStats(org.id)
            : {
                totalProperties: 0,
                totalRooms: 0,
                availableRooms: 0,
                occupiedRooms: 0,
                pendingBookings: 0,
                approvedBookings: 0,
              }
        );
      })();
    }, [])
  );

  if (!stats) {
    return <LoadingSpinner fullScreen message="Loading dashboard..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Dashboard" />
      <ScrollView contentContainerStyle={styles.grid}>
        {STAT_LABELS.map(({ key, label, icon, route }) => (
          <Pressable key={key} style={styles.tilePress} onPress={() => router.push(route)}>
            <StatTile value={stats[key]} label={label} icon={icon} />
          </Pressable>
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
  tilePress: {
    minWidth: '45%',
    flexGrow: 1,
  },
});
