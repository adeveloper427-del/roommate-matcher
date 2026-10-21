import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header, MatchCard } from '../../src/components/domain';
import { LoadingSpinner } from '../../src/components/ui';
import { colors, spacing } from '../../src/constants/theme';
import { getMatchesForUser } from '../../src/services/compatibilityService';
import { createConnectionRequest, getConnectionsForUser } from '../../src/services/connectionService';
import { getCurrentUser, getUserById } from '../../src/services/userService';
import { CompatibilityResult, UserProfile } from '../../src/types';

export default function MatchesScreen() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [matches, setMatches] = useState<CompatibilityResult[]>([]);
  const [usersById, setUsersById] = useState<Record<string, UserProfile>>({});
  const [connectedIds, setConnectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const user = await getCurrentUser();
        const [results, connections] = await Promise.all([
          getMatchesForUser(user.id),
          getConnectionsForUser(user.id),
        ]);
        const matchedUsers = await Promise.all(results.map((r) => getUserById(r.matchedUserId)));

        setCurrentUser(user);
        setMatches(results);
        setUsersById(
          Object.fromEntries(
            matchedUsers.filter((u): u is UserProfile => !!u).map((u) => [u.id, u])
          )
        );
        setConnectedIds(connections.map((c) => (c.fromUserId === user.id ? c.toUserId : c.fromUserId)));
        setLoading(false);
      })();
    }, [])
  );

  const handleConnect = async (matchedUserId: string) => {
    if (!currentUser) return;
    setConnectedIds((prev) => [...prev, matchedUserId]);
    await createConnectionRequest(currentUser.id, matchedUserId);
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Finding your matches..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Find Your Roommate" />
      <FlatList
        data={matches}
        keyExtractor={(item) => item.matchedUserId}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const user = usersById[item.matchedUserId];
          if (!user) return null;
          return (
            <MatchCard
              user={user}
              compatibilityScore={item.compatibilityScore}
              strengths={item.strengths}
              connected={connectedIds.includes(user.id)}
              onViewProfile={() =>
                router.push({ pathname: '/(user)/match-details', params: { userId: user.id } })
              }
              onConnect={() => handleConnect(user.id)}
            />
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
  },
});
