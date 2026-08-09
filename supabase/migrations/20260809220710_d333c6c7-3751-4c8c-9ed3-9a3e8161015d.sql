-- 1. organizations.owner_id must reference the user account (RLS already
-- compares it to auth.uid()), not providers.id.
UPDATE public.organizations o
SET owner_id = NULL
WHERE owner_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = o.owner_id);

ALTER TABLE public.organizations DROP CONSTRAINT IF EXISTS organizations_owner_id_fkey;
ALTER TABLE public.organizations
  ADD CONSTRAINT organizations_owner_id_fkey
  FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Focus areas for organizations (additive, nullable).
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS focus_areas_en text[],
  ADD COLUMN IF NOT EXISTS focus_areas_ar text[];

-- 3. One satellite row per user, so onboarding can upsert safely.
CREATE UNIQUE INDEX IF NOT EXISTS organizations_owner_id_unique
  ON public.organizations (owner_id) WHERE owner_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS whos_who_user_id_unique
  ON public.whos_who (user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS culture_actors_user_id_unique
  ON public.culture_actors (user_id) WHERE user_id IS NOT NULL;