# Top 4 Improvements — Implementation Plan

## 1. `<SmartImage>` component
Create `src/components/ui/SmartImage.tsx` wrapping `<img>` with:
- Teal-tinted placeholder (`bg-primary/10`) + centered Lucide `Camera` icon shown while loading and on `onError`.
- Skeleton shimmer until first successful load.
- Forwarded props (`src`, `alt`, `className`, `loading="lazy"` default, `sizes`).
- Bilingual `alt` fallback.

Swap `<img>` → `<SmartImage>` on high-traffic detail pages first:
RegionDetail, CityDetail, ExperienceDetail, TripDetail, AudioTourDetail, PersonDetail, AccommodationDetail, ProductDetail, PartnerDetail, PostDetail, EventCalendar cards.

## 2. Unified `<NotFound>` component
Create `src/components/NotFound.tsx` (in-page, not the 404 route):
- Props: `context: "experience" | "trip" | "audio-tour" | "person" | "city" | "region" | "post" | "stay" | "product" | "cause" | "partner" | "generic"` and optional `message`.
- Bilingual headline mapped per context (e.g. "Experience not found" / "التجربة غير موجودة").
- Sandal-teal illustration block + primary "Return to Explore" button → navigates to `/`.
- Replace inline "not found" divs in: ExperienceDetail, TripDetail, AudioTourDetail, PersonDetail, CityDetail, RegionDetail, PostDetail, AccommodationDetail, ProductDetail, CauseDetail, PartnerDetail, HighlightDetail, OrganizationDetail, CultureActorDetail, HostDetail, TransportDetail.
- Keep the existing `pages/NotFound.tsx` route page but have it render `<NotFound context="generic" />`.

## 3. Finish DB migration on RegionDetail & CityDetail
Currently both pages still import from `src/lib/sampleData.ts` for several sections. Replace with hooks backed by Supabase via `useListings` / `fetchByIdOrSlug`:
- Experiences-by-city/region → `useListings({ type: "experience", cityId | regionId })`
- Who's Who → `useListings({ type: "person", cityId | regionId })`
- Stays → `useListings({ type: "accommodation", cityId | regionId })`
- Products → `useListings({ type: "product", cityId | regionId })`
- Audio tours, trips, posts → same pattern.

Keep existing UI; add `<Skeleton>` placeholders during loading and `<NotFound context="city">` if the city/region row is missing. Drop the now-unused `sampleData` imports from these two pages.

If a hook variant is missing for a content type, extend `useListings` rather than re-importing sample data.

## 4. Lazy routes
Refactor `src/App.tsx`:
- Convert all ~70 page imports to `React.lazy(() => import(...))`.
- Wrap `<Routes>` in `<Suspense fallback={<RouteFallback/>}>` where `RouteFallback` is a centered Skeleton matching app chrome.
- Keep `Splash`, `Index`, `Login`, `Signup` eagerly imported (first-paint critical) — everything else lazy.

## Technical notes
- No schema changes; reads only.
- No new dependencies (Lucide + existing Skeleton already available).
- No changes to `client.ts`, `types.ts`, `.env`, or `config.toml`.
- Preserve RTL/LTR via existing `useI18n()` patterns.
- Memory rule respected: Cairo font, teal palette, mobile-first.

## Files created
- `src/components/ui/SmartImage.tsx`
- `src/components/NotFound.tsx` (in-page variant)

## Files edited
- `src/App.tsx` (lazy + Suspense)
- `src/pages/NotFound.tsx` (uses new component)
- `src/pages/RegionDetail.tsx`, `src/pages/CityDetail.tsx` (DB hooks + SmartImage + NotFound)
- ~12 other detail pages (NotFound + SmartImage swaps)
- `src/hooks/useListings.ts` (extend filters if needed)

## Out of scope
- Bottom-sheet filter standardization, RTL logical-property migration, route helper, query staleTime — can follow in a later batch.
