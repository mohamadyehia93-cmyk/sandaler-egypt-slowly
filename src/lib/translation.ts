import { supabase } from "@/integrations/supabase/client";

export type Lang = "en" | "ar";

export type FieldProvenance = { source: "human" | "machine"; at?: string; from?: Lang };
export type TranslationMeta = Record<string, FieldProvenance>;

/** Calls the translate-text edge function. Never throws — always returns a result object. */
export async function translateText(args: {
  text: string;
  from: Lang;
  to: Lang;
  context?: string;
}): Promise<{ ok: true; translation: string } | { ok: false; error: string }> {
  const text = args.text.trim();
  if (!text) return { ok: false, error: "Nothing to translate" };
  try {
    const { data, error } = await supabase.functions.invoke("translate-text", {
      body: { text, from: args.from, to: args.to, context: args.context ?? "" },
    });
    if (error) return { ok: false, error: error.message || "Translation failed" };
    if (data?.ok && typeof data.translation === "string" && data.translation.trim()) {
      return { ok: true, translation: data.translation.trim() };
    }
    return { ok: false, error: (data?.error as string) || "Translation failed" };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Translation failed" };
  }
}

export function markMachine(meta: TranslationMeta, field: string, from: Lang): TranslationMeta {
  return { ...meta, [field]: { source: "machine", at: new Date().toISOString(), from } };
}

export function markHuman(meta: TranslationMeta, field: string): TranslationMeta {
  return { ...meta, [field]: { source: "human" } };
}

export function isMachine(meta: unknown, field: string): boolean {
  if (!meta || typeof meta !== "object") return false;
  const entry = (meta as TranslationMeta)[field];
  return !!entry && entry.source === "machine";
}

export const machineLabel = (lang: Lang) =>
  lang === "ar" ? "ترجمة آلية" : "Machine translated";
