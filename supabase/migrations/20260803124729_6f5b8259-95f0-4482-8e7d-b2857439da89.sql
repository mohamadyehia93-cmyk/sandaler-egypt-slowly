DELETE FROM public.post_comments WHERE post_key = 'test' AND text = 'hello';
DELETE FROM public.provider_statuses WHERE text = 'hi' AND status_date = '2026-08-03';
DELETE FROM public.saved_itineraries WHERE title = 't';
DELETE FROM public.follows WHERE target_type = 'provider' AND target_id = 'x';
DELETE FROM public.messages WHERE text = 'hi' AND conversation_id IN (SELECT id FROM public.conversations WHERE participant_1 = participant_2);
DELETE FROM public.conversations WHERE participant_1 = participant_2;
DELETE FROM public.providers WHERE name_en = 'RC' AND name_ar = 'RC';