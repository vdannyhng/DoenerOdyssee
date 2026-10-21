import * as Crypto from 'expo-crypto';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import { supabase } from '@/lib/supabase';

export const PHOTO_BUCKET = 'photos';
const MAX_EDGE = 1280;
const SIGNED_URL_SECONDS = 60 * 60 * 24;

export type PhotoSource = 'camera' | 'library';

/** Foto aufnehmen oder aus der Galerie wählen; null = abgebrochen, 'denied' = keine Berechtigung */
export async function pickPhoto(source: PhotoSource): Promise<string | null | 'denied'> {
  const permission =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return 'denied';

  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: 'images',
    quality: 0.9,
    allowsEditing: false,
  };
  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);
  return result.canceled ? null : (result.assets[0]?.uri ?? null);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Verkleinert (längste Kante 1280 px), komprimiert und lädt in den Crew-Ordner hoch. Liefert den Pfad. */
export async function uploadPhoto(crewId: string, localUri: string): Promise<string> {
  const image = await manipulateAsync(localUri, [{ resize: { width: MAX_EDGE } }], {
    compress: 0.7,
    format: SaveFormat.JPEG,
    base64: true,
  });
  if (!image.base64) throw new Error('photo_encoding_failed');
  const path = `${crewId}/${Crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, base64ToBytes(image.base64), { contentType: 'image/jpeg' });
  if (error) throw error;
  return path;
}

/** Kurzlebige Links für viele Fotos in einem Aufruf */
export async function signPhotoPaths(paths: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(paths)];
  if (!unique.length) return new Map();
  const { data, error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .createSignedUrls(unique, SIGNED_URL_SECONDS);
  // Fotos sind Beiwerk: lieber ohne Bild anzeigen als die ganze Seite scheitern lassen
  if (error || !data) return new Map();
  return new Map(data.flatMap((d) => (d.path && d.signedUrl ? [[d.path, d.signedUrl] as const] : [])));
}

export async function deletePhoto(path: string): Promise<void> {
  await supabase.storage.from(PHOTO_BUCKET).remove([path]);
}
