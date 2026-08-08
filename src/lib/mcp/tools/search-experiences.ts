import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "search_experiences",
  title: "Search experiences",
  description:
    "Search bookable Egypt experiences by keyword, theme, or maximum price. Returns title, region, theme, price in EGP and rating.",
  inputSchema: {
    query: z.string().trim().optional().describe("Keyword matched against the English title."),
    theme: z.string().trim().optional().describe("Theme filter, e.g. culture, nature, food."),
    max_price: z.number().positive().optional().describe("Maximum price in EGP."),
    limit: z.number().int().min(1).max(50).default(10).describe("Maximum results to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, theme, max_price, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    let q = supabaseForUser(ctx)
      .from("experiences")
      .select("id, slug, title_en, title_ar, theme, price, rating, region_id, city_id, duration_minutes")
      .limit(limit ?? 10);
    if (query) q = q.ilike("title_en", `%${query}%`);
    if (theme) q = q.eq("theme", theme);
    if (typeof max_price === "number") q = q.lte("price", max_price);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { experiences: data ?? [] },
    };
  },
});
