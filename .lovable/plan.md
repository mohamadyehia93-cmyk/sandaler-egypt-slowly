# UX/UI Audit — current state (read-only, nothing changed)

## 1. Information architecture

**123 routes** declared in `src/App.tsx`.

| Group | Count | Routes |
|---|---|---|
| Discovery / browse | 24 | `/`, `/calendar`, `/trips`, `/audio-tours`, `/causes`, `/people`, `/collections`, `/posts`, `/statuses`, `/search`, `/planner`, `/community`, `/region/:regionId`, `/regions/:slug`, `/city/:cityId`, `/city/:cityId/highlight/:highlightSlug`, plus 8 detail routes (`/experience/:id`, `/trip/:id`, `/event/:id`, `/audio-tour/:id`, `/stay/:id`, `/transport/:id`, `/product/:id`, `/collection/:id`) |
| Content / people / orgs | 8 | `/post/:id`, `/person/:id`, `/culture-actor/:id`, `/organization/:id`, `/partner/:id`, `/provider/:id`, `/cause/:id`, `/program/:id` |
| Transaction | 12 | `/booking`, `/booking/success`, `/booking/cancelled`, `/event/:id/tickets`, `/event-ticket/:ticketId`, 4× `/cause/:id/{gift,donate,volunteer,consult}`, `/program/:id/:action`, `/status` |
| My-activity | 11 | `/bookings`, `/orders`, `/tickets`, `/applications`, `/pledges`, `/commissions`, `/sessions`, `/session-requests`, `/wishlists`, `/profile/activity`, `/profile/dashboard` |
| Profile / auth | 11 | `/profile`, `/edit-profile`, `/visitor/:id`, `/profile/{impact,badges,following,settings,help}`, `/login`, `/signup`, `/forgot-password`, `/reset-password` |
| Provider dashboards + create/edit wizards | 43 | `/dashboard/*` across 6 role portals |
| Admin / editorial | 5 | `/admin`, 4× `/admin/editorial/...` |
| Utility / onboarding | 9 | `/welcome`, `/switch-role`, `/claim/:token`, `/about`, `/credits`, `/flag-issue`, `/flag-issue/:id`, `/diagnostics`, `*` |

**Primary navigation — three systems, and they don't add up to one.**

- **Header:** not a shared component. `Index.tsx:71-112` hand-rolls the only real header (logo, language toggle, search, calendar, bell). Every other page hand-rolls its own sticky bar with a back arrow. There is no `Header.tsx` / layout component in `src/components` — only `BottomNav`, `CategoryNav`, `NavLink`, `SectionHeader`.
- **Bottom nav** (`BottomNav.tsx`): visitor = Explore · Planner · Wishlists · Inbox · Profile; provider = Dashboard · Inbox · Profile. Rendered on only **29 of ~90 pages** — so most detail pages and all creation wizards drop the global nav entirely.
- **Sticky category nav** (`CategoryNav.tsx`): rendered on **the homepage only** (`Index.tsx:128`). It is an in-page scroll-spy (8 anchors: Events, Audio Tours, Experiences, Trips, Stays, Rides, Products, Stories), not navigation.

Conflict: the category nav is cosmetically top-level but functionally page-local, so its vocabulary (8 content types) does not match the bottom nav's vocabulary (5 tasks) or the route tree's vocabulary (16 searchable types). Once a visitor taps a card, the category spine disappears and never returns — no equivalent exists on `/city/:id`, `/region/:id`, or any list page. `TopTabs.tsx` still exists but is imported nowhere (dead component).

**Back behaviour is ad hoc.** 80 files call `navigate(-1)`; 193 `ArrowLeft` occurrences across pages, each styled locally. No breadcrumbs anywhere. Consequence: entering a detail page from search or a shared link sends "back" to whatever was before, or to a blank history entry. No page declares a canonical parent.

## 2. First-run and onboarding

`/` renders the full live homepage immediately — no splash gate, no modal, no auth wall (`App.tsx:164`; `RouteGuard.tsx:40-57` only redirects providers). `/welcome` (`Splash.tsx`) is opt-in; `Splash.tsx:536` writes `sandal-onboarded`, and nothing reads it for gating.

- **Understand what Sandal is:** 1 screen — hero + the purpose line and About link (`Index.tsx:117-126`). Weak point: the purpose line is 13px body text below the fold-line hero, and `/about` still contains the `[ADMIN: replace with About text]` placeholders.
- **Browse a real listing:** 2 taps (home → card).
- **Create an account:** 2 taps + 1 form (Profile tab → `/signup`, bare email/password/name, `Signup.tsx:23-57`). No personalisation captured on this path — which is why interests/style/budget are empty for ~90 of 98 accounts.

**Provider onboarding:** splash → role → localRole → roleDetails (1–2 question pages) → city → profile = 5–6 screens, then the auth wall at the end (`Splash.tsx:494-523`), which **does** persist an onboarding draft and returns the person to the `profile` step. 7 intents (`providerIntents.ts:41-126`). Listing wizard = **10 steps** (`WizardProgress.tsx:4-15`).

Draft saving is wired into 7 of 11 creation forms (`NewExperience`, `NewTrip`, `NewProduct`, `NewEvent`, `NewAudioTour`, `NewAccommodation`, `NewTransport`). **Missing:** `NewArticle`, `NewProgram`, `NewSession`, `NewCollection` — these still lose everything on interruption (`NewArticle`'s "Save as draft" is a publish status, not crash recovery).

## 3. Key flows

**Visitor: discover → listing → request → status.** Home (1) → detail (2) → `/booking` step 1 date/slot/guests (3) → step 2 contact details (4) → submit (5) → confirmation, which honestly says "not a confirmed booking" and links to `/bookings` (`Booking.tsx:130-168`). Status is reachable — good.
Friction: the auth wall fires at the **last** click (`Booking.tsx:466-471`) and discards every field typed in steps 1–2; only the return path survives. A signed-out visitor pays the full 4-screen cost twice.

**Visitor: find & play an audio tour.** Home carousel or `/audio-tours` → `/audio-tour/:id` → player. 2–3 taps, and search covers audio tours. `AllAudioTours.tsx` has region chips + text search and a real empty state. Cleanest flow in the app.

**Provider: sign up → first listing → publish → receive → respond.** 6 onboarding screens + signup + dashboard + 10 wizard steps ≈ 18 screens before a first listing exists. Requests arrive in `OwnerReservationRequests` / `ReservationRequestsList` on the dashboard; responding is in-dashboard. Friction: the 10-step wizard has no "save and finish later" affordance visible up-front — only the recovery prompt after a crash; and nothing tells a new provider their listing needs publishing vs. being live.

**Search.** One global RPC (`global_search`) over 16 types, grouped by type, 250ms debounce, recent-search chips (`Search.tsx:32-55`). **Zero filters** — no price, date, region, category or availability facet on any type. Reachable from **exactly one place in the app**: the homepage header icon (`Index.tsx:88`). Not in the bottom nav, not on any list or city page.

## 4. Consistency

**Cards: one good template, adopted in 5 places out of ~15.** `ContentCard.tsx` is used only by the five homepage carousels. Bespoke cards remain in:

| Location | Type label | Price/Free badge |
|---|---|---|
| `EventCard.tsx:18` | category only | inline text, not `PriceBadge` |
| `ProgramCauseCard.tsx:16` | kind chip | n/a |
| `Search.tsx:296` result rows | none | none |
| `Wishlists.tsx:250` rows | section-level only | none |
| `CityDetail.tsx:391-530` (7 near-duplicate grids) | inconsistent | hand-built per section |
| `RegionDetail.tsx:420-578` (6 grids) | inconsistent | hand-built |
| `AllTrips.tsx:122` | none | price + Book button |
| `AllPosts.tsx:278` | yes (two chips) | n/a |
| `AllPeople.tsx:69`, `AllCollections.tsx:148` | role / discipline only | n/a |
| `AllAudioTours.tsx:140` | duration/stops | yes (`PriceBadge`) |

**Detail pages: shared skeleton, real divergence.** Common spine = sticky back bar → hero → title/price → description → provider card → extras → fixed bottom CTA. Divergences: only `ExperienceDetail` has reviews; only `AudioTourDetail` has a real map (others show a `MapPin` icon beside text) and two stacked bottom bars; "similar items" exists on Trip/Stay/Transport/Post and not on Experience/Product/AudioTour/Cause; `CauseDetail`'s bottom bar is `justify-end` with no price; `PersonDetail`/`OrganizationDetail` have no commerce bar at all; loading is `DetailSkeleton` on some pages and inline `Skeleton` stacks on most.

**Empty states.** All 11 sampled dashboards use one consistent `isLoading → empty → list` ternary — the most consistent code in the app. The `All*` pages all have real empty states (`AllCollections` best, `AllTrips`/`AllCauses` message-only, no icon). **Blank gaps:** every sub-section on `CityDetail.tsx` and `RegionDetail.tsx` is gated on `.length > 0`, so a city with no stays or no rides silently loses that whole block — a visitor can't tell if it's empty or broken.

## 5. Content and labelling

The content-type label is on every `ContentCard`, i.e. the homepage carousels only. Surfaces **still missing** it: search results, wishlist rows, all city/region sub-grids, `AllTrips`, and `EventCard` (shows category, not type). So the "I can't tell what Sandal is" problem is solved on the homepage and nowhere else.

Bilingual: 188 files branch on `lang === "ar"`, and `index.css`/logical properties (`start-`/`end-`) are used in the shared components — no hardcoded LTR breakage found in the redesigned parts. `/about` still ships the admin placeholder text in both languages. `AllAudioTours`' theme classifier (`classifyTour`, line 23) matches English keywords only, so Arabic-only tours all fall into "Culture & Heritage".

## 6. Interaction and feedback

Skeletons exist in 32 pages. **`CauseDetail.tsx` has no loading state at all** — line 54 runs `if (!cause) return <NotFoundView>` before the query resolves, so every visitor opening a cause sees a "not found" screen flash, and on a slow connection sees only the 404. The same `if (!x) return <NotFound>` pattern appears in 28 pages, but the others guard it with a loading branch first. `EventCalendar.tsx` also has no loading guard.

Toasts are used in 77 page/component files — feedback is broadly consistent. Dead controls from the earlier pass are gone (audio-tour play/download, article bookmarks now route or use `WishlistButton`). `TopTabs.tsx` is dead code, not a dead control.

## 7. Accessibility

- **91 icon-only buttons with no `aria-label`** — including every page's back arrow, the homepage search and bell icons (`Index.tsx:88,102`), all five dashboard bell icons, the audio-tour pause button (`AudioTourDetail.tsx:882`), and both close buttons (`EditProfile.tsx:126`, `ProductDetail.tsx:609`). Screen readers announce these as "button".
- **Tap targets below 44px:** `p-1.5` back buttons on all four cause-support pages, `EventDetail.tsx:176` share, `ChatView.tsx:45` back; `p-1` remove buttons in `AudioPicker`/`VideoPicker`.
- **Focus states:** only `components/ui/button.tsx` declares `focus-visible`. Hand-rolled `<button>`s and the card `role="link"` elements (`ContentCard.tsx:46-56`) have no visible focus ring, though the card does handle Enter/Space.
- Alt text: clean — every `<img>` in `src` has an `alt`.
- Contrast risk: `text-primary-foreground/60` on teal in `BottomNav.tsx:40` for inactive tabs, and 10–11px label text on gradient scrims in `ContentCard.tsx:83,93`.

## 8. Top 10 UX problems, ranked

| # | Problem | Where | Severity | Effort |
|---|---|---|---|---|
| 1 | Causes always flash/stick on "not found" — no loading guard before the 404 return | `CauseDetail.tsx:54` | Blocker | Quick |
| 2 | Booking auth wall fires at the last click and wipes all typed booking details | `Booking.tsx:466-471` | Blocker | Real work |
| 3 | Search has no filters at all and exactly one entry point in the whole app | `Search.tsx`, `Index.tsx:88` | Major | Real work |
| 4 | Three competing wayfinding systems, no shared header, no breadcrumbs; bottom nav absent from ~2/3 of pages | `Index.tsx`, `BottomNav.tsx`, `CategoryNav.tsx` | Major | Real work |
| 5 | The shared card is used in 5 places; 10+ bespoke cards keep type labels and price badges inconsistent | `CityDetail`, `RegionDetail`, `All*`, `Search`, `Wishlists`, `EventCard` | Major | Real work |
| 6 | 91 icon buttons unlabelled + no focus rings on hand-rolled controls and cards | app-wide | Major | Quick (mechanical) |
| 7 | City and region pages silently drop whole sections when empty — reads as broken | `CityDetail.tsx:391-530`, `RegionDetail.tsx:420-578` | Major | Quick |
| 8 | 4 creation wizards still lose all work on interruption | `NewArticle`, `NewProgram`, `NewSession`, `NewCollection` | Major | Quick (pattern exists) |
| 9 | Visitor signup captures nothing personal, so personalisation and the completeness nudge start empty | `Signup.tsx:23-57` vs `Splash.tsx` | Minor | Real work |
| 10 | `/about` still shows the `[ADMIN: replace…]` placeholder; audio-tour themes classify Arabic-only tours wrongly | `src/content/siteCopy.ts`, `AllAudioTours.tsx:23` | Minor | Quick (content) |

## Not verified
- `SessionRequestForm.tsx` was not read line-by-line — whether it shows an explicit "request sent" confirmation is unconfirmed.
- Colour-contrast items above are read from token usage in code, not measured.
