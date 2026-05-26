# Sandal — Discover Egypt Slowly

**Egypt's slow rural tourism platform.** Discover overlooked villages, book authentic local experiences, and explore the Nile Delta, Suez Canal communities, Fayyum, Mariout, and Upper Egypt frontiers.

Tagline: _Discover Egypt. Slowly._ / _اكتشف مصر. ببطء._

---

## ⚠️ Branch Protection — Read This First

`main` is the protected production branch. **Do not push directly to `main`.**

| Branch | Purpose | Who writes |
|---|---|---|
| `main` | Production-ready code | PRs only, after review |
| `lovable-staging` | Lovable AI iterations | Lovable (configure in Lovable settings) |
| `feat/*` | Feature work | Engineers via PRs |
| `fix/*` | Bug fixes | Engineers via PRs |

**Workflow:**
1. Lovable iterates on `lovable-staging`
2. Engineer reviews the diff, cherry-picks or merges into a `feat/*` branch
3. PR from `feat/*` → `main`, requires review + passing CI
4. Never merge Lovable commits directly to `main` without review

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full workflow.

---

## Tech Stack

- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui (Radix UI primitives)
- **State / Data:** TanStack Query (React Query)
- **Forms:** React Hook Form + Zod
- **Backend:** Supabase (Auth, Database, Storage, Edge Functions)
- **Maps:** Leaflet + React Leaflet
- **Audio:** Howler.js with Media Session API integration
- **i18n:** i18next + react-i18next (English + Arabic with full RTL)
- **Monitoring:** Sentry (errors + session replay)
- **Analytics:** PostHog (privacy-respecting product analytics)
- **PWA:** vite-plugin-pwa with offline support for audio tours
- **Testing:** Vitest (unit) + Playwright (E2E) + Testing Library

---

## Getting Started

### Prerequisites
- Node.js 20+
- npm (or Bun)

### Setup

```bash
# Clone
git clone https://github.com/mohamadyehia93-cmyk/sandaler-egypt-slowly.git
cd sandaler-egypt-slowly

# Copy env template and fill in values
cp .env.example .env
# Edit .env with your Supabase project credentials

# Install
npm install

# Run dev server
npm run dev
```

### Build

```bash
npm run build
npm run preview
```

### Tests

```bash
npm test              # unit tests via Vitest
npx playwright test   # E2E tests
```

---

## Project Structure

```
sandaler-egypt-slowly/
├── public/                      # Static assets (favicon, PWA icons, manifest)
├── src/
│   ├── main.tsx                 # App entry — initializes Sentry, PostHog, i18n
│   ├── App.tsx                  # Root component, providers, router (lazy-loaded routes)
│   ├── index.css                # Tailwind layers + Sandal design tokens
│   ├── assets/                  # Bundled images
│   ├── components/              # Shared feature components
│   │   └── ui/                  # shadcn/ui primitives
│   ├── pages/                   # Route-level components (lazy-loaded)
│   │   └── dashboards/          # Provider dashboards (culture actor, host, narrator, etc.)
│   ├── hooks/                   # Reusable hooks
│   │   ├── useAuth.tsx          # Supabase auth state
│   │   ├── useLanguage.ts       # i18next + html lang/dir sync
│   │   ├── useAudioTour.ts      # AudioTourPlayer subscription
│   │   ├── useOfflineTour.ts    # Offline-aware tour state
│   │   ├── useUserLocation.ts   # Geolocation hook
│   │   └── useAnalytics.ts      # PostHog event helpers
│   ├── lib/
│   │   ├── audio/               # Howler-based AudioTourPlayer
│   │   ├── monitoring/          # Sentry initialization
│   │   ├── analytics/           # PostHog initialization
│   │   ├── i18n.tsx             # Legacy context-based i18n (being migrated)
│   │   ├── dbAdapters.ts        # Supabase row → domain model mappers
│   │   ├── fetchByIdOrSlug.ts   # Typed dynamic table lookup
│   │   ├── regionThemes.ts      # Region color/image mapping
│   │   ├── providerData.ts      # Provider role metadata
│   │   ├── sampleData.ts        # Seed/demo data
│   │   └── utils.ts             # cn() and small helpers
│   ├── i18n/
│   │   ├── config.ts            # i18next setup
│   │   └── locales/             # en/, ar/ JSON namespaces
│   ├── integrations/
│   │   └── supabase/            # Generated client + types
│   └── test/                    # Vitest setup and unit tests
├── supabase/
│   ├── functions/               # Edge Functions
│   └── migrations/              # SQL migrations (auto-generated)
├── index.html                   # HTML shell with OG/Twitter/PWA meta
├── vite.config.ts               # Vite + PWA + plugin config
├── tailwind.config.ts           # Sandal palette + Cairo font
├── .env.example                 # Template for required env vars
└── package.json
```

---

## User Roles

Sandal supports 9 distinct user roles, each with its own dashboard and permissions:

1. **Visitor** — discovers, books, experiences, contributes to community impact
2. **Culture Actor** — local writers/photographers/podcasters creating editorial content
3. **Service Provider** — offers bookable experiences (boatmen, cooks, guides, craftspeople)
4. **Who's Who** — high-trust local experts (non-transactional, moderated contact)
5. **Organization** — NGOs/initiatives running programs, accepting donations and volunteers
6. **Ambassador** — paid trusted locals doing verification, onboarding, safety
7. **Product Seller** — authentic local goods (crafts, food, textiles)
8. **Trip Organizer** — curated multi-stop trips
9. **Subject Expert** — researchers/academics creating educational depth

---

## Design System

- **Primary color:** Sandal Teal `#2BBFB3`
- **Font:** Cairo (Google Fonts) — used for both Arabic and Latin scripts
- **Mobile-first:** designed at 390px viewport width (iPhone 14 Pro)
- **RTL support:** full mirror layout when language is Arabic
- **Role accent colors:** each provider role has a distinct accent (see `tailwind.config.ts` → `role.*`)

---

## Deployment

Currently deployed via Lovable at: https://sandaler-egypt-slowly.lovable.app

Lovable should be configured to push to `lovable-staging`, not `main`.

---

## Contributing

Internal project. See [CONTRIBUTING.md](./CONTRIBUTING.md) for branch workflow. Contact Mohamed Yehia for access.

## License

All rights reserved. Sandal © 2026.
