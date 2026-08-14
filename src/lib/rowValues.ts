/**
 * Small readers for loosely-typed Supabase rows (`Record<string, unknown>`).
 * They never invent a value — they only narrow what the row actually holds.
 */
export const str = (v: unknown): string => (typeof v === "string" ? v : "");

export const numStr = (v: unknown): string =>
  v === null || v === undefined || v === "" ? "" : String(v);

export const num = (v: unknown): number => (typeof v === "number" ? v : Number(v) || 0);

export const strArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.length > 0) : [];
