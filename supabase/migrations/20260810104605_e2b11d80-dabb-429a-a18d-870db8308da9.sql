CREATE TABLE public.commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  culture_actor_id uuid NOT NULL REFERENCES public.culture_actors(id) ON DELETE CASCADE,
  actor_user_id uuid,
  commissioner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('article','audio_narration','photo_essay','research','talk','other')),
  title text NOT NULL,
  brief text,
  deliverable_url text,
  deliverable_post_id uuid REFERENCES public.posts(id) ON DELETE SET NULL,
  proposed_fee numeric,
  currency text DEFAULT 'EGP',
  deadline date,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','delivered','completed','cancelled')),
  decline_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.commissions TO authenticated;
GRANT ALL ON public.commissions TO service_role;

ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Commissioners can create commissions"
ON public.commissions FOR INSERT TO authenticated
WITH CHECK (commissioner_id = auth.uid());

CREATE POLICY "Commissioners can view their own commissions"
ON public.commissions FOR SELECT TO authenticated
USING (commissioner_id = auth.uid());

CREATE POLICY "Actors can view commissions addressed to them"
ON public.commissions FOR SELECT TO authenticated
USING (actor_user_id = auth.uid());

CREATE POLICY "Commissioners can update their own commissions"
ON public.commissions FOR UPDATE TO authenticated
USING (commissioner_id = auth.uid())
WITH CHECK (commissioner_id = auth.uid());

CREATE POLICY "Actors can update commissions addressed to them"
ON public.commissions FOR UPDATE TO authenticated
USING (actor_user_id = auth.uid())
WITH CHECK (actor_user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.enforce_commission_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user uuid;
BEGIN
  SELECT user_id INTO v_user FROM public.culture_actors WHERE id = NEW.culture_actor_id;
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'This culture actor profile has not been claimed yet and cannot receive commissions';
  END IF;
  NEW.actor_user_id := v_user;
  NEW.status := 'pending';
  NEW.decline_reason := NULL;
  NEW.deliverable_url := NULL;
  NEW.deliverable_post_id := NULL;
  NEW.created_at := now();
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER commissions_insert_integrity
BEFORE INSERT ON public.commissions
FOR EACH ROW EXECUTE FUNCTION public.enforce_commission_insert();

CREATE OR REPLACE FUNCTION public.enforce_commission_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- immutable columns for everyone
  NEW.id := OLD.id;
  NEW.culture_actor_id := OLD.culture_actor_id;
  NEW.actor_user_id := OLD.actor_user_id;
  NEW.commissioner_id := OLD.commissioner_id;
  NEW.kind := OLD.kind;
  NEW.title := OLD.title;
  NEW.brief := OLD.brief;
  NEW.proposed_fee := OLD.proposed_fee;
  NEW.currency := OLD.currency;
  NEW.deadline := OLD.deadline;
  NEW.created_at := OLD.created_at;
  NEW.updated_at := now();

  IF auth.uid() IS NOT NULL AND auth.uid() = OLD.actor_user_id THEN
    -- actor: may only move to accepted / declined / delivered
    IF NEW.status IS DISTINCT FROM OLD.status
       AND NEW.status NOT IN ('accepted','declined','delivered') THEN
      RAISE EXCEPTION 'A culture actor may only accept, decline or deliver a commission';
    END IF;
    IF NEW.status = 'delivered' AND OLD.status NOT IN ('accepted','delivered') THEN
      RAISE EXCEPTION 'A commission must be accepted before it can be delivered';
    END IF;
  ELSIF auth.uid() IS NOT NULL AND auth.uid() = OLD.commissioner_id THEN
    -- commissioner: may only complete or cancel (cancel only while pending)
    NEW.deliverable_url := OLD.deliverable_url;
    NEW.deliverable_post_id := OLD.deliverable_post_id;
    NEW.decline_reason := OLD.decline_reason;
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      IF NEW.status NOT IN ('completed','cancelled') THEN
        RAISE EXCEPTION 'A commissioner may only complete or cancel a commission';
      END IF;
      IF NEW.status = 'cancelled' AND OLD.status <> 'pending' THEN
        RAISE EXCEPTION 'A commission can only be cancelled while it is still pending';
      END IF;
      IF NEW.status = 'completed' AND OLD.status <> 'delivered' THEN
        RAISE EXCEPTION 'A commission can only be completed after it has been delivered';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER commissions_update_guard
BEFORE UPDATE ON public.commissions
FOR EACH ROW EXECUTE FUNCTION public.enforce_commission_update();

CREATE INDEX idx_commissions_actor_user ON public.commissions(actor_user_id, status);
CREATE INDEX idx_commissions_commissioner ON public.commissions(commissioner_id, status);