import { supabase } from "@/integrations/supabase/client";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function fetchByIdOrSlug(
  table: string,
  idOrSlug: string
) {
  const isUuid = UUID_RE.test(idOrSlug);
  const column = isUuid ? "id" : "slug";
  const { data, error } = await (supabase as any)
    .from(table)
    .select("*")
    .eq(column, idOrSlug)
    .maybeSingle();
  if (error) throw error;
  return data;
}
