# Optional description for every itinerary step

Each itinerary step gets an optional description line under it — in the experience wizard and in the trip form. Experience itinerary steps also start being saved and shown on the public experience page (today they are typed and silently discarded).

## Experience wizard (the screen in the screenshot)

- Every step keeps its short title input and gains an optional description textarea beneath it, with a bilingual placeholder ("Add detail — optional" / "أضف وصفًا — اختياري").
- Steps are authored in one language at a time, matching the existing bilingual convention used by trips: the language you write in is the language saved, and the other language's stored itinerary is preserved untouched on edit.
- Steps with an empty title and empty description are dropped on save.

## Public experience page

- A new "Itinerary / خطة التجربة" section renders the numbered steps, each with its description when present.
- The section is hidden entirely when the listing has no itinerary content — no placeholders, no invented steps.
- Editing an experience loads the saved steps and descriptions back into the wizard.

## Trip form

- Each itinerary day keeps its current short line and gains an optional description textarea below it.
- The trip detail page already renders a day heading plus a description, so both fields surface without changes there.
- Existing trips: the currently stored day text loads into the short line; the new description starts empty. Nothing is deleted.

## Technical notes

- Migration: add nullable `itinerary_en jsonb` and `itinerary_ar jsonb` (default `[]`) to `public.experiences`, mirroring the `trips` columns. No policy or grant changes needed — existing experience policies already cover the table.
- Shape stored per experience step: `{ "step": string, "description": string }`.
- Files: `src/components/experience-wizard/types.ts` (step shape + default), `src/components/experience-wizard/StepLocation.tsx` (description input, add/remove), `src/pages/dashboards/NewExperience.tsx` (load on edit, include in save payload with the same `otherLang` preservation pattern used by `NewTrip.tsx`), `src/pages/ExperienceDetail.tsx` (render section, hidden when empty), `src/pages/dashboards/NewTrip.tsx` (per-day description bound to the day `description` field, short line bound to `title`).
- Verification: typecheck + vite build, then a headless Arabic pass at 390px creating an experience with descriptions and confirming they render on the public page in both languages.

## One language mandatory, not both

Currently the experience wizard demands both an English and an Arabic title (both marked `*`), so an Arabic-first host cannot proceed without writing English.

- Only the field in the author's current interface language is required; the other language becomes clearly optional.
- Labels reflect it: `*` only on the required language, "(optional)" on the other.
- Validation on the step and on publish checks the author-language field only; description fields follow the same rule.
- Applies to the experience wizard title and description steps, and any other creation form that hard-requires both languages (the shared bilingual field already treats the second language as optional, so most forms are unaffected — I will sweep the New* forms and align any that require both).
- Nothing is invented for the empty language: it saves as empty and public pages already fall back to the language that exists.
