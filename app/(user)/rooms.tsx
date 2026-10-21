import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header, RoomCard } from '../../src/components/domain';
import { EmptyState, LoadingSpinner, SearchBar } from '../../src/components/ui';
import { colors, spacing } from '../../src/constants/theme';
import { getProperties, getRoomsByProperty } from '../../src/services/roomService';
import { Property, Room } from '../../src/types';

export default function DiscoverRoomsScreen() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [featuredRoomByProperty, setFeaturedRoomByProperty] = useState<Record<string, Room>>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const propertyList = await getProperties();
        const roomLists = await Promise.all(propertyList.map((p) => getRoomsByProperty(p.id)));
        const featured: Record<string, Room> = {};
        propertyList.forEach((property, index) => {
          const room = roomLists[index].find((r) => r.status !== 'full');
          if (room) featured[property.id] = room;
        });

        setProperties(propertyList);
        setFeaturedRoomByProperty(featured);
        setLoading(false);
      })();
    }, [])
  );

  const filtered = properties.filter(
    (p) => featuredRoomByProperty[p.id] && p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading rooms..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Discover Rooms" />
      <View style={styles.searchWrap}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search properties or location" />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          properties.length === 0 ? (
            <EmptyState
              icon="business-outline"
              title="No rooms listed yet"
              message="Organizations haven't added any rooms yet. Check back soon."
            />
          ) : (
            <EmptyState icon="search-outline" title="No matches" message="Try a different search term." />
          )
        }
        renderItem={({ item }) => (
          <RoomCard
            property={item}
            room={featuredRoomByProperty[item.id]}
            onView={() => router.push({ pathname: '/(user)/room-details', params: { propertyId: item.id } })}
          />
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
  searchWrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  list: {
    padding: spacing.lg,
    paddingTop: 0,
    flexGrow: 1,
  },
});
