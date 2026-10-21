import { supabase } from '../lib/supabase';
import { Property, Review, Room } from '../types';

function mapProperty(row: any): Property {
  return {
    id: row.id,
    organizationId: row.organization_id,
    name: row.name,
    description: row.description,
    location: row.location,
    address: row.address ?? undefined,
    images: row.images ?? [],
    amenities: row.amenities ?? [],
    rating: Number(row.rating ?? 0),
    reviewCount: row.review_count ?? 0,
    totalRooms: row.total_rooms ?? 0,
    availableRooms: row.available_rooms ?? 0,
  };
}

function mapRoom(row: any): Room {
  return {
    id: row.id,
    propertyId: row.property_id,
    name: row.name,
    roomType: row.room_type,
    pricePerMonth: Number(row.price_per_month),
    currency: row.currency,
    capacity: row.capacity,
    availableSpaces: row.available_spaces,
    amenities: row.amenities ?? [],
    images: row.images ?? [],
    status: row.status,
  };
}

function mapReview(row: any, authorName: string): Review {
  return {
    id: row.id,
    propertyId: row.property_id,
    authorName,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
  };
}

export async function getProperties(): Promise<Property[]> {
  const { data, error } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapProperty);
}

export async function getPropertiesForOrganization(organizationId: string): Promise<Property[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapProperty);
}

export async function getPropertyById(id: string): Promise<Property | undefined> {
  const { data, error } = await supabase.from('properties').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapProperty(data) : undefined;
}

export async function getRoomsByProperty(propertyId: string): Promise<Room[]> {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('property_id', propertyId)
    .order('created_at');
  if (error) throw error;
  return (data ?? []).map(mapRoom);
}

export async function getRoomsForOrganization(organizationId: string): Promise<Room[]> {
  const { data, error } = await supabase
    .from('rooms')
    .select('*, properties!inner(organization_id)')
    .eq('properties.organization_id', organizationId);
  if (error) throw error;
  return (data ?? []).map(mapRoom);
}

export async function getRoomById(id: string): Promise<Room | undefined> {
  const { data, error } = await supabase.from('rooms').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapRoom(data) : undefined;
}

export async function getReviewsForProperty(propertyId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles(full_name)')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row: any) => mapReview(row, row.profiles?.full_name ?? 'Anonymous'));
}

export async function createProperty(
  input: Omit<Property, 'id' | 'rating' | 'reviewCount' | 'totalRooms' | 'availableRooms'>
): Promise<Property> {
  const { data, error } = await supabase
    .from('properties')
    .insert({
      organization_id: input.organizationId,
      name: input.name,
      description: input.description,
      location: input.location,
      address: input.address,
      images: input.images,
      amenities: input.amenities,
    })
    .select()
    .single();
  if (error) throw error;
  return mapProperty(data);
}

export async function createRoom(input: Omit<Room, 'id'>): Promise<Room> {
  const { data, error } = await supabase
    .from('rooms')
    .insert({
      property_id: input.propertyId,
      name: input.name,
      room_type: input.roomType,
      price_per_month: input.pricePerMonth,
      currency: input.currency,
      capacity: input.capacity,
      available_spaces: input.availableSpaces,
      amenities: input.amenities,
      images: input.images,
      status: input.status,
    })
    .select()
    .single();
  if (error) throw error;

  const { data: property } = await supabase
    .from('properties')
    .select('total_rooms, available_rooms')
    .eq('id', input.propertyId)
    .single();
  if (property) {
    await supabase
      .from('properties')
      .update({
        total_rooms: (property.total_rooms ?? 0) + 1,
        available_rooms: (property.available_rooms ?? 0) + (input.availableSpaces > 0 ? 1 : 0),
      })
      .eq('id', input.propertyId);
  }

  return mapRoom(data);
}

export async function updateRoomStatus(id: string, status: Room['status']): Promise<Room | undefined> {
  const { data, error } = await supabase.from('rooms').update({ status }).eq('id', id).select().maybeSingle();
  if (error) throw error;
  return data ? mapRoom(data) : undefined;
}
