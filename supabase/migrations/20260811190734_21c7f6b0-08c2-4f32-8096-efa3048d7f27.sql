ALTER TABLE public.experiences
  ADD COLUMN IF NOT EXISTS remarks_en text,
  ADD COLUMN IF NOT EXISTS remarks_ar text;