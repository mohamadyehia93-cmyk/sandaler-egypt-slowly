-- 1. listing_kind on both tables
ALTER TABLE public.accommodations
  ADD COLUMN IF NOT EXISTS listing_kind text NOT NULL DEFAULT 'editorial';
ALTER TABLE public.transport
  ADD COLUMN IF NOT EXISTS listing_kind text NOT NULL DEFAULT 'editorial';

ALTER TABLE public.accommodations DROP CONSTRAINT IF EXISTS accommodations_listing_kind_check;
ALTER TABLE public.accommodations
  ADD CONSTRAINT accommodations_listing_kind_check
  CHECK (listing_kind IN ('editorial','hosted'));

ALTER TABLE public.transport DROP CONSTRAINT IF EXISTS transport_listing_kind_check;
ALTER TABLE public.transport
  ADD CONSTRAINT transport_listing_kind_check
  CHECK (listing_kind IN ('editorial','hosted'));

-- 2. Backfill. A row whose owner record was never claimed by a real user is
-- reference information, not an orphan: detach the placeholder owner and mark
-- it editorial. Rows owned by a claimed provider record become hosted.
UPDATE public.accommodations a
SET listing_kind = 'hosted'
WHERE a.host_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM public.providers p WHERE p.id = a.host_id AND p.user_id IS NOT NULL);

UPDATE public.accommodations a
SET listing_kind = 'editorial', host_id = NULL
WHERE a.host_id IS NULL
   OR NOT EXISTS (SELECT 1 FROM public.providers p WHERE p.id = a.host_id AND p.user_id IS NOT NULL);

UPDATE public.transport t
SET listing_kind = 'hosted'
WHERE t.provider_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM public.providers p WHERE p.id = t.provider_id AND p.user_id IS NOT NULL);

UPDATE public.transport t
SET listing_kind = 'editorial', provider_id = NULL
WHERE t.provider_id IS NULL
   OR NOT EXISTS (SELECT 1 FROM public.providers p WHERE p.id = t.provider_id AND p.user_id IS NOT NULL);

-- 3. Enforce the model in the database, not the client.
CREATE OR REPLACE FUNCTION public.enforce_listing_kind_owner()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  owner_col text := TG_ARGV[0];
  owner_val uuid;
BEGIN
  EXECUTE format('SELECT ($1).%I', owner_col) INTO owner_val USING NEW;

  IF NEW.listing_kind = 'hosted' AND owner_val IS NULL THEN
    RAISE EXCEPTION 'a hosted listing must have an owner (%)', owner_col
      USING ERRCODE = 'check_violation';
  END IF;

  IF NEW.listing_kind = 'editorial' AND owner_val IS NOT NULL THEN
    RAISE EXCEPTION 'an editorial listing must not have an owner (%)', owner_col
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_accommodation_listing_kind ON public.accommodations;
CREATE TRIGGER enforce_accommodation_listing_kind
  BEFORE INSERT OR UPDATE ON public.accommodations
  FOR EACH ROW EXECUTE FUNCTION public.enforce_listing_kind_owner('host_id');

DROP TRIGGER IF EXISTS enforce_transport_listing_kind ON public.transport;
CREATE TRIGGER enforce_transport_listing_kind
  BEFORE INSERT OR UPDATE ON public.transport
  FOR EACH ROW EXECUTE FUNCTION public.enforce_listing_kind_owner('provider_id');

-- 4. Admin editorial authoring. Admins get write access to editorial rows only;
-- hosted rows they do not own stay closed to them.
DROP POLICY IF EXISTS "Admins can read editorial accommodations" ON public.accommodations;
CREATE POLICY "Admins can read editorial accommodations"
  ON public.accommodations FOR SELECT TO authenticated
  USING (listing_kind = 'editorial' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert editorial accommodations" ON public.accommodations;
CREATE POLICY "Admins can insert editorial accommodations"
  ON public.accommodations FOR INSERT TO authenticated
  WITH CHECK (listing_kind = 'editorial' AND host_id IS NULL AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update editorial accommodations" ON public.accommodations;
CREATE POLICY "Admins can update editorial accommodations"
  ON public.accommodations FOR UPDATE TO authenticated
  USING (listing_kind = 'editorial' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (listing_kind = 'editorial' AND host_id IS NULL AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete editorial accommodations" ON public.accommodations;
CREATE POLICY "Admins can delete editorial accommodations"
  ON public.accommodations FOR DELETE TO authenticated
  USING (listing_kind = 'editorial' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can read editorial transport" ON public.transport;
CREATE POLICY "Admins can read editorial transport"
  ON public.transport FOR SELECT TO authenticated
  USING (listing_kind = 'editorial' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert editorial transport" ON public.transport;
CREATE POLICY "Admins can insert editorial transport"
  ON public.transport FOR INSERT TO authenticated
  WITH CHECK (listing_kind = 'editorial' AND provider_id IS NULL AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update editorial transport" ON public.transport;
CREATE POLICY "Admins can update editorial transport"
  ON public.transport FOR UPDATE TO authenticated
  USING (listing_kind = 'editorial' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (listing_kind = 'editorial' AND provider_id IS NULL AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete editorial transport" ON public.transport;
CREATE POLICY "Admins can delete editorial transport"
  ON public.transport FOR DELETE TO authenticated
  USING (listing_kind = 'editorial' AND public.has_role(auth.uid(), 'admin'));

-- 5. Hosted-listing insert/update policies must also refuse editorial writes
-- by providers (owner columns are already checked by owns_provider_record).
CREATE INDEX IF NOT EXISTS idx_accommodations_listing_kind ON public.accommodations (listing_kind);
CREATE INDEX IF NOT EXISTS idx_transport_listing_kind ON public.transport (listing_kind);