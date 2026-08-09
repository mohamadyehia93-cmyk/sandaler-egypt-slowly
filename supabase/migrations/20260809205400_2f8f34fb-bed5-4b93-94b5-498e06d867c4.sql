CREATE TABLE public.session_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meetup_id uuid NOT NULL REFERENCES public.meetups(id) ON DELETE CASCADE,
  requester_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  expert_owner_id uuid,
  preferred_date text,
  message text,
  contact_email text,
  contact_phone text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.session_requests TO authenticated;
GRANT ALL ON public.session_requests TO service_role;

ALTER TABLE public.session_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Requesters can create their own session requests"
ON public.session_requests FOR INSERT TO authenticated
WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Requesters can view their own session requests"
ON public.session_requests FOR SELECT TO authenticated
USING (requester_id = auth.uid());

CREATE POLICY "Requesters can cancel pending session requests"
ON public.session_requests FOR UPDATE TO authenticated
USING (requester_id = auth.uid() AND status = 'pending')
WITH CHECK (requester_id = auth.uid() AND status = 'cancelled');

CREATE POLICY "Experts can view requests for their sessions"
ON public.session_requests FOR SELECT TO authenticated
USING (expert_owner_id = auth.uid());

CREATE POLICY "Experts can accept or decline requests"
ON public.session_requests FOR UPDATE TO authenticated
USING (expert_owner_id = auth.uid())
WITH CHECK (expert_owner_id = auth.uid() AND status IN ('accepted','declined'));

CREATE OR REPLACE FUNCTION public.enforce_session_request_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner uuid;
BEGIN
  SELECT organizer_id INTO v_owner FROM public.meetups WHERE id = NEW.meetup_id;
  NEW.expert_owner_id := v_owner;
  NEW.status := 'pending';
  NEW.created_at := now();
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER session_requests_insert_integrity
BEFORE INSERT ON public.session_requests
FOR EACH ROW EXECUTE FUNCTION public.enforce_session_request_insert();

CREATE OR REPLACE FUNCTION public.enforce_session_request_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.id := OLD.id;
  NEW.meetup_id := OLD.meetup_id;
  NEW.requester_id := OLD.requester_id;
  NEW.expert_owner_id := OLD.expert_owner_id;
  NEW.preferred_date := OLD.preferred_date;
  NEW.message := OLD.message;
  NEW.contact_email := OLD.contact_email;
  NEW.contact_phone := OLD.contact_phone;
  NEW.created_at := OLD.created_at;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER session_requests_update_guard
BEFORE UPDATE ON public.session_requests
FOR EACH ROW EXECUTE FUNCTION public.enforce_session_request_update();