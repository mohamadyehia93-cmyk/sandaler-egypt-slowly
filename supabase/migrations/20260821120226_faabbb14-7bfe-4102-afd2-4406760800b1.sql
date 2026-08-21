ALTER TABLE public.whos_who
  ADD COLUMN IF NOT EXISTS availability jsonb NOT NULL DEFAULT '[]'::jsonb;