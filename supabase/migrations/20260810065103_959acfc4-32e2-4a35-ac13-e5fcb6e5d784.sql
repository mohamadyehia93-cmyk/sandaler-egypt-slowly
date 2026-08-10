CREATE TABLE public.wishlists (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type text NOT NULL CHECK (item_type IN ('experience','trip','event','post','audio_tour','product','accommodation','transport','cause')),
  item_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT wishlists_user_item_unique UNIQUE (user_id, item_type, item_id)
);

GRANT SELECT, INSERT, DELETE ON public.wishlists TO authenticated;
GRANT ALL ON public.wishlists TO service_role;

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can save their own wishlist items"
  ON public.wishlists FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own wishlist items"
  ON public.wishlists FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can remove their own wishlist items"
  ON public.wishlists FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX wishlists_user_type_idx ON public.wishlists (user_id, item_type);