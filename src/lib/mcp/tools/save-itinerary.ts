import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "save_itinerary",
  title: "Save itinerary",
  description:
    "Save a trip itinerary to the signed-in user's account so it appears in the app's Trip Planner.",
  inputSchema: {
    title: z.string().trim().min(1).max(120).describe("Short itinerary title."),
    plan: z.string().trim().min(1).describe("The itinerary content, Markdown allowed."),
    destination: z.string().trim().optional().describe("Main destination, e.g. Luxor."),
    duration_days: z.number().int().min(1).max(60).optional().describe("Trip length in days."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ title, plan, destination, duration_days }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const { data, error } = await supabaseForUser(ctx)
      .from("saved_itineraries")
      .insert({
        user_id: ctx.getUserId()!,
        title,
        destination: destination ?? null,
        duration_days: duration_days ?? null,
        messages: [{ role: "assistant", content: plan }],
      })
      .select("id, title")
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Saved itinerary "${data.title}" (id ${data.id}).` }],
      structuredContent: { itinerary: data },
    };
  },
});
