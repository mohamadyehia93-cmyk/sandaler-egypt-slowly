## Goal
Shift visual weight on the home/Explore feed away from chrome (header, banners, labels) and onto the actual content (photos, hero, cards).

## Changes

### 1. Hero takes over the top of the page (`src/components/HeroCarousel.tsx`)
- Make edge-to-edge (remove `mx-4` and rounded corners), height `60vh` min `420px`.
- Stronger bottom-to-top dark gradient; title bumped to `text-3xl font-bold` overlaid on image.
- Subtler dot indicators (thin pills, white).
- Slight zoom-in animation on slide change for cinematic feel.

### 2. Compact, auto-hiding header (`src/pages/Index.tsx`)
- Header becomes `absolute top-0` over the hero, transparent background, white icons, so the hero starts at the very top.
- After scroll past hero, header gains a solid background via scroll listener.
- Remove the standalone "Date Banner" row — fold it into the header as a small calendar icon button next to the bell.
- Move the language toggle out of the header (to Profile/Settings); keep Search + Calendar + Bell only.

### 3. Pill-style top tabs (`src/components/TopTabs.tsx`)
- Replace full-width underlined tabs with centered rounded pills (active: filled `primary-dark`, inactive: muted text).
- Tabs sit on a transparent strip directly under the hero, no border line.

### 4. Lighter section headers (`src/components/SectionHeader.tsx`)
- Title: `text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground` (Arabic skips uppercase/tracking).
- "See All" link: small, muted-foreground, hover→primary.
- Increase section bottom margin to `mb-8` for breathing room.

### 5. Icon-only bottom nav (`src/components/BottomNav.tsx`)
- Drop text labels; show only icons (`w-6 h-6`) with a small dot under the active icon.
- Add `aria-label` for accessibility / RTL.

### 6. Move trust modules out of main feed (`src/pages/Index.tsx`)
- Remove `<Testimonials />`, `<Partners />`, `<Certifications />` from the inline Explore stack.
- Add a single collapsible "Why Sandal?" footer section at the bottom of the feed that, when expanded, renders those three components. Collapsed by default.

## Files touched
- `src/components/HeroCarousel.tsx` — full-bleed taller hero
- `src/components/TopTabs.tsx` — pill tabs
- `src/components/SectionHeader.tsx` — quieter typography
- `src/components/BottomNav.tsx` — icons only
- `src/pages/Index.tsx` — auto-hiding transparent header, fold date into header, remove lang toggle, collapsed "Why Sandal" footer

## Out of scope (can do in follow-ups)
- Card-level changes (portrait aspect ratios, removing role badges from thumbnails).
- Color palette restraint on feed cards.
- Move language toggle into Settings page (will only remove from header for now; users can still switch via Settings if it exists).

## Notes
- All changes preserve RTL (chevrons, gradients direction-agnostic, Arabic skips uppercase).
- No backend changes, no new dependencies.
