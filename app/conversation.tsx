import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../src/components/domain';
import { LoadingSpinner } from '../src/components/ui';
import { colors, radius, spacing, typography } from '../src/constants/theme';
import { getConversationById, getMessagesForConversation, sendMessage } from '../src/services/messageService';
import { getCurrentUser, getUserById } from '../src/services/userService';
import { Message, UserProfile } from '../src/types';

export default function ConversationScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    (async () => {
      const user = await getCurrentUser();
      const [conv, msgs] = await Promise.all([
        getConversationById(conversationId),
        getMessagesForConversation(conversationId),
      ]);
      const otherId = conv?.participantIds.find((id) => id !== user.id);
      setCurrentUser(user);
      setOtherUser(otherId ? (await getUserById(otherId)) ?? null : null);
      setMessages(msgs);
      setLoading(false);
    })();
  }, [conversationId]);

  const handleSend = async () => {
    if (!draft.trim() || !currentUser) return;
    setSending(true);
    const message = await sendMessage(conversationId, currentUser.id, draft.trim());
    setMessages((prev) => [...prev, message]);
    setDraft('');
    setSending(false);
  };

  if (loading || !currentUser) {
    return <LoadingSpinner fullScreen message="Loading conversation..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title={otherUser?.fullName ?? 'Conversation'} showBack />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messages}
          renderItem={({ item }) => {
            const isMe = item.senderId === currentUser.id;
            return (
              <View style={[styles.bubbleRow, isMe && styles.bubbleRowMe]}>
                <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
                  <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>{item.text}</Text>
                </View>
              </View>
            );
          }}
        />
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={colors.textMuted}
            value={draft}
            onChangeText={setDraft}
            multiline
          />
          <Pressable style={styles.sendButton} onPress={handleSend} disabled={sending || !draft.trim()}>
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
    maxWidth: '78%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
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
