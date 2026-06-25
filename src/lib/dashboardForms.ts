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
