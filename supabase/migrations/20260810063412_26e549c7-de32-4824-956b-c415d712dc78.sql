-- Helper: resolve an item's owner column value (which may be a providers.id or an auth user id) to an auth user id
CREATE OR REPLACE FUNCTION public.resolve_owner_user_id(_owner uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN _owner IS NULL THEN NULL
    ELSE COALESCE((SELECT p.user_id FROM public.providers p WHERE p.id = _owner), _owner)
  END
$$;

-- ============ reservation_requests ============
CREATE TABLE public.reservation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type text NOT NULL CHECK (item_type IN ('trip','accommodation','transport','product')),
  item_id uuid NOT NULL,
  requester_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id uuid,
  guests integer,
  start_date date,
  end_date date,
  contact_name text,
  contact_phone text,
  note text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','declined','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.reservation_requests TO authenticated;
GRANT ALL ON public.reservation_requests TO service_role;

ALTER TABLE public.reservation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Requesters can create their own reservation requests"
ON public.reservation_requests FOR INSERT TO authenticated
WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Requesters can view their own reservation requests"
ON public.reservation_requests FOR SELECT TO authenticated
USING (requester_id = auth.uid());

CREATE POLICY "Owners can view reservation requests for their items"
ON public.reservation_requests FOR SELECT TO authenticated
USING (owner_id IS NOT NULL AND owner_id = auth.uid());

CREATE POLICY "Requesters can cancel their pending reservation requests"
ON public.reservation_requests FOR UPDATE TO authenticated
USING (requester_id = auth.uid() AND status = 'pending')
WITH CHECK (requester_id = auth.uid() AND status = 'cancelled');

CREATE POLICY "Owners can confirm or decline reservation requests"
ON public.reservation_requests FOR UPDATE TO authenticated
USING (owner_id IS NOT NULL AND owner_id = auth.uid())
WITH CHECK (owner_id IS NOT NULL AND owner_id = auth.uid() AND status IN ('confirmed','declined'));

CREATE INDEX idx_reservation_requests_requester ON public.reservation_requests (requester_id, created_at DESC);
CREATE INDEX idx_reservation_requests_owner ON public.reservation_requests (owner_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.enforce_reservation_request_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner uuid;
BEGIN
  IF NEW.item_type = 'trip' THEN
    SELECT organizer_id INTO v_owner FROM public.trips WHERE id = NEW.item_id;
  ELSIF NEW.item_type = 'accommodation' THEN
    SELECT host_id INTO v_owner FROM public.accommodations WHERE id = NEW.item_id;
  ELSIF NEW.item_type = 'transport' THEN
    SELECT provider_id INTO v_owner FROM public.transport WHERE id = NEW.item_id;
  ELSIF NEW.item_type = 'product' THEN
    SELECT seller_id INTO v_owner FROM public.products WHERE id = NEW.item_id;
  END IF;

  NEW.owner_id := public.resolve_owner_user_id(v_owner);
  NEW.status := 'pending';
  NEW.created_at := now();
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER reservation_requests_insert_integrity
BEFORE INSERT ON public.reservation_requests
FOR EACH ROW EXECUTE FUNCTION public.enforce_reservation_request_insert();

CREATE OR REPLACE FUNCTION public.enforce_reservation_request_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.id := OLD.id;
  NEW.item_type := OLD.item_type;
  NEW.item_id := OLD.item_id;
  NEW.requester_id := OLD.requester_id;
  NEW.owner_id := OLD.owner_id;
  NEW.guests := OLD.guests;
  NEW.start_date := OLD.start_date;
  NEW.end_date := OLD.end_date;
  NEW.contact_name := OLD.contact_name;
  NEW.contact_phone := OLD.contact_phone;
  NEW.note := OLD.note;
  NEW.created_at := OLD.created_at;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER reservation_requests_update_guard
BEFORE UPDATE ON public.reservation_requests
FOR EACH ROW EXECUTE FUNCTION public.enforce_reservation_request_update();

-- ============ support_pledges ============
CREATE TABLE public.support_pledges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cause_id uuid NOT NULL REFERENCES public.causes(id) ON DELETE CASCADE,
  supporter_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id uuid,
  kind text NOT NULL CHECK (kind IN ('donation','gift','consult')),
  amount numeric,
  currency text NOT NULL DEFAULT 'EGP',
  message text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  contact_name text,
  contact_email text,
  contact_phone text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','contacted','completed','declined','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.support_pledges TO authenticated;
GRANT ALL ON public.support_pledges TO service_role;

ALTER TABLE public.support_pledges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Supporters can create their own pledges"
ON public.support_pledges FOR INSERT TO authenticated
WITH CHECK (supporter_id = auth.uid());

CREATE POLICY "Supporters can view their own pledges"
ON public.support_pledges FOR SELECT TO authenticated
USING (supporter_id = auth.uid());

CREATE POLICY "Cause owners can view pledges for their causes"
ON public.support_pledges FOR SELECT TO authenticated
USING (owner_id IS NOT NULL AND owner_id = auth.uid());

CREATE POLICY "Supporters can cancel their pending pledges"
ON public.support_pledges FOR UPDATE TO authenticated
USING (supporter_id = auth.uid() AND status = 'pending')
WITH CHECK (supporter_id = auth.uid() AND status = 'cancelled');

CREATE POLICY "Cause owners can progress pledge status"
ON public.support_pledges FOR UPDATE TO authenticated
USING (owner_id IS NOT NULL AND owner_id = auth.uid())
WITH CHECK (owner_id IS NOT NULL AND owner_id = auth.uid() AND status IN ('contacted','completed','declined'));

CREATE INDEX idx_support_pledges_supporter ON public.support_pledges (supporter_id, created_at DESC);
CREATE INDEX idx_support_pledges_owner ON public.support_pledges (owner_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.enforce_support_pledge_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner uuid;
BEGIN
  SELECT owner_id INTO v_owner FROM public.causes WHERE id = NEW.cause_id;
  NEW.owner_id := public.resolve_owner_user_id(v_owner);
  NEW.status := 'pending';
  NEW.created_at := now();
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER support_pledges_insert_integrity
BEFORE INSERT ON public.support_pledges
FOR EACH ROW EXECUTE FUNCTION public.enforce_support_pledge_insert();

CREATE OR REPLACE FUNCTION public.enforce_support_pledge_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.id := OLD.id;
  NEW.cause_id := OLD.cause_id;
  NEW.supporter_id := OLD.supporter_id;
  NEW.owner_id := OLD.owner_id;
  NEW.kind := OLD.kind;
  NEW.amount := OLD.amount;
  NEW.currency := OLD.currency;
  NEW.message := OLD.message;
  NEW.details := OLD.details;
  NEW.contact_name := OLD.contact_name;
  NEW.contact_email := OLD.contact_email;
  NEW.contact_phone := OLD.contact_phone;
  NEW.created_at := OLD.created_at;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER support_pledges_update_guard
BEFORE UPDATE ON public.support_pledges
FOR EACH ROW EXECUTE FUNCTION public.enforce_support_pledge_update();