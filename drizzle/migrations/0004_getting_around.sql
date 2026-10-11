-- Rollback: DROP TABLE public.getting_around_services; DROP TABLE public.city_getting_around; DROP TYPE public.getting_around_badge;
CREATE TYPE public.getting_around_badge AS ENUM ('pick-frequency','pick-comfort','pick-price','pick-speed','pick-groups','pick-ease','pick-view','not-recommended','intermittent','summer-only','no-regular-service');

CREATE TABLE public.city_getting_around (
  city_id text PRIMARY KEY REFERENCES public.cities(id) ON DELETE CASCADE,
  preamble_en text, preamble_ar text,
  notes_en text[] NOT NULL DEFAULT '{}', notes_ar text[] NOT NULL DEFAULT '{}',
  editorial_article_slug text,
  verified_at date,
  status text NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.city_getting_around TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.city_getting_around TO authenticated;
GRANT ALL ON public.city_getting_around TO service_role;
ALTER TABLE public.city_getting_around ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published getting-around pages are public" ON public.city_getting_around FOR SELECT USING (status = 'published' OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage getting-around pages" ON public.city_getting_around FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.getting_around_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  city_id text NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  origin_city_id text NOT NULL DEFAULT 'cairo',
  operator text,
  mode_label_en text, mode_label_ar text,
  route_title_en text NOT NULL, route_title_ar text,
  editorial_note_en text, editorial_note_ar text,
  price_range text, duration_text text, frequency text,
  from_station text, to_station text, booking_channel text,
  action_1_label text, action_1_url text,
  action_2_label text, action_2_url text,
  action_3_label text, action_3_url text,
  badge public.getting_around_badge,
  recommended boolean NOT NULL DEFAULT false,
  caution boolean NOT NULL DEFAULT false,
  verified_at date,
  order_rank integer NOT NULL DEFAULT 100,
  transport_row_link uuid REFERENCES public.transport(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX getting_around_services_city_idx ON public.getting_around_services(city_id, order_rank);
GRANT SELECT ON public.getting_around_services TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.getting_around_services TO authenticated;
GRANT ALL ON public.getting_around_services TO service_role;
ALTER TABLE public.getting_around_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published services are public" ON public.getting_around_services FOR SELECT USING (status = 'published' OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage services" ON public.getting_around_services FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_city_getting_around_updated BEFORE UPDATE ON public.city_getting_around FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_getting_around_services_updated BEFORE UPDATE ON public.getting_around_services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();