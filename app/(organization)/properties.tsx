import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/domain';
import { Card, EmptyState, LoadingSpinner, Rating } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/constants/theme';
import { getMyOrganization } from '../../src/services/organizationService';
import { getPropertiesForOrganization } from '../../src/services/roomService';
import { Property } from '../../src/types';

export default function ManagePropertiesScreen() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const org = await getMyOrganization();
    setProperties(org ? await getPropertiesForOrganization(org.id) : []);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading properties..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Manage Properties" rightIcon="add-circle-outline" onRightPress={() => router.push('/(organization)/add-property')} />
      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="business-outline"
            title="No properties yet"
            message="Add your first property to start listing rooms."
            actionLabel="Add Property"
            onAction={() => router.push('/(organization)/add-property')}
          />
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push({ pathname: '/(organization)/property-details', params: { propertyId: item.id } })}>
            <Card style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.name}>{item.name}</Text>
                <Rating value={item.rating} reviewCount={item.reviewCount} />
              </View>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.location}>{item.location}</Text>
              </View>
              <Text style={styles.meta}>
                {item.availableRooms} of {item.totalRooms} rooms available
              </Text>
            </Card>
          </Pressable>
        )}
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
    flexGrow: 1,
  },
  card: {
    gap: spacing.xs,
    marginBottom: spacing.md,
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
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  location: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  meta: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
