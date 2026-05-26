# Monitoring & Operations Runbook

This document covers how Sandal is monitored in production and what to do when
something breaks. It reflects the monitoring infrastructure shipped in the
Production Sprint (Sentry, PostHog, the `health` Edge Function, and the public
`/status` page).

---

## 1. Health Endpoint

**Endpoint:** `GET https://<project-ref>.supabase.co/functions/v1/health`

Returns a JSON payload describing the state of critical services. Source:
`supabase/functions/health/index.ts`.

| Field      | Meaning                                                            |
| ---------- | ------------------------------------------------------------------ |
| `status`   | `healthy` (200) or `degraded` (503) — driven by database + storage |
| `database` | Latency + status of a `regions` table read                        |
| `storage`  | Latency + status of `storage.listBuckets()`                       |
| `stripe`   | `ok` / `error` / `not_configured` (non-critical, never trips 503)  |
| `version`  | `APP_VERSION` env var, or `"unknown"`                              |

Notes:
- Only **database** and **storage** failures return HTTP 503. Stripe is
  intentionally non-critical so the endpoint stays green before payments are
  activated.
- The endpoint uses `SUPABASE_SERVICE_ROLE_KEY`, which Supabase injects into
  every Edge Function automatically — no manual secret needed for the DB/storage
  checks.

**Public status page:** `/status` (`src/pages/Status.tsx`) polls this endpoint
every 30s and renders a three-state UI (loading / error / health grid). It is
`noindex` — operational tooling, not indexable content.

---

## 2. Uptime Checks (recommended setup)

Configure an external uptime monitor (UptimeRobot, BetterStack, or Pingdom) with:

| Check                | Target                                                          | Interval | Alert when            |
| -------------------- | --------------------------------------------------------------- | -------- | --------------------- |
| Health (primary)     | `/functions/v1/health`                                          | 1 min    | HTTP != 200 for 2 min |
| Home page            | `https://sandaler-egypt-slowly.lovable.app/`                    | 5 min    | HTTP != 200 for 5 min |
| Status page          | `https://sandaler-egypt-slowly.lovable.app/status`              | 5 min    | HTTP != 200 for 5 min |

> **Note:** Current live URL is `https://sandaler-egypt-slowly.lovable.app`. Update these targets
> to `https://sandal.eg` once the domain is registered (Sprint 3).

- Use a keyword check on the health monitor: alert if the response body does
  **not** contain `"status": "healthy"`. This catches a 503 `degraded` response
  even when the function itself is reachable.
- Route alerts to the on-call channel (Slack/email). Escalate after 10 min.

---

## 3. Error Tracking — Sentry

Config: `src/lib/monitoring/sentry.ts`. Initialised in `src/main.tsx`.

- **Disabled** in dev and when `VITE_SENTRY_DSN` is unset (logs a console notice).
- `tracesSampleRate: 0.1` — 10% performance traces.
- Session replay: `maskAllText` + `blockAllMedia`, 0% baseline / 100% on error.
- `beforeSend` drops events from `localhost`.

### Recommended alert rules (configure in Sentry dashboard)

| Rule                          | Condition                                  | Action            |
| ----------------------------- | ------------------------------------------ | ----------------- |
| Booking checkout failure spike | >5 errors in `useBooking` / checkout in 5m | Page on-call      |
| New error type in production  | First seen, `environment:production`       | Slack notify      |
| Error rate regression         | Error count 2× the prior 24h baseline      | Slack notify      |
| Webhook handler error         | Any error tagged `stripe-webhook`          | Page on-call      |

Wrap new top-level surfaces in `Sentry.withErrorBoundary` (the root `App` already
is — see `src/App.tsx`).

---

## 4. Product Analytics — PostHog

Config: `src/lib/analytics/posthog.ts`. Typed event helpers in
`src/hooks/useAnalytics.ts`. Privacy defaults: `maskAllInputs`, `[data-private]`
selector masking, and dev opt-out.

### Tracked events

| Event                   | Fired from                          |
| ----------------------- | ----------------------------------- |
| `trackBookingStarted`   | Checkout initiation                 |
| `trackBookingCompleted` | Successful booking confirmation     |
| `trackAudioTourStarted` | Audio tour playback start           |
| `trackContentRead`      | Story / post detail view            |
| `trackLanguageSwitched` | `LanguageToggle` (en ⇄ ar)          |

### Recommended dashboards

1. **Conversion funnel** — `trackBookingStarted` → `trackBookingCompleted`.
   Watch drop-off; a sudden cliff usually means a checkout/Stripe regression.
2. **Language split** — breakdown of `trackLanguageSwitched` by target language;
   informs how much to invest in Arabic content.
3. **Content engagement** — `trackContentRead` and `trackAudioTourStarted` by
   region; identifies which regions drive the most engagement.
4. **Acquisition** — pageviews on `/regions/*` from organic search (cross-check
   with Google Search Console once the sitemap is indexed).

---

## 5. Operational Runbook

### Health endpoint returns 503 `degraded`

1. Open `/status` to see which service is red (database or storage).
2. **Database red** → check the Supabase dashboard → Database → is the project
   paused or over quota? Check connection count and recent migrations.
3. **Storage red** → check Supabase Storage status and the
   [Supabase status page](https://status.supabase.com).
4. If both are red, it's almost always a project-level Supabase incident.

### Booking checkout failures

1. Check Sentry for the error grouped under checkout / `useBooking`.
2. Verify `STRIPE_SECRET_KEY` is set as a Supabase secret and the
   `create-booking-checkout` function is deployed.
3. Check the `stripe-webhook` function logs — a booking can be paid but stuck
   "pending" if the webhook secret is wrong. Verify `STRIPE_WEBHOOK_SECRET`.
4. Confirm the webhook endpoint is registered in the Stripe Dashboard.

### Site is up but Google isn't indexing region pages

1. Confirm `https://sandaler-egypt-slowly.lovable.app/sitemap.xml` returns 200 and lists all 6 region
   routes.
2. Confirm `npm run build` (with react-snap) produced
   `dist/regions/<slug>/index.html` with real prerendered HTML.
3. Submit the sitemap in Google Search Console and request indexing.

### Deploying a fix

All changes go through a `feat/**` or `fix/**` branch → PR to `main`. CI
(`.github/workflows/test.yml`) must be green (unit + e2e) before merge. Never
push directly to `main`; see `CONTRIBUTING.md` for the branch-protection policy.

---

## 6. Required Secrets (production)

| Secret                      | Where set         | Used by                          |
| --------------------------- | ----------------- | -------------------------------- |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto (Supabase)   | All Edge Functions               |
| `STRIPE_SECRET_KEY`         | Supabase secrets  | checkout + health Stripe check   |
| `STRIPE_WEBHOOK_SECRET`     | Supabase secrets  | `stripe-webhook`                 |
| `APP_VERSION`               | Supabase secrets  | `health` (optional, for version) |
| `VITE_SENTRY_DSN`           | Build env         | Sentry (frontend)                |
| `VITE_SUPABASE_URL`         | Build env         | Frontend client + `/status`      |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Build env     | Frontend client                  |

Never commit secrets. `.env` is git-ignored; use `.env.example` as the template.
