# Shorter, smoother visitor onboarding

Today a visitor passes 8 screens: splash → language → role → city grid (~30 cities) → interests (3 required) → travel style → budget → profile. Most of it collects data the feed can survive without.

Target: **3 screens before the feed** (plus the splash), everything else optional or deferred.

## New visitor flow

```text
1. Splash + language     (logo, "العربية / English" — one tap, no separate screen)
2. Who are you?          (Visitor / one of the provider statements)
3. Where + what          (4 region cards, then interests in the same scroll)
   → Explore feed
```

### 1. Merge splash and language
The splash screen currently exists only to be tapped through. Put the two language buttons directly on it, so the first tap already sets the language and advances.

### 2. Region instead of cities
Replace the city grid with 4 large region cards (Nile Delta, Upper Egypt, Suez Canal, Frontiers) using the existing region images/emoji — multi-select, no scrolling, no region-filter chips. Store the chosen region ids; cities stay available later from the profile/settings for anyone who wants finer control. Feed personalization already groups by region, so nothing downstream loses meaning.

### 3. One personalization screen instead of three
Interests, travel style and budget become one scrollable screen:
- Interests: same icon grid, **minimum drops from 3 to 0** (a "Continue" that is always enabled).
- Travel style and budget: compact single-row chip pickers under the interests grid, optional.

### 4. Profile step becomes optional and deferred for visitors
Visitors finish at the region/interests screen and land on the feed immediately. Name/photo/bio are only asked when they actually need an identity (posting, messaging, booking) — the existing profile step stays exactly as it is for provider branches and for `/edit-profile`.

### 5. Smoothness details
- Persistent slim progress bar with real step counts (3 steps, not the current "1/3" that only covers the quiz).
- Every screen keeps a single primary button; remove the duplicated "Skip" links now that nothing is required.
- Selections apply on tap and advance without a second confirmation where the step is single-select (language, role).
- Back always returns to the previous visible screen (the current back handler reconstructs role-question indexes; it gets simpler with fewer steps).

## Technical notes

All in `src/pages/Splash.tsx`:
- `OnboardingStep` for the visitor branch shrinks to `"splash" | "role" | "discover"`; provider steps (`localRole`, `roleDetails`, `city`, `profile`) are untouched.
- New `discover` step renders regions (from `useRegions`) + interests + style + budget; `city` step is kept solely for the provider branch ("Where are you based?").
- `persistPersonalization` keeps writing `interests`, `travel_style`, `budget`, and starts writing region ids into the existing `profiles.cities` semantics — no schema change. If the stored shape should stay city-based, regions expand to their member city ids on save so nothing that reads `cities` breaks.
- Draft persistence (`onboardingDraft.ts`) keeps working; only the step names it restores to change.

No migration, no change to provider onboarding, Who's Who stays invitation-only.
