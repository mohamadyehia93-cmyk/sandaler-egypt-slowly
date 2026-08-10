import { supabase } from "@/integrations/supabase/client";

/** Build a URL-safe slug from a title, optionally suffixed (e.g. with a short id). */
export function slugify(input: string, suffix?: string): string {
  const base =
    input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 48) || "item";
  return suffix ? `${base}-${suffix}` : base;
}

/**
 * Upload a list of image files to a public storage bucket scoped under the
 * user's id and return their public URLs. Mirrors the pattern used by the
 * working NewExperience flow.
 */
export async function uploadImages(
  files: File[],
  userId: string,
  bucket = "listing-images"
): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const ext = file.name.split(".").pop();
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}

/** Audio formats accepted for narration uploads. */
export const AUDIO_ACCEPT = "audio/mpeg,audio/mp3,audio/mp4,audio/m4a,audio/x-m4a,audio/aac,audio/wav,audio/x-wav,audio/ogg,audio/webm";

/** Max narration file size: 25 MB — roughly 25 min of 128 kbps mp3, enough for
 *  a full walking-tour narration while staying inside the storage upload limit. */
export const MAX_AUDIO_BYTES = 25 * 1024 * 1024;

export class AudioUploadError extends Error {}

/**
 * Upload one narration file to the `audio-files` bucket under the owner's user
 * id folder (required by the storage RLS policies — the first path segment must
 * equal auth.uid()) and return its public URL.
 */
export async function uploadAudio(
  file: File,
  userId: string,
  bucket = "audio-files"
): Promise<string> {
  if (file.size > MAX_AUDIO_BYTES) {
    throw new AudioUploadError(
      `Audio file is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 25 MB.`
    );
  }
  const ext = (file.name.split(".").pop() || "mp3").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type || undefined });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

