ALTER TABLE public.accommodations ADD COLUMN IF NOT EXISTS latitude numeric, ADD COLUMN IF NOT EXISTS longitude numeric;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS latitude numeric, ADD COLUMN IF NOT EXISTS longitude numeric;
ALTER TABLE public.audio_tours ADD COLUMN IF NOT EXISTS latitude numeric, ADD COLUMN IF NOT EXISTS longitude numeric;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS latitude numeric, ADD COLUMN IF NOT EXISTS longitude numeric;
ALTER TABLE public.whos_who ADD COLUMN IF NOT EXISTS latitude numeric, ADD COLUMN IF NOT EXISTS longitude numeric;
ALTER TABLE public.causes ADD COLUMN IF NOT EXISTS latitude numeric, ADD COLUMN IF NOT EXISTS longitude numeric;