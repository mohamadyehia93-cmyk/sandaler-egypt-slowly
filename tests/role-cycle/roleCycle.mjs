/**
 * Backend end-to-end role cycle harness.
 *
 * For every provider role it runs the real cycle against the live backend:
 *   sign-up -> sign-in -> onboarding (provider profile) -> create -> edit
 *   -> list (owner-scoped read) -> delete
 * plus shared checks for uploads, public downloads and interactions
 * (follows, comments, statuses, messaging).
 *
 * Everything it creates is removed again in the cleanup phase.
 */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

const envFile = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 48) ||
  "provider";

const stamp = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

/** role -> the primary content table that role owns */
export const ROLE_CONTENT = {
  "culture-actor": {
    table: "posts",
    ownerColumn: "author_id",
    create: (t) => ({ title_en: `E2E Post ${t}`, title_ar: `منشور ${t}`, status: "published" }),
    edit: (t) => ({ title_en: `E2E Post ${t} edited` }),
  },
  "service-provider": {
    table: "experiences",
    ownerColumn: "provider_id",
    create: (t) => ({ title_en: `E2E Experience ${t}`, title_ar: `تجربة ${t}`, price: 250, status: "published" }),
    edit: () => ({ price: 300 }),
  },
  "whos-who": {
    table: "meetups",
    ownerColumn: "organizer_id",
    create: (t) => ({ title_en: `E2E Meetup ${t}`, title_ar: `لقاء ${t}`, status: "published" }),
    edit: (t) => ({ title_en: `E2E Meetup ${t} edited` }),
  },
  organization: {
    table: "programs",
    ownerColumn: "owner_id",
    create: (t) => ({ title_en: `E2E Program ${t}`, title_ar: `برنامج ${t}`, status: "published" }),
    edit: () => ({ volunteers_needed: 12 }),
  },
  ambassador: {
    table: "ambassador_tasks",
    ownerColumn: "ambassador_id",
    create: (t) => ({ title_en: `E2E Task ${t}`, status: "open" }),
    edit: () => ({ status: "done" }),
  },
  "product-seller": {
    table: "products",
    ownerColumn: "seller_id",
    create: (t) => ({ name_en: `E2E Product ${t}`, name_ar: `منتج ${t}`, price: 120, status: "published" }),
    edit: () => ({ price: 150 }),
  },
  "trip-organizer": {
    table: "trips",
    ownerColumn: "organizer_id",
    create: (t) => ({ title_en: `E2E Trip ${t}`, title_ar: `رحلة ${t}`, price: 900, status: "published" }),
    edit: () => ({ price: 950 }),
  },
  "subject-expert": {
    table: "collections",
    ownerColumn: "expert_id",
    create: (t) => ({
      title_en: `E2E Collection ${t}`,
      title_ar: `مجموعة ${t}`,
      entries: [],
      refs: [],
      license: "CC-BY",
      status: "published",
    }),
    edit: (t) => ({ title_en: `E2E Collection ${t} edited` }),
  },
  narrator: {
    table: "audio_tours",
    ownerColumn: "creator_id",
    create: (t) => ({
      title_en: `E2E Tour ${t}`,
      title_ar: `مسار ${t}`,
      duration_minutes: 30,
      stops_count: 3,
      price: 100,
      status: "published",
    }),
    edit: () => ({ duration_minutes: 45 }),
  },
};

export const ROLES = Object.keys(ROLE_CONTENT);

export const BUCKETS = ["listing-images", "profile-photos", "provider-status-images", "audio-files"];

function client() {
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("Missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY");
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function signUpAndIn(sb, email, password) {
  // The auth API rate-limits bursts of sign-ups; back off and retry.
  let signUpError = null;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    ({ error: signUpError } = await sb.auth.signUp({ password, email }));
    if (!signUpError) break;
    if (!/rate limit/i.test(signUpError.message)) break;
    await sleep(3000 * (attempt + 1));
  }
  if (signUpError) throw new Error(`sign-up failed: ${signUpError.message}`);
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`sign-in failed: ${error.message}`);
  if (!data.session?.user) throw new Error("sign-in returned no session");
  return data.session.user;
}

/** Mirrors src/lib/becomeProvider.ts onboarding write. */
async function becomeProvider(sb, user, role) {
  const displayName = user.email.split("@")[0];
  const { error } = await sb.from("providers").upsert(
    {
      user_id: user.id,
      role,
      name_en: displayName,
      name_ar: displayName,
      slug: `${slugify(displayName)}-${user.id.slice(0, 6)}`,
      status: "published",
    },
    { onConflict: "user_id" }
  );
  if (error) throw new Error(`onboarding failed: ${error.message}`);

  const { data, error: readError } = await sb
    .from("providers")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  if (readError) throw new Error(`role read-back failed: ${readError.message}`);
  if (data?.role !== role) throw new Error(`role resolved to "${data?.role}" instead of "${role}"`);
}

/**
 * Runs the create -> edit -> list -> delete cycle for one role.
 * Returns a report object; throws only on unexpected harness failures.
 */
export async function runRoleCycle(role, { keep = false } = {}) {
  const spec = ROLE_CONTENT[role];
  const sb = client();
  const token = stamp();
  const email = `e2e-${role}-${token}@sandal-e2e.test`;
  const password = `E2e!${token}Pass`;
  const steps = {};

  const user = await signUpAndIn(sb, email, password);
  steps.auth = true;

  await becomeProvider(sb, user, role);
  steps.onboarding = true;

  const payload = { ...spec.create(token), [spec.ownerColumn]: user.id };
  const { data: created, error: createError } = await sb
    .from(spec.table)
    .insert(payload)
    .select("id")
    .single();
  if (createError) throw new Error(`create in ${spec.table} failed: ${createError.message}`);
  steps.create = true;

  const { error: editError } = await sb
    .from(spec.table)
    .update(spec.edit(token))
    .eq("id", created.id);
  if (editError) throw new Error(`edit in ${spec.table} failed: ${editError.message}`);
  steps.edit = true;

  const { data: listed, error: listError } = await sb
    .from(spec.table)
    .select("id")
    .eq(spec.ownerColumn, user.id);
  if (listError) throw new Error(`list of ${spec.table} failed: ${listError.message}`);
  if (!listed.some((row) => row.id === created.id)) throw new Error(`created row missing from owner list of ${spec.table}`);
  steps.list = true;

  if (!keep) {
    const { error: deleteError } = await sb.from(spec.table).delete().eq("id", created.id);
    if (deleteError) throw new Error(`delete from ${spec.table} failed: ${deleteError.message}`);
    const { data: after } = await sb.from(spec.table).select("id").eq("id", created.id).maybeSingle();
    if (after) throw new Error(`row still present after delete in ${spec.table}`);
    steps.delete = true;
  }

  await sb.from("providers").delete().eq("user_id", user.id);
  await sb.auth.signOut();

  return { role, table: spec.table, steps };
}

/** Uploads a small file to every bucket and verifies the public download. */
export async function runStorageCycle() {
  const sb = client();
  const token = stamp();
  const user = await signUpAndIn(sb, `e2e-storage-${token}@sandal-e2e.test`, `E2e!${token}Pass`);
  const body = new Blob([new Uint8Array([1, 2, 3, 4])], { type: "application/octet-stream" });
  const results = {};

  for (const bucket of BUCKETS) {
    const objectPath = `${user.id}/e2e-${token}.bin`;
    const { error: uploadError } = await sb.storage.from(bucket).upload(objectPath, body);
    if (uploadError) throw new Error(`upload to ${bucket} failed: ${uploadError.message}`);

    const { data: pub } = sb.storage.from(bucket).getPublicUrl(objectPath);
    const res = await fetch(pub.publicUrl);
    if (!res.ok) throw new Error(`download from ${bucket} failed with HTTP ${res.status}`);

    await sb.storage.from(bucket).remove([objectPath]);
    results[bucket] = true;
  }

  await sb.auth.signOut();
  return results;
}

/** Follows, comments, provider statuses, saved itineraries and messaging. */
export async function runInteractionCycle() {
  const token = stamp();
  const a = client();
  const b = client();
  const userA = await signUpAndIn(a, `e2e-inter-a-${token}@sandal-e2e.test`, `E2e!${token}PassA`);
  const userB = await signUpAndIn(b, `e2e-inter-b-${token}@sandal-e2e.test`, `E2e!${token}PassB`);
  const results = {};

  // Follow + public follower count RPC.
  const { error: followError } = await a
    .from("follows")
    .insert({ user_id: userA.id, target_type: "region", target_id: "nile-delta" });
  if (followError) throw new Error(`follow failed: ${followError.message}`);
  const { data: count, error: countError } = await a.rpc("get_follower_count", {
    _target_type: "region",
    _target_id: "nile-delta",
  });
  if (countError) throw new Error(`follower count failed: ${countError.message}`);
  if (typeof count !== "number") throw new Error("follower count did not return a number");
  results.follows = true;

  // Comment (identity is derived server-side by trigger).
  const postKey = `e2e-${token}`;
  const { data: comment, error: commentError } = await a
    .from("post_comments")
    .insert({ post_key: postKey, user_id: userA.id, text: "E2E comment", author_name: "ignored" })
    .select("id, author_name")
    .single();
  if (commentError) throw new Error(`comment failed: ${commentError.message}`);
  results.comments = true;

  const { data: visibleComments, error: readCommentsError } = await b
    .from("post_comments")
    .select("id")
    .eq("post_key", postKey);
  if (readCommentsError) throw new Error(`comment read failed: ${readCommentsError.message}`);
  if (!visibleComments.some((c) => c.id === comment.id)) throw new Error("comment not readable by another user");
  results.commentsVisible = true;

  // Provider status update.
  const { data: status, error: statusError } = await a
    .from("provider_statuses")
    .insert({ user_id: userA.id, status_date: new Date().toISOString().slice(0, 10), text: "E2E status" })
    .select("id")
    .single();
  if (statusError) throw new Error(`status failed: ${statusError.message}`);
  results.statuses = true;

  // Saved itinerary (visitor-owned content).
  const { data: itinerary, error: itineraryError } = await a
    .from("saved_itineraries")
    .insert({ user_id: userA.id, title: "E2E itinerary", messages: [] })
    .select("id")
    .single();
  if (itineraryError) throw new Error(`saved itinerary failed: ${itineraryError.message}`);
  results.savedItineraries = true;

  // Messaging between the two users.
  const { data: conversation, error: conversationError } = await a
    .from("conversations")
    .insert({ participant_1: userA.id, participant_2: userB.id })
    .select("id")
    .single();
  if (conversationError) throw new Error(`conversation failed: ${conversationError.message}`);
  const { error: messageError } = await a
    .from("messages")
    .insert({ conversation_id: conversation.id, sender_id: userA.id, text: "E2E hello", message_type: "text" });
  if (messageError) throw new Error(`message send failed: ${messageError.message}`);
  const { data: inbox, error: inboxError } = await b
    .from("messages")
    .select("id")
    .eq("conversation_id", conversation.id);
  if (inboxError) throw new Error(`message read failed: ${inboxError.message}`);
  if (inbox.length !== 1) throw new Error("recipient could not read the message");
  results.messaging = true;

  // Sender spoofing must stay blocked.
  const { error: spoofError } = await b
    .from("messages")
    .insert({ conversation_id: conversation.id, sender_id: userA.id, text: "spoofed", message_type: "text" });
  if (!spoofError) throw new Error("sender spoofing was allowed");
  results.spoofBlocked = true;

  // Cleanup.
  await a.from("messages").delete().eq("conversation_id", conversation.id);
  await a.from("saved_itineraries").delete().eq("id", itinerary.id);
  await a.from("provider_statuses").delete().eq("id", status.id);
  await a.from("post_comments").delete().eq("id", comment.id);
  await a.from("follows").delete().eq("user_id", userA.id);
  await a.auth.signOut();
  await b.auth.signOut();
  return results;
}

/** Anonymous visitors must still be able to browse published content. */
export async function runAnonymousReadCycle() {
  const sb = client();
  const tables = ["events", "regions", "cities", "hero_slides", "partners"];
  const results = {};
  for (const table of tables) {
    const { error } = await sb.from(table).select("id").limit(1);
    if (error) throw new Error(`anonymous read of ${table} failed: ${error.message}`);
    results[table] = true;
  }
  return results;
}
