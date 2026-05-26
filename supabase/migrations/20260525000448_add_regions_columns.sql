-- Extend the existing regions table with SEO/display columns.
-- Scoped to the 4 curated regions (nile-delta, suez-canal, upper-egypt, frontiers).
-- Uses UPDATE (not UPSERT) to preserve existing name/description/image data.

-- 1. Add new columns (no-op if already present)
ALTER TABLE public.regions
  ADD COLUMN IF NOT EXISTS tagline_en TEXT,
  ADD COLUMN IF NOT EXISTS tagline_ar TEXT,
  ADD COLUMN IF NOT EXISTS governorates TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS season_highlights_en TEXT,
  ADD COLUMN IF NOT EXISTS season_highlights_ar TEXT,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. RLS: public read of active regions
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read active regions" ON public.regions;
CREATE POLICY "Public can read active regions"
  ON public.regions FOR SELECT
  USING (is_active = true);

-- 3. Populate new metadata columns for the 4 existing regions (UPDATE only, no inserts)
UPDATE public.regions SET
  tagline_en           = 'The heart of rural Egypt',
  tagline_ar           = 'قلب مصر الريفية',
  governorates         = ARRAY['Damietta','Beheira','Kafr El-Sheikh','Gharbia','Dakahlia'],
  season_highlights_en = 'Oct–Mar: flamingo season at Lake Manzala. Apr–Jun: lotus flowers on the waterways.',
  season_highlights_ar = 'أكتوبر–مارس: موسم الفلامينغو في بحيرة المنزلة. أبريل–يونيو: زهور اللوتس على الممرات المائية.',
  sort_order           = 1,
  is_active            = true
WHERE id = 'nile-delta';

UPDATE public.regions SET
  tagline_en           = 'Where two seas meet',
  tagline_ar           = 'حيث يلتقي البحران',
  governorates         = ARRAY['Ismailia','Port Said','Suez'],
  season_highlights_en = 'Oct–Apr: pleasant Mediterranean weather for canal-side walks and heritage exploration.',
  season_highlights_ar = 'أكتوبر–أبريل: طقس متوسطي لطيف للتجوال على ضفاف القناة واستكشاف التراث.',
  sort_order           = 2,
  is_active            = true
WHERE id = 'suez-canal';

UPDATE public.regions SET
  tagline_en           = 'Beyond the temples',
  tagline_ar           = 'وراء المعابد',
  governorates         = ARRAY['Aswan','Luxor','Qena','Sohag'],
  season_highlights_en = 'Nov–Feb: cool enough for valley walks and village visits. Avoid Jun–Aug heat.',
  season_highlights_ar = 'نوفمبر–فبراير: مناسب للمشي في الوادي وزيارة القرى. تجنب حرارة يونيو–أغسطس.',
  sort_order           = 3,
  is_active            = true
WHERE id = 'upper-egypt';

UPDATE public.regions SET
  tagline_en           = 'The edges of Egypt',
  tagline_ar           = 'أطراف مصر',
  governorates         = ARRAY['Matrouh','New Valley','South Sinai','Red Sea'],
  season_highlights_en = 'Oct–Mar: ideal for Siwa and White Desert camping. Apr–Jun: Red Sea diving visibility peaks.',
  season_highlights_ar = 'أكتوبر–مارس: مثالي للتخييم في سيوة والصحراء البيضاء. أبريل–يونيو: ذروة رؤية الغوص في البحر الأحمر.',
  sort_order           = 4,
  is_active            = true
WHERE id = 'frontiers';

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_regions_active_sort ON public.regions(is_active, sort_order);

-- Slug index only if a separate slug column exists (id is the slug and already PK-indexed otherwise)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'regions' AND column_name = 'slug'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_regions_slug ON public.regions(slug);
  END IF;
END$$;
