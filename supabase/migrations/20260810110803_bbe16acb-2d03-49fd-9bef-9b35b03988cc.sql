CREATE TABLE public.image_credits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url text NOT NULL UNIQUE,
  file_title text,
  artist text,
  license text,
  license_url text,
  source_url text,
  used_for text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.image_credits TO anon;
GRANT SELECT ON public.image_credits TO authenticated;
GRANT ALL ON public.image_credits TO service_role;

ALTER TABLE public.image_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Image credits are publicly readable"
  ON public.image_credits FOR SELECT
  USING (true);

CREATE TRIGGER update_image_credits_updated_at
  BEFORE UPDATE ON public.image_credits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();