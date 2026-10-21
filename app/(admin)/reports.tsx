import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/domain';
import { Card, CompatibilityBar, LoadingSpinner, Rating, StatTile } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/constants/theme';
import { getAllBookings } from '../../src/services/bookingService';
import { getOrganizations } from '../../src/services/organizationService';
import { getProperties } from '../../src/services/roomService';
import { getAllUsers } from '../../src/services/userService';
import { Booking, Organization, Property } from '../../src/types';
import { exportPlatformReport } from '../../src/utils/reportDocument';

const bookingStatuses: Booking['status'][] = ['pending', 'approved', 'rejected', 'cancelled'];

export default function AdminReportsScreen() {
  const [userCount, setUserCount] = useState(0);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [verifiedRate, setVerifiedRate] = useState(0);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [topProperties, setTopProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [users, orgs, allBookings, allProperties] = await Promise.all([
          getAllUsers(),
          getOrganizations(),
          getAllBookings(),
          getProperties(),
        ]);
        setUserCount(users.length);
        setOrganizations(orgs);
        setVerifiedRate(orgs.length > 0 ? Math.round((orgs.filter((o) => o.verified).length / orgs.length) * 100) : 0);
        setBookings(allBookings);
        setProperties(allProperties);
        setTopProperties([...allProperties].sort((a, b) => b.rating - a.rating).slice(0, 3));
        setLoading(false);
      })();
    }, [])
  );

  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      await exportPlatformReport({ userCount, organizations, verifiedRate, properties, bookings, topProperties });
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading reports..." />;
  }

  const totalBookings = bookings.length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Reports" rightIcon="print-outline" onRightPress={handleExport} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statsRow}>
          <StatTile value={userCount} label="Total Users" icon="people-outline" />
          <StatTile value={`${verifiedRate}%`} label="Orgs Verified" icon="shield-checkmark-outline" />
        </View>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Bookings by Status</Text>
          {bookingStatuses.map((status) => {
            const count = bookings.filter((b) => b.status === status).length;
            const percentage = totalBookings > 0 ? Math.round((count / totalBookings) * 100) : 0;
            return (
              <CompatibilityBar
                key={status}
                label={`${status.charAt(0).toUpperCase()}${status.slice(1)} (${count})`}
                percentage={percentage}
              />
            );
          })}
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Top Rated Properties</Text>
          {topProperties.map((property) => (
            <View key={property.id} style={styles.propertyRow}>
              <Text style={styles.propertyName}>{property.name}</Text>
              <Rating value={property.rating} reviewCount={property.reviewCount} />
            </View>
          ))}
        </Card>
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
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  section: {
    gap: spacing.xs,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  propertyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  propertyName: {
    ...typography.body,
    color: colors.textPrimary,
  },
});
