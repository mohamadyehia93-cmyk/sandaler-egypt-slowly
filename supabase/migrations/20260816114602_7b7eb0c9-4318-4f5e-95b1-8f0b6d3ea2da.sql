ALTER TABLE public.accommodations
  ADD COLUMN IF NOT EXISTS amenities_en text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS amenities_ar text[] NOT NULL DEFAULT '{}';

-- The 4 existing rows all carry English amenity labels, so they migrate into amenities_en.
UPDATE public.accommodations
SET amenities_en = COALESCE(amenities, '{}')
WHERE cardinality(COALESCE(amenities_en, '{}')) = 0
  AND cardinality(COALESCE(amenities, '{}')) > 0;