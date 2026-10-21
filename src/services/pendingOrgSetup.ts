import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'roommate-matcher:pending-org';

export interface PendingOrgSetup {
  name: string;
  contactEmail: string;
}

export async function savePendingOrgSetup(setup: PendingOrgSetup): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(setup));
}

export async function consumePendingOrgSetup(): Promise<PendingOrgSetup | null> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  await AsyncStorage.removeItem(STORAGE_KEY);
  return JSON.parse(stored) as PendingOrgSetup;
}
