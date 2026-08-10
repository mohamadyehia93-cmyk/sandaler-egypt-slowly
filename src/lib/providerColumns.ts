/**
 * Public column list for `public.providers`.
 *
 * The private contact columns (contact_email, contact_phone, whatsapp) are no
 * longer granted to anon/authenticated at the database level, so `select("*")`
 * now fails with "permission denied for table providers". Every public read
 * must therefore use this explicit list. Private details are read through the
 * `get_provider_contact` RPC, which only returns them to the provider itself or
 * to a user with a confirmed transaction.
 */
export const PROVIDER_PUBLIC_COLUMNS =
  "id, user_id, role, name_en, name_ar, avatar, cover_image, city_en, city_ar, region_en, region_ar, bio_en, bio_ar, tagline_en, tagline_ar, languages, years_active, verified, followers, rating, review_count, specialties, slug, status, created_at, updated_at, website, social_links";

export type ProviderContact = {
  contact_email: string | null;
  contact_phone: string | null;
  whatsapp: string | null;
};
