import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/domain';
import { Button, Card, Input, LoadingSpinner } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/constants/theme';
import { createBooking } from '../../src/services/bookingService';
import { getPropertyById, getRoomById } from '../../src/services/roomService';
import { getCurrentUser } from '../../src/services/userService';
import { Property, Room } from '../../src/types';

export default function BookingScreen() {
  const router = useRouter();
  const { propertyId, roomId } = useLocalSearchParams<{ propertyId: string; roomId: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [moveInDate, setMoveInDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const [prop, r] = await Promise.all([getPropertyById(propertyId), getRoomById(roomId)]);
      setProperty(prop ?? null);
      setRoom(r ?? null);
      setLoading(false);
    })();
  }, [propertyId, roomId]);

  const handleSubmit = async () => {
    if (!property || !room) return;
    setSubmitting(true);
    const currentUser = await getCurrentUser();
    const booking = await createBooking({
      userId: currentUser.id,
      roomId: room.id,
      propertyId: property.id,
      moveInDate,
      notes,
    });
    setSubmitting(false);
    router.replace({ pathname: '/(user)/booking-confirmation', params: { bookingId: booking.id } });
  };

  if (loading || !property || !room) {
    return <LoadingSpinner fullScreen message="Loading booking details..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Book Room" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.summary}>
          <Text style={styles.propertyName}>{property.name}</Text>
          <Text style={styles.roomName}>{room.name}</Text>
          <Text style={styles.price}>
            {room.currency} {room.pricePerMonth.toLocaleString()} / month
          </Text>
        </Card>

        <Input
          label="Preferred move-in date"
          placeholder="YYYY-MM-DD"
          value={moveInDate}
          onChangeText={setMoveInDate}
        />
        <Input
          label="Notes (optional)"
          placeholder="Anything the organization should know"
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <Button label="Confirm Booking Request" onPress={handleSubmit} loading={submitting} disabled={!moveInDate} />
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
  summary: {
    gap: spacing.xs,
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
    ...typography.h3,
    color: colors.primary,
  },
});
