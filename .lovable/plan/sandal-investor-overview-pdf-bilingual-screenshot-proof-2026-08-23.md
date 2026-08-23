# Sandal — Investor Overview PDF (bilingual, screenshot-proof)

A single downloadable PDF that explains what Sandal is, the paths through it, and the main features — with high-resolution screenshots of the live app as proof, in both English and Arabic (RTL).

## One blocker first

Capturing logged-in screens (provider dashboards, listing wizards, inbox, checkout, admin) needs an active signed-in preview session. Right now the preview reports **signed out**, so those screens can't be reached. Please sign in to the preview (ideally on an account that has a provider profile), then say "go" — the session becomes available on the next message and I'll capture the full set.

If you'd rather not wait, I can build the document with public surfaces only and leave labelled gaps for the dashboards.

## Document structure (~28 pages, ~45 screenshots)

1. Cover — Sandal wordmark, one-line positioning, date
2. What Sandal is — the four regions, bilingual by design, 6 participant roles (one page, diagram-led)
3. The visitor path — Splash → Home → Region → City → Detail → Book, screenshots in sequence with short captions
4. Discovery surfaces — Explore feed, Regions, Cities, Search, Calendar, Wishlists, AI Itinerary Planner
5. What you can book or buy — Experiences, Trips, Stays, Rides, Events, Products, Audio Tours, Programs & Causes (2 pages, cover + detail shots)
6. Transactions — booking flow, event ticket checkout + receipt, product order, reservation request, pledges/applications
7. The six roles — one page per role: Service Provider, Trip Organizer, Culture Actor, Who's Who, Organization, Product Seller. Each shows the dashboard plus one authoring screen (wizard step, city/map picker, bilingual field)
8. Community & messaging — Community forum, Statuses, Inbox, Follows, Comments
9. Trust & governance — admin review queue, flag reports, editorial vs hosted listings, image Credits page with licence attribution
10. Arabic / RTL proof — 4–6 of the key screens re-captured in Arabic to show the mirrored layout
11. What's built today — plain table of surfaces, roles and flows that are live
12. Back page — published URL, contact

## How screenshots are captured

- Playwright against the running app at mobile size (390×844 CSS px) at device scale factor 3, giving ~1170×2532 px PNGs — sharp at print resolution.
- Each shot is scripted by route so the set is reproducible: navigate, wait for content, screenshot. Long pages captured as one or two framed sections rather than a full-page strip, so nothing is illegibly small.
- Arabic shots are the same routes with the language toggle set to Arabic.
- Real seeded content only — no mock overlays, no retouching.

## Design of the PDF

Follows the app's own brand rather than a generic template: teal primary (#2BBFB3) with the dark teal (#1A7A74), 12px radii echoed in the image frames, generous white space, captions in a light sans. Phone screenshots sit in simple device frames, two or three per page, with a short caption and the route path (e.g. `/region/upper-egypt`) as a small monospace label — the route labels double as the "paths" map you asked for.

English body text with the Arabic equivalent set beneath each caption in a smaller weight, so a single document serves both readers.

## Technical notes

- Screenshot script written to `/tmp` (not the project), Playwright + Chromium already available in the sandbox.
- PDF assembled with ReportLab, registering a Unicode font with Arabic coverage (Noto Naskh / DejaVu via fontconfig) since the built-in fonts cannot render Arabic; Arabic strings shaped and reordered for correct RTL presentation.
- Output written to `/mnt/documents/sandal-overview.pdf` and surfaced as a downloadable artifact.
- QA: every page rendered to an image and inspected for clipped text, overlaps, broken Arabic glyphs and blank screenshots; regenerate until clean. Any route that fails to render is reported rather than silently dropped.
- No application code, schema or data is changed by this task.
