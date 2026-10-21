import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/domain';
import { Avatar, Button, Card, EmptyState, LoadingSpinner } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/constants/theme';
import { getConnectionsForUser, respondToConnection } from '../../src/services/connectionService';
import { getOrCreateConversation } from '../../src/services/messageService';
import { getCurrentUser, getUserById } from '../../src/services/userService';
import { Connection, UserProfile } from '../../src/types';

export default function ConnectionsScreen() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [usersById, setUsersById] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const user = await getCurrentUser();
    const conns = await getConnectionsForUser(user.id);
    const otherIds = conns.map((c) => (c.fromUserId === user.id ? c.toUserId : c.fromUserId));
    const others = await Promise.all(otherIds.map((id) => getUserById(id)));

    setCurrentUser(user);
    setConnections(conns);
    setUsersById(Object.fromEntries(others.filter((u): u is UserProfile => !!u).map((u) => [u.id, u])));
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading || !currentUser) {
    return <LoadingSpinner fullScreen message="Loading connections..." />;
  }

  const incoming = connections.filter((c) => c.status === 'pending' && c.toUserId === currentUser.id);
  const outgoing = connections.filter((c) => c.status === 'pending' && c.fromUserId === currentUser.id);
  const active = connections.filter((c) => c.status === 'accepted');

  const otherUser = (c: Connection) => usersById[c.fromUserId === currentUser.id ? c.toUserId : c.fromUserId];

  const handleRespond = async (id: string, status: Connection['status']) => {
    await respondToConnection(id, status);
    load();
  };

  const openConversation = async (userId: string) => {
    const conversation = await getOrCreateConversation(currentUser.id, userId);
    router.push({ pathname: '/conversation', params: { conversationId: conversation.id } });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Connections" />
      <ScrollView contentContainerStyle={styles.content}>
        {incoming.length === 0 && outgoing.length === 0 && active.length === 0 && (
          <EmptyState
            icon="people-outline"
            title="No connections yet"
            message="Connect with a match from Find Roommates to start building your network."
          />
        )}

        {incoming.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pending Requests</Text>
            {incoming.map((c) => {
              const user = otherUser(c);
              if (!user) return null;
              return (
                <Card key={c.id} style={styles.row}>
                  <Avatar uri={user.profilePictureUrl} name={user.fullName} size={44} />
                  <View style={styles.info}>
                    <Text style={styles.name}>{user.fullName}</Text>
                    <Text style={styles.meta}>Wants to connect</Text>
                  </View>
                  <View style={styles.inlineActions}>
                    <Button label="Decline" variant="outline" size="sm" fullWidth={false} onPress={() => handleRespond(c.id, 'declined')} />
                    <Button label="Accept" size="sm" fullWidth={false} onPress={() => handleRespond(c.id, 'accepted')} />
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        {outgoing.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sent Requests</Text>
            {outgoing.map((c) => {
              const user = otherUser(c);
              if (!user) return null;
              return (
                <Card key={c.id} style={styles.row}>
                  <Avatar uri={user.profilePictureUrl} name={user.fullName} size={44} />
                  <View style={styles.info}>
                    <Text style={styles.name}>{user.fullName}</Text>
                    <Text style={styles.meta}>Request pending</Text>
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        {active.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Connections</Text>
            {active.map((c) => {
              const user = otherUser(c);
              if (!user) return null;
              return (
                <Card key={c.id} style={styles.row}>
                  <Avatar uri={user.profilePictureUrl} name={user.fullName} size={44} />
                  <View style={styles.info}>
                    <Text style={styles.name}>{user.fullName}</Text>
                    <Text style={styles.meta}>{user.university}</Text>
                  </View>
                  <Button label="Message" size="sm" fullWidth={false} onPress={() => openConversation(user.id)} />
                </Card>
              );
            })}
          </View>
        )}
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
    gap: spacing.xl,
    flexGrow: 1,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
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
  inlineActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
