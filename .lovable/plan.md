## The Problem

The user asked a simple, factual question — "what are the transport options to go from Cairo to Ismailia?" — and the planner replied by demanding all 6 intake questions (budget, interests, group, days, pace, transport).

This happens because the system prompt in `supabase/functions/itinerary-chat/index.ts` enforces a blanket rule:

> "You MUST collect ALL 6 pieces of information BEFORE generating ANY response that contains itinerary content, suggestions, recommendations, links, or activity ideas... ZERO EXCEPTIONS"

The intake gate was designed for the use case "build me a full multi-day itinerary," but it fires on **every** user message, including:
- Single-fact lookups ("how do I get from A to B?", "how much does X cost?", "what's the best time to visit Aswan?")
- Catalog browsing ("show me audio tours in Luxor")
- Clarifications ("is the Nile cruise wheelchair accessible?")

The result: the chatbot feels rigid and unhelpful for anything short of a full trip plan.

## The Fix

Reframe the system prompt around **intent detection**. The 6-question intake should only trigger when the user actually wants a personalized multi-day itinerary. For one-off questions, answer directly using the catalog.

### 1. Edit `supabase/functions/itinerary-chat/index.ts`

Replace the "MANDATORY INTAKE FLOW" section with a two-mode model:

**Mode A — Direct answer mode (default for most messages):**
Trigger when the user asks a specific, scoped question such as:
- Transport / logistics ("how to get from X to Y", "best way to reach Siwa")
- Single recommendations ("a good seafood restaurant in Alexandria", "audio tours about Coptic Cairo")
- Factual questions ("opening hours", "best season", "what to pack")
- Catalog browsing ("show me trips under 2000 EGP")

In this mode: answer concisely, link to relevant catalog items where helpful, and end with a soft offer like *"Want me to build a full day-by-day itinerary around this? I'll just need a few preferences."*

**Mode B — Itinerary builder mode:**
Trigger only when the user explicitly wants a personalized multi-day plan, e.g.:
- "Plan 3 days in Luxor"
- "Build me an itinerary for Siwa"
- "Help me plan a family trip"
- The 4 quick-prompt buttons on the empty state

In this mode: collect the 6 intake answers via `[CHOICES:]` blocks before producing the full itinerary. Skip questions the user has already answered in their opening message (e.g. if they said "3 days in Luxor for a couple", don't re-ask days or group).

### 2. Refine the quick prompts (optional polish)

The 4 quick-prompt buttons on the empty state ("Plan 3 days in Luxor & Aswan", etc.) are all itinerary-builder intents — those should still trigger the intake. Keep them as is.

Consider adding 1–2 example "ask" prompts to signal the planner also handles quick questions, e.g.:
- "How do I get from Cairo to Siwa?"
- "Best time to visit Aswan?"

### 3. No frontend logic change needed

`ItineraryPlanner.tsx` is already mode-agnostic — it renders whatever the model returns, including markdown answers without `[CHOICES:]` blocks. The `parseChoices` helper handles zero-choice messages cleanly.

## Technical Details

**File touched:** `supabase/functions/itinerary-chat/index.ts` (system prompt only — no schema, no API change). Edge function auto-deploys.

**System prompt structure (new):**
```
1. Role + tone
2. INTENT DETECTION (new): decide between "direct answer" and "itinerary builder"
3. Direct-answer rules: be concise, cite catalog with markdown links, soft upsell to full planner
4. Itinerary-builder rules: collect missing intake answers via [CHOICES:], then produce day-by-day plan
5. Formatting rules (links, EGP, emoji time markers) — unchanged
6. Language mirroring (AR/EN) — unchanged
```

**Risk:** the model may occasionally misclassify intent. Mitigation: include 4–5 explicit examples in the prompt (one transport question, one factual question, one catalog browse, one "plan X days" request) so Gemini Flash has clear anchors.

## Out of Scope

- No changes to `saved_itineraries`, choice-chip UI, or catalog generation.
- No new tables or migrations.
- No model swap (still `google/gemini-3-flash-preview`).
