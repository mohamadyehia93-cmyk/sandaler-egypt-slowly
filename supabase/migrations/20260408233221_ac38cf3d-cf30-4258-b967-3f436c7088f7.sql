
-- Experience reviews table
CREATE TABLE public.experience_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  experience_id UUID NOT NULL,
  user_id UUID,
  reviewer_name TEXT NOT NULL,
  reviewer_city TEXT,
  reviewer_initials TEXT NOT NULL DEFAULT '',
  reviewer_avatar_bg TEXT DEFAULT '#9FE1CB',
  rating INTEGER NOT NULL DEFAULT 5,
  review_text TEXT,
  verified_attendee BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.experience_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are publicly readable"
  ON public.experience_reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON public.experience_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON public.experience_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON public.experience_reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Experience availability slots table
CREATE TABLE public.experience_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  experience_id UUID NOT NULL,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  spots_available INTEGER NOT NULL DEFAULT 10,
  is_discounted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.experience_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Slots are publicly readable"
  ON public.experience_slots FOR SELECT
  USING (true);

CREATE POLICY "Providers can insert slots"
  ON public.experience_slots FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.experiences
      WHERE id = experience_slots.experience_id
      AND provider_id = auth.uid()
    )
  );

CREATE POLICY "Providers can update own slots"
  ON public.experience_slots FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.experiences
      WHERE id = experience_slots.experience_id
      AND provider_id = auth.uid()
    )
  );

CREATE POLICY "Providers can delete own slots"
  ON public.experience_slots FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.experiences
      WHERE id = experience_slots.experience_id
      AND provider_id = auth.uid()
    )
  );

-- Seed sample reviews for bird-watching experience
INSERT INTO public.experience_reviews (experience_id, reviewer_name, reviewer_city, reviewer_initials, reviewer_avatar_bg, rating, review_text, verified_attendee)
VALUES
  ('593022ac-7f32-4e83-a7d7-b3088d318d60', 'Sharif', 'Cairo · solo', 'SH', '#9FE1CB', 4, 'Fun way to connect with nature and hear real local stories about the lake. Hassan knows every bird by name!', true),
  ('593022ac-7f32-4e83-a7d7-b3088d318d60', 'Nadia', 'Alexandria · family', 'NA', '#B5D4F4', 5, 'Hassan was incredibly patient with our kids. The flamingos were breathtaking at sunrise. A must-do experience.', true),
  ('593022ac-7f32-4e83-a7d7-b3088d318d60', 'Mona', 'Mansoura · couple', 'MO', '#FAC775', 5, 'We came for the birds but stayed for the stories. Hassan is a true storyteller. The tea at the fisherman café was the highlight.', true),
  ('593022ac-7f32-4e83-a7d7-b3088d318d60', 'Ahmed', 'Tanta · group', 'AH', '#E8F8F7', 4, 'Great value for the price. Bring your own binoculars for an even better experience. The lake is stunning.', true);

-- Seed sample slots for bird-watching experience
INSERT INTO public.experience_slots (experience_id, slot_date, start_time, end_time, price, spots_available, is_discounted)
VALUES
  ('593022ac-7f32-4e83-a7d7-b3088d318d60', '2026-04-12', '06:00', '10:00', 150, 12, false),
  ('593022ac-7f32-4e83-a7d7-b3088d318d60', '2026-04-12', '15:00', '19:00', 120, 14, true),
  ('593022ac-7f32-4e83-a7d7-b3088d318d60', '2026-04-13', '06:00', '10:00', 150, 2, false),
  ('593022ac-7f32-4e83-a7d7-b3088d318d60', '2026-04-19', '06:00', '10:00', 150, 10, false),
  ('593022ac-7f32-4e83-a7d7-b3088d318d60', '2026-04-20', '06:00', '10:00', 150, 8, false);
