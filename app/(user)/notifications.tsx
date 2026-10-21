import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/domain';
import { EmptyState, LoadingSpinner } from '../../src/components/ui';
import { colors, radius, spacing, typography } from '../../src/constants/theme';
import {
  getNotificationsForUser,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../src/services/notificationService';
import { getCurrentUser } from '../../src/services/userService';
import { AppNotification, NotificationType } from '../../src/types';

const iconForType: Record<NotificationType, keyof typeof Ionicons.glyphMap> = {
  match: 'heart',
  booking: 'calendar',
  message: 'chatbubble',
  connection: 'people',
  system: 'information-circle',
};

export default function NotificationsScreen() {
  const [userId, setUserId] = useState('');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const user = await getCurrentUser();
    setUserId(user.id);
    setNotifications(await getNotificationsForUser(user.id));
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await markNotificationRead(id);
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await markAllNotificationsRead(userId);
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading notifications..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Notifications" rightIcon="checkmark-done-outline" onRightPress={handleMarkAllRead} />
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState icon="notifications-outline" title="No notifications" message="You're all caught up." />}
        renderItem={({ item }) => (
          <Pressable style={[styles.row, !item.read && styles.rowUnread]} onPress={() => handleMarkRead(item.id)}>
            <View style={styles.iconWrap}>
              <Ionicons name={iconForType[item.type]} size={18} color={colors.primary} />
            </View>
            <View style={styles.info}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
            </View>
            {!item.read && <View style={styles.dot} />}
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
    gap: spacing.sm,
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  rowUnread: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  title: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  body: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
});
