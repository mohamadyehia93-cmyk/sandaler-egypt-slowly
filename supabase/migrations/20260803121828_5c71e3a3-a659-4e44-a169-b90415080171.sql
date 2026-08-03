DROP POLICY "Users can update own reviews" ON public.experience_reviews;
CREATE POLICY "Users can update own reviews" ON public.experience_reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY "Users can update own comments" ON public.post_comments;
CREATE POLICY "Users can update own comments" ON public.post_comments FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY "Users can update own status" ON public.provider_statuses;
CREATE POLICY "Users can update own status" ON public.provider_statuses FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY "Users can update own provider profile" ON public.providers;
CREATE POLICY "Users can update own provider profile" ON public.providers FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY "Users can update own culture_actor" ON public.culture_actors;
CREATE POLICY "Users can update own culture_actor" ON public.culture_actors FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY "Users can update own whos_who entry" ON public.whos_who;
CREATE POLICY "Users can update own whos_who entry" ON public.whos_who FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY "Owners can update own causes" ON public.causes;
CREATE POLICY "Owners can update own causes" ON public.causes FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY "Owners can update own organizations" ON public.organizations;
CREATE POLICY "Owners can update own organizations" ON public.organizations FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY "Organizers can update own trips" ON public.trips;
CREATE POLICY "Organizers can update own trips" ON public.trips FOR UPDATE TO authenticated USING (auth.uid() = organizer_id) WITH CHECK (auth.uid() = organizer_id);

DROP POLICY "Organizers can update own meetups" ON public.meetups;
CREATE POLICY "Organizers can update own meetups" ON public.meetups FOR UPDATE TO authenticated USING (auth.uid() = organizer_id) WITH CHECK (auth.uid() = organizer_id);

DROP POLICY "Hosts can update own accommodations" ON public.accommodations;
CREATE POLICY "Hosts can update own accommodations" ON public.accommodations FOR UPDATE TO authenticated USING (auth.uid() = host_id) WITH CHECK (auth.uid() = host_id);

DROP POLICY "Providers can update own transport" ON public.transport;
CREATE POLICY "Providers can update own transport" ON public.transport FOR UPDATE TO authenticated USING (auth.uid() = provider_id) WITH CHECK (auth.uid() = provider_id);

DROP POLICY "Providers can update own experiences" ON public.experiences;
CREATE POLICY "Providers can update own experiences" ON public.experiences FOR UPDATE TO authenticated USING (auth.uid() = provider_id) WITH CHECK (auth.uid() = provider_id);

DROP POLICY "Sellers can update own products" ON public.products;
CREATE POLICY "Sellers can update own products" ON public.products FOR UPDATE TO authenticated USING (auth.uid() = seller_id) WITH CHECK (auth.uid() = seller_id);

DROP POLICY "Authors can update own posts" ON public.posts;
CREATE POLICY "Authors can update own posts" ON public.posts FOR UPDATE TO authenticated USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);

DROP POLICY "Creators can update own audio tours" ON public.audio_tours;
CREATE POLICY "Creators can update own audio tours" ON public.audio_tours FOR UPDATE TO authenticated USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);