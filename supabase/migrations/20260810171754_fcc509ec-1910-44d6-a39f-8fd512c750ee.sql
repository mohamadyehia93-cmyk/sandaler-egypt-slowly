CREATE OR REPLACE FUNCTION public.global_search(_q text, _limit integer DEFAULT 20)
 RETURNS TABLE(item_type text, item_id uuid, slug text, title_en text, title_ar text, subtitle text, image text, rank real)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  q text := btrim(coalesce(_q, ''));
  pat text;
  pre text;
  lim int := least(greatest(coalesce(_limit, 20), 1), 100);
BEGIN
  IF length(q) < 2 THEN
    RETURN;
  END IF;
  q := replace(replace(replace(q, '\', '\\'), '%', '\%'), '_', '\_');
  pat := '%' || q || '%';
  pre := q || '%';

  RETURN QUERY
  WITH hits AS (
    SELECT 'experience'::text AS item_type, e.id AS item_id, e.slug, e.title_en, e.title_ar,
           NULL::text AS subtitle, e.image,
           CASE WHEN e.title_en ILIKE pre OR e.title_ar ILIKE pre THEN 2.0 ELSE 1.0 END::real AS rank
    FROM public.experiences e
    WHERE e.status = 'published'
      AND (e.title_en ILIKE pat OR e.title_ar ILIKE pat OR e.description_en ILIKE pat OR e.description_ar ILIKE pat)

    UNION ALL
    SELECT 'trip', t.id, t.slug, t.title_en, t.title_ar, NULL, t.image,
           CASE WHEN t.title_en ILIKE pre OR t.title_ar ILIKE pre THEN 2.0 ELSE 1.0 END
    FROM public.trips t
    WHERE t.status = 'published'
      AND (t.title_en ILIKE pat OR t.title_ar ILIKE pat OR t.description_en ILIKE pat OR t.description_ar ILIKE pat)

    UNION ALL
    SELECT 'event', ev.id, ev.slug, ev.title_en, ev.title_ar, ev.category, ev.image,
           CASE WHEN ev.title_en ILIKE pre OR ev.title_ar ILIKE pre THEN 2.0 ELSE 1.0 END
    FROM public.events ev
    WHERE ev.status = 'published'
      AND (ev.title_en ILIKE pat OR ev.title_ar ILIKE pat OR ev.description_en ILIKE pat OR ev.description_ar ILIKE pat)

    UNION ALL
    SELECT 'post', p.id, p.slug, p.title_en, p.title_ar, p.category, p.image,
           CASE WHEN p.title_en ILIKE pre OR p.title_ar ILIKE pre THEN 2.0 ELSE 1.0 END
    FROM public.posts p
    WHERE p.status = 'published'
      AND (p.title_en ILIKE pat OR p.title_ar ILIKE pat OR p.excerpt_en ILIKE pat OR p.excerpt_ar ILIKE pat)

    UNION ALL
    SELECT 'audio_tour', a.id, a.slug, a.title_en, a.title_ar, NULL, a.image,
           CASE WHEN a.title_en ILIKE pre OR a.title_ar ILIKE pre THEN 2.0 ELSE 1.0 END
    FROM public.audio_tours a
    WHERE a.status = 'published'
      AND (a.title_en ILIKE pat OR a.title_ar ILIKE pat OR a.description_en ILIKE pat OR a.description_ar ILIKE pat)

    UNION ALL
    SELECT 'product', pr.id, pr.slug, pr.name_en, pr.name_ar, pr.category, pr.image,
           CASE WHEN pr.name_en ILIKE pre OR pr.name_ar ILIKE pre THEN 2.0 ELSE 1.0 END
    FROM public.products pr
    WHERE pr.status = 'published'
      AND (pr.name_en ILIKE pat OR pr.name_ar ILIKE pat OR pr.description_en ILIKE pat OR pr.description_ar ILIKE pat)

    UNION ALL
    SELECT 'accommodation', ac.id, ac.slug, ac.name_en, ac.name_ar, NULL, ac.image,
           CASE WHEN ac.name_en ILIKE pre OR ac.name_ar ILIKE pre THEN 2.0 ELSE 1.0 END
    FROM public.accommodations ac
    WHERE ac.status = 'published'
      AND (ac.name_en ILIKE pat OR ac.name_ar ILIKE pat OR ac.description_en ILIKE pat OR ac.description_ar ILIKE pat)

    UNION ALL
    SELECT 'transport', tr.id, tr.slug, tr.name_en, tr.name_ar, NULL, tr.image,
           CASE WHEN tr.name_en ILIKE pre OR tr.name_ar ILIKE pre THEN 2.0 ELSE 1.0 END
    FROM public.transport tr
    WHERE tr.status = 'published'
      AND (tr.name_en ILIKE pat OR tr.name_ar ILIKE pat OR tr.description_en ILIKE pat OR tr.description_ar ILIKE pat)

    UNION ALL
    SELECT 'cause', c.id, c.slug, c.title_en, c.title_ar, c.category_en, c.image,
           CASE WHEN c.title_en ILIKE pre OR c.title_ar ILIKE pre THEN 2.0 ELSE 1.0 END
    FROM public.causes c
    WHERE c.status = 'published'
      AND (c.title_en ILIKE pat OR c.title_ar ILIKE pat OR c.summary_en ILIKE pat OR c.summary_ar ILIKE pat)

    UNION ALL
    SELECT 'person', w.id, w.slug, w.name_en, w.name_ar, w.role_en, w.image,
           CASE WHEN w.name_en ILIKE pre OR w.name_ar ILIKE pre THEN 2.0 ELSE 1.0 END
    FROM public.whos_who w
    WHERE w.status = 'published'
      AND (w.name_en ILIKE pat OR w.name_ar ILIKE pat OR w.role_en ILIKE pat OR w.role_ar ILIKE pat OR w.bio_en ILIKE pat OR w.bio_ar ILIKE pat)

    UNION ALL
    SELECT 'culture_actor', ca.id, ca.slug, ca.name_en, ca.name_ar, ca.title_en, ca.image,
           CASE WHEN ca.name_en ILIKE pre OR ca.name_ar ILIKE pre THEN 2.0 ELSE 1.0 END
    FROM public.culture_actors ca
    WHERE ca.status = 'published'
      AND (ca.name_en ILIKE pat OR ca.name_ar ILIKE pat OR ca.title_en ILIKE pat OR ca.title_ar ILIKE pat OR ca.bio_en ILIKE pat OR ca.bio_ar ILIKE pat)

    UNION ALL
    SELECT 'organization', o.id, o.slug, o.name_en, o.name_ar, NULL, COALESCE(o.image, o.logo),
           CASE WHEN o.name_en ILIKE pre OR o.name_ar ILIKE pre THEN 2.0 ELSE 1.0 END
    FROM public.organizations o
    WHERE o.status = 'published'
      AND (o.name_en ILIKE pat OR o.name_ar ILIKE pat OR o.description_en ILIKE pat OR o.description_ar ILIKE pat)

    UNION ALL
    -- knowledge collections: public columns only, published rows only
    SELECT 'collection', col.id, col.slug, col.title_en, col.title_ar, col.discipline, col.cover_image,
           CASE WHEN col.title_en ILIKE pre OR col.title_ar ILIKE pre THEN 2.0 ELSE 1.0 END
    FROM public.collections col
    WHERE col.status = 'published'
      AND (col.title_en ILIKE pat OR col.title_ar ILIKE pat OR col.abstract_en ILIKE pat OR col.abstract_ar ILIKE pat OR col.discipline ILIKE pat)

    UNION ALL
    -- providers: PUBLIC columns only. contact_email / contact_phone / whatsapp are never selected here.
    SELECT 'provider', pv.id, pv.slug, pv.name_en, pv.name_ar, COALESCE(pv.tagline_en, pv.city_en), pv.avatar,
           CASE WHEN pv.name_en ILIKE pre OR pv.name_ar ILIKE pre THEN 2.0 ELSE 1.0 END
    FROM public.providers pv
    WHERE pv.status = 'published'
      AND (pv.name_en ILIKE pat OR pv.name_ar ILIKE pat OR pv.tagline_en ILIKE pat OR pv.tagline_ar ILIKE pat)

    UNION ALL
    SELECT 'city', NULL::uuid, ci.id, ci.name_en, ci.name_ar, ci.governorate_en, ci.image,
           CASE WHEN ci.name_en ILIKE pre OR ci.name_ar ILIKE pre THEN 2.5 ELSE 1.0 END
    FROM public.cities ci
    WHERE ci.name_en ILIKE pat OR ci.name_ar ILIKE pat

    UNION ALL
    SELECT 'region', NULL::uuid, r.id, r.name_en, r.name_ar, r.tagline_en, r.image,
           CASE WHEN r.name_en ILIKE pre OR r.name_ar ILIKE pre THEN 2.5 ELSE 1.0 END
    FROM public.regions r
    WHERE r.is_active IS NOT FALSE
      AND (r.name_en ILIKE pat OR r.name_ar ILIKE pat)
  )
  SELECT h.item_type, h.item_id, h.slug, h.title_en, h.title_ar, h.subtitle, h.image, h.rank
  FROM hits h
  ORDER BY h.rank DESC, h.title_en NULLS LAST
  LIMIT lim;
END;
$function$;