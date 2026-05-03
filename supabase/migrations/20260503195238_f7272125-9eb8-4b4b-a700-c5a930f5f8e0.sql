
ALTER TABLE public.trips ADD COLUMN IF NOT EXISTS theme text;
ALTER TABLE public.trips ADD CONSTRAINT trips_theme_check CHECK (theme IS NULL OR theme = ANY (ARRAY['nature','history','food','adventure','culture','community']));
