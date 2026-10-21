import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../constants/theme';
import { Booking, Property, Room } from '../../types';
import { Badge, Card } from '../ui';

interface BookingCardProps {
  booking: Booking;
  property?: Property;
  room?: Room;
}

const statusTone: Record<Booking['status'], 'success' | 'warning' | 'danger' | 'neutral'> = {
  approved: 'success',
  pending: 'warning',
  rejected: 'danger',
  cancelled: 'neutral',
};

const statusLabel: Record<Booking['status'], string> = {
  approved: 'Approved',
  pending: 'Pending',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

export function BookingCard({ booking, property, room }: BookingCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.propertyName}>{property?.name ?? 'Property'}</Text>
        <Badge label={statusLabel[booking.status]} tone={statusTone[booking.status]} />
      </View>
      <Text style={styles.roomName}>{room?.name}</Text>
      {room && (
        <Text style={styles.price}>
          {room.currency} {room.pricePerMonth.toLocaleString()}/month
        </Text>
      )}
      <Text style={styles.moveIn}>Move-in: {booking.moveInDate}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  propertyName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  roomName: {
    ...typography.body,
    color: colors.textSecondary,
  },
  price: {
    ...typography.captionBold,
    color: colors.primary,
  },
  moveIn: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
