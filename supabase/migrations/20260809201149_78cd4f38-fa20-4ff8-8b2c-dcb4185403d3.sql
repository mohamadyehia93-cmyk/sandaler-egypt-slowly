CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE RESTRICT,
  buyer_id uuid NOT NULL,
  seller_id uuid,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price_egp numeric,
  total_egp numeric,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','shipped','completed','cancelled')),
  buyer_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can create their own orders"
ON public.orders FOR INSERT TO authenticated
WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Buyers can read their own orders"
ON public.orders FOR SELECT TO authenticated
USING (buyer_id = auth.uid());

CREATE POLICY "Sellers can read orders for their products"
ON public.orders FOR SELECT TO authenticated
USING (
  seller_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.providers p
    WHERE p.id = orders.seller_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Sellers can update status of their orders"
ON public.orders FOR UPDATE TO authenticated
USING (
  seller_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.providers p
    WHERE p.id = orders.seller_id AND p.user_id = auth.uid()
  )
)
WITH CHECK (
  (
    seller_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.providers p
      WHERE p.id = orders.seller_id AND p.user_id = auth.uid()
    )
  )
  AND status IN ('pending','confirmed','shipped','completed','cancelled')
);

CREATE OR REPLACE FUNCTION public.is_order_seller(_seller_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT _seller_id = _user_id
     OR EXISTS (
       SELECT 1 FROM public.providers p
       WHERE p.id = _seller_id AND p.user_id = _user_id
     );
$$;

CREATE OR REPLACE FUNCTION public.enforce_order_seller_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF public.is_order_seller(OLD.seller_id, auth.uid()) AND OLD.buyer_id IS DISTINCT FROM auth.uid() THEN
    NEW.id := OLD.id;
    NEW.product_id := OLD.product_id;
    NEW.buyer_id := OLD.buyer_id;
    NEW.seller_id := OLD.seller_id;
    NEW.quantity := OLD.quantity;
    NEW.unit_price_egp := OLD.unit_price_egp;
    NEW.total_egp := OLD.total_egp;
    NEW.buyer_note := OLD.buyer_note;
    NEW.created_at := OLD.created_at;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.is_order_seller(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_order_seller_update() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER orders_seller_update_guard
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.enforce_order_seller_update();

CREATE INDEX idx_orders_buyer ON public.orders (buyer_id, created_at DESC);
CREATE INDEX idx_orders_seller ON public.orders (seller_id, created_at DESC);