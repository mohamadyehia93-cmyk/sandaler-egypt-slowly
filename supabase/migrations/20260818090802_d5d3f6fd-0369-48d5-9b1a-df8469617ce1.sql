ALTER TABLE public.programs
  ADD COLUMN IF NOT EXISTS region_id text REFERENCES public.regions(id),
  ADD COLUMN IF NOT EXISTS city_id text REFERENCES public.cities(id),
  ADD COLUMN IF NOT EXISTS latitude numeric,
  ADD COLUMN IF NOT EXISTS longitude numeric,
  ADD COLUMN IF NOT EXISTS video_url text;