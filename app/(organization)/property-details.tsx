import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/domain';
import { Badge, Button, Card, LoadingSpinner, Rating } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/constants/theme';
import { getPropertyById, getRoomsByProperty } from '../../src/services/roomService';
import { Property, Room } from '../../src/types';

const statusTone: Record<Room['status'], 'success' | 'warning' | 'danger' | 'neutral'> = {
  available: 'success',
  almost_full: 'warning',
  full: 'danger',
  maintenance: 'neutral',
};

export default function OrganizationPropertyDetailsScreen() {
  const router = useRouter();
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [prop, roomList] = await Promise.all([getPropertyById(propertyId), getRoomsByProperty(propertyId)]);
    setProperty(prop ?? null);
    setRooms(roomList);
    setLoading(false);
  }, [propertyId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading || !property) {
    return <LoadingSpinner fullScreen message="Loading property..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title={property.name} showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Image source={{ uri: property.images[0] }} style={styles.image} />

        <View style={styles.titleRow}>
          <Text style={styles.name}>{property.name}</Text>
          <Rating value={property.rating} reviewCount={property.reviewCount} />
        </View>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.location}>{property.location}</Text>
        </View>
        <Text style={styles.description}>{property.description}</Text>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenities}>
            {property.amenities.map((a) => (
              <Badge key={a} label={a} tone="primary" />
            ))}
          </View>
        </Card>

        <View style={styles.roomsHeader}>
          <Text style={styles.sectionTitle}>Rooms ({rooms.length})</Text>
          <Text
            style={styles.addRoomLink}
            onPress={() => router.push({ pathname: '/(organization)/add-room', params: { propertyId: property.id } })}
          >
            + Add Room
          </Text>
        </View>

        {rooms.map((room) => (
          <Pressable key={room.id} onPress={() => router.push({ pathname: '/(organization)/room-details', params: { roomId: room.id } })}>
            <Card style={styles.roomCard}>
              <View style={styles.row}>
                <Text style={styles.roomName}>{room.name}</Text>
                <Badge label={room.status.replace('_', ' ')} tone={statusTone[room.status]} />
              </View>
              <Text style={styles.meta}>
                {room.currency} {room.pricePerMonth.toLocaleString()}/month · {room.availableSpaces}/{room.capacity} spaces
              </Text>
            </Card>
          </Pressable>
        ))}

        <Button
          label="Add Room to this Property"
          variant="outline"
          onPress={() => router.push({ pathname: '/(organization)/add-room', params: { propertyId: property.id } })}
        />
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
    flex: 1,
    marginRight: spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  location: {
    ...typography.body,
    color: colors.textSecondary,
  },
  description: {
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
  amenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  roomsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  addRoomLink: {
    ...typography.captionBold,
    color: colors.primary,
  },
  roomCard: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
