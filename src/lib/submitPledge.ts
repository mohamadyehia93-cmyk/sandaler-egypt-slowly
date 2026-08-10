import { supabase } from "@/integrations/supabase/client";

export type PledgeKind = "donation" | "gift" | "consult";

export type PledgeInput = {
  /** Route param — may be a cause slug or a cause uuid. */
  causeIdOrSlug: string;
  supporterId: string;
  kind: PledgeKind;
  amount?: number | null;
  currency?: string;
  message?: string | null;
  details?: Record<string, unknown>;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
};

/**
 * Persists a cause-support intent. No payment is taken anywhere in this path —
 * `owner_id` and `status` are assigned server-side by the
 * support_pledges_insert_integrity trigger, so they are never trusted from the client.
 */
export const submitPledge = async (input: PledgeInput): Promise<{ error: string | null }> => {
  const { data: causeRow, error: causeError } = await supabase
    .from("causes")
    .select("id")
    .or(`slug.eq.${input.causeIdOrSlug},id.eq.${input.causeIdOrSlug}`)
    .maybeSingle();

  if (causeError) return { error: causeError.message };
  if (!causeRow) return { error: "Cause not found" };

  const { error } = await supabase.from("support_pledges").insert({
    cause_id: causeRow.id,
    supporter_id: input.supporterId,
    kind: input.kind,
    amount: input.amount ?? null,
    currency: input.currency || "EGP",
    message: input.message || null,
    details: (input.details || {}) as never,
    contact_name: input.contactName || null,
    contact_email: input.contactEmail || null,
    contact_phone: input.contactPhone || null,
  });

  return { error: error ? error.message : null };
};
