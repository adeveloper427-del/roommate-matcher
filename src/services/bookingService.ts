import { supabase } from '../lib/supabase';
import { Booking, BookingStatus } from '../types';

function mapBooking(row: any): Booking {
  return {
    id: row.id,
    userId: row.user_id,
    roomId: row.room_id,
    propertyId: row.property_id,
    status: row.status,
    moveInDate: row.move_in_date,
    createdAt: row.created_at,
    notes: row.notes ?? undefined,
  };
}

export async function getBookingById(id: string): Promise<Booking | undefined> {
  const { data, error } = await supabase.from('bookings').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapBooking(data) : undefined;
}

export async function getAllBookings(): Promise<Booking[]> {
  const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapBooking);
}

export async function getBookingsForUser(userId: string): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapBooking);
}

export async function getBookingsForOrganization(organizationId: string): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, properties!inner(organization_id)')
    .eq('properties.organization_id', organizationId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapBooking);
}

export async function getBookingsForProperty(propertyId: string): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapBooking);
}

export async function createBooking(input: Omit<Booking, 'id' | 'createdAt' | 'status'>): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      user_id: input.userId,
      room_id: input.roomId,
      property_id: input.propertyId,
      move_in_date: input.moveInDate,
      notes: input.notes,
    })
    .select()
    .single();
  if (error) throw error;
  return mapBooking(data);
}

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<Booking | undefined> {
  const { data, error } = await supabase.from('bookings').update({ status }).eq('id', id).select().maybeSingle();
  if (error) throw error;
  return data ? mapBooking(data) : undefined;
}
