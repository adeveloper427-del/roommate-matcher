import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, Badge, Card, LoadingSpinner, StatTile } from '../../src/components/ui';
import { colors, gradients, radius, shadow, spacing, typography } from '../../src/constants/theme';
import { getMatchesForUser } from '../../src/services/compatibilityService';
import { getBookingsForUser } from '../../src/services/bookingService';
import { getConnectionsForUser } from '../../src/services/connectionService';
import { getNotificationsForUser } from '../../src/services/notificationService';
import { getProperties } from '../../src/services/roomService';
import { getCurrentUser, getUserById } from '../../src/services/userService';
import { CompatibilityResult, Property, UserProfile } from '../../src/types';

export default function UserHomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [topMatch, setTopMatch] = useState<CompatibilityResult | null>(null);
  const [topMatchUser, setTopMatchUser] = useState<UserProfile | null>(null);
  const [rooms, setRooms] = useState<Property[]>([]);
  const [pendingBookings, setPendingBookings] = useState(0);
  const [activeConnections, setActiveConnections] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const currentUser = await getCurrentUser();
        const [matches, properties, bookings, connections, notifications] = await Promise.all([
          getMatchesForUser(currentUser.id),
          getProperties(),
          getBookingsForUser(currentUser.id),
          getConnectionsForUser(currentUser.id),
          getNotificationsForUser(currentUser.id),
        ]);

        const best = matches[0] ?? null;
        setUser(currentUser);
        setTopMatch(best);
        setTopMatchUser(best ? (await getUserById(best.matchedUserId)) ?? null : null);
        setRooms(properties.slice(0, 2));
        setPendingBookings(bookings.filter((b) => b.status === 'pending').length);
        setActiveConnections(connections.filter((c) => c.status === 'accepted').length);
        setUnreadNotifications(notifications.filter((n) => !n.read).length);
        setLoading(false);
      })();
    }, [])
  );

  if (loading || !user) {
    return <LoadingSpinner fullScreen message="Loading your dashboard..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.header, shadow.glow]}>
          <View>
            <Text style={styles.greeting}>Good morning 👋</Text>
            <Text style={styles.title}>{user.fullName.split(' ')[0]}</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable style={styles.bellButton} onPress={() => router.push('/(user)/notifications')}>
              <Ionicons name="notifications-outline" size={20} color={colors.textInverse} />
              {unreadNotifications > 0 && <View style={styles.bellDot} />}
            </Pressable>
            <Avatar uri={user.profilePictureUrl} name={user.fullName} size={48} />
          </View>
        </LinearGradient>

        <Pressable onPress={() => router.push('/(user)/ai-assistant')}>
          <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.aiCard}>
            <View style={styles.aiIconWrap}>
              <Ionicons name="sparkles" size={20} color={colors.textInverse} />
            </View>
            <View style={styles.aiTextWrap}>
              <Text style={styles.aiTitle}>Ask your AI Roommate Assistant</Text>
              <Text style={styles.aiSubtitle}>"Find me someone who sleeps early and doesn't smoke"</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textInverse} />
          </LinearGradient>
        </Pressable>

        {topMatchUser && topMatch && (
          <Card style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="heart" size={16} color={colors.primary} />
              <Text style={styles.sectionTitle}>Your Top Match</Text>
            </View>
            <View style={styles.matchRow}>
              <Avatar uri={topMatchUser.profilePictureUrl} name={topMatchUser.fullName} size={48} />
              <View style={styles.matchInfo}>
                <Text style={styles.matchName}>{topMatchUser.fullName}</Text>
                <Badge label={`${topMatch.compatibilityScore}% Compatible`} tone="success" />
              </View>
            </View>
            <Text style={styles.link} onPress={() => router.push('/(user)/matches')}>
              View Match →
            </Text>
          </Card>
        )}

        <Card style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="business" size={16} color={colors.primary} />
            <Text style={styles.sectionTitle}>Recommended Rooms</Text>
          </View>
          {rooms.map((room) => (
            <View key={room.id} style={styles.roomRow}>
              <Text style={styles.roomName}>{room.name}</Text>
              <Text style={styles.roomPrice}>{room.location}</Text>
            </View>
          ))}
          <Text style={styles.link} onPress={() => router.push('/(user)/rooms')}>
            View All →
          </Text>
        </Card>

        <View style={styles.statsRow}>
          <Pressable style={styles.statPress} onPress={() => router.push('/(user)/bookings')}>
            <StatTile value={pendingBookings} label="Pending Bookings" icon="time-outline" />
          </Pressable>
          <Pressable style={styles.statPress} onPress={() => router.push('/(user)/connections')}>
            <StatTile value={activeConnections} label="Active Connections" icon="people-outline" />
          </Pressable>
        </View>
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
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  greeting: {
    ...typography.body,
    color: 'rgba(255,255,255,0.85)',
  },
  title: {
    ...typography.h1,
    color: colors.textInverse,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
    borderWidth: 1,
    borderColor: colors.surface,
  },
  aiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  aiIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTextWrap: {
    flex: 1,
  },
  aiTitle: {
    ...typography.bodyBold,
    color: colors.textInverse,
  },
  aiSubtitle: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  matchInfo: {
    gap: spacing.xs,
  },
  matchName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  roomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  roomName: {
    ...typography.body,
    color: colors.textPrimary,
  },
  roomPrice: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  link: {
    ...typography.captionBold,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statPress: {
    flex: 1,
  },
});
