CREATE TYPE public.stay_badge AS ENUM ('pick-view','pick-beach','pick-resort','pick-service','pick-price','pick-location','pick-local','not-recommended','seasonal','booking-only');

CREATE TABLE public.city_stays (
  city_id text PRIMARY KEY REFERENCES public.cities(id),
  preamble_en text, preamble_ar text,
  editorial_article_slug text,
  verified_at date,
  notes_en text[], notes_ar text[],
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.city_stays TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.city_stays TO authenticated;
GRANT ALL ON public.city_stays TO service_role;
ALTER TABLE public.city_stays ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published stay pages are public" ON public.city_stays FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Admins manage stay pages" ON public.city_stays FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.stays_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id text REFERENCES public.cities(id),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  stay_type_en text, stay_type_ar text,
  editorial_note_en text, editorial_note_ar text,
  price_range text, rooms_text text,
  amenities_en text, amenities_ar text,
  area_en text, area_ar text,
  action_1_label_en text, action_1_label_ar text, action_1_url text,
  action_2_label_en text, action_2_label_ar text, action_2_url text,
  action_3_label_en text, action_3_label_ar text, action_3_url text,
  badge public.stay_badge,
  recommended boolean NOT NULL DEFAULT false,
  caution boolean NOT NULL DEFAULT false,
  order_rank integer NOT NULL DEFAULT 100,
  verified_at date,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX stays_services_city_idx ON public.stays_services(city_id, order_rank);
GRANT SELECT ON public.stays_services TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.stays_services TO authenticated;
GRANT ALL ON public.stays_services TO service_role;
ALTER TABLE public.stays_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published stays are public" ON public.stays_services FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Admins manage stays" ON public.stays_services FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_city_stays_updated BEFORE UPDATE ON public.city_stays FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_stays_services_updated BEFORE UPDATE ON public.stays_services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();