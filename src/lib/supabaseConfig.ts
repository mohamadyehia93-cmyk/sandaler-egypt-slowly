/**
 * Resolved backend configuration.
 *
 * The project URL and publishable (anon) key are public values — they ship in the
 * browser bundle and are protected by Row Level Security. When a build runs without
 * the VITE_SUPABASE_* env vars (which previously produced a blank published page),
 * we fall back to the known project values so the app still boots.
 *
 * vite.config.ts applies the same fallbacks to `import.meta.env` at build time, so
 * the auto-generated `src/integrations/supabase/client.ts` also resolves correctly
 * without being edited.
 */

export const FALLBACK_SUPABASE_URL = "https://meacccbwpzrrcoanlojw.supabase.co";
export const FALLBACK_SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lYWNjY2J3cHpycmNvYW5sb2p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MjI1OTIsImV4cCI6MjA5MDk5ODU5Mn0.0tiOl8gFP5JEwp8apSWNSDLHHCI-4P1EOQeuAxljV-w";

const clean = (value: unknown) =>
  typeof value === "string" && value.trim() !== "" && value !== "undefined" ? value.trim() : undefined;

export const SUPABASE_URL =
  clean(import.meta.env.VITE_SUPABASE_URL) ?? FALLBACK_SUPABASE_URL;

export const SUPABASE_PUBLISHABLE_KEY =
  clean(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) ?? FALLBACK_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = () =>
  Boolean(clean(SUPABASE_URL) && clean(SUPABASE_PUBLISHABLE_KEY));
