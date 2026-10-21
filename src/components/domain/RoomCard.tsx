import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { Property, Room } from '../../types';
import { Badge, Button, Card, Rating } from '../ui';

interface RoomCardProps {
  property: Property;
  room: Room;
  onView: () => void;
}

export function RoomCard({ property, room, onView }: RoomCardProps) {
  return (
    <Card padded={false} style={styles.card}>
      <Image source={{ uri: property.images[0] }} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {property.name}
          </Text>
          <Rating value={property.rating} reviewCount={property.reviewCount} />
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.location}>{property.location}</Text>
        </View>

        <Text style={styles.price}>
          {room.currency} {room.pricePerMonth.toLocaleString()} / month
        </Text>

        <View style={styles.metaRow}>
          <Badge label={roomTypeLabel[room.roomType]} tone="primary" />
          <Text style={styles.spaces}>{room.availableSpaces} spaces available</Text>
        </View>

        <View style={styles.amenities}>
          {room.amenities.slice(0, 4).map((a) => (
            <View key={a} style={styles.amenityChip}>
              <Ionicons name="checkmark" size={12} color={colors.success} />
              <Text style={styles.amenityText}>{a}</Text>
            </View>
          ))}
        </View>

        <Button label="View Room" onPress={onView} size="sm" />
      </View>
    </Card>
  );
}

const roomTypeLabel: Record<Room['roomType'], string> = {
  single: 'Single',
  shared_double: '2-person room',
  shared_triple: '3-person room',
  dormitory: 'Dormitory',
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: colors.border,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    ...typography.h3,
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
    ...typography.caption,
    color: colors.textSecondary,
  },
  price: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  spaces: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  amenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  amenityText: {
    ...typography.small,
    color: colors.success,
  },
});
