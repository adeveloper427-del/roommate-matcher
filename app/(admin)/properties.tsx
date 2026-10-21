import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/domain';
import { Card, LoadingSpinner, Rating } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/constants/theme';
import { getOrganizations } from '../../src/services/organizationService';
import { getProperties } from '../../src/services/roomService';
import { Organization, Property } from '../../src/types';

export default function AdminPropertiesScreen() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [propertyList, organizationList] = await Promise.all([getProperties(), getOrganizations()]);
        setProperties(propertyList);
        setOrganizations(organizationList);
        setLoading(false);
      })();
    }, [])
  );

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading properties..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Properties" />
      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const org = organizations.find((o) => o.id === item.organizationId);
          return (
            <Pressable
              onPress={() => org && router.push({ pathname: '/(admin)/organization-details', params: { organizationId: org.id } })}
            >
              <Card style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Rating value={item.rating} reviewCount={item.reviewCount} />
                </View>
                <View style={styles.metaRow}>
                  <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.meta}>{item.location}</Text>
                </View>
                <Text style={styles.orgName}>{org?.name}</Text>
                <Text style={styles.meta}>
                  {item.availableRooms} of {item.totalRooms} rooms available
                </Text>
              </Card>
            </Pressable>
          );
        }}
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
  },
  card: {
    gap: spacing.xs,
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  orgName: {
    ...typography.captionBold,
    color: colors.primary,
  },
});
