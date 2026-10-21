import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/domain';
import { Avatar, Card, LoadingSpinner } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/constants/theme';
import { getAllUsers } from '../../src/services/userService';
import { UserProfile } from '../../src/types';

export default function AdminUsersScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setUsers(await getAllUsers());
        setLoading(false);
      })();
    }, [])
  );

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading users..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Users" />
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push({ pathname: '/(admin)/user-details', params: { userId: item.id } })}>
            <Card style={styles.row}>
              <Avatar uri={item.profilePictureUrl} name={item.fullName} size={44} />
              <View style={styles.info}>
                <Text style={styles.name}>{item.fullName}</Text>
                <Text style={styles.meta}>{item.university}</Text>
              </View>
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
