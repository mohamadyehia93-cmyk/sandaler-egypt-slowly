## Goal
Make the provider role flow actually work so a real user can: sign up → log in → choose a provider role → land on the right dashboard → upload their offering/content. Then test all 8 roles end to end.

## Root cause (why it's broken today)
- `useUserRole` derives a user's role **only** from the `providers` table (`providers.user_id = auth.uid()`) — this is the secure design and is correct.
- The onboarding screen (`Splash.tsx`) lets a user pick a provider role, but its `handleFinish` calls `setRole(...)`, which in the hardened `useUserRole` is a **no-op for every non-visitor role**. It only writes to `localStorage`, which the role system ignores.
- **Nothing in the app ever inserts a row into `providers`** for the signed-up user. The RLS insert policy exists (`auth.uid() = user_id`) but is never used.
- The 8 seeded `providers` rows all have `user_id = NULL`, so they belong to no account.
- Onboarding (`/welcome`) is only reachable from Settings — it is not part of the signup flow, so a new user never even gets there.

Net result: every account stays a "visitor" forever and can never reach a dashboard or upload anything.

## Plan

### 1. Enable auto-confirm email (auth setting)
Turn on auto-confirm so test (and real) signups can log in immediately without inbox access. Project-wide auth setting.

### 2. Database: one provider profile per user
Add a partial unique index on `providers.user_id` (where `user_id is not null`) so:
- a user can have at most one provider profile, and
- we can safely `upsert` on `user_id`.

(The existing insert RLS policy `auth.uid() = user_id` already allows the user to create their own row; we'll add an update policy scoped the same way if not present, so re-selecting a role updates the existing row.)

### 3. Wire onboarding role selection to persist the role
Create a small helper `becomeProvider(role)` that upserts a `providers` row for the current user:
- `user_id` = `auth.uid()`
- `role` = selected provider role
- `name_en` / `name_ar` = the user's display name (from profile / auth metadata), falling back to the email local-part (both are NOT NULL)
- `slug` = generated from the name + a short unique suffix

Update `Splash.tsx` `handleFinish`:
- If the chosen role is a provider role and the user **is logged in** → call `becomeProvider(role)`, then navigate to that role's dashboard. `useUserRole` re-reads `providers` and grants access.
- If the chosen role is a provider role and the user is **not logged in** → stash the selection in `sessionStorage` and send them to `/signup?next=/welcome`; on return to `/welcome` while authenticated, auto-complete the provider creation.
- Visitor path is unchanged.

### 4. Make the role flow reachable
- Add a clear "Become a host / provider" entry on the Profile page that routes a logged-in visitor to `/welcome` (Settings already links there).
- Ensure `/welcome` behaves correctly when already authenticated.

### 5. Test the full cycle for all 8 roles
Enable auto-confirm, then for each role (culture-actor, service-provider, who's-who, organization, ambassador, product-seller, trip-organizer, subject-expert):
1. Sign up a test account and log in.
2. Go through onboarding and pick the role → confirm it lands on the correct dashboard.
3. Open that role's "new …" wizard, fill required fields, submit.
4. Verify the row is created in the DB (experiences / products / trips / events / etc.) and that RLS accepted it.

I'll report a pass/fail matrix per role with any wizard or RLS issues found, and fix blockers as they come up.

## Technical notes
- Upload RLS already only requires `provider_id/seller_id/organizer_id = auth.uid()`, so once a user has a provider role and reaches the wizard, submits should pass.
- `useUserRole` uses `.maybeSingle()` on `providers`, so the unique-per-user constraint (step 2) is required to avoid errors.
- `RouteGuard` redirects providers away from visitor-only pages but does not block visitors from dashboards by URL; role gating still works because `dashboardPath` is null for visitors. No change needed there for this fix.
- Roles outside the 8 dashboard roles (e.g. `accommodation-host`, `transport-provider` seeds) are not selectable in onboarding and remain unaffected.
