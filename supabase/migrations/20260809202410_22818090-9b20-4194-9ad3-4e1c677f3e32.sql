-- 1. New buyer contact columns
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS contact_name text,
  ADD COLUMN IF NOT EXISTS contact_phone text;

-- 2. Widen status set to include declined / fulfilled (keeps existing values)
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending','confirmed','declined','fulfilled','shipped','completed','cancelled'));

-- 3. Required references (table is empty, safe to tighten)
ALTER TABLE public.orders ALTER COLUMN product_id SET NOT NULL;
ALTER TABLE public.orders ALTER COLUMN seller_id SET NOT NULL;
ALTER TABLE public.orders ALTER COLUMN buyer_id SET DEFAULT auth.uid();

-- 4. Derive seller_id / prices from the product row on insert so the client cannot spoof them.
--    NOTE: this models an unpaid order request. Payment (Stripe) can be layered on later
--    by adding payment columns and a checkout edge function; status stays the source of truth.
CREATE OR REPLACE FUNCTION public.enforce_order_insert_integrity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_seller uuid;
  v_price numeric;
BEGIN
  SELECT seller_id, price INTO v_seller, v_price
  FROM public.products WHERE id = NEW.product_id;

  IF v_seller IS NULL THEN
    RAISE EXCEPTION 'Product % has no seller and cannot be ordered', NEW.product_id;
  END IF;

  NEW.seller_id := v_seller;
  NEW.unit_price_egp := v_price;
  NEW.total_egp := COALESCE(v_price, 0) * NEW.quantity;
  NEW.status := 'pending';
  NEW.created_at := now();
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_order_insert_integrity() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS orders_insert_integrity ON public.orders;
CREATE TRIGGER orders_insert_integrity
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.enforce_order_insert_integrity();

-- 5. Pin every non-status column for BOTH sides on update (mirrors bookings_provider_update_guard)
CREATE OR REPLACE FUNCTION public.enforce_order_seller_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF public.is_order_seller(OLD.seller_id, auth.uid()) OR OLD.buyer_id = auth.uid() THEN
    NEW.id := OLD.id;
    NEW.product_id := OLD.product_id;
    NEW.buyer_id := OLD.buyer_id;
    NEW.seller_id := OLD.seller_id;
    NEW.quantity := OLD.quantity;
    NEW.unit_price_egp := OLD.unit_price_egp;
    NEW.total_egp := OLD.total_egp;
    NEW.buyer_note := OLD.buyer_note;
    NEW.contact_name := OLD.contact_name;
    NEW.contact_phone := OLD.contact_phone;
    NEW.created_at := OLD.created_at;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- 6. Seller status set now includes declined / fulfilled
DROP POLICY IF EXISTS "Sellers can update status of their orders" ON public.orders;
CREATE POLICY "Sellers can update status of their orders"
ON public.orders FOR UPDATE TO authenticated
USING (
  seller_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.providers p WHERE p.id = orders.seller_id AND p.user_id = auth.uid())
)
WITH CHECK (
  (seller_id = auth.uid()
   OR EXISTS (SELECT 1 FROM public.providers p WHERE p.id = orders.seller_id AND p.user_id = auth.uid()))
  AND status IN ('pending','confirmed','declined','fulfilled')
);

-- 7. Buyer may cancel only while pending
DROP POLICY IF EXISTS "Buyers can cancel their pending orders" ON public.orders;
CREATE POLICY "Buyers can cancel their pending orders"
ON public.orders FOR UPDATE TO authenticated
USING (buyer_id = auth.uid() AND status = 'pending')
WITH CHECK (buyer_id = auth.uid() AND status = 'cancelled');
