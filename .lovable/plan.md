# Audit: what a visitor sees about themselves today

Read-only audit. Nothing was changed.

## 1. The public traveller page (`/visitor/:id`)

Renders, in order, from one real query on `profiles` (`display_name, avatar_url, bio, created_at`):

1. Teal band + back button — static.
2. Avatar (real `avatar_url`, else a person icon) and name (real `display_name`, else "Traveler/مسافر").
3. Follow button + Message button (Message hidden on your own page) — real follows/messaging.
4. Followers count (real, counted in the backend) and Joined year (real, from account creation).
5. Bio card, or "This traveler hasn't added any details yet."

No mock data left — the Sarah Mitchell persona is gone. That is the **entire** field list: name, photo, bio, join year, follower count. Reality check: of 98 accounts, 0 have a bio, 8 have a photo — so almost every public traveller page is an empty shell today.

## 2. Own profile (`/profile`) — what is surfaced

- Photo, name, email, role label, "Edit profile" — real.
- Saved AI itineraries list — real (`saved_itineraries`, currently 0 rows).
- Stats row: "Plans" = real itinerary count; **"Reviews" is hardcoded to 0** even though 39 reviews exist in the reviews table.
- Menu links: My Tickets, My Orders, My Applications, My Session Requests, Impact, Badges & Quests, Settings, Help.

Status of each activity type:

| Thing | State |
|---|---|
| Bookings (paid experiences) | page exists and is real, **not linked** from the profile |
| Reservation requests (stays/rides) | **no visitor-facing page at all** — only the owner sees them |
| Orders | shown & real |
| Event tickets | shown & real |
| Volunteer applications | shown & real |
| Session requests | shown & real |
| Pledges / donations | page exists and is real, **not linked** (only reachable via Impact) |
| Commissions | page exists and is real, **not linked** |
| Wishlist | real, reached from the bottom bar heart, not from the profile |
| Follows (who they follow) | stored (2 rows) — **never shown to the user** |
| Their community posts / comments | stored — **never shown on their profile** |
| Messages | real, in the Inbox tab |
| Onboarding answers (interests, style, budget, cities) | saved to the account **and** to the phone, but **shown nowhere**; and only 11 of 98 accounts have cities, 0 have interests/style/budget — the current sign-up path isn't filling them |
| Badges & Quests | **entirely invented** — six hardcoded badges, three hardcoded quests with fake progress. Nothing behind it. |
| Impact | real and honest (only recorded donations), currently empty for everyone |

## 3. Editing

`/edit-profile` handles a plain visitor with no provider record: name, photo, bio only. Language lives in Settings. Interests, travel style, budget and cities are **not editable anywhere** after sign-up.

## 4. Pages that exist but aren't linked

`/bookings`, `/pledges`, `/commissions`, `/sessions`, `/statuses` — direct URL only.

## 5. Gaps a visitor would reasonably expect

- One activity view (upcoming vs past) instead of eight separate lists.
- "Upcoming" at the top: next booking, next event ticket, next stay request.
- Saved items at a glance on the profile.
- A profile-completeness nudge (add a photo, a bio, your interests) — with 0 bios in the whole database this is the biggest single win.
- Interests / travel style / cities shown and editable, and used to say "made for you".
- Real numbers on the stats row (reviews, saved, followers, places).
- Their own posts and comments on their profile.
- Who they follow.
- Honest badges, or none.

## 6. Stored but hidden

Follows, community posts, comments, experience reviews (39), onboarding answers (interests/style/budget/cities), preferred language, reservation requests, pledges, commissions, bookings.

## Bottom line

**Real:** name, photo, bio, join year, followers, saved itineraries, orders, tickets, applications, session requests, bookings, pledges, commissions, wishlist, impact.
**Missing:** unified activity view, upcoming panel, visitor-facing stay/ride requests, completeness nudge, editable interests, real stats, own posts/follows.
**Fake:** Badges & Quests (all of it), the "0 reviews" stat.
**Stored but hidden:** onboarding personalisation, follows, posts, comments, reviews.

## Next step

No code change is proposed yet. Tell me which of the gaps above to build and I'll plan that specifically — my suggested first three: a real activity hub with an Upcoming panel, a profile-completeness nudge with editable interests, and replacing the invented Badges page with something measured (or removing it).
