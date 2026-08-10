CREATE OR REPLACE FUNCTION public.enforce_booking_insert_defaults()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_provider_record uuid;
  v_provider_user uuid;
BEGIN
  IF NEW.status IS NULL OR NEW.status NOT IN ('pending','pending_payment') THEN
    NEW.status := 'pending';
  END IF;
  NEW.payment_status := 'unpaid';
  NEW.paid_at := NULL;
  NEW.refunded_at := NULL;
  NEW.created_at := now();
  NEW.updated_at := now();

  -- Never trust a client-supplied host: derive it from the listing.
  -- experiences.provider_id holds providers.id; bookings.provider_id holds the auth user id.
  SELECT e.provider_id INTO v_provider_record
  FROM public.experiences e WHERE e.id = NEW.experience_id;

  IF v_provider_record IS NOT NULL THEN
    SELECT p.user_id INTO v_provider_user
    FROM public.providers p WHERE p.id = v_provider_record;
  END IF;

  IF v_provider_user IS NULL THEN
    RAISE EXCEPTION 'This listing has no active host yet, so it cannot take booking requests';
  END IF;

  NEW.provider_id := v_provider_user;
  RETURN NEW;
END;
$function$;