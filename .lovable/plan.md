# Events row on Home, Regions and Cities

## What exists today

- Region pages and City pages already render an Events row (3 cards + "See all" to the calendar).
- The Home page (Explore tab) has no Events row.
- The database has 89 events, 3 per city across all 28 cities and all 4 regions — but only 1 per city is in the future, so the rows currently fill up with past events.

## What will change

1. **Home page (Explore tab)**: add an Events row between the Audio Tours and Causes rows — same look as the other rows: 3 large cards in a grid with a "See all" link to the calendar page.
2. **Regions and Cities**: keep the existing rows, no layout change needed.
3. **Seed upcoming events**: add 2 more upcoming events per city (dated over the next few months) so every city, every region, and the Home row shows at least 3 genuinely upcoming events. Each event gets English and Arabic title/description, venue, location, date and time, category, capacity, price or free flag, and an image.

## Technical notes

- New markup in `src/pages/Index.tsx`: render `<EventsSection events={events} />` inside the Explore tab, fed by the existing `useEvents` hook.
- `EventsSection` already sorts upcoming-first and slices to 3, so no component change is required.
- Seeding is a data insert into `public.events` with `status = 'published'`, correct `city_id` / `region_id` pairs, and staggered future `start_date` values.
