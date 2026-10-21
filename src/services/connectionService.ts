import { supabase } from '../lib/supabase';
import { Connection, ConnectionStatus } from '../types';

function mapConnection(row: any): Connection {
  return {
    id: row.id,
    fromUserId: row.from_user_id,
    toUserId: row.to_user_id,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function getConnectionsForUser(userId: string): Promise<Connection[]> {
  const { data, error } = await supabase
    .from('connections')
    .select('*')
    .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`);
  if (error) throw error;
  return (data ?? []).map(mapConnection);
}

export async function respondToConnection(id: string, status: ConnectionStatus): Promise<Connection | undefined> {
  const { data, error } = await supabase.from('connections').update({ status }).eq('id', id).select().maybeSingle();
  if (error) throw error;
  return data ? mapConnection(data) : undefined;
}

export async function createConnectionRequest(fromUserId: string, toUserId: string): Promise<Connection> {
  const { data, error } = await supabase
    .from('connections')
    .insert({ from_user_id: fromUserId, to_user_id: toUserId })
    .select()
    .single();
  if (error) throw error;
  return mapConnection(data);
}
