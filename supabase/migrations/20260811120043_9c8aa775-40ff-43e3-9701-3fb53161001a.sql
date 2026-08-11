-- 1. Preferences
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email_notifications boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS preferred_language text;

-- 2. Outbox
CREATE TABLE IF NOT EXISTS public.notification_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dedupe_key text NOT NULL UNIQUE,
  template text NOT NULL,
  recipient_user_id uuid,
  recipient_email text NOT NULL,
  language text NOT NULL DEFAULT 'bi',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.notification_outbox TO authenticated;
GRANT ALL ON public.notification_outbox TO service_role;
ALTER TABLE public.notification_outbox ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Recipients can view their own queued notifications" ON public.notification_outbox;
CREATE POLICY "Recipients can view their own queued notifications"
  ON public.notification_outbox FOR SELECT TO authenticated
  USING (recipient_user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_notification_outbox_pending
  ON public.notification_outbox (status, next_attempt_at);

DROP TRIGGER IF EXISTS update_notification_outbox_updated_at ON public.notification_outbox;
CREATE TRIGGER update_notification_outbox_updated_at
  BEFORE UPDATE ON public.notification_outbox
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Helpers
CREATE OR REPLACE FUNCTION public.notif_auth_user(_id uuid)
RETURNS uuid LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v uuid;
BEGIN
  IF _id IS NULL THEN RETURN NULL; END IF;
  SELECT id INTO v FROM auth.users WHERE id = _id;
  IF v IS NOT NULL THEN RETURN v; END IF;
  SELECT user_id INTO v FROM public.providers WHERE id = _id;
  RETURN v;
END $$;
REVOKE ALL ON FUNCTION public.notif_auth_user(uuid) FROM PUBLIC, anon;

CREATE OR REPLACE FUNCTION public.notif_enqueue(_dedupe text, _template text, _user uuid, _payload jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_email text; v_lang text; v_opt boolean; v_name text;
BEGIN
  IF _user IS NULL THEN RETURN; END IF;
  SELECT email INTO v_email FROM auth.users WHERE id = _user;
  IF v_email IS NULL OR v_email = '' THEN RETURN; END IF;
  SELECT email_notifications, preferred_language, display_name
    INTO v_opt, v_lang, v_name FROM public.profiles WHERE user_id = _user;
  IF v_opt IS FALSE THEN RETURN; END IF;
  INSERT INTO public.notification_outbox
    (dedupe_key, template, recipient_user_id, recipient_email, language, payload)
  VALUES (_dedupe, _template, _user, v_email,
          CASE WHEN v_lang IN ('en','ar') THEN v_lang ELSE 'bi' END,
          _payload || jsonb_build_object('recipient_name', v_name))
  ON CONFLICT (dedupe_key) DO NOTHING;
END $$;
REVOKE ALL ON FUNCTION public.notif_enqueue(text, text, uuid, jsonb) FROM PUBLIC, anon, authenticated;

-- 4. Generic request-event trigger
-- TG_ARGV[0] request_type label, [1] owner column, [2] requester column,
-- [3] owner link path, [4] requester link path
CREATE OR REPLACE FUNCTION public.notif_request_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  j jsonb := to_jsonb(NEW);
  owner_u uuid;
  req_u uuid;
  base text := 'https://sandal.lovable.app';
  payload jsonb;
BEGIN
  owner_u := public.notif_auth_user(NULLIF(j->>TG_ARGV[1], '')::uuid);
  req_u := public.notif_auth_user(NULLIF(j->>TG_ARGV[2], '')::uuid);

  payload := jsonb_build_object(
    'request_type', TG_ARGV[0],
    'source_table', TG_TABLE_NAME,
    'record_id', NEW.id,
    'status', j->>'status',
    'owner_link', base || TG_ARGV[3],
    'requester_link', base || TG_ARGV[4]
  );

  IF TG_OP = 'INSERT' THEN
    IF owner_u IS NOT NULL AND (req_u IS NULL OR owner_u <> req_u) THEN
      PERFORM public.notif_enqueue(
        'provider-new-request:' || TG_TABLE_NAME || ':' || NEW.id,
        'provider-new-request', owner_u, payload);
    END IF;
    IF req_u IS NOT NULL AND (owner_u IS NULL OR owner_u <> req_u) THEN
      PERFORM public.notif_enqueue(
        'requester-request-sent:' || TG_TABLE_NAME || ':' || NEW.id,
        'requester-request-sent', req_u, payload);
    END IF;
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    IF req_u IS NOT NULL AND (owner_u IS NULL OR owner_u <> req_u) THEN
      PERFORM public.notif_enqueue(
        'request-status:' || TG_TABLE_NAME || ':' || NEW.id || ':' || coalesce(NEW.status, 'null'),
        'request-status-changed', req_u, payload);
    END IF;
  END IF;
  RETURN NEW;
END $$;

-- 5. Attach triggers
DROP TRIGGER IF EXISTS notify_bookings ON public.bookings;
CREATE TRIGGER notify_bookings AFTER INSERT OR UPDATE OF status ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.notif_request_event(
    'booking', 'provider_id', 'visitor_id', '/dashboard/service-provider', '/bookings');

DROP TRIGGER IF EXISTS notify_orders ON public.orders;
CREATE TRIGGER notify_orders AFTER INSERT OR UPDATE OF status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.notif_request_event(
    'order', 'seller_id', 'buyer_id', '/dashboard/product-seller', '/orders');

DROP TRIGGER IF EXISTS notify_reservation_requests ON public.reservation_requests;
CREATE TRIGGER notify_reservation_requests AFTER INSERT OR UPDATE OF status ON public.reservation_requests
  FOR EACH ROW EXECUTE FUNCTION public.notif_request_event(
    'reservation', 'owner_id', 'requester_id', '/dashboard/service-provider', '/bookings');

DROP TRIGGER IF EXISTS notify_session_requests ON public.session_requests;
CREATE TRIGGER notify_session_requests AFTER INSERT OR UPDATE OF status ON public.session_requests
  FOR EACH ROW EXECUTE FUNCTION public.notif_request_event(
    'session', 'expert_owner_id', 'requester_id', '/dashboard/whos-who', '/session-requests');

DROP TRIGGER IF EXISTS notify_volunteer_applications ON public.volunteer_applications;
CREATE TRIGGER notify_volunteer_applications AFTER INSERT OR UPDATE OF status ON public.volunteer_applications
  FOR EACH ROW EXECUTE FUNCTION public.notif_request_event(
    'volunteer', 'org_owner_id', 'applicant_id', '/dashboard/organization', '/applications');

DROP TRIGGER IF EXISTS notify_commissions ON public.commissions;
CREATE TRIGGER notify_commissions AFTER INSERT OR UPDATE OF status ON public.commissions
  FOR EACH ROW EXECUTE FUNCTION public.notif_request_event(
    'commission', 'actor_user_id', 'commissioner_id', '/dashboard/culture-actor', '/commissions');

DROP TRIGGER IF EXISTS notify_support_pledges ON public.support_pledges;
CREATE TRIGGER notify_support_pledges AFTER INSERT OR UPDATE OF status ON public.support_pledges
  FOR EACH ROW EXECUTE FUNCTION public.notif_request_event(
    'pledge', 'owner_id', 'supporter_id', '/dashboard/organization', '/pledges');