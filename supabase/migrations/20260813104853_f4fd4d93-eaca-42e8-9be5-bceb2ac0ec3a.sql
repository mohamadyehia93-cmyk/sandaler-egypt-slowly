-- ACCOMMODATIONS: describe the unit, the stay rules and the terms.
ALTER TABLE public.accommodations
  ADD COLUMN IF NOT EXISTS unit_type_en text,
  ADD COLUMN IF NOT EXISTS unit_type_ar text,
  ADD COLUMN IF NOT EXISTS sleeps integer,
  ADD COLUMN IF NOT EXISTS bedrooms integer,
  ADD COLUMN IF NOT EXISTS bathrooms integer,
  ADD COLUMN IF NOT EXISTS check_in_time text,
  ADD COLUMN IF NOT EXISTS check_out_time text,
  ADD COLUMN IF NOT EXISTS min_nights integer,
  ADD COLUMN IF NOT EXISTS house_rules_en text,
  ADD COLUMN IF NOT EXISTS house_rules_ar text,
  ADD COLUMN IF NOT EXISTS cancellation_en text,
  ADD COLUMN IF NOT EXISTS cancellation_ar text,
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'EGP';

ALTER TABLE public.accommodations
  DROP CONSTRAINT IF EXISTS accommodations_sleeps_check,
  DROP CONSTRAINT IF EXISTS accommodations_min_nights_check;

ALTER TABLE public.accommodations
  ADD CONSTRAINT accommodations_sleeps_check CHECK (sleeps IS NULL OR sleeps > 0),
  ADD CONSTRAINT accommodations_min_nights_check CHECK (min_nights IS NULL OR min_nights > 0);

-- TRANSPORT: route vs hire, price basis, departure point, schedule, gallery.
ALTER TABLE public.transport
  ADD COLUMN IF NOT EXISTS hire_type text,
  ADD COLUMN IF NOT EXISTS price_basis text,
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'EGP',
  ADD COLUMN IF NOT EXISTS departure_point_en text,
  ADD COLUMN IF NOT EXISTS departure_point_ar text,
  ADD COLUMN IF NOT EXISTS schedule_en text,
  ADD COLUMN IF NOT EXISTS schedule_ar text,
  ADD COLUMN IF NOT EXISTS notes_en text,
  ADD COLUMN IF NOT EXISTS notes_ar text,
  ADD COLUMN IF NOT EXISTS latitude numeric,
  ADD COLUMN IF NOT EXISTS longitude numeric,
  ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}'::text[];

ALTER TABLE public.transport
  DROP CONSTRAINT IF EXISTS transport_hire_type_check,
  DROP CONSTRAINT IF EXISTS transport_price_basis_check;

ALTER TABLE public.transport
  ADD CONSTRAINT transport_hire_type_check CHECK (hire_type IS NULL OR hire_type IN ('fixed-route', 'on-demand')),
  ADD CONSTRAINT transport_price_basis_check CHECK (price_basis IS NULL OR price_basis IN ('per-person', 'per-vehicle'));