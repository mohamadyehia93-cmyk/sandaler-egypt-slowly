ALTER TABLE public.provider_statuses
  ADD COLUMN IF NOT EXISTS sample_id text;

ALTER TABLE public.provider_statuses
  ALTER COLUMN user_id DROP NOT NULL;

CREATE INDEX IF NOT EXISTS provider_statuses_sample_idx
  ON public.provider_statuses (sample_id, status_date)
  WHERE sample_id IS NOT NULL;

DELETE FROM public.provider_statuses
  WHERE sample_id = 'ca3'
    AND status_date = (now() AT TIME ZONE 'UTC')::date;

INSERT INTO public.provider_statuses (sample_id, status_date, text, image_url, link_url)
VALUES (
  'ca3',
  (now() AT TIME ZONE 'UTC')::date,
  E'مرحبًا! اليوم نستضيف ورشة عن الموسيقى النوبية في أسوان 🎶\n\nGreetings! Today we''re hosting a Nubian music workshop in Aswan. Come join us by the Nile.',
  'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=800',
  'https://example.com/aswan-workshop'
);