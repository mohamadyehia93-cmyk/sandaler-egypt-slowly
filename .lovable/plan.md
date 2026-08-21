# Real, relevant photos for seeded content

## What's wrong today

Roughly 700 seeded rows point at generic `images.unsplash.com` URLs that were never matched to the actual place, activity, or product: 145 events, 115 posts, 88 experiences, 85 transport, 84 causes, 84 products, 63 Who's Who people, 22 trips, 10 audio tours, 4 stays. Only cities (28) and regions (4) use real, credited Wikimedia photos — which is why those look right and everything else looks random.

## The approach

Extend the same pipeline that already works for cities/regions: mine Wikimedia Commons for freely licensed photos, match them to each row by subject, and record every file in the existing `image_credits` table so the Credits page stays complete and honest.

Matching order for each row:

1. Build a search query from the row itself — title, category/theme, city and governorate names (English + Arabic), and for transport the from/to pair.
2. Query Wikimedia Commons for image files, keep only CC-BY / CC-BY-SA / CC0 / public-domain files, and require the file's own title or categories to overlap the row's city or subject. No overlap, no match.
3. Score candidates (subject match beats city match), pick the best, and take a second/third for gallery `images` where the table has one.
4. If nothing passes the test, fall back to a credited Wikimedia photo of the row's city — generic, but the right place.
5. Write the file's photographer, licence, licence URL and Commons link into `image_credits` with `used_for` naming the row.

People are handled differently: the 63 Who's Who portraits are stock faces of people who aren't the real person, and no amount of mining fixes that. Their `image` is cleared and the profile renders a generated monogram avatar (initials over a brand-tinted circle) until the real person uploads a photo. Same treatment for the seeded `host_image` / `organizer_image` / `seller_image` / `narrator_image` / `author_image` stock faces.

## Scope of rows touched

Experiences, trips, events, accommodations, transport, audio tours, posts, causes, programs, products — cover image plus gallery images where the column exists. Cities and regions are already correct and stay as they are. Rows created by real users are left alone; only seeded rows (no owner, or still on an `images.unsplash.com` URL) are rewritten.

## Technical notes

- Mining runs as a one-off sandbox script (`scripts/mine-commons-images.ts`) hitting the Commons `action=query` API with `prop=imageinfo&iiprop=extmetadata` to read `Artist`, `LicenseShortName`, `LicenseUrl` and `DescriptionUrl`. Results are written as a SQL migration so the change is reproducible and reviewable, not an untracked one-time mutation.
- Rate-limited and cached to disk so re-runs don't re-hit the API; a `User-Agent` is set as Commons requires.
- New `src/components/MonogramAvatar.tsx` renders initials for rows with no photo; `PersonDetail`, `WhosWho` cards, host/organizer/seller blocks use it when `image` is null instead of falling back to a stock face.
- Image URLs use Commons thumbnail URLs (`/thumb/.../800px-...`) rather than full-resolution originals, to keep the feed light.
- Verification: after the migration, a query confirms zero remaining `images.unsplash.com` URLs, every non-null image has a matching `image_credits` row, and the Credits page lists them grouped by licence. Spot-check a handful of detail pages in the preview.

## What you will see

Content cards and detail pages show photos of the actual city, craft, or activity, with attribution flowing into the existing Credits page. People without a real uploaded photo show a clean initials avatar instead of a stranger's face.
