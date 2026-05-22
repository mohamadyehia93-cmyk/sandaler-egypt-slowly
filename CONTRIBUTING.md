# Contributing to Sandal

## Why this document exists

Lovable is the primary AI development tool for Sandal. Because Lovable commits directly to GitHub, we had an incident where Lovable's commits to `main` overwrote critical infrastructure work (Sentry, PostHog, PWA, i18n, audio layer). This document defines a workflow to prevent that from happening again.

---

## Branch Structure

```
main              ← protected. production-ready only. PRs required.
lovable-staging   ← Lovable's sandbox. unrestricted push access.
feat/*            ← engineer feature branches
fix/*             ← engineer bug-fix branches
```

---

## Workflow

### For Lovable (AI-generated work)

1. **Configure Lovable to push to `lovable-staging`** (not `main`).
   - In Lovable project settings → GitHub integration → set branch to `lovable-staging`
2. Lovable iterates freely on `lovable-staging`
3. An engineer reviews the diff before anything reaches `main`:
   ```bash
   git fetch origin
   git diff origin/main...origin/lovable-staging
   ```

### Promoting Lovable work to main

**Option A — Cherry-pick specific commits** (preferred for UI changes)
```bash
git checkout feat/my-feature
git cherry-pick <commit-sha>
# review, test, then PR to main
```

**Option B — Merge the whole branch** (when Lovable's batch is clean)
```bash
git checkout feat/lovable-batch-YYYYMMDD
git merge origin/lovable-staging
# review the full diff, test build, then PR to main
```

Never do:
```bash
git merge lovable-staging main  # ← bypasses review
git push origin main            # ← blocked by branch protection
```

### For engineers

1. Branch from `main`:
   ```bash
   git checkout main && git pull
   git checkout -b feat/your-feature
   ```
2. Develop, commit, push
3. Open a PR → `main`
4. PR requires: at least 1 approval + CI passing (build + tests)
5. Squash-merge preferred for clean history

---

## Protected Infrastructure Files

These files contain foundational work that **must not be silently overwritten**. Any PR touching them requires explicit review:

| File | Why it matters |
|---|---|
| `src/main.tsx` | Sentry + PostHog initialization order |
| `src/lib/monitoring/sentry.ts` | Error tracking config |
| `src/lib/analytics/posthog.ts` | Analytics config |
| `src/lib/audio/AudioPlayer.ts` | Howler singleton |
| `src/i18n/` | Translation files + i18next config |
| `src/hooks/useLanguage.ts` | RTL/LTR document sync |
| `src/hooks/useAudioTour.ts` | AudioPlayer React subscription |
| `src/hooks/useAnalytics.ts` | Typed PostHog event helpers |
| `src/i18n/config.ts` | i18next bootstrap (explicit entry) |
| `vite.config.ts` | PWA plugin + build config |
| `tailwind.config.ts` | Design tokens |
| `src/index.css` | Sandal CSS variables |
| `index.html` | OG tags, Cairo font, PWA meta |
| `.env.example` | Env var template |
| `.gitignore` | Blocks .env from being committed |
| `package.json` | Dependency list |
| `public/favicon.svg` | Sandal-branded SVG favicon |
| `public/sandal-logo.svg` | Primary brand logo asset |
| `public/pwa-192x192.png` | PWA icon (manifest + iOS) |
| `public/pwa-512x512.png` | PWA icon large (maskable) |
| `supabase/functions/` | Edge Functions — needs deploy review |
| `supabase/migrations/` | Schema migrations — irreversible in prod |
| `CONTRIBUTING.md` | This file — workflow definition |
| `README.md` | Project documentation |

---

## Setting Up Branch Protection (manual step — GitHub Settings)

These rules must be applied manually at:
**GitHub → Settings → Branches → Add branch protection rule → `main`**

Required settings:
- ✅ Require a pull request before merging
- ✅ Require approvals: **1**
- ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ Require status checks to pass before merging
  - Add check: `build` (once a CI workflow exists)
- ✅ Do not allow bypassing the above settings
- ✅ Restrict who can push to matching branches (add engineer GitHub usernames)
- ❌ Allow force pushes — **leave OFF**
- ❌ Allow deletions — **leave OFF**

---

## Commit Message Convention

```
type: short description (imperative, ≤72 chars)
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `deps`, `security`, `i18n`, `analytics`, `monitoring`, `audio`, `pwa`

Examples:
```
feat: add booking flow for experiences
fix: repair audio tour seek position on iOS
deps: upgrade @sentry/react to 10.x
security: rotate Supabase anon key reference in env
```
