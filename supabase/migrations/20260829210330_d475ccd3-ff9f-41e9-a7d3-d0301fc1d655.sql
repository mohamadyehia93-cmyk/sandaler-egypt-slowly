-- ============================================================
-- Assisted onboarding: admin-created unclaimed provider profiles
-- + single-use claim tokens
-- ============================================================

-- 1. Admin access to unclaimed provider + satellite rows -------------

CREATE POLICY "Admins can read all provider profiles"
  ON public.providers FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create unclaimed provider profiles"
  ON public.providers FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND user_id IS NULL);

CREATE POLICY "Admins can update unclaimed provider profiles"
  ON public.providers FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') AND user_id IS NULL)
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND user_id IS NULL);

CREATE POLICY "Admins can create unclaimed organizations"
  ON public.organizations FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND owner_id IS NULL);

CREATE POLICY "Admins can update unclaimed organizations"
  ON public.organizations FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') AND owner_id IS NULL)
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND owner_id IS NULL);

CREATE POLICY "Admins can create unclaimed whos_who entries"
  ON public.whos_who FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND user_id IS NULL);

CREATE POLICY "Admins can update unclaimed whos_who entries"
  ON public.whos_who FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') AND user_id IS NULL)
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND user_id IS NULL);

CREATE POLICY "Admins can create unclaimed culture actors"
  ON public.culture_actors FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND user_id IS NULL);

CREATE POLICY "Admins can update unclaimed culture actors"
  ON public.culture_actors FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') AND user_id IS NULL)
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND user_id IS NULL);

-- 2. Claim tokens ---------------------------------------------------
-- Only the SHA-256 hash of the token is stored, so a database read can
-- never reconstruct a working claim link.

CREATE TABLE public.provider_claim_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  created_by uuid NOT NULL,
  expires_at timestamptz NOT NULL,
  claimed_at timestamptz,
  claimed_by uuid,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX provider_claim_tokens_provider_idx ON public.provider_claim_tokens(provider_id);

GRANT SELECT ON public.provider_claim_tokens TO authenticated;
GRANT ALL ON public.provider_claim_tokens TO service_role;

ALTER TABLE public.provider_claim_tokens ENABLE ROW LEVEL SECURITY;

-- Admins may inspect claim status. Writes happen only through the
-- security-definer functions below, so no INSERT/UPDATE/DELETE policy exists.
CREATE POLICY "Admins can read claim tokens"
  ON public.provider_claim_tokens FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_provider_claim_tokens_updated_at
  BEFORE UPDATE ON public.provider_claim_tokens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Token generation (admins only) ---------------------------------

CREATE OR REPLACE FUNCTION public.admin_create_provider_claim(_provider_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  _token text;
  _owner uuid;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not-authorised';
  END IF;

  SELECT user_id INTO _owner FROM public.providers WHERE id = _provider_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'provider-not-found';
  END IF;
  IF _owner IS NOT NULL THEN
    RAISE EXCEPTION 'already-claimed';
  END IF;

  -- Issuing a new link cancels every previous unused link for this profile.
  UPDATE public.provider_claim_tokens
     SET revoked_at = now()
   WHERE provider_id = _provider_id
     AND claimed_at IS NULL
     AND revoked_at IS NULL;

  _token := replace(replace(encode(gen_random_bytes(32), 'base64'), '/', '_'), '+', '-');
  _token := replace(_token, '=', '');

  INSERT INTO public.provider_claim_tokens (provider_id, token_hash, created_by, expires_at)
  VALUES (_provider_id, encode(digest(_token, 'sha256'), 'hex'), auth.uid(), now() + interval '30 days');

  RETURN _token;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_create_provider_claim(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_create_provider_claim(uuid) TO authenticated;

-- 4. Claiming (any signed-in user holding a valid token) -------------

CREATE OR REPLACE FUNCTION public.claim_provider_profile(_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  _uid uuid := auth.uid();
  _row public.provider_claim_tokens;
  _provider public.providers;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'not-authenticated';
  END IF;
  IF _token IS NULL OR length(_token) < 20 THEN
    RAISE EXCEPTION 'invalid-token';
  END IF;

  SELECT * INTO _row
    FROM public.provider_claim_tokens
   WHERE token_hash = encode(digest(_token, 'sha256'), 'hex')
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'invalid-token';
  END IF;
  IF _row.revoked_at IS NOT NULL THEN
    RAISE EXCEPTION 'token-revoked';
  END IF;
  IF _row.claimed_at IS NOT NULL THEN
    RAISE EXCEPTION 'token-used';
  END IF;
  IF _row.expires_at < now() THEN
    RAISE EXCEPTION 'token-expired';
  END IF;

  SELECT * INTO _provider FROM public.providers WHERE id = _row.provider_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'provider-not-found';
  END IF;
  IF _provider.user_id IS NOT NULL THEN
    RAISE EXCEPTION 'already-claimed';
  END IF;

  IF EXISTS (SELECT 1 FROM public.providers WHERE user_id = _uid) THEN
    RAISE EXCEPTION 'account-has-provider';
  END IF;

  UPDATE public.providers SET user_id = _uid, updated_at = now() WHERE id = _provider.id;

  -- Bind the matching satellite profile, if the role has one.
  IF _provider.role = 'organization' THEN
    UPDATE public.organizations SET owner_id = _uid, updated_at = now()
     WHERE id = (SELECT id FROM public.organizations
                  WHERE owner_id IS NULL AND lower(name_en) = lower(_provider.name_en)
                  ORDER BY created_at DESC LIMIT 1);
  ELSIF _provider.role = 'whos-who' THEN
    UPDATE public.whos_who SET user_id = _uid, updated_at = now()
     WHERE id = (SELECT id FROM public.whos_who
                  WHERE user_id IS NULL AND lower(name_en) = lower(_provider.name_en)
                  ORDER BY created_at DESC LIMIT 1);
  ELSIF _provider.role = 'culture-actor' THEN
    UPDATE public.culture_actors SET user_id = _uid, updated_at = now()
     WHERE id = (SELECT id FROM public.culture_actors
                  WHERE user_id IS NULL AND lower(name_en) = lower(_provider.name_en)
                  ORDER BY created_at DESC LIMIT 1);
  END IF;

  UPDATE public.provider_claim_tokens
     SET claimed_at = now(), claimed_by = _uid
   WHERE id = _row.id;

  RETURN jsonb_build_object(
    'provider_id', _provider.id,
    'role', _provider.role,
    'slug', _provider.slug,
    'name_en', _provider.name_en
  );
END;
$$;

REVOKE ALL ON FUNCTION public.claim_provider_profile(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_provider_profile(text) TO authenticated;