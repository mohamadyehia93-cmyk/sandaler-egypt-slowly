-- provider_statuses table
CREATE TABLE public.provider_statuses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  status_date DATE NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::date,
  text TEXT NOT NULL,
  image_url TEXT,
  link_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, status_date)
);

CREATE INDEX idx_provider_statuses_user_date
  ON public.provider_statuses (user_id, status_date DESC);

ALTER TABLE public.provider_statuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Statuses are publicly readable"
  ON public.provider_statuses FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own status"
  ON public.provider_statuses FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own status"
  ON public.provider_statuses FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own status"
  ON public.provider_statuses FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_provider_statuses_updated_at
  BEFORE UPDATE ON public.provider_statuses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for status images
INSERT INTO storage.buckets (id, name, public)
VALUES ('provider-status-images', 'provider-status-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Status images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'provider-status-images');

CREATE POLICY "Users can upload own status images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'provider-status-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own status images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'provider-status-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own status images"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'provider-status-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );