import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

async function fetchProfile(userId: string): Promise<UserProfile | undefined> {
  const [{ data: profile }, { data: details }, { data: lifestyle }] = await Promise.all([
    supabase.from('profiles').select('id, full_name').eq('id', userId).maybeSingle(),
    supabase.from('user_details').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('lifestyle_preferences').select('*').eq('user_id', userId).maybeSingle(),
  ]);

  if (!profile) return undefined;

  return {
    id: profile.id,
    fullName: profile.full_name,
    profilePictureUrl: details?.profile_picture_url ?? undefined,
    age: details?.age ?? undefined,
    university: details?.university ?? undefined,
    course: details?.course ?? undefined,
    yearOfStudy: details?.year_of_study ?? undefined,
    location: details?.location ?? undefined,
    budgetMin: details?.budget_min ?? undefined,
    budgetMax: details?.budget_max ?? undefined,
    preferredLocation: details?.preferred_location ?? undefined,
    roomTypePreference: details?.room_type_preference ?? undefined,
    roommatesWanted: details?.roommates_wanted ?? undefined,
    bio: details?.bio ?? undefined,
    profileCompleted: details?.profile_completed ?? false,
    lifestyle: lifestyle
      ? {
          sleepSchedule: lifestyle.sleep_schedule ?? undefined,
          cleanliness: lifestyle.cleanliness ?? undefined,
          noiseTolerance: lifestyle.noise_tolerance ?? undefined,
          studyHabits: lifestyle.study_habits ?? undefined,
          smoking: lifestyle.smoking ?? undefined,
          pets: lifestyle.pets ?? undefined,
          cooking: lifestyle.cooking ?? undefined,
          socialLifestyle: lifestyle.social_lifestyle ?? undefined,
          guests: lifestyle.guests ?? undefined,
          personality: lifestyle.personality ?? undefined,
          hobbies: lifestyle.hobbies ?? undefined,
          otherPreferences: lifestyle.other_preferences ?? undefined,
        }
      : {},
  };
}

export async function getCurrentUser(): Promise<UserProfile> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error('Not signed in.');
  const profile = await fetchProfile(data.user.id);
  if (!profile) throw new Error('Profile not found.');
  return profile;
}

export async function getUserById(id: string): Promise<UserProfile | undefined> {
  return fetchProfile(id);
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const { data: profiles, error } = await supabase.from('profiles').select('id').eq('role', 'user');
  if (error) throw error;
  const results = await Promise.all((profiles ?? []).map((p) => fetchProfile(p.id)));
  return results.filter((p): p is UserProfile => !!p);
}

export async function updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('Not signed in.');
  const userId = auth.user.id;

  if (updates.fullName !== undefined) {
    const { error } = await supabase.from('profiles').update({ full_name: updates.fullName }).eq('id', userId);
    if (error) throw error;
  }

  const detailsPayload: Record<string, unknown> = { user_id: userId };
  if (updates.profilePictureUrl !== undefined) detailsPayload.profile_picture_url = updates.profilePictureUrl;
  if (updates.age !== undefined) detailsPayload.age = updates.age;
  if (updates.university !== undefined) detailsPayload.university = updates.university;
  if (updates.course !== undefined) detailsPayload.course = updates.course;
  if (updates.yearOfStudy !== undefined) detailsPayload.year_of_study = updates.yearOfStudy;
  if (updates.location !== undefined) detailsPayload.location = updates.location;
  if (updates.budgetMin !== undefined) detailsPayload.budget_min = updates.budgetMin;
  if (updates.budgetMax !== undefined) detailsPayload.budget_max = updates.budgetMax;
  if (updates.preferredLocation !== undefined) detailsPayload.preferred_location = updates.preferredLocation;
  if (updates.roomTypePreference !== undefined) detailsPayload.room_type_preference = updates.roomTypePreference;
  if (updates.roommatesWanted !== undefined) detailsPayload.roommates_wanted = updates.roommatesWanted;
  if (updates.bio !== undefined) detailsPayload.bio = updates.bio;
  if (updates.profileCompleted !== undefined) detailsPayload.profile_completed = updates.profileCompleted;

  if (Object.keys(detailsPayload).length > 1) {
    const { error } = await supabase.from('user_details').upsert(detailsPayload);
    if (error) throw error;
  }

  if (updates.lifestyle) {
    const l = updates.lifestyle;
    const { error } = await supabase.from('lifestyle_preferences').upsert({
      user_id: userId,
      sleep_schedule: l.sleepSchedule,
      cleanliness: l.cleanliness,
      noise_tolerance: l.noiseTolerance,
      study_habits: l.studyHabits,
      smoking: l.smoking,
      pets: l.pets,
      cooking: l.cooking,
      social_lifestyle: l.socialLifestyle,
      guests: l.guests,
      personality: l.personality ?? [],
      hobbies: l.hobbies ?? [],
      other_preferences: l.otherPreferences,
    });
    if (error) throw error;
  }

  const updated = await fetchProfile(userId);
  if (!updated) throw new Error('Profile not found after update.');
  return updated;
}
