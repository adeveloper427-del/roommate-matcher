import { supabase } from '../lib/supabase';
import { CompatibilityResult } from '../types';

export function mapCompatibilityRow(row: any): CompatibilityResult {
  return {
    userId: row.user_id,
    matchedUserId: row.matched_user_id,
    compatibilityScore: row.compatibility_score,
    breakdown: {
      sleepSchedule: row.breakdown?.sleepSchedule ?? 0,
      cleanliness: row.breakdown?.cleanliness ?? 0,
      studyHabits: row.breakdown?.studyHabits ?? 0,
      socialLifestyle: row.breakdown?.socialLifestyle ?? 0,
      noisePreference: row.breakdown?.noisePreference ?? 0,
      budget: row.breakdown?.budget ?? 0,
      location: row.breakdown?.location ?? 0,
    },
    strengths: row.strengths ?? [],
    potentialConflicts: row.potential_conflicts ?? [],
    recommendation: row.recommendation ?? '',
  };
}

export async function getMatchesForUser(userId: string): Promise<CompatibilityResult[]> {
  const { data: others, error } = await supabase.from('profiles').select('id').eq('role', 'user').neq('id', userId);
  if (error) throw error;

  const results = await Promise.all(
    (others ?? []).map(async (other) => {
      const { data, error: rpcError } = await supabase
        .rpc('calculate_compatibility', { p_user_id: userId, p_matched_user_id: other.id })
        .single();
      if (rpcError) throw rpcError;
      return mapCompatibilityRow(data);
    })
  );

  return results.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
}

export async function getCompatibilityDetail(
  userId: string,
  matchedUserId: string
): Promise<CompatibilityResult | undefined> {
  const { data, error } = await supabase
    .rpc('calculate_compatibility', { p_user_id: userId, p_matched_user_id: matchedUserId })
    .single();
  if (error) throw error;
  return data ? mapCompatibilityRow(data) : undefined;
}
