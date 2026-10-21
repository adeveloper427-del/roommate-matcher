import { supabase } from '../lib/supabase';
import { UserRole } from '../types';

export interface AuthSession {
  userId: string;
  email: string;
  role: UserRole;
}

async function fetchRole(userId: string): Promise<UserRole> {
  const { data, error } = await supabase.from('profiles').select('role').eq('id', userId).single();
  if (error || !data) throw error ?? new Error('Profile not found for signed-in user.');
  return data.role as UserRole;
}

export async function register(
  email: string,
  password: string,
  role: UserRole,
  fullName: string
): Promise<AuthSession> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { role, full_name: fullName } },
  });
  if (error) throw error;
  if (!data.user) throw new Error('Registration did not return a user.');
  return { userId: data.user.id, email: data.user.email ?? email, role };
}

export async function login(email: string, password: string): Promise<AuthSession> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  const role = await fetchRole(data.user.id);
  return { userId: data.user.id, email: data.user.email ?? email, role };
}

export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function requestPasswordReset(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}

export async function getSession(): Promise<AuthSession | null> {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) return null;
  const role = await fetchRole(user.id);
  return { userId: user.id, email: user.email ?? '', role };
}
