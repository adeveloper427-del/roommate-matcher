import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/domain';
import { Avatar, EmptyState, LoadingSpinner } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/constants/theme';
import { getConversationsForUser } from '../../src/services/messageService';
import { getCurrentUser, getUserById } from '../../src/services/userService';
import { Conversation, UserProfile } from '../../src/types';

export default function OrganizationMessagesScreen() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [usersById, setUsersById] = useState<Record<string, UserProfile>>({});
  const [currentUserId, setCurrentUserId] = useState('');
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const currentUser = await getCurrentUser();
        const convos = await getConversationsForUser(currentUser.id);
        const otherIds = convos
          .map((c) => c.participantIds.find((id) => id !== currentUser.id))
          .filter((id): id is string => !!id);
        const others = await Promise.all(otherIds.map((id) => getUserById(id)));

        setCurrentUserId(currentUser.id);
        setConversations(convos);
        setUsersById(Object.fromEntries(others.filter((u): u is UserProfile => !!u).map((u) => [u.id, u])));
        setLoading(false);
      })();
    }, [])
  );

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading messages..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Messages" rightIcon="create-outline" onRightPress={() => router.push('/new-message')} />
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="chatbubble-outline"
            title="No messages yet"
            message="Message a customer to get started."
            actionLabel="New Message"
            onAction={() => router.push('/new-message')}
          />
        }
        renderItem={({ item }) => {
          const otherId = item.participantIds.find((id) => id !== currentUserId);
          const other = otherId ? usersById[otherId] : undefined;
          if (!other) return null;
          return (
            <Pressable
              style={styles.row}
              onPress={() => router.push({ pathname: '/conversation', params: { conversationId: item.id } })}
            >
              <Avatar uri={other.profilePictureUrl} name={other.fullName} size={48} />
              <View style={styles.rowText}>
                <Text style={styles.name}>{other.fullName}</Text>
                <Text style={styles.preview} numberOfLines={1}>
                  {item.lastMessage?.text}
                </Text>
              </View>
              {item.lastMessage && !item.lastMessage.read && <View style={styles.dot} />}
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
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowText: {
    flex: 1,
  },
  name: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  preview: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
});
