import { supabase } from '../lib/supabase';
import { AppNotification } from '../types';

function mapNotification(row: any): AppNotification {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    body: row.body,
    createdAt: row.created_at,
    read: row.read,
  };
}

export async function getNotificationsForUser(userId: string): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapNotification);
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
  if (error) throw error;
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const { error } = await supabase.from('notifications').update({ read: true }).eq('user_id', userId);
  if (error) throw error;
}
