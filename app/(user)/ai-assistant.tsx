import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../src/components/domain';
import { Avatar, Badge } from '../../src/components/ui';
import { colors, radius, spacing, typography } from '../../src/constants/theme';
import { askAssistant, AssistantMatch, AssistantRoomMatch } from '../../src/services/aiAssistantService';
import { getCurrentUser } from '../../src/services/userService';
import { UserProfile } from '../../src/types';

interface ChatEntry {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  matches?: AssistantMatch[];
  rooms?: AssistantRoomMatch[];
}

const SUGGESTIONS = [
  'Find me someone who sleeps early and doesn\'t smoke',
  'Rooms in Nairobi under KSh 10,000',
  'How do I book a room?',
  'How does matching work?',
];

export default function AiAssistantScreen() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [entries, setEntries] = useState<ChatEntry[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text:
        "Hi! I can find compatible roommates (\"someone who sleeps early and doesn't smoke\"), search for rooms (\"rooms in Nairobi under KSh 10,000\"), explain a match (\"why was Sarah recommended?\"), or answer questions about using the app.",
    },
  ]);
  const [draft, setDraft] = useState('');
  const [thinking, setThinking] = useState(false);

  useEffect(() => {
    (async () => setCurrentUser(await getCurrentUser()))();
  }, []);

  const handleSend = async (text?: string) => {
    const query = (text ?? draft).trim();
    if (!query || !currentUser || thinking) return;

    const userEntry: ChatEntry = { id: `u${Date.now()}`, role: 'user', text: query };
    setEntries((prev) => [...prev, userEntry]);
    setDraft('');
    setThinking(true);

    try {
      const response = await askAssistant(currentUser.id, query);
      setEntries((prev) => [
        ...prev,
        { id: `a${Date.now()}`, role: 'assistant', text: response.text, matches: response.matches, rooms: response.rooms },
      ]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="AI Roommate Assistant" showBack />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messages}
          renderItem={({ item }) => (
            <View style={[styles.bubbleRow, item.role === 'user' && styles.bubbleRowMe]}>
              <View style={[styles.bubble, item.role === 'user' ? styles.bubbleMe : styles.bubbleOther]}>
                {item.role === 'assistant' && (
                  <View style={styles.assistantTag}>
                    <Ionicons name="sparkles" size={12} color={colors.primary} />
                    <Text style={styles.assistantTagText}>AI Assistant</Text>
                  </View>
                )}
                <Text style={[styles.bubbleText, item.role === 'user' && styles.bubbleTextMe]}>{item.text}</Text>

                {item.matches?.map((match) => (
                  <Pressable
                    key={match.user.id}
                    style={styles.matchCard}
                    onPress={() =>
                      router.push({ pathname: '/(user)/match-details', params: { userId: match.user.id } })
                    }
                  >
                    <Avatar uri={match.user.profilePictureUrl} name={match.user.fullName} size={36} />
                    <View style={styles.matchInfo}>
                      <Text style={styles.matchName}>{match.user.fullName}</Text>
                      {match.matchedCriteria.length > 0 && (
                        <Text style={styles.matchMeta}>{match.matchedCriteria.join(' · ')}</Text>
                      )}
                    </View>
                    <Badge label={`${match.compatibility.compatibilityScore}%`} tone="success" />
                  </Pressable>
                ))}

                {item.rooms?.map(({ property, room }) => (
                  <Pressable
                    key={room.id}
                    style={styles.matchCard}
                    onPress={() =>
                      router.push({ pathname: '/(user)/room-details', params: { propertyId: property.id } })
                    }
                  >
                    <View style={styles.roomIconWrap}>
                      <Ionicons name="business" size={18} color={colors.primary} />
                    </View>
                    <View style={styles.matchInfo}>
                      <Text style={styles.matchName}>{property.name}</Text>
                      <Text style={styles.matchMeta}>
                        {property.location} · {room.currency} {room.pricePerMonth.toLocaleString()}/mo
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                  </Pressable>
                ))}
              </View>
            </View>
          )}
          ListFooterComponent={
            thinking ? (
              <View style={[styles.bubbleRow]}>
                <View style={[styles.bubble, styles.bubbleOther]}>
                  <Text style={styles.bubbleText}>Thinking…</Text>
                </View>
              </View>
            ) : null
          }
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestions}>
          {SUGGESTIONS.map((s) => (
            <Pressable key={s} style={styles.suggestionChip} onPress={() => handleSend(s)}>
              <Text style={styles.suggestionText}>{s}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Ask about compatible roommates..."
            placeholderTextColor={colors.textMuted}
            value={draft}
            onChangeText={setDraft}
            multiline
          />
          <Pressable style={styles.sendButton} onPress={() => handleSend()} disabled={thinking || !draft.trim()}>
            <Ionicons name="send" size={18} color={colors.textInverse} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  messages: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  bubbleRow: {
    flexDirection: 'row',
  },
  bubbleRowMe: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '85%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    gap: spacing.sm,
  },
  bubbleOther: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  bubbleMe: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  bubbleTextMe: {
    color: colors.textInverse,
  },
  assistantTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  assistantTagText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '700',
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  roomIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchInfo: {
    flex: 1,
  },
  matchName: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  matchMeta: {
    ...typography.small,
    color: colors.textSecondary,
  },
  suggestions: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  suggestionChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
  },
  suggestionText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: colors.textPrimary,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
