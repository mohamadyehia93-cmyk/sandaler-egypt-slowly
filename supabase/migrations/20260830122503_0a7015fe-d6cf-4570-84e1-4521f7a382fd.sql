-- 1. Claim tokens remember their satellite row explicitly ---------------
ALTER TABLE public.provider_claim_tokens
  ADD COLUMN IF NOT EXISTS satellite_table text,
  ADD COLUMN IF NOT EXISTS satellite_id uuid;

ALTER TABLE public.provider_claim_tokens
  ADD CONSTRAINT provider_claim_tokens_satellite_table_chk
  CHECK (satellite_table IS NULL OR satellite_table IN ('organizations', 'whos_who', 'culture_actors'));

-- 2. Token generation, now able to pin a satellite row -------------------
CREATE OR REPLACE FUNCTION public.admin_create_provider_claim(
  _provider_id uuid,
  _satellite_table text DEFAULT NULL,
  _satellite_id uuid DEFAULT NULL
)
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

  UPDATE public.provider_claim_tokens
     SET revoked_at = now()
   WHERE provider_id = _provider_id
     AND claimed_at IS NULL
     AND revoked_at IS NULL;

  _token := replace(replace(encode(gen_random_bytes(32), 'base64'), '/', '_'), '+', '-');
  _token := replace(_token, '=', '');

  INSERT INTO public.provider_claim_tokens
    (provider_id, token_hash, created_by, expires_at, satellite_table, satellite_id)
  VALUES
    (_provider_id, encode(digest(_token, 'sha256'), 'hex'), auth.uid(),
     now() + interval '30 days', _satellite_table, _satellite_id);

  RETURN _token;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_create_provider_claim(uuid, text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_create_provider_claim(uuid, text, uuid) TO authenticated;

-- 3. Claiming binds the pinned satellite row when present ---------------
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

  IF _row.satellite_id IS NOT NULL AND _row.satellite_table = 'organizations' THEN
    UPDATE public.organizations SET owner_id = _uid, updated_at = now()
     WHERE id = _row.satellite_id AND owner_id IS NULL;
  ELSIF _row.satellite_id IS NOT NULL AND _row.satellite_table = 'whos_who' THEN
    UPDATE public.whos_who SET user_id = _uid, updated_at = now()
     WHERE id = _row.satellite_id AND user_id IS NULL;
  ELSIF _row.satellite_id IS NOT NULL AND _row.satellite_table = 'culture_actors' THEN
    UPDATE public.culture_actors SET user_id = _uid, updated_at = now()
     WHERE id = _row.satellite_id AND user_id IS NULL;
  ELSIF _provider.role = 'organization' THEN
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

-- 4. Adopt an existing ownerless Who's Who directory entry -------------
CREATE OR REPLACE FUNCTION public.admin_adopt_whos_who(_whos_who_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  _ww public.whos_who;
  _provider_id uuid;
  _token text;
  _city_en text;
  _city_ar text;
  _region_en text;
  _region_ar text;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not-authorised';
  END IF;

  SELECT * INTO _ww FROM public.whos_who WHERE id = _whos_who_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'entry-not-found';
  END IF;
  IF _ww.user_id IS NOT NULL THEN
    RAISE EXCEPTION 'already-claimed';
  END IF;

  SELECT c.name_en, c.name_ar INTO _city_en, _city_ar
    FROM public.cities c WHERE c.id = _ww.city_id;
  SELECT r.name_en, r.name_ar INTO _region_en, _region_ar
    FROM public.regions r WHERE r.id = _ww.region_id;

  -- Reuse the provider row created by an earlier adoption of this same entry.
  SELECT p.id INTO _provider_id
    FROM public.provider_claim_tokens t
    JOIN public.providers p ON p.id = t.provider_id
   WHERE t.satellite_table = 'whos_who'
     AND t.satellite_id = _whos_who_id
   ORDER BY t.created_at DESC
   LIMIT 1;

  IF _provider_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM public.providers WHERE id = _provider_id AND user_id IS NOT NULL) THEN
      RAISE EXCEPTION 'already-claimed';
    END IF;
  ELSE
    INSERT INTO public.providers (
      user_id, role, name_en, name_ar, avatar, bio_en, bio_ar,
      city_en, city_ar, region_en, region_ar, slug, status
    ) VALUES (
      NULL, 'whos-who', _ww.name_en, _ww.name_ar, _ww.image, _ww.bio_en, _ww.bio_ar,
      _city_en, _city_ar, _region_en, _region_ar,
      coalesce(_ww.slug, '') || '-ww-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6),
      CASE WHEN _ww.bio_en IS NOT NULL OR _ww.image IS NOT NULL THEN 'published' ELSE 'draft' END
    )
    RETURNING id INTO _provider_id;
  END IF;

  _token := public.admin_create_provider_claim(_provider_id, 'whos_who', _whos_who_id);

  RETURN jsonb_build_object('provider_id', _provider_id, 'token', _token);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_adopt_whos_who(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_adopt_whos_who(uuid) TO authenticated;

-- 5. Remove the leftover role-cycle test rows --------------------------
DELETE FROM public.whos_who
 WHERE user_id IN (SELECT user_id FROM public.providers
                    WHERE slug = 'cycle-whos-who-1781116237389' AND user_id IS NOT NULL);
DELETE FROM public.providers WHERE slug = 'cycle-whos-who-1781116237389';