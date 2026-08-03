ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_author_id_fkey;
ALTER TABLE public.experiences DROP CONSTRAINT IF EXISTS experiences_provider_id_fkey;
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_seller_id_fkey;
ALTER TABLE public.trips DROP CONSTRAINT IF EXISTS trips_organizer_id_fkey;
ALTER TABLE public.audio_tours DROP CONSTRAINT IF EXISTS audio_tours_creator_id_fkey;