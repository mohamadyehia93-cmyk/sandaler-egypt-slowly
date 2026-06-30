-- 1) Replace trigger to never store full email as display_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
      NULLIF(NEW.raw_user_meta_data->>'display_name', ''),
      NULLIF(NEW.raw_user_meta_data->>'name', ''),
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    )
  )
  ON CONFLICT (user_id) DO UPDATE SET
    display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
    avatar_url   = COALESCE(EXCLUDED.avatar_url,   profiles.avatar_url),
    updated_at   = now();
  RETURN NEW;
END;
$function$;

-- 2) Backfill: scrub email-shaped display_names to local-part only
UPDATE public.profiles
SET display_name = split_part(display_name, '@', 1),
    updated_at   = now()
WHERE display_name ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$';