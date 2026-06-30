-- Prevent comment author spoofing: force author_name/author_avatar to come from the
-- authenticated user's canonical profile, ignoring any client-supplied values.
CREATE OR REPLACE FUNCTION public.enforce_comment_author_identity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_display_name text;
  v_avatar_url text;
BEGIN
  SELECT display_name, avatar_url
    INTO v_display_name, v_avatar_url
  FROM public.profiles
  WHERE user_id = NEW.user_id;

  -- Always derive the public identity server-side.
  NEW.author_name := COALESCE(NULLIF(v_display_name, ''), 'Member');
  NEW.author_avatar := v_avatar_url;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_comment_author_identity_trg ON public.post_comments;
CREATE TRIGGER enforce_comment_author_identity_trg
BEFORE INSERT OR UPDATE ON public.post_comments
FOR EACH ROW
EXECUTE FUNCTION public.enforce_comment_author_identity();