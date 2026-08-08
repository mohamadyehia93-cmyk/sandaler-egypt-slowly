import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "my_event_tickets",
  title: "My event tickets",
  description: "List the signed-in user's event ticket orders with reference code, quantity and total in EGP.",
  inputSchema: {
    limit: z.number().int().min(1).max(50).default(20).describe("Maximum results to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const { data, error } = await supabaseForUser(ctx)
      .from("event_tickets")
      .select("id, reference, event_id, attendee_name, quantity, total_egp, status, created_at")
      .eq("user_id", ctx.getUserId()!)
      .order("created_at", { ascending: false })
      .limit(limit ?? 20);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { tickets: data ?? [] },
    };
  },
});
