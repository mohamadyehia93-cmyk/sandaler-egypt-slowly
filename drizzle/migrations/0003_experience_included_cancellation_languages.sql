ALTER TABLE public.experiences
  ADD COLUMN IF NOT EXISTS included_en text,
  ADD COLUMN IF NOT EXISTS included_ar text,
  ADD COLUMN IF NOT EXISTS not_included_en text,
  ADD COLUMN IF NOT EXISTS not_included_ar text,
  ADD COLUMN IF NOT EXISTS cancellation_policy_en text,
  ADD COLUMN IF NOT EXISTS cancellation_policy_ar text,
  ADD COLUMN IF NOT EXISTS languages text[];