import { supabase } from '../lib/supabase';
import { Organization } from '../types';
import { getPropertiesForOrganization, getRoomsForOrganization } from './roomService';

interface OrganizationRow {
  id: string;
  owner_id: string;
  name: string;
  type: Organization['type'];
  logo_url: string | null;
  contact_email: string;
  contact_phone: string | null;
  location: string;
  description: string | null;
  verified: boolean;
}

function mapOrganization(row: OrganizationRow): Organization {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    type: row.type,
    logoUrl: row.logo_url ?? undefined,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone ?? undefined,
    location: row.location,
    description: row.description ?? undefined,
    verified: row.verified,
  };
}

export async function getOrganizations(): Promise<Organization[]> {
  const { data, error } = await supabase.from('organizations').select('*').order('created_at');
  if (error) throw error;
  return (data ?? []).map(mapOrganization);
}

export async function getOrganizationById(id: string): Promise<Organization | undefined> {
  const { data, error } = await supabase.from('organizations').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapOrganization(data) : undefined;
}

export async function getMyOrganization(): Promise<Organization | undefined> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return undefined;
  const { data, error } = await supabase.from('organizations').select('*').eq('owner_id', auth.user.id).maybeSingle();
  if (error) throw error;
  return data ? mapOrganization(data) : undefined;
}

export async function createOrganization(
  input: Omit<Organization, 'id' | 'ownerId' | 'verified'>
): Promise<Organization> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('Not signed in.');

  const { data, error } = await supabase
    .from('organizations')
    .insert({
      owner_id: auth.user.id,
      name: input.name,
      type: input.type,
      logo_url: input.logoUrl,
      contact_email: input.contactEmail,
      contact_phone: input.contactPhone,
      location: input.location,
      description: input.description,
    })
    .select()
    .single();

  if (error) throw error;
  return mapOrganization(data);
}

export async function setOrganizationVerified(id: string, verified: boolean): Promise<Organization | undefined> {
  const { data, error } = await supabase
    .from('organizations')
    .update({ verified })
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data ? mapOrganization(data) : undefined;
}

export interface OrgDashboardStats {
  totalProperties: number;
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  pendingBookings: number;
  approvedBookings: number;
}

export async function getDashboardStats(organizationId: string): Promise<OrgDashboardStats> {
  const [properties, rooms] = await Promise.all([
    getPropertiesForOrganization(organizationId),
    getRoomsForOrganization(organizationId),
  ]);

  const propertyIds = properties.map((p) => p.id);
  let pendingBookings = 0;
  let approvedBookings = 0;

  if (propertyIds.length > 0) {
    const { data: bookingCounts } = await supabase
      .from('bookings')
      .select('status')
      .in('property_id', propertyIds);
    pendingBookings = (bookingCounts ?? []).filter((b) => b.status === 'pending').length;
    approvedBookings = (bookingCounts ?? []).filter((b) => b.status === 'approved').length;
  }

  return {
    totalProperties: properties.length,
    totalRooms: rooms.length,
    availableRooms: rooms.filter((r) => r.status === 'available' || r.status === 'almost_full').length,
    occupiedRooms: rooms.filter((r) => r.status === 'full').length,
    pendingBookings,
    approvedBookings,
  };
}
