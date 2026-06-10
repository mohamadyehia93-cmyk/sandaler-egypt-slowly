# Add Cultural Events to City & Region Pages

I think it's a strong fit. The app already has a culture theme, an `EventCalendar` page, and a `meetups` table — but cultural events (festivals, exhibitions, concerts) deserve their own curated, provider-managed table rather than being mixed with casual community meetups. Per your choices: a **new `events` table**, **providers/organizers create them**, and the section shows **all events with upcoming ones first**.

## What you'll get
- An **Events** section on every city page (`/city/:slug`) and region page (`/region/:slug`), styled exactly like the existing Experiences/Trips rails (horizontal card scroll under a `SectionHeader`).
- Each card shows image, title, date badge, venue/location, and category. Past events appear after upcoming ones with a muted "Past" tag.
- A **tap-through event detail page** consistent with the app's slug routing.
- A **provider "My Events"** area so verified providers/organizers can add and edit their own events.
- A few **seeded sample events** so the section isn't empty on launch.
- Events also flow into the existing **EventCalendar** page automatically.

## Plan

### 1. Database — `events` table (migration)
Fields (plus standard id/created_at/updated_at):
- Bilingual: `title_en/ar`, `description_en/ar`, `location_en/ar`, `venue_en/ar`
- Scope: `region_id` (text), `city_id` (text) — matching how `meetups` links
- Timing: `start_date` (date), `end_date` (date, nullable), `event_time` (text, nullable)
- Meta: `category` (text, e.g. festival/exhibition/concert/workshop), `image` (text), `slug` (text, unique), `is_free` (boolean), `price` (numeric, nullable), `ticket_url` (text, nullable)
- Ownership/visibility: `organizer_id` (uuid), `status` (text default `published`)

Access rules (RLS + GRANTs):
- Public can read published events (anon + authenticated SELECT).
- Authenticated organizers can insert/update/delete **only their own** events (`auth.uid() = organizer_id`).
- `service_role` full access.
- `updated_at` trigger using existing `update_updated_at_column`.

Seed ~4–6 sample events across a couple of cities/regions via an insert.

### 2. Data hook
- Add `useEvents` to `src/hooks/useListings.ts` (mirrors `useMeetups`): fetch published events. Sorting/filtering by upcoming-first done in the components.

### 3. Reusable card + section
- New `EventCard` component (image, date chip, title, venue, category; "Past" badge when `start_date < today`).
- Shared sort helper: upcoming events (date >= today) ascending by date, then past events descending.

### 4. City & Region pages
- `CityDetail.tsx`: filter events by `city_id === cityId`, render an Events `SectionHeader` (titleKey `section.events`) with `onSeeAll` → EventCalendar/events list. Place it near the other discovery rails. Hide section when empty.
- `RegionDetail.tsx`: same, filtered by `region_id === regionId` (and respect the page's existing city filter if one is selected).

### 5. Event detail page
- New `EventDetail.tsx` route `/event/:slug` using the existing dual-identifier (UUID or slug) lookup pattern. Shows full description, date/time, venue + city/region cross-links, category, price/free, and a ticket/contact action (in-app messaging or `ticket_url`).

### 6. Provider management ("My Events")
- A provider-portal screen listing the organizer's events with create/edit/delete.
- A simple Events form (bilingual fields, date, city/region pickers, category, image upload to existing `listing-images` bucket, free/price). Scoped so providers manage only their own rows (enforced by RLS).

### 7. i18n + calendar
- Add bilingual keys: `section.events`, `events.upcoming`, `events.past`, `events.free`, category labels, form labels.
- Extend `EventCalendar.tsx` to include `useEvents` alongside experiences/trips so events show on the calendar too.

## Technical notes
- `city_id`/`region_id` are `text` (slug-style ids) on existing tables — the new table follows the same convention so filtering matches the current `e.city_id === cityId` pattern.
- All new colors/spacing use existing semantic tokens; cards reuse the Cairo type scale and 12px radius from project memory.
- "All, upcoming first" ordering is applied client-side so the same hook serves both pages and the calendar.

## Out of scope (unless you want it)
- Ticketing/payments for events (would reuse the existing booking/platform-fee flow if added later).
- Admin moderation dashboard beyond provider self-management.
