import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function genDescriptions(title: string, city: string, stops: any[]) {
  const stopsBrief = stops.map((s, i) => ({ i, label_en: s.label_en, label_ar: s.label_ar }));
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content:
            "You write concise bilingual (EN + AR) one-sentence stop descriptions for walking audio tours. Each description is 12-22 words, vivid, factual, focused on what the visitor sees/hears at that exact spot. Never repeat the stop name.",
        },
        {
          role: "user",
          content: `Audio tour: ${title} (city: ${city}).\nStops:\n${JSON.stringify(
            stopsBrief
          )}\n\nReturn STRICT JSON: {"items":[{"i":int,"desc_en":str,"desc_ar":str}]} aligned by i.`,
        },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) throw new Error(`AI ${res.status}: ${await res.text()}`);
  const body = await res.json();
  const parsed = JSON.parse(body.choices[0].message.content);
  const map = new Map<number, any>(parsed.items.map((it: any) => [it.i, it]));
  return stops.map((_, i) => ({
    desc_en: map.get(i)?.desc_en || "",
    desc_ar: map.get(i)?.desc_ar || "",
  }));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Require authenticated admin (claims.sub present + has_role admin)
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authClient = createClient(SUPABASE_URL, ANON_KEY);
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supa = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: isAdmin, error: roleError } = await supa.rpc("has_role", {
      _user_id: claimsData.claims.sub,
      _role: "admin",
    });
    if (roleError || !isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden: admin role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: tours, error } = await supa
      .from("audio_tours")
      .select("id, title_en, city_id, stops");
    if (error) throw error;

    const results: any[] = [];
    for (const t of tours || []) {
      const stops = (t.stops as any[]) || [];
      if (stops.length === 0) continue;
      // Skip if all stops already have descriptions
      if (stops.every((s) => s.desc_en && s.desc_ar)) {
        results.push({ id: t.id, skipped: true });
        continue;
      }
      try {
        const descs = await genDescriptions(t.title_en, t.city_id || "Egypt", stops);
        const merged = stops.map((s, i) => ({ ...s, desc_en: descs[i].desc_en, desc_ar: descs[i].desc_ar }));
        const { error: upErr } = await supa
          .from("audio_tours")
          .update({ stops: merged })
          .eq("id", t.id);
        if (upErr) throw upErr;
        results.push({ id: t.id, updated: stops.length });
      } catch (e) {
        results.push({ id: t.id, error: (e as Error).message });
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
