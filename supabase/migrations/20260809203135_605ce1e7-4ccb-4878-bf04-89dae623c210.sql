CREATE TABLE public.volunteer_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid REFERENCES public.programs(id) ON DELETE CASCADE,
  cause_id uuid REFERENCES public.causes(id) ON DELETE CASCADE,
  applicant_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  org_owner_id uuid,
  full_name text,
  contact_email text,
  contact_phone text,
  message text,
  availability text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','withdrawn')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT volunteer_applications_target_required CHECK (program_id IS NOT NULL OR cause_id IS NOT NULL)
);

GRANT SELECT, INSERT, UPDATE ON public.volunteer_applications TO authenticated;
GRANT ALL ON public.volunteer_applications TO service_role;

ALTER TABLE public.volunteer_applications ENABLE ROW LEVEL SECURITY;

-- Resolve the organization owner server-side; never trust the client.
CREATE OR REPLACE FUNCTION public.enforce_volunteer_application_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner uuid;
BEGIN
  IF NEW.program_id IS NOT NULL THEN
    SELECT owner_id INTO v_owner FROM public.programs WHERE id = NEW.program_id;
  END IF;

  IF v_owner IS NULL AND NEW.cause_id IS NOT NULL THEN
    SELECT owner_id INTO v_owner FROM public.causes WHERE id = NEW.cause_id;
  END IF;

  NEW.org_owner_id := v_owner;
  NEW.status := 'pending';
  NEW.created_at := now();
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_volunteer_application_insert() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER volunteer_applications_insert_integrity
BEFORE INSERT ON public.volunteer_applications
FOR EACH ROW EXECUTE FUNCTION public.enforce_volunteer_application_insert();

-- Pin every non-status column back to OLD so neither side can rewrite the record.
CREATE OR REPLACE FUNCTION public.enforce_volunteer_application_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.id := OLD.id;
  NEW.program_id := OLD.program_id;
  NEW.cause_id := OLD.cause_id;
  NEW.applicant_id := OLD.applicant_id;
  NEW.org_owner_id := OLD.org_owner_id;
  NEW.full_name := OLD.full_name;
  NEW.contact_email := OLD.contact_email;
  NEW.contact_phone := OLD.contact_phone;
  NEW.message := OLD.message;
  NEW.availability := OLD.availability;
  NEW.created_at := OLD.created_at;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_volunteer_application_update() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER volunteer_applications_update_guard
BEFORE UPDATE ON public.volunteer_applications
FOR EACH ROW EXECUTE FUNCTION public.enforce_volunteer_application_update();

CREATE POLICY "Applicants can submit their own applications"
ON public.volunteer_applications FOR INSERT TO authenticated
WITH CHECK (applicant_id = auth.uid());

CREATE POLICY "Applicants can read their own applications"
ON public.volunteer_applications FOR SELECT TO authenticated
USING (applicant_id = auth.uid());

CREATE POLICY "Applicants can withdraw pending applications"
ON public.volunteer_applications FOR UPDATE TO authenticated
USING (applicant_id = auth.uid() AND status = 'pending')
WITH CHECK (applicant_id = auth.uid() AND status = 'withdrawn');

CREATE POLICY "Organizations can read applications for their work"
ON public.volunteer_applications FOR SELECT TO authenticated
USING (org_owner_id = auth.uid());

CREATE POLICY "Organizations can accept or decline applications"
ON public.volunteer_applications FOR UPDATE TO authenticated
USING (org_owner_id = auth.uid())
WITH CHECK (org_owner_id = auth.uid() AND status IN ('accepted','declined'));