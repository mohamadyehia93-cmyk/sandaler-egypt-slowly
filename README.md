# Sandal — Discover Egypt Slowly

**Egypt's slow rural tourism platform.** Discover overlooked villages, book authentic local experiences, and explore the Nile Delta, Suez Canal communities, Fayyum, Mariout, and Upper Egypt frontiers.

Tagline: _Discover Egypt. Slowly._ / _اكتشف مصر. ببطء._

---

## Tech Stack

- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui (Radix UI primitives)
- **State / Data:** TanStack Query (React Query) + Zustand (where needed)
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
- Bun (preferred) or npm/yarn

### Setup

```bash
# Clone
git clone https://github.com/mohamadyehia93-cmyk/sandaler-egypt-slowly.git
cd sandaler-egypt-slowly

# Copy env template and fill in values
cp .env.example .env
# Edit .env with your Supabase project credentials

# Install
bun install
# or: npm install

# Run dev server
bun dev
# or: npm run dev
```

### Build

```bash
bun run build
bun run preview
```

### Tests

```bash
bun test           # unit tests via Vitest
bun playwright test # E2E tests
```

---

## Project Structure

```
sandaler-egypt-slowly/
├── public/                      # Static assets (favicon, PWA icons, manifest)
├── src/
│   ├── main.tsx                 # App entry — initializes Sentry, PostHog, i18n
│   ├── App.tsx                  # Root component, providers, router
│   ├── index.css                # Tailwind layers + Sandal design tokens
│   ├── assets/                  # Bundled images
│   ├── components/              # Shared feature components
│   │   └── ui/                  # shadcn/ui primitives
│   ├── pages/                   # Route-level components
│   │   └── dashboards/          # Provider dashboards (culture actor, host, etc.)
│   ├── hooks/                   # Reusable hooks
│   │   ├── useAuth.tsx          # Supabase auth state
│   │   ├── useLanguage.ts       # i18next + html lang/dir sync
│   │   ├── useAudioTour.ts      # AudioTourPlayer subscription
│   │   └── useAnalytics.ts      # PostHog event helpers
│   ├── lib/
│   │   ├── audio/               # Howler-based AudioTourPlayer
│   │   ├── monitoring/          # Sentry initialization
│   │   ├── analytics/           # PostHog initialization
│   │   ├── i18n.tsx             # Legacy context-based i18n (being migrated)
│   │   ├── dbAdapters.ts        # Supabase row → domain model mappers
│   │   ├── fetchByIdOrSlug.ts   # Typed dynamic table lookup
│   │   ├── providerData.ts      # Provider role metadata
│   │   ├── sampleData.ts        # Seed/demo data
│   │   └── utils.ts             # cn() and small helpers
│   ├── i18n/
│   │   ├── config.ts            # i18next setup
│   │   └── locales/             # en/, ar/ JSON namespaces
│   ├── integrations/
│   │   └── supabase/            # Generated client + types
│   └── test/                    # Vitest setup and unit tests
├── index.html                   # HTML shell with OG/Twitter/PWA meta
├── vite.config.ts               # Vite + PWA + plugin config
├── tailwind.config.ts           # Sandal palette + Cairo font
├── .env.example                 # Template for required env vars
└── package.json
```
