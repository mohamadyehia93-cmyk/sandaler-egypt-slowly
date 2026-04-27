
-- HERO SLIDES
CREATE TABLE public.hero_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  position integer NOT NULL DEFAULT 0,
  title_en text NOT NULL,
  title_ar text NOT NULL,
  subtitle_en text,
  subtitle_ar text,
  image text,
  link text,
  status text DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hero slides are publicly readable" ON public.hero_slides FOR SELECT USING (true);
CREATE TRIGGER trg_hero_slides_updated BEFORE UPDATE ON public.hero_slides FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- CAUSES
CREATE TABLE public.causes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE,
  owner_id uuid,
  title_en text NOT NULL,
  title_ar text NOT NULL,
  summary_en text,
  summary_ar text,
  description_en text,
  description_ar text,
  org_name_en text,
  org_name_ar text,
  org_founded text,
  org_members integer DEFAULT 0,
  org_logo text,
  image text,
  region_id text,
  city_id text,
  raised integer DEFAULT 0,
  goal integer DEFAULT 0,
  supporters integer DEFAULT 0,
  category_en text,
  category_ar text,
  status text DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.causes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Causes are publicly readable" ON public.causes FOR SELECT USING (true);
CREATE POLICY "Owners can insert causes" ON public.causes FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update own causes" ON public.causes FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete own causes" ON public.causes FOR DELETE TO authenticated USING (auth.uid() = owner_id);
CREATE TRIGGER trg_causes_updated BEFORE UPDATE ON public.causes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- WHO'S WHO (local experts)
CREATE TABLE public.whos_who (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE,
  user_id uuid,
  name_en text NOT NULL,
  name_ar text NOT NULL,
  role_en text,
  role_ar text,
  bio_en text,
  bio_ar text,
  image text,
  region_id text,
  city_id text,
  interests_en text[] DEFAULT '{}',
  interests_ar text[] DEFAULT '{}',
  favorite_places_en text[] DEFAULT '{}',
  favorite_places_ar text[] DEFAULT '{}',
  meeting_times_en text,
  meeting_times_ar text,
  languages_en text[] DEFAULT '{}',
  languages_ar text[] DEFAULT '{}',
  years_active integer DEFAULT 0,
  status text DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.whos_who ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Who's who is publicly readable" ON public.whos_who FOR SELECT USING (true);
CREATE POLICY "Users can insert own whos_who entry" ON public.whos_who FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own whos_who entry" ON public.whos_who FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own whos_who entry" ON public.whos_who FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER trg_whos_who_updated BEFORE UPDATE ON public.whos_who FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- CULTURE ACTORS
CREATE TABLE public.culture_actors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE,
  user_id uuid,
  name_en text NOT NULL,
  name_ar text NOT NULL,
  title_en text,
  title_ar text,
  image text,
  region_id text,
  bio_en text,
  bio_ar text,
  expertise_en text[] DEFAULT '{}',
  expertise_ar text[] DEFAULT '{}',
  quote_en text,
  quote_ar text,
  social_links jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.culture_actors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Culture actors are publicly readable" ON public.culture_actors FOR SELECT USING (true);
CREATE POLICY "Users can insert own culture_actor" ON public.culture_actors FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own culture_actor" ON public.culture_actors FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own culture_actor" ON public.culture_actors FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER trg_culture_actors_updated BEFORE UPDATE ON public.culture_actors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PARTNERS
CREATE TABLE public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE,
  name_en text NOT NULL,
  name_ar text NOT NULL,
  type_en text,
  type_ar text,
  logo text,
  color text,
  location_en text,
  location_ar text,
  since integer,
  impact_number text,
  impact_label_en text,
  impact_label_ar text,
  projects integer DEFAULT 0,
  about_en text,
  about_ar text,
  mission_en text,
  mission_ar text,
  focus_areas_en text[] DEFAULT '{}',
  focus_areas_ar text[] DEFAULT '{}',
  contributions_en text[] DEFAULT '{}',
  contributions_ar text[] DEFAULT '{}',
  status text DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Partners are publicly readable" ON public.partners FOR SELECT USING (true);
CREATE TRIGGER trg_partners_updated BEFORE UPDATE ON public.partners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- MEETUPS
CREATE TABLE public.meetups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE,
  organizer_id uuid,
  title_en text NOT NULL,
  title_ar text NOT NULL,
  description_en text,
  description_ar text,
  region_id text,
  city_id text,
  meetup_date date,
  meetup_time text,
  location_en text,
  location_ar text,
  attendees_count integer DEFAULT 0,
  capacity integer DEFAULT 20,
  image text,
  status text DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.meetups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Meetups are publicly readable" ON public.meetups FOR SELECT USING (true);
CREATE POLICY "Organizers can insert meetups" ON public.meetups FOR INSERT TO authenticated WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Organizers can update own meetups" ON public.meetups FOR UPDATE TO authenticated USING (auth.uid() = organizer_id);
CREATE POLICY "Organizers can delete own meetups" ON public.meetups FOR DELETE TO authenticated USING (auth.uid() = organizer_id);
CREATE TRIGGER trg_meetups_updated BEFORE UPDATE ON public.meetups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for filtering
CREATE INDEX idx_causes_city ON public.causes(city_id);
CREATE INDEX idx_causes_region ON public.causes(region_id);
CREATE INDEX idx_whos_who_city ON public.whos_who(city_id);
CREATE INDEX idx_whos_who_region ON public.whos_who(region_id);
CREATE INDEX idx_culture_actors_region ON public.culture_actors(region_id);
CREATE INDEX idx_meetups_city ON public.meetups(city_id);
