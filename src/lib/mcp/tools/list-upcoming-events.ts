import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_upcoming_events",
  title: "List upcoming events",
  description:
    "List published upcoming events, optionally filtered by keyword, category, or free-only, ordered by start date.",
  inputSchema: {
    query: z.string().trim().optional().describe("Keyword matched against the English event title."),
    category: z.string().trim().optional().describe("Event category filter."),
    free_only: z.boolean().optional().describe("Only return free events."),
    limit: z.number().int().min(1).max(50).default(10).describe("Maximum results to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, category, free_only, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const today = new Date().toISOString().slice(0, 10);
    let q = supabaseForUser(ctx)
      .from("events")
      .select("id, slug, title_en, title_ar, start_date, event_time, venue_en, location_en, category, price, is_free, capacity")
      .eq("status", "published")
      .gte("start_date", today)
      .order("start_date", { ascending: true })
      .limit(limit ?? 10);
    if (query) q = q.ilike("title_en", `%${query}%`);
    if (category) q = q.eq("category", category);
    if (free_only) q = q.eq("is_free", true);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { events: data ?? [] },
    };
  },
});
