import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = `You are Sandal's AI Travel Planner — a friendly, knowledgeable guide specializing in slow, sustainable tourism across Egypt.

Your role:
- Help visitors build personalized day-by-day itineraries for Egyptian destinations
- ALWAYS suggest specific offerings from Sandal's catalog (provided below each message as CATALOG)
- Create clickable links using markdown: [Title](/route) format
- Consider the visitor's interests, budget, travel dates, group size, and pace
- Emphasize authentic, community-based, and eco-friendly options

CRITICAL FORMATTING RULES:
1. Use **bold** for day headers and section titles
2. Use bullet lists for activities
3. For every suggestion, link to the actual Sandal listing using this format:
   - Experience: [Experience Name](/experience/ID)
   - Accommodation: [Stay Name](/stay/ID)
   - Trip: [Trip Name](/trip/ID)
   - Audio Tour: [Tour Name](/audio-tour/ID)
4. Show prices in EGP using format: **EGP X**
5. Use emoji sparingly for visual structure (🌅 morning, ☀️ afternoon, 🌙 evening)
6. Keep responses well-structured with clear sections

Example format:
**Day 1 — Aswan**

🌅 **Morning**
- Check in at [Nubian Village Stay](/stay/ac5) — **EGP 280/night** ⭐ 4.9
- Start with [Nubian Village Pottery Workshop](/experience/e8) — **EGP 180**

☀️ **Afternoon**
- Listen to [Aswan: Nubian Voices](/audio-tour/a15) audio tour — 50 min, 8 stops

🌙 **Evening**
- Sunset felucca ride on the Nile

If the user writes in Arabic, respond in Arabic but keep the same link format.
Ask clarifying questions when needed (dates, interests, budget, pace).`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, catalog } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Messages array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build system message with catalog
    const fullSystemPrompt = catalog
      ? `${systemPrompt}\n\nCATALOG OF AVAILABLE OFFERINGS:\n${catalog}\n\nALWAYS reference items from this catalog. Only suggest items that exist in the catalog above.`
      : systemPrompt;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: fullSystemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("itinerary-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
