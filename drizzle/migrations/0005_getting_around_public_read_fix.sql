DROP POLICY "Published getting-around pages are public" ON public.city_getting_around;
CREATE POLICY "Published getting-around pages are public" ON public.city_getting_around FOR SELECT TO anon, authenticated USING (status = 'published');
DROP POLICY "Published services are public" ON public.getting_around_services;
CREATE POLICY "Published services are public" ON public.getting_around_services FOR SELECT TO anon, authenticated USING (status = 'published');