ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_editor_choice boolean DEFAULT false;
UPDATE public.posts SET is_editor_choice = true WHERE slug = 'the-balconies-the-city-banned';