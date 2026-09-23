DO $$
DECLARE d text;
BEGIN
  d := pg_get_functiondef('public.global_search(text,integer)'::regprocedure);
  IF position('p.body_en ILIKE pat' in d) = 0 THEN
    d := replace(d, 'OR p.excerpt_en ILIKE pat OR p.excerpt_ar ILIKE pat)', 'OR p.excerpt_en ILIKE pat OR p.excerpt_ar ILIKE pat OR p.body_en ILIKE pat OR p.body_ar ILIKE pat)');
    EXECUTE d;
  END IF;
END $$;