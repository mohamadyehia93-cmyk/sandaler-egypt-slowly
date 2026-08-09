# Blank published page — diagnosis and fix

## What I found

Confirmed root cause: **the published bundle was built without the Supabase environment variables.**

Evidence:
- Loading the published site in a headless browser: `root` element renders 0 bytes of HTML and a single uncaught page error — `supabaseUrl is required.` Nothing else logs, no failed requests.
- Downloading the live bundle `/assets/index-Bj0xCN5l.js` (1.75 MB, HTTP 200): it contains **zero** occurrences of the project URL (`*.supabase.co`) and zero occurrences of the publishable key. Vite inlines these at build time, so their absence means `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` were unset for that build.
- `src/integrations/supabase/client.ts` calls `createClient(SUPABASE_URL, KEY)` at module scope. With `undefined` it throws during module evaluation — before React renders — so the whole app dies with a white screen. The Sentry error boundary cannot catch it (it happens outside render).

Ruled out:
- **Build failure** — production build completes cleanly (exit 0, PWA precache generated, only a chunk-size warning).
- **Local prod bundle** — serving the built `dist` locally renders the full home page, no page errors (only two Unsplash images blocked in the sandbox).
- **Hardcoded preview-only origins** — none. Auth/booking redirects all use `window.location.origin`; SEO/edge-function fallbacks correctly use the published domain.
- **Prerender/hydration mismatch** — published HTML ships an empty `<div id="root">`, so `createRoot` is used, not `hydrateRoot`.
- **Assets/service worker** — HTML, JS, CSS and `sw.js` all return 200; no stale-module preload errors.

Locally `.env` does contain all three `VITE_SUPABASE_*` values, which is why preview works. Only the publish build lacked them.

## Fix

1. Re-publish so the build picks up the current `.env` values, then re-verify the live bundle contains the project URL and that the home page renders.
2. Add a fail-loud guard so this never presents as a silent white screen again: if `VITE_SUPABASE_URL` or `VITE_SUPABASE_PUBLISHABLE_KEY` is missing, render a clear "backend configuration missing" message instead of throwing during module init.
   - `src/integrations/supabase/client.ts` is auto-generated and must not be edited, so the guard goes in `src/main.tsx` (check the two env vars before importing/mounting `App`).
3. Optional: surface the same check on `/diagnostics` so config problems are visible in-app.

## Technical notes

- Guard placement matters: the throw happens at import time of the Supabase client, so the check must run in `main.tsx` before `App` (and its transitive Supabase import) is evaluated — using a dynamic `import()` of `App` after the check.
- No backend, RLS, or edge-function changes are involved.
