import { supabase } from "@/integrations/supabase/client";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function fetchByIdOrSlug<T>(
  table: string,
  idOrSlug: string,
  idColumn = "id",
  slugColumn = "slug"
): Promise<T | null> {
  const isUuid = UUID_RE.test(idOrSlug);
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq(isUuid ? idColumn : slugColumn, idOrSlug)
    .maybeSingle();
  if (error) throw error;
  return data as T | null;
}
