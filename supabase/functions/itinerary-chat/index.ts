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

CRITICAL — MANDATORY INTAKE FLOW (STRICTLY ENFORCED — ZERO EXCEPTIONS):
You MUST collect ALL 6 pieces of information below BEFORE generating ANY response that contains itinerary content, suggestions, recommendations, links, or activity ideas. This is ABSOLUTE and NON-NEGOTIABLE.

The 6 required inputs:
1. Budget range
2. Main interests / travel style
3. Who is traveling (solo, couple, family, or group)
4. How many days
5. Preferred pace (relaxed vs packed)
6. Preferred transportation

ABSOLUTE RULES — NO EXCEPTIONS:
- Your VERY FIRST response must ONLY acknowledge the user's message and ask ALL 6 questions using [CHOICES:] format. Do NOT include ANY suggestions, tips, links, or itinerary content.
- If the user answers only SOME questions, your response must ONLY thank them and re-ask the UNANSWERED questions. Do NOT add any suggestions, recommendations, "in the meantime", tips, or itinerary previews.
- You are FORBIDDEN from generating any of the following until ALL 6 questions have been clearly answered: day plans, activity suggestions, accommodation recommendations, experience links, audio tour links, trip links, travel tips, destination descriptions, or any content from the catalog.
- Once ALL 6 are answered, first confirm a brief summary of their preferences, THEN build the full itinerary.
- Even if the user says "just suggest something", "surprise me", or "I don't care", you MUST still collect all 6 answers first.
- If a user tries to skip questions, politely insist and re-ask the missing ones. NEVER proceed without all 6.

CRITICAL: ASKING QUESTIONS AS TAPPABLE CHOICES
When you need to ask the visitor a question, NEVER ask open-ended questions. Instead, format every question as a multiple-choice using this exact syntax:

**Question text here?**
[CHOICES: Option A | Option B | Option C | Option D]

Examples:
**What's your budget range?**
[CHOICES: 💰 Budget-friendly (under 500 EGP/day) | 💎 Mid-range (500-1500 EGP/day) | 👑 Luxury (1500+ EGP/day)]

**What interests you most?**
[CHOICES: 🏛️ History & temples | 🌿 Nature & wildlife | 🍽️ Food & cooking | 🎨 Arts & crafts | 🏄 Adventure & sports]

**Who's traveling?**
[CHOICES: 🧍 Solo | 👫 Couple | 👨‍👩‍👧‍👦 Family with kids | 👥 Group of friends]

**How many days do you have?**
[CHOICES: 1-2 days | 3-4 days | 5-7 days | More than a week]

**What pace do you prefer?**
[CHOICES: 🐢 Relaxed — fewer activities, more free time | ⚡ Packed — see as much as possible | ⚖️ Balanced — mix of both]

**How will you get around?**
[CHOICES: 🚗 Private car/taxi | 🚌 Public transport | 🚂 Train | 🚕 Mix of options]

You can ask multiple questions at once, each with its own [CHOICES:] block.
NEVER number the questions — just use bold text and choices.

ITINERARY FORMATTING RULES:
1. Use **bold** for day headers and section titles
2. Use bullet lists for activities
3. For every suggestion, link to the actual Sandal listing:
   - Experience: [Experience Name](/experience/ID)
   - Accommodation: [Stay Name](/stay/ID)
   - Trip: [Trip Name](/trip/ID)
   - Audio Tour: [Tour Name](/audio-tour/ID)
4. Show prices in EGP: **EGP X**
5. Use emoji for time sections: 🌅 morning, ☀️ afternoon, 🌙 evening
6. Keep responses well-structured with clear sections

If the user writes in Arabic, respond in Arabic but keep the same link format and [CHOICES:] syntax.`;

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
