import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';

export type StorageBucket = 'avatars' | 'property-images';

export interface PickedImage {
  uri: string;
  base64: string;
  mimeType: string;
}

/**
 * Opens the device image picker and returns the picked image's base64 data,
 * or null if the user cancelled or permission was denied.
 */
export async function pickImage(): Promise<PickedImage | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.7,
    base64: true,
  });

  if (result.canceled || result.assets.length === 0) return null;
  const asset = result.assets[0];
  const mimeType = asset.mimeType ?? 'image/jpeg';

  if (asset.base64) {
    return { uri: asset.uri, base64: asset.base64, mimeType };
  }

  // Fallback for platforms where base64 isn't returned directly by the picker.
  const base64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: 'base64' });
  return { uri: asset.uri, base64, mimeType };
}

/**
 * Uploads a picked image to the given Supabase Storage bucket under `path`
 * and returns its public URL.
 */
export async function uploadImage(bucket: StorageBucket, path: string, image: PickedImage): Promise<string> {
  const { error } = await supabase.storage.from(bucket).upload(path, decode(image.base64), {
    contentType: image.mimeType,
    upsert: true,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Convenience helper: pick an image and upload it in one step. Returns the
 * public URL, or null if the user cancelled.
 */
export async function pickAndUploadImage(bucket: StorageBucket, path: string): Promise<string | null> {
  const image = await pickImage();
  if (!image) return null;
  return uploadImage(bucket, path, image);
}
