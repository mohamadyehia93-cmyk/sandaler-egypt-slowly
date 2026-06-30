CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE,
  organizer_id uuid,
  title_en text NOT NULL,
  title_ar text NOT NULL,
  description_en text,
  description_ar text,
  region_id text,
  city_id text,
  start_date date NOT NULL,
  end_date date,
  event_time text,
  location_en text,
  location_ar text,
  venue_en text,
  venue_ar text,
  category text DEFAULT 'festival',
  image text,
  is_free boolean NOT NULL DEFAULT true,
  price numeric,
  ticket_url text,
  status text NOT NULL DEFAULT 'published',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published events are publicly readable"
ON public.events FOR SELECT
USING (status = 'published' OR auth.uid() = organizer_id);

CREATE POLICY "Organizers can insert their own events"
ON public.events FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update their own events"
ON public.events FOR UPDATE
TO authenticated
USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers can delete their own events"
ON public.events FOR DELETE
TO authenticated
USING (auth.uid() = organizer_id);

CREATE INDEX idx_events_city ON public.events (city_id);
CREATE INDEX idx_events_region ON public.events (region_id);
CREATE INDEX idx_events_start_date ON public.events (start_date);

CREATE TRIGGER trg_events_updated
BEFORE UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();