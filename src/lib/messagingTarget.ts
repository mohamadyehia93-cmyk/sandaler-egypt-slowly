import { supabase } from "@/integrations/supabase/client";

/**
 * Messaging identity boundary.
 *
 * `conversations.participant_1/2` MUST hold auth user ids. Detail pages, however,
 * naturally hold *record* ids (`providers.id`, `culture_actors.id`). Passing one of
 * those straight into a conversation creates a thread the real host can never see.
 *
 * Every conversation-creating path funnels through `resolveUserIdForMessaging`,
 * so no call site can write the wrong kind of id again.
 */
export type MessagingTargetKind = "user" | "provider" | "culture_actor" | "auto";

export interface MessagingTarget {
  /** auth user id, or null when it could not be resolved */
  userId: string | null;
  /** true when the target record exists but has not been claimed by a real account */
  unclaimed: boolean;
}

const NOT_FOUND: MessagingTarget = { userId: null, unclaimed: false };

async function fromProvider(id: string): Promise<MessagingTarget | null> {
  const { data } = await supabase.from("providers").select("user_id").eq("id", id).maybeSingle();
  if (!data) return null;
  return { userId: data.user_id ?? null, unclaimed: !data.user_id };
}

async function fromCultureActor(id: string): Promise<MessagingTarget | null> {
  const { data } = await supabase.from("culture_actors").select("user_id").eq("id", id).maybeSingle();
  if (!data) return null;
  return { userId: data.user_id ?? null, unclaimed: !data.user_id };
}

async function asAuthUser(id: string): Promise<MessagingTarget | null> {
  // profiles.user_id is created by trigger for every real account, so a hit here
  // proves the id belongs to an auth user.
  const { data } = await supabase.from("profiles").select("user_id").eq("user_id", id).maybeSingle();
  return data ? { userId: data.user_id, unclaimed: false } : null;
}

export async function resolveUserIdForMessaging(
  id: string,
  kind: MessagingTargetKind = "auto",
): Promise<MessagingTarget> {
  if (!id) return NOT_FOUND;

  if (kind === "user") return (await asAuthUser(id)) ?? NOT_FOUND;
  if (kind === "provider") return (await fromProvider(id)) ?? NOT_FOUND;
  if (kind === "culture_actor") return (await fromCultureActor(id)) ?? NOT_FOUND;

  // auto: a real account wins, then the two record tables.
  return (
    (await asAuthUser(id)) ??
    (await fromProvider(id)) ??
    (await fromCultureActor(id)) ??
    NOT_FOUND
  );
}
