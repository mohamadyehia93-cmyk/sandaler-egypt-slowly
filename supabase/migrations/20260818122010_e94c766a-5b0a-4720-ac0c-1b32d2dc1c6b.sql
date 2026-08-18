ALTER TABLE public.experiences DROP CONSTRAINT IF EXISTS experiences_theme_check;
ALTER TABLE public.experiences ADD CONSTRAINT experiences_theme_check CHECK (theme = ANY (ARRAY['nature','history','food','adventure','culture','community','other']));
ALTER TABLE public.trips DROP CONSTRAINT IF EXISTS trips_theme_check;
ALTER TABLE public.trips ADD CONSTRAINT trips_theme_check CHECK (theme IS NULL OR theme = ANY (ARRAY['nature','history','food','adventure','culture','community','other']));
ALTER TABLE public.experiences ADD COLUMN IF NOT EXISTS theme_other text;
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS theme_other text;