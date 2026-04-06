
CREATE TABLE public.providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NULL,
  role TEXT NOT NULL DEFAULT 'service-provider',
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  avatar TEXT NULL,
  cover_image TEXT NULL,
  city_en TEXT NULL,
  city_ar TEXT NULL,
  region_en TEXT NULL,
  region_ar TEXT NULL,
  bio_en TEXT NULL,
  bio_ar TEXT NULL,
  tagline_en TEXT NULL,
  tagline_ar TEXT NULL,
  languages TEXT NULL,
  years_active INTEGER NULL DEFAULT 0,
  verified BOOLEAN NULL DEFAULT false,
  followers INTEGER NULL DEFAULT 0,
  rating NUMERIC NULL DEFAULT 0,
  review_count INTEGER NULL DEFAULT 0,
  specialties JSONB NULL DEFAULT '[]'::jsonb,
  slug TEXT NULL,
  status TEXT NULL DEFAULT 'published',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers are publicly readable"
  ON public.providers FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own provider profile"
  ON public.providers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own provider profile"
  ON public.providers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own provider profile"
  ON public.providers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_providers_updated_at
  BEFORE UPDATE ON public.providers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
