import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/domain';
import { Badge, Button, Card, LoadingSpinner, Rating } from '../../src/components/ui';
import { colors, radius, spacing, typography } from '../../src/constants/theme';
import { getPropertyById, getReviewsForProperty, getRoomsByProperty } from '../../src/services/roomService';
import { Property, Review, Room } from '../../src/types';

export default function RoomDetailsScreen() {
  const router = useRouter();
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [prop, roomList, reviewList] = await Promise.all([
        getPropertyById(propertyId),
        getRoomsByProperty(propertyId),
        getReviewsForProperty(propertyId),
      ]);
      setProperty(prop ?? null);
      setRooms(roomList);
      setReviews(reviewList);
      setLoading(false);
    })();
  }, [propertyId]);

  if (loading || !property) {
    return <LoadingSpinner fullScreen message="Loading room details..." />;
  }

  const availableRoom = rooms.find((r) => r.status !== 'full') ?? rooms[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title={property.name} showBack />
      <ScrollView>
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {property.images.map((img) => (
            <Image key={img} source={{ uri: img }} style={styles.galleryImage} />
          ))}
        </ScrollView>

        <View style={styles.content}>
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

          {availableRoom && (
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Available Room</Text>
              <Text style={styles.roomName}>{availableRoom.name}</Text>
              <Text style={styles.price}>
                {availableRoom.currency} {availableRoom.pricePerMonth.toLocaleString()} / month
              </Text>
              <Text style={styles.capacity}>
                {availableRoom.availableSpaces} of {availableRoom.capacity} spaces available
              </Text>
            </Card>
          )}

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            {reviews.length === 0 && <Text style={styles.description}>No reviews yet.</Text>}
            {reviews.map((review) => (
              <View key={review.id} style={styles.review}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewAuthor}>{review.authorName}</Text>
                  <Rating value={review.rating} />
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))}
          </Card>

          <Button
            label="Book Room"
            onPress={() =>
              router.push({
                pathname: '/(user)/booking',
                params: { propertyId: property.id, roomId: availableRoom?.id ?? '' },
              })
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  galleryImage: {
    width: 380,
    height: 220,
    backgroundColor: colors.border,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
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
  roomName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  price: {
    ...typography.h3,
    color: colors.primary,
  },
  capacity: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  review: {
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.xs,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reviewAuthor: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  reviewComment: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
