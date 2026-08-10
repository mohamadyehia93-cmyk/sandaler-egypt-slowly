REVOKE SELECT ON public.providers FROM anon, authenticated;

GRANT SELECT (
  id, user_id, role, name_en, name_ar, avatar, cover_image,
  city_en, city_ar, region_en, region_ar, bio_en, bio_ar,
  tagline_en, tagline_ar, languages, years_active, verified,
  followers, rating, review_count, specialties, slug, status,
  created_at, updated_at, website, social_links
) ON public.providers TO anon, authenticated;