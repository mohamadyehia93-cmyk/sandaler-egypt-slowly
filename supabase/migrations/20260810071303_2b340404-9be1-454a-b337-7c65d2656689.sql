-- 1. additive columns on flag_reports
ALTER TABLE public.flag_reports
  ADD COLUMN IF NOT EXISTS reviewed_by uuid,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS resolution_note text;

ALTER TABLE public.flag_reports ALTER COLUMN status SET DEFAULT 'pending';

UPDATE public.flag_reports
SET status = 'pending'
WHERE status IS NULL OR status NOT IN ('pending','reviewing','resolved','dismissed');

-- 2. first-admin bootstrap: usable exactly once, ever
CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Must be signed in to claim the first admin role';
  END IF;

  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RAISE EXCEPTION 'An administrator already exists; first-admin bootstrap is closed';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_uid, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_first_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.claim_first_admin() FROM anon;
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;

-- 3. RLS: admin read/update on flag_reports
DROP POLICY IF EXISTS "Admins can read all reports" ON public.flag_reports;
CREATE POLICY "Admins can read all reports"
  ON public.flag_reports FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update reports" ON public.flag_reports;
CREATE POLICY "Admins can update reports"
  ON public.flag_reports FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. column guard: reporters cannot touch moderation fields; admins cannot rewrite the report body
CREATE OR REPLACE FUNCTION public.enforce_flag_report_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin boolean := public.has_role(auth.uid(), 'admin');
BEGIN
  IF v_admin THEN
    -- admins may only moderate
    NEW.id := OLD.id;
    NEW.reporter_id := OLD.reporter_id;
    NEW.issue_type := OLD.issue_type;
    NEW.priority := OLD.priority;
    NEW.provider_name := OLD.provider_name;
    NEW.location := OLD.location;
    NEW.description := OLD.description;
    NEW.created_at := OLD.created_at;

    IF NEW.status IS NULL OR NEW.status NOT IN ('pending','reviewing','resolved','dismissed') THEN
      RAISE EXCEPTION 'Invalid flag report status: %', NEW.status;
    END IF;

    IF NEW.status IS DISTINCT FROM OLD.status THEN
      NEW.reviewed_by := auth.uid();
      NEW.reviewed_at := now();
    END IF;
  ELSE
    -- reporters may only edit their own report body
    NEW.status := OLD.status;
    NEW.reviewed_by := OLD.reviewed_by;
    NEW.reviewed_at := OLD.reviewed_at;
    NEW.resolution_note := OLD.resolution_note;
    NEW.action_taken := OLD.action_taken;
    NEW.reporter_id := OLD.reporter_id;
    NEW.created_at := OLD.created_at;
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS flag_reports_update_guard ON public.flag_reports;
CREATE TRIGGER flag_reports_update_guard
  BEFORE UPDATE ON public.flag_reports
  FOR EACH ROW EXECUTE FUNCTION public.enforce_flag_report_update();