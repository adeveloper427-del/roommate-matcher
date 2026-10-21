import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/domain';
import { Badge, Card, EmptyState, LoadingSpinner } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/constants/theme';
import { getMyOrganization } from '../../src/services/organizationService';
import { getRoomsForOrganization } from '../../src/services/roomService';
import { Room } from '../../src/types';

const statusTone: Record<Room['status'], 'success' | 'warning' | 'danger' | 'neutral'> = {
  available: 'success',
  almost_full: 'warning',
  full: 'danger',
  maintenance: 'neutral',
};

const statusLabel: Record<Room['status'], string> = {
  available: 'Available',
  almost_full: 'Almost Full',
  full: 'Full',
  maintenance: 'Maintenance',
};

export default function ManageRoomsScreen() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const org = await getMyOrganization();
    setRooms(org ? await getRoomsForOrganization(org.id) : []);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading rooms..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Manage Rooms" rightIcon="add-circle-outline" onRightPress={() => router.push('/(organization)/add-room')} />
      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="bed-outline"
            title="No rooms yet"
            message="Add a room to one of your properties."
            actionLabel="Add Room"
            onAction={() => router.push('/(organization)/add-room')}
          />
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push({ pathname: '/(organization)/room-details', params: { roomId: item.id } })}>
            <Card style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.name}>{item.name}</Text>
                <Badge label={statusLabel[item.status]} tone={statusTone[item.status]} />
              </View>
              <Text style={styles.meta}>
                {item.currency} {item.pricePerMonth.toLocaleString()} / month · {item.availableSpaces}/{item.capacity}{' '}
                spaces
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
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
