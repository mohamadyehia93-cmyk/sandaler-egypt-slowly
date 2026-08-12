ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS variant_selection jsonb,
  ADD COLUMN IF NOT EXISTS delivery_method text,
  ADD COLUMN IF NOT EXISTS delivery_address text;

-- The seller/buyer update guard must also freeze the newly added buyer-authored
-- columns, otherwise either side could rewrite what was ordered after the fact.
CREATE OR REPLACE FUNCTION public.enforce_order_seller_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
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
    NEW.variant_selection := OLD.variant_selection;
    NEW.delivery_method := OLD.delivery_method;
    NEW.delivery_address := OLD.delivery_address;
    NEW.created_at := OLD.created_at;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$function$;