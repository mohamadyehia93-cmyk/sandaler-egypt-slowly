ALTER TABLE public.experiences
  ADD COLUMN IF NOT EXISTS itinerary_en jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS itinerary_ar jsonb DEFAULT '[]'::jsonb;