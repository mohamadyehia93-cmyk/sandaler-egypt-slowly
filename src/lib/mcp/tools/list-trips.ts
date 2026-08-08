import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_trips",
  title: "List trips",
  description: "List multi-day Egypt trips with route, duration in days, price in EGP and rating.",
  inputSchema: {
    query: z.string().trim().optional().describe("Keyword matched against the English trip title."),
    theme: z.string().trim().optional().describe("Trip theme filter."),
    max_days: z.number().int().positive().optional().describe("Maximum trip duration in days."),
    limit: z.number().int().min(1).max(50).default(10).describe("Maximum results to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, theme, max_days, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    let q = supabaseForUser(ctx)
      .from("trips")
      .select("id, slug, title_en, title_ar, route_en, duration_days, price, rating, theme, trip_type")
      .limit(limit ?? 10);
    if (query) q = q.ilike("title_en", `%${query}%`);
    if (theme) q = q.eq("theme", theme);
    if (typeof max_days === "number") q = q.lte("duration_days", max_days);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { trips: data ?? [] },
    };
  },
});
