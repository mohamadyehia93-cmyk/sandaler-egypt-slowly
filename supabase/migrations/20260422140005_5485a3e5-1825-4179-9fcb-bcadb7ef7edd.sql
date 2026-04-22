-- Follows table: a user follows an organization (by sample_id like 'org-c1' or future real ids)
CREATE TABLE public.follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, target_type, target_id)
);

CREATE INDEX idx_follows_user ON public.follows(user_id);
CREATE INDEX idx_follows_target ON public.follows(target_type, target_id);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Anyone can see follow counts/relationships (public social graph)
CREATE POLICY "Follows are viewable by everyone"
  ON public.follows FOR SELECT
  USING (true);

CREATE POLICY "Users can follow on their own behalf"
  ON public.follows FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow on their own behalf"
  ON public.follows FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
