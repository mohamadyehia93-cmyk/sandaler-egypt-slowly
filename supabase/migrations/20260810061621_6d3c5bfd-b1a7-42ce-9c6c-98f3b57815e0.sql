-- 1. Remove private contact columns from public/authenticated read access.
REVOKE SELECT (contact_email, contact_phone, whatsapp) ON public.providers FROM anon, authenticated;

-- 2. Guarded accessor: owner or confirmed transaction only.
CREATE OR REPLACE FUNCTION public.get_provider_contact(_provider_id uuid)
RETURNS TABLE (contact_email text, contact_phone text, whatsapp text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.contact_email, p.contact_phone, p.whatsapp
  FROM public.providers p
  WHERE p.id = _provider_id
    AND auth.uid() IS NOT NULL
    AND (
      p.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.bookings b
        JOIN public.experiences e ON e.id = b.experience_id
        WHERE b.visitor_id = auth.uid()
          AND b.status IN ('confirmed','completed')
          AND (e.provider_id = p.id OR e.provider_id = p.user_id)
      )
      OR EXISTS (
        SELECT 1 FROM public.orders o
        JOIN public.products pr ON pr.id = o.product_id
        WHERE o.buyer_id = auth.uid()
          AND o.status IN ('confirmed','fulfilled')
          AND (pr.seller_id = p.id OR pr.seller_id = p.user_id)
      )
      OR EXISTS (
        SELECT 1 FROM public.event_tickets t
        JOIN public.events ev ON ev.id = t.event_id
        WHERE t.user_id = auth.uid()
          AND t.status IN ('paid','valid','confirmed','completed')
          AND (ev.organizer_id = p.id OR ev.organizer_id = p.user_id)
      )
      OR EXISTS (
        SELECT 1 FROM public.session_requests sr
        JOIN public.meetups m ON m.id = sr.meetup_id
        WHERE sr.requester_id = auth.uid()
          AND sr.status = 'accepted'
          AND (m.organizer_id = p.id OR m.organizer_id = p.user_id)
      )
      OR EXISTS (
        SELECT 1 FROM public.volunteer_applications va
        LEFT JOIN public.programs pg ON pg.id = va.program_id
        LEFT JOIN public.causes c ON c.id = va.cause_id
        WHERE va.applicant_id = auth.uid()
          AND va.status = 'accepted'
          AND (
            pg.owner_id = p.id OR pg.owner_id = p.user_id
            OR c.owner_id = p.id OR c.owner_id = p.user_id
          )
      )
    )
$$;

REVOKE ALL ON FUNCTION public.get_provider_contact(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_provider_contact(uuid) TO authenticated, service_role;