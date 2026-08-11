-- L4 — bring the three out-of-band tables into version control.
--
-- public.profiles, public.saved_itineraries and public.user_roles have no
-- CREATE TABLE anywhere in supabase/migrations. They were created outside the
-- migration history (Lovable project bootstrap) and predate every file here:
-- replaying the migrations against an empty database fails on the very first
-- one, 20260406110453, at `ALTER TABLE public.profiles ADD CONSTRAINT
-- profiles_user_id_key` — "relation public.profiles does not exist".
--
-- ⚠️  THIS IS A RECONSTRUCTION, NOT A DUMP. It was written from indirect
-- evidence, not from the live schema (no database access at authoring time).
-- It must be checked against a real `pg_dump --schema-only` before being
-- trusted. See the PR description for the confirmed/inferred breakdown.
--
-- SAFETY: every statement is inside a guard that fires only when the table is
-- absent. Against the live database, where all three exist, this migration
-- does nothing at all — no ALTER, no policy, no grant, no data. It cannot
-- clobber or widen anything. Its value today is documentation and the ability
-- to stand up a fresh environment.
--
-- NOTE ON RLS: the SELECT policies for these tables live only in the live
-- database and are NOT reproduced here, because RLS policies are permissive
-- and OR together — inventing one could *widen* access on any environment
-- where the table did not already exist. Freshly created tables therefore get
-- RLS enabled with no read policy, which fails closed (deny-all) until the
-- real policies are dumped from production and committed. The UPDATE policies
-- for profiles and saved_itineraries are already in 20260810132333.

-- app_role enum — values confirmed from src/integrations/supabase/types.ts.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
  END IF;
END $$;

-- ---------------------------------------------------------------- profiles
DO $$
BEGIN
  IF to_regclass('public.profiles') IS NULL THEN
    CREATE TABLE public.profiles (
      id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id       uuid NOT NULL,
      display_name  text,
      avatar_url    text,
      bio           text,
      -- personalisation columns: withheld from the anon/authenticated column
      -- GRANT in 20260810132333, which is what keeps them private.
      budget        text,
      cities        text[],
      interests     text[],
      travel_style  text,
      created_at    timestamptz NOT NULL DEFAULT now(),
      updated_at    timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT profiles_user_id_key UNIQUE (user_id),
      CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES auth.users(id) ON DELETE CASCADE
    );
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- ------------------------------------------------------- saved_itineraries
DO $$
BEGIN
  IF to_regclass('public.saved_itineraries') IS NULL THEN
    CREATE TABLE public.saved_itineraries (
      id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id        uuid NOT NULL,
      title          text NOT NULL,
      destination    text,
      duration_days  integer,
      messages       jsonb NOT NULL DEFAULT '[]'::jsonb,
      created_at     timestamptz NOT NULL DEFAULT now(),
      updated_at     timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT saved_itineraries_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES auth.users(id) ON DELETE CASCADE
    );
    ALTER TABLE public.saved_itineraries ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- -------------------------------------------------------------- user_roles
DO $$
BEGIN
  IF to_regclass('public.user_roles') IS NULL THEN
    CREATE TABLE public.user_roles (
      id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id  uuid NOT NULL,
      role     public.app_role NOT NULL,
      CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role),
      CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES auth.users(id) ON DELETE CASCADE
    );
    ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- ------------------------------------------------- out-of-band FUNCTIONS
-- Two functions are referenced throughout the migrations but defined nowhere
-- in the repo, so a replay fails on them the same way it failed on the tables:
--
--   update_updated_at_column()  — 40+ BEFORE UPDATE triggers call it
--   has_role(uuid, app_role)    — called by 4 policies (events, flag_reports)
--                                 and by the new hero_slides admin policy
--
-- CREATE OR REPLACE is deliberately avoided: on the live database that would
-- overwrite the real definition with this guess. Each is created only when
-- absent, so live is untouched.
DO $recon$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'update_updated_at_column'
  ) THEN
    EXECUTE $fn$
      CREATE FUNCTION public.update_updated_at_column()
      RETURNS trigger
      LANGUAGE plpgsql
      AS $body$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $body$;
    $fn$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'has_role'
  ) THEN
    EXECUTE $fn$
      CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
      RETURNS boolean
      LANGUAGE sql
      STABLE
      SECURITY DEFINER
      SET search_path = public
      AS $body$
        SELECT EXISTS (
          SELECT 1 FROM public.user_roles
          WHERE user_id = _user_id AND role = _role
        )
      $body$;
    $fn$;
    -- Matches the grant matrix already established in 20260610085743.
    EXECUTE 'REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated';
  END IF;
END $recon$;
