CREATE TABLE public.event_tickets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reference text NOT NULL UNIQUE DEFAULT upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0 AND quantity <= 20),
  unit_price_egp integer NOT NULL DEFAULT 0 CHECK (unit_price_egp >= 0),
  service_fee_egp integer NOT NULL DEFAULT 0 CHECK (service_fee_egp >= 0),
  total_egp integer NOT NULL DEFAULT 0 CHECK (total_egp >= 0),
  attendee_name text NOT NULL,
  attendee_email text NOT NULL,
  payment_method text NOT NULL DEFAULT 'card',
  status text NOT NULL DEFAULT 'confirmed',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.event_tickets TO authenticated;
GRANT ALL ON public.event_tickets TO service_role;

ALTER TABLE public.event_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own event tickets"
ON public.event_tickets FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Organizers can view tickets for their events"
ON public.event_tickets FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.events e
  JOIN public.providers p ON p.id = e.organizer_id
  WHERE e.id = event_tickets.event_id AND p.user_id = auth.uid()
));

CREATE POLICY "Users can buy their own event tickets"
ON public.event_tickets FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own event tickets"
ON public.event_tickets FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE INDEX idx_event_tickets_user ON public.event_tickets(user_id);
CREATE INDEX idx_event_tickets_event ON public.event_tickets(event_id);

CREATE TRIGGER update_event_tickets_updated_at
BEFORE UPDATE ON public.event_tickets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();