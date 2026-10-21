import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../src/components/domain';
import { Avatar, EmptyState, LoadingSpinner, SearchBar } from '../src/components/ui';
import { colors, spacing, typography } from '../src/constants/theme';
import { getOrganizations } from '../src/services/organizationService';
import { getOrCreateConversation } from '../src/services/messageService';
import { getAllUsers, getCurrentUser } from '../src/services/userService';
import { Organization, UserProfile } from '../src/types';

interface Contact {
  id: string;
  targetUserId: string;
  name: string;
  subtitle: string;
  avatarUrl?: string;
}

export default function NewMessageScreen() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [people, setPeople] = useState<Contact[]>([]);
  const [organizations, setOrganizations] = useState<Contact[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const user = await getCurrentUser();
      const [allUsers, allOrgs] = await Promise.all([getAllUsers(), getOrganizations()]);

      setCurrentUser(user);
      setPeople(
        allUsers
          .filter((u) => u.id !== user.id)
          .map((u) => ({
            id: `user-${u.id}`,
            targetUserId: u.id,
            name: u.fullName,
            subtitle: u.university ?? 'Roommate seeker',
            avatarUrl: u.profilePictureUrl,
          }))
      );
      setOrganizations(
        allOrgs
          .filter((o: Organization) => o.ownerId !== user.id)
          .map((o: Organization) => ({
            id: `org-${o.id}`,
            targetUserId: o.ownerId,
            name: o.name,
            subtitle: o.location,
            avatarUrl: o.logoUrl,
          }))
      );
      setLoading(false);
    })();
  }, []);

  const matchesSearch = (contact: Contact) => contact.name.toLowerCase().includes(search.toLowerCase());
  const filteredPeople = people.filter(matchesSearch);
  const filteredOrgs = organizations.filter(matchesSearch);

  const [error, setError] = useState<string | null>(null);

  const handleSelect = async (contact: Contact) => {
    if (!currentUser || startingId) return;
    setStartingId(contact.id);
    setError(null);
    try {
      const conversation = await getOrCreateConversation(currentUser.id, contact.targetUserId);
      router.replace({ pathname: '/conversation', params: { conversationId: conversation.id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start that conversation. Please try again.');
    } finally {
      setStartingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading contacts..." />;
  }

  const sections: { title: string; data: Contact[] }[] = [
    { title: 'Organizations', data: filteredOrgs },
    { title: 'People', data: filteredPeople },
  ].filter((s) => s.data.length > 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="New Message" showBack />
      <View style={styles.searchWrap}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search people or organizations" />
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
      <FlatList
        data={sections}
        keyExtractor={(item) => item.title}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState icon="people-outline" title="No contacts found" message="Try a different search term." />
        }
        renderItem={({ item: section }) => (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.data.map((contact) => (
              <Pressable
                key={contact.id}
                style={styles.row}
                onPress={() => handleSelect(contact)}
                disabled={startingId === contact.id}
              >
                <Avatar uri={contact.avatarUrl} name={contact.name} size={44} />
                <View style={styles.rowText}>
                  <Text style={styles.name}>{contact.name}</Text>
                  <Text style={styles.subtitle}>{contact.subtitle}</Text>
                </View>
              </Pressable>
            ))}
          </View>
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
    gap: spacing.xs,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
  },
  list: {
    padding: spacing.lg,
    paddingTop: 0,
    flexGrow: 1,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.captionBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
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
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
