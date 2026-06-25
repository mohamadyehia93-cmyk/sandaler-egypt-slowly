-- =========================================================
-- COLLECTIONS (subject-expert)
-- =========================================================
CREATE TABLE public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text,
  expert_id uuid NOT NULL,
  title_en text NOT NULL,
  title_ar text NOT NULL,
  abstract_en text,
  abstract_ar text,
  discipline text,
  region_id text,
  cover_image text,
  entries jsonb NOT NULL DEFAULT '[]'::jsonb,
  refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  license text NOT NULL DEFAULT 'cc-by',
  status text NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.collections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collections TO authenticated;
GRANT ALL ON public.collections TO service_role;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published collections are public" ON public.collections
  FOR SELECT USING (status = 'published' OR auth.uid() = expert_id);
CREATE POLICY "Experts insert own collections" ON public.collections
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = expert_id);
CREATE POLICY "Experts update own collections" ON public.collections
  FOR UPDATE TO authenticated USING (auth.uid() = expert_id) WITH CHECK (auth.uid() = expert_id);
CREATE POLICY "Experts delete own collections" ON public.collections
  FOR DELETE TO authenticated USING (auth.uid() = expert_id);
CREATE TRIGGER trg_collections_updated_at BEFORE UPDATE ON public.collections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- PROGRAMS (organization)
-- =========================================================
CREATE TABLE public.programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text,
  owner_id uuid NOT NULL,
  organization_id uuid,
  title_en text NOT NULL,
  title_ar text NOT NULL,
  description_en text,
  description_ar text,
  program_type text,
  location_en text,
  location_ar text,
  start_date date,
  end_date date,
  volunteers_needed integer,
  donation_target integer,
  goals jsonb NOT NULL DEFAULT '[]'::jsonb,
  image text,
  status text NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.programs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.programs TO authenticated;
GRANT ALL ON public.programs TO service_role;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published programs are public" ON public.programs
  FOR SELECT USING (status = 'published' OR auth.uid() = owner_id);
CREATE POLICY "Owners insert own programs" ON public.programs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners update own programs" ON public.programs
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners delete own programs" ON public.programs
  FOR DELETE TO authenticated USING (auth.uid() = owner_id);
CREATE TRIGGER trg_programs_updated_at BEFORE UPDATE ON public.programs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- FLAG REPORTS (ambassador)
-- =========================================================
CREATE TABLE public.flag_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  issue_type text NOT NULL,
  priority text NOT NULL,
  provider_name text,
  location text,
  description text NOT NULL,
  action_taken text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.flag_reports TO authenticated;
GRANT ALL ON public.flag_reports TO service_role;
ALTER TABLE public.flag_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reporters read own reports" ON public.flag_reports
  FOR SELECT TO authenticated USING (auth.uid() = reporter_id);
CREATE POLICY "Reporters insert own reports" ON public.flag_reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Reporters update own reports" ON public.flag_reports
  FOR UPDATE TO authenticated USING (auth.uid() = reporter_id) WITH CHECK (auth.uid() = reporter_id);
CREATE TRIGGER trg_flag_reports_updated_at BEFORE UPDATE ON public.flag_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- AMBASSADOR TASKS (ambassador)
-- =========================================================
CREATE TABLE public.ambassador_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id uuid NOT NULL,
  title_en text NOT NULL,
  title_ar text,
  description text,
  location text,
  status text NOT NULL DEFAULT 'pending',
  due_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ambassador_tasks TO authenticated;
GRANT ALL ON public.ambassador_tasks TO service_role;
ALTER TABLE public.ambassador_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ambassadors read own tasks" ON public.ambassador_tasks
  FOR SELECT TO authenticated USING (auth.uid() = ambassador_id);
CREATE POLICY "Ambassadors insert own tasks" ON public.ambassador_tasks
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = ambassador_id);
CREATE POLICY "Ambassadors update own tasks" ON public.ambassador_tasks
  FOR UPDATE TO authenticated USING (auth.uid() = ambassador_id) WITH CHECK (auth.uid() = ambassador_id);
CREATE POLICY "Ambassadors delete own tasks" ON public.ambassador_tasks
  FOR DELETE TO authenticated USING (auth.uid() = ambassador_id);
CREATE TRIGGER trg_ambassador_tasks_updated_at BEFORE UPDATE ON public.ambassador_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();