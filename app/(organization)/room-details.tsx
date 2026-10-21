import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/domain';
import { Badge, Card, LoadingSpinner, SingleChoiceGroup } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/constants/theme';
import { getPropertyById, getRoomById, updateRoomStatus } from '../../src/services/roomService';
import { Property, Room } from '../../src/types';

const statusOptions: { value: Room['status']; label: string; description?: string }[] = [
  { value: 'available', label: 'Available' },
  { value: 'almost_full', label: 'Almost Full' },
  { value: 'full', label: 'Full' },
  { value: 'maintenance', label: 'Maintenance' },
];

const statusTone: Record<Room['status'], 'success' | 'warning' | 'danger' | 'neutral'> = {
  available: 'success',
  almost_full: 'warning',
  full: 'danger',
  maintenance: 'neutral',
};

export default function OrganizationRoomDetailsScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async () => {
    const r = await getRoomById(roomId);
    setRoom(r ?? null);
    if (r) setProperty((await getPropertyById(r.propertyId)) ?? null);
    setLoading(false);
  }, [roomId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleStatusChange = async (status: Room['status']) => {
    setUpdating(true);
    const updated = await updateRoomStatus(roomId, status);
    if (updated) setRoom(updated);
    setUpdating(false);
  };

  if (loading || !room) {
    return <LoadingSpinner fullScreen message="Loading room..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title={room.name} showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Image source={{ uri: room.images[0] }} style={styles.image} />

        <View style={styles.titleRow}>
          <Text style={styles.name}>{room.name}</Text>
          <Badge label={room.status.replace('_', ' ')} tone={statusTone[room.status]} />
        </View>
        {property && <Text style={styles.propertyName}>{property.name}</Text>}

        <Card style={styles.section}>
          <Text style={styles.price}>
            {room.currency} {room.pricePerMonth.toLocaleString()} / month
          </Text>
          <Text style={styles.meta}>
            {room.availableSpaces} of {room.capacity} spaces available
          </Text>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenities}>
            {room.amenities.map((a) => (
              <Badge key={a} label={a} tone="primary" />
            ))}
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Update Status</Text>
          <SingleChoiceGroup options={statusOptions} value={room.status} onChange={handleStatusChange} />
          {updating && <Text style={styles.updatingText}>Saving...</Text>}
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
    gap: spacing.md,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    backgroundColor: colors.border,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  propertyName: {
    ...typography.body,
    color: colors.textSecondary,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  price: {
    ...typography.h3,
    color: colors.primary,
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  amenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  updatingText: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
