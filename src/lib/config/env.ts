/**
 * Required client-side configuration.
 *
 * These are read by the generated Supabase client at module load. When any is
 * missing, `createClient` throws while the module graph is still evaluating,
 * which takes down the whole render before React mounts — the symptom is a
 * blank page with no visible error. `missingRequiredEnv` lets the entrypoint
 * detect that before importing the app, so the failure can be shown instead.
 */
export const REQUIRED_ENV_VARS = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
] as const;

export type RequiredEnvVar = (typeof REQUIRED_ENV_VARS)[number];

/** Returns the names of required env vars that are absent or blank. */
export function missingRequiredEnv(
  env: Record<string, unknown> = import.meta.env as unknown as Record<string, unknown>,
): RequiredEnvVar[] {
  return REQUIRED_ENV_VARS.filter((name) => {
    const value = env[name];
    return typeof value !== "string" || value.trim() === "";
  });
}
