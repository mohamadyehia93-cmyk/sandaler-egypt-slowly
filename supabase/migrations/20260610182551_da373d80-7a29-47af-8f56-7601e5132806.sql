DROP INDEX IF EXISTS public.providers_user_id_unique;
ALTER TABLE public.providers ADD CONSTRAINT providers_user_id_key UNIQUE (user_id);