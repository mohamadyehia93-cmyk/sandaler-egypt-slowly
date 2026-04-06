
-- =============================================
-- REFERENCE TABLES (read-only, seeded by admin)
-- =============================================

-- Regions
CREATE TABLE public.regions (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  emoji TEXT,
  color TEXT,
  about_en TEXT,
  about_ar TEXT,
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Regions are publicly readable" ON public.regions FOR SELECT USING (true);

-- Cities
CREATE TABLE public.cities (
  id TEXT PRIMARY KEY,
  region_id TEXT NOT NULL REFERENCES public.regions(id),
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  governorate_en TEXT,
  governorate_ar TEXT,
  population TEXT,
  overview_en TEXT,
  overview_ar TEXT,
  history_en TEXT,
  history_ar TEXT,
  culture_en TEXT,
  culture_ar TEXT,
  geography_en TEXT,
  geography_ar TEXT,
  highlights_en TEXT[] DEFAULT '{}',
  highlights_ar TEXT[] DEFAULT '{}',
  known_for_en TEXT[] DEFAULT '{}',
  known_for_ar TEXT[] DEFAULT '{}',
  best_time_en TEXT,
  best_time_ar TEXT,
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cities are publicly readable" ON public.cities FOR SELECT USING (true);

-- =============================================
-- LISTING TABLES (provider-managed)
-- =============================================

-- Experiences
CREATE TABLE public.experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE,
  provider_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  region_id TEXT REFERENCES public.regions(id),
  city_id TEXT REFERENCES public.cities(id),
  theme TEXT CHECK (theme IN ('nature','history','food','adventure','culture','community')),
  price INTEGER NOT NULL DEFAULT 0,
  date TEXT,
  duration_minutes INTEGER,
  capacity_min INTEGER DEFAULT 1,
  capacity_max INTEGER DEFAULT 20,
  image TEXT,
  images TEXT[] DEFAULT '{}',
  rating NUMERIC(2,1) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  host_name_en TEXT,
  host_name_ar TEXT,
  host_image TEXT,
  meeting_point_lat NUMERIC(10,7),
  meeting_point_lng NUMERIC(10,7),
  meeting_point_name TEXT,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft','pending','published','archived')),
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Experiences are publicly readable" ON public.experiences FOR SELECT USING (true);
CREATE POLICY "Providers can insert experiences" ON public.experiences FOR INSERT TO authenticated WITH CHECK (auth.uid() = provider_id);
CREATE POLICY "Providers can update own experiences" ON public.experiences FOR UPDATE TO authenticated USING (auth.uid() = provider_id);
CREATE POLICY "Providers can delete own experiences" ON public.experiences FOR DELETE TO authenticated USING (auth.uid() = provider_id);

-- Audio Tours
CREATE TABLE public.audio_tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE,
  creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  region_id TEXT REFERENCES public.regions(id),
  city_id TEXT REFERENCES public.cities(id),
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  stops_count INTEGER NOT NULL DEFAULT 5,
  price INTEGER NOT NULL DEFAULT 0,
  image TEXT,
  narrator_name_en TEXT,
  narrator_name_ar TEXT,
  narrator_image TEXT,
  languages TEXT[] DEFAULT '{en}',
  status TEXT DEFAULT 'published' CHECK (status IN ('draft','pending','published','archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audio_tours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Audio tours are publicly readable" ON public.audio_tours FOR SELECT USING (true);
CREATE POLICY "Creators can insert audio tours" ON public.audio_tours FOR INSERT TO authenticated WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update own audio tours" ON public.audio_tours FOR UPDATE TO authenticated USING (auth.uid() = creator_id);
CREATE POLICY "Creators can delete own audio tours" ON public.audio_tours FOR DELETE TO authenticated USING (auth.uid() = creator_id);

-- Trips
CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE,
  organizer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  region_id TEXT REFERENCES public.regions(id),
  city_id TEXT REFERENCES public.cities(id),
  trip_type TEXT DEFAULT 'one-day' CHECK (trip_type IN ('one-day','multi-day')),
  access_type TEXT DEFAULT 'public' CHECK (access_type IN ('public','private')),
  price INTEGER NOT NULL DEFAULT 0,
  date TEXT,
  duration_days INTEGER DEFAULT 1,
  capacity_min INTEGER DEFAULT 1,
  capacity_max INTEGER DEFAULT 30,
  image TEXT,
  images TEXT[] DEFAULT '{}',
  route_en TEXT,
  route_ar TEXT,
  inclusions_en TEXT[] DEFAULT '{}',
  inclusions_ar TEXT[] DEFAULT '{}',
  exclusions_en TEXT[] DEFAULT '{}',
  exclusions_ar TEXT[] DEFAULT '{}',
  organizer_name_en TEXT,
  organizer_name_ar TEXT,
  organizer_image TEXT,
  rating NUMERIC(2,1) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft','pending','published','archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Trips are publicly readable" ON public.trips FOR SELECT USING (true);
CREATE POLICY "Organizers can insert trips" ON public.trips FOR INSERT TO authenticated WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Organizers can update own trips" ON public.trips FOR UPDATE TO authenticated USING (auth.uid() = organizer_id);
CREATE POLICY "Organizers can delete own trips" ON public.trips FOR DELETE TO authenticated USING (auth.uid() = organizer_id);

-- Accommodations
CREATE TABLE public.accommodations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE,
  host_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  region_id TEXT REFERENCES public.regions(id),
  city_id TEXT REFERENCES public.cities(id),
  accommodation_type TEXT CHECK (accommodation_type IN ('homestay','eco-lodge','guesthouse','camp','hotel')),
  price_per_night INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC(2,1) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  image TEXT,
  images TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  host_name_en TEXT,
  host_name_ar TEXT,
  host_image TEXT,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft','pending','published','archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.accommodations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Accommodations are publicly readable" ON public.accommodations FOR SELECT USING (true);
CREATE POLICY "Hosts can insert accommodations" ON public.accommodations FOR INSERT TO authenticated WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Hosts can update own accommodations" ON public.accommodations FOR UPDATE TO authenticated USING (auth.uid() = host_id);
CREATE POLICY "Hosts can delete own accommodations" ON public.accommodations FOR DELETE TO authenticated USING (auth.uid() = host_id);

-- Transport
CREATE TABLE public.transport (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE,
  provider_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  transport_type TEXT CHECK (transport_type IN ('felucca','tuk-tuk','bus','private-car','boat','horse-cart','train','microbus')),
  from_en TEXT,
  from_ar TEXT,
  to_en TEXT,
  to_ar TEXT,
  region_id TEXT REFERENCES public.regions(id),
  city_id TEXT REFERENCES public.cities(id),
  price INTEGER NOT NULL DEFAULT 0,
  capacity INTEGER DEFAULT 4,
  duration TEXT,
  frequency TEXT,
  image TEXT,
  rating NUMERIC(2,1) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  provider_name_en TEXT,
  provider_name_ar TEXT,
  provider_image TEXT,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft','pending','published','archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transport ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Transport is publicly readable" ON public.transport FOR SELECT USING (true);
CREATE POLICY "Providers can insert transport" ON public.transport FOR INSERT TO authenticated WITH CHECK (auth.uid() = provider_id);
CREATE POLICY "Providers can update own transport" ON public.transport FOR UPDATE TO authenticated USING (auth.uid() = provider_id);
CREATE POLICY "Providers can delete own transport" ON public.transport FOR DELETE TO authenticated USING (auth.uid() = provider_id);

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE,
  seller_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  origin_story_en TEXT,
  origin_story_ar TEXT,
  category TEXT,
  region_id TEXT REFERENCES public.regions(id),
  city_id TEXT REFERENCES public.cities(id),
  price INTEGER NOT NULL DEFAULT 0,
  stock INTEGER DEFAULT 10,
  image TEXT,
  images TEXT[] DEFAULT '{}',
  badges TEXT[] DEFAULT '{}',
  seller_name_en TEXT,
  seller_name_ar TEXT,
  seller_image TEXT,
  seller_village_en TEXT,
  seller_village_ar TEXT,
  rating NUMERIC(2,1) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft','pending','published','archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are publicly readable" ON public.products FOR SELECT USING (true);
CREATE POLICY "Sellers can insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can update own products" ON public.products FOR UPDATE TO authenticated USING (auth.uid() = seller_id);
CREATE POLICY "Sellers can delete own products" ON public.products FOR DELETE TO authenticated USING (auth.uid() = seller_id);

-- Posts (articles, stories)
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title_en TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  excerpt_en TEXT,
  excerpt_ar TEXT,
  body_en TEXT,
  body_ar TEXT,
  category TEXT,
  region_id TEXT REFERENCES public.regions(id),
  city_id TEXT REFERENCES public.cities(id),
  image TEXT,
  images TEXT[] DEFAULT '{}',
  author_name_en TEXT,
  author_name_ar TEXT,
  author_image TEXT,
  author_role TEXT,
  read_time_minutes INTEGER DEFAULT 5,
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'published' CHECK (status IN ('draft','pending','published','archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Posts are publicly readable" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Authors can insert posts" ON public.posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own posts" ON public.posts FOR UPDATE TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Authors can delete own posts" ON public.posts FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- Organizations (causes)
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  mission_en TEXT,
  mission_ar TEXT,
  org_type TEXT CHECK (org_type IN ('education','environment','heritage','health','community','women','youth')),
  region_id TEXT REFERENCES public.regions(id),
  city_id TEXT REFERENCES public.cities(id),
  location_en TEXT,
  location_ar TEXT,
  logo TEXT,
  image TEXT,
  website TEXT,
  volunteers_count INTEGER DEFAULT 0,
  donations_total INTEGER DEFAULT 0,
  programs JSONB DEFAULT '[]',
  status TEXT DEFAULT 'published' CHECK (status IN ('draft','pending','published','archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Organizations are publicly readable" ON public.organizations FOR SELECT USING (true);
CREATE POLICY "Owners can insert organizations" ON public.organizations FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update own organizations" ON public.organizations FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete own organizations" ON public.organizations FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- =============================================
-- STORAGE BUCKETS
-- =============================================

INSERT INTO storage.buckets (id, name, public) VALUES ('listing-images', 'listing-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-photos', 'profile-photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('audio-files', 'audio-files', true);

-- Storage policies
CREATE POLICY "Listing images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'listing-images');
CREATE POLICY "Authenticated users can upload listing images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'listing-images');
CREATE POLICY "Users can update their own listing images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'listing-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Profile photos are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'profile-photos');
CREATE POLICY "Authenticated users can upload profile photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'profile-photos');
CREATE POLICY "Users can update their own profile photos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Audio files are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'audio-files');
CREATE POLICY "Authenticated users can upload audio files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'audio-files');
CREATE POLICY "Users can update their own audio files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'audio-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =============================================
-- TRIGGERS for updated_at
-- =============================================
CREATE TRIGGER update_experiences_updated_at BEFORE UPDATE ON public.experiences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_audio_tours_updated_at BEFORE UPDATE ON public.audio_tours FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON public.trips FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_accommodations_updated_at BEFORE UPDATE ON public.accommodations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_transport_updated_at BEFORE UPDATE ON public.transport FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
