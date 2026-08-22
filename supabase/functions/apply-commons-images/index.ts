// One-off maintenance function: applies mined Wikimedia Commons photography to
// seeded content rows from a JSON payload stored in the `listing-images` bucket.
// Admin-only. Safe to delete once the backfill has run.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALLOWED = new Set([
  "experiences",
  "trips",
  "events",
  "accommodations",
  "transport",
  "audio_tours",
  "posts",
  "causes",
  "products",
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // One-off maintenance token: this function is deleted right after the backfill runs.
  const TOKEN = "b7f4c1d2-commons-backfill-2026";
  if (req.headers.get("x-backfill-token") !== TOKEN) {
    return new Response("Unauthorized", { status: 401, headers: cors });
  }

  const { path = "backfill/commons-images.json" } = await req.json().catch(() => ({}));
  const file = await admin.storage.from("listing-images").download(path);
  if (file.error) {
    return new Response(JSON.stringify({ error: file.error.message }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
  const payload = JSON.parse(await file.data.text());

  const result: Record<string, number> = {};
  const errors: string[] = [];

  for (const [table, rows] of Object.entries<any[]>(payload.tables ?? {})) {
    if (!ALLOWED.has(table)) continue;
    let done = 0;
    for (const r of rows) {
      const patch: Record<string, unknown> = { image: r.image };
      if (r.images) patch.images = r.images;
      const { error } = await admin.from(table).update(patch).eq("id", r.id);
      if (error) errors.push(`${table}/${r.id}: ${error.message}`);
      else done++;
    }
    result[table] = done;
  }

  const credits = payload.credits ?? [];
  for (let i = 0; i < credits.length; i += 200) {
    const { error } = await admin
      .from("image_credits")
      .upsert(credits.slice(i, i + 200), { onConflict: "image_url" });
    if (error) errors.push(`image_credits: ${error.message}`);
  }
  result.credits = credits.length;

  return new Response(JSON.stringify({ result, errors: errors.slice(0, 20), errorCount: errors.length }), {
    headers: { ...cors, "Content-Type": "application/json" },
  });
});
