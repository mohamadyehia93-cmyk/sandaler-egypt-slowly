ALTER TABLE public.transport DROP CONSTRAINT IF EXISTS transport_transport_type_check;
ALTER TABLE public.transport ADD CONSTRAINT transport_transport_type_check
  CHECK (transport_type = ANY (ARRAY[
    'felucca','tuk-tuk','bus','private-car','boat','horse-cart','horse-carriage','train','microbus',
    'service-taxi','ferry','shuttle','camel','bicycle','walking','flight','cruise','4x4','donkey-cart','balloon'
  ]));