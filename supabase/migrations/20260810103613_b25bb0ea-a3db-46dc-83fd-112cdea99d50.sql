DROP POLICY IF EXISTS "Posts are publicly readable" ON public.posts;

CREATE POLICY "Published posts are publicly readable"
ON public.posts FOR SELECT
USING (status = 'published');

CREATE POLICY "Authors can read own posts"
ON public.posts FOR SELECT TO authenticated
USING (auth.uid() = author_id);