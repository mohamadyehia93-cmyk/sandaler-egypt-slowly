# Smoother role switching

## Problem today

Switching role sends the user to `/welcome`, the full onboarding flow: pick a statement, region, city, name/Arabic name/bio/photo, then a role quiz, and only at the end a "you already have a role" confirmation dialog. For someone who already has a provider profile that is 6+ screens of re-typing data the app already stores, and the conflict warning appears last instead of first.

## What we build

A single dedicated switch screen, reachable from Settings and from the wrong-role dashboard card.

1. **New page `/switch-role`** (mobile-first, bilingual AR/EN, RTL-safe)
   - Shows the current role at the top ("You are currently: Service Provider").
   - Lists the 5 self-serve roles as plain-language statement cards (same wording as onboarding intents), with the current one marked and unselectable.
   - Also offers "Just browsing / visitor mode" as a way out of a provider role.
   - One tap on a card → one short confirmation sheet stating exactly what happens: the role changes, the existing public profile for the old role is hidden, listings are kept. Confirm → done.
   - No region, city, name, bio, photo or quiz steps. The existing provider profile (name, city, photo, WhatsApp) is reused as-is.
   - On success: refresh the verified role from the server, then land directly on the new dashboard. No intermediate screens.

2. **Settings** — "Switch role" now goes to `/switch-role` for accounts that already have a provider role; accounts with no role still go to `/welcome` (they genuinely need onboarding). Label splits accordingly.

3. **Wrong-role dashboard card** — the "This dashboard isn't for your account" state gets a "Switch to this role" button that goes straight to `/switch-role` pre-selecting the role that dashboard needs, so a one-tap confirm resolves it.

4. **`/welcome` shortcut** — if a signed-in user with an existing provider role opens onboarding, show a short banner offering the quick switch instead of walking the whole flow. The full flow stays available for anyone who wants to update their details.

5. **Who's Who stays out** — it is invitation-only; it is never listed as a switch target. A Who's Who holder can switch away from it like any other role.

## Technical notes

- New `src/pages/SwitchRole.tsx`; route added in `App.tsx` behind the existing provider/auth guard, plus `/switch-role` allowed in `RouteGuard`.
- Reuses `becomeProvider(role, undefined, { force: true })` — no `details` payload, so the stored provider row keeps its name/city/photo and only `role` changes; the old satellite is unpublished and a satellite for the new role is created by the existing helper.
- After success, `await refreshRole()` from `useUserRole` before navigating, so `DashboardGate` sees the new role (this is the fix already applied for the blocking card).
- Role labels come from `providerIntents.ts` so wording stays identical to onboarding.
- Errors surface via the existing `providerErrorMessage` toast; satellite failure shows the existing "profile created but public listing failed" message rather than a silent success.
- No schema changes, no change to stored role values.

## Verification

Typecheck, lint, build; then walk Arabic at 390px: Settings → switch → confirm → new dashboard renders with no wrong-role card, and the reverse switch back works. Any test account created is deleted afterwards.
