-- Remove stock-photo faces of people who are not the actual person.
-- The app renders an initials avatar when no photo exists.
update public.whos_who set image = null where image like '%unsplash%' or image like '%pravatar%';
update public.culture_actors set image = null where image like '%unsplash%' or image like '%pravatar%';
update public.audio_tours set narrator_image = null where narrator_image like '%unsplash%' or narrator_image like '%pravatar%';
update public.trips set organizer_image = null where organizer_image like '%unsplash%' or organizer_image like '%pravatar%';
update public.experiences set host_image = null where host_image like '%unsplash%' or host_image like '%pravatar%';
update public.posts set author_image = null where author_image like '%unsplash%' or author_image like '%pravatar%';
update public.products set seller_image = null where seller_image like '%unsplash%' or seller_image like '%pravatar%';
update public.accommodations set host_image = null where host_image like '%unsplash%' or host_image like '%pravatar%';
update public.transport set provider_image = null where provider_image like '%unsplash%' or provider_image like '%pravatar%';
update public.providers set avatar = null
 where user_id is null and (avatar like '%unsplash%' or avatar like '%pravatar%');
-- Stock portraits are never valid content; block them coming back through seeds.
