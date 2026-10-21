import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/domain';
import { Avatar, Badge, Card, LoadingSpinner } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/constants/theme';
import { getOrganizations } from '../../src/services/organizationService';
import { Organization } from '../../src/types';

export default function AdminOrganizationsScreen() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setOrganizations(await getOrganizations());
        setLoading(false);
      })();
    }, [])
  );

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading organizations..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Organizations" />
      <FlatList
        data={organizations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: '/(admin)/organization-details', params: { organizationId: item.id } })}
          >
            <Card style={styles.row}>
              <Avatar uri={item.logoUrl} name={item.name} size={44} />
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>{item.location}</Text>
              </View>
              <Badge label={item.verified ? 'Verified' : 'Unverified'} tone={item.verified ? 'success' : 'warning'} />
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
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  info: {
    flex: 1,
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
