import * as Crypto from 'expo-crypto';
import { supabase } from '../lib/supabase';
import { Conversation, Message } from '../types';

function mapMessage(row: any): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    text: row.text,
    createdAt: row.created_at,
    read: row.read,
  };
}

async function attachLastMessage(conversationId: string): Promise<Message | undefined> {
  const { data } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ? mapMessage(data) : undefined;
}

export async function getConversationsForUser(userId: string): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', userId);
  if (error) throw error;

  const conversationIds = (data ?? []).map((row) => row.conversation_id);
  if (conversationIds.length === 0) return [];

  const { data: participantRows, error: participantsError } = await supabase
    .from('conversation_participants')
    .select('conversation_id, user_id')
    .in('conversation_id', conversationIds);
  if (participantsError) throw participantsError;

  const conversations: Conversation[] = await Promise.all(
    conversationIds.map(async (id) => ({
      id,
      participantIds: (participantRows ?? []).filter((r) => r.conversation_id === id).map((r) => r.user_id),
      lastMessage: await attachLastMessage(id),
    }))
  );

  return conversations;
}

export async function getConversationById(conversationId: string): Promise<Conversation | undefined> {
  const { data: participantRows, error } = await supabase
    .from('conversation_participants')
    .select('user_id')
    .eq('conversation_id', conversationId);
  if (error) throw error;
  if (!participantRows || participantRows.length === 0) return undefined;

  return {
    id: conversationId,
    participantIds: participantRows.map((r) => r.user_id),
    lastMessage: await attachLastMessage(conversationId),
  };
}

export async function getOrCreateConversation(userIdA: string, userIdB: string): Promise<Conversation> {
  const { data: mineRows } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', userIdA);

  const myConversationIds = (mineRows ?? []).map((r) => r.conversation_id);

  if (myConversationIds.length > 0) {
    const { data: sharedRows } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', userIdB)
      .in('conversation_id', myConversationIds);

    if (sharedRows && sharedRows.length > 0) {
      const existing = await getConversationById(sharedRows[0].conversation_id);
      if (existing) return existing;
    }
  }

  // Generate the id client-side rather than relying on `insert().select()`:
  // Postgres checks RETURNING rows against the table's SELECT policy, and at
  // this point no conversation_participants row exists yet, so the new
  // conversation would be invisible to its own INSERT...RETURNING and
  // `.single()` would fail with "no rows returned".
  const conversationId = Crypto.randomUUID();

  const { error } = await supabase.from('conversations').insert({ id: conversationId });
  if (error) throw error;

  const { error: participantsError } = await supabase.from('conversation_participants').insert([
    { conversation_id: conversationId, user_id: userIdA },
    { conversation_id: conversationId, user_id: userIdB },
  ]);
  if (participantsError) throw participantsError;

  return { id: conversationId, participantIds: [userIdA, userIdB] };
}

export async function getMessagesForConversation(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at');
  if (error) throw error;
  return (data ?? []).map(mapMessage);
}

export async function sendMessage(conversationId: string, senderId: string, text: string): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, text })
    .select()
    .single();
  if (error) throw error;
  return mapMessage(data);
}
