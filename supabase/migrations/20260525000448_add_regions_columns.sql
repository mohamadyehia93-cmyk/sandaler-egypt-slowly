-- Extend the existing regions table with SEO/display columns
ALTER TABLE public.regions
  ADD COLUMN IF NOT EXISTS tagline_en TEXT,
  ADD COLUMN IF NOT EXISTS tagline_ar TEXT,
  ADD COLUMN IF NOT EXISTS governorates TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS season_highlights_en TEXT,
  ADD COLUMN IF NOT EXISTS season_highlights_ar TEXT,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Upsert all 6 Sandal regions. The `id` column serves as the slug.
-- `image` is the existing hero image column.
INSERT INTO public.regions (id, name_en, name_ar, emoji, color, about_en, about_ar, tagline_en, tagline_ar, governorates, season_highlights_en, season_highlights_ar, sort_order, is_active)
VALUES
  (
    'nile-delta',
    'Nile Delta', 'دلتا النيل',
    '🌿', '#2BBFB3',
    'Flamingos at Lake Manzala, traditional fishing villages, palm-lined towns, and the agricultural heartland that feeds Egypt.',
    'طيور الفلامينغو في بحيرة المنزلة، قرى الصيد التقليدية، المدن المظللة بالنخيل، والقلب الزراعي الذي يطعم مصر.',
    'The heart of rural Egypt', 'قلب مصر الريفية',
    ARRAY['Damietta','Beheira','Kafr El-Sheikh','Gharbia','Dakahlia'],
    'Oct–Mar: flamingo season at Lake Manzala. Apr–Jun: lotus flowers on the waterways.',
    'أكتوبر–مارس: موسم الفلامينغو في بحيرة المنزلة. أبريل–يونيو: زهور اللوتس على الممرات المائية.',
    1, true
  ),
  (
    'suez-canal',
    'Suez Canal', 'قناة السويس',
    '⚓', '#1A7A74',
    'Ismailia''s tree-lined avenues, Port Said''s coastal heritage, and the engineering wonder that reshaped the world.',
    'شوارع الإسماعيلية المظللة بالأشجار، تراث بورسعيد الساحلي، والمعجزة الهندسية التي غيرت العالم.',
    'Where two seas meet', 'حيث يلتقي البحران',
    ARRAY['Ismailia','Port Said','Suez'],
    'Oct–Apr: pleasant Mediterranean weather for canal-side walks and heritage exploration.',
    'أكتوبر–أبريل: طقس متوسطي لطيف للتجوال على ضفاف القناة واستكشاف التراث.',
    2, true
  ),
  (
    'upper-egypt',
    'Upper Egypt', 'صعيد مصر',
    '🏛️', '#E8A838',
    'Nubian villages, traditional crafts, and the slower rhythms of the South — far from the cruise-ship trails.',
    'قرى النوبة، الحرف التقليدية، وإيقاع الجنوب الهادئ — بعيداً عن مسارات سفن السياحة.',
    'Beyond the temples', 'وراء المعابد',
    ARRAY['Aswan','Luxor','Qena','Sohag'],
    'Nov–Feb: cool enough for valley walks and village visits. Avoid Jun–Aug heat.',
    'نوفمبر–فبراير: مناسب للمشي في الوادي وزيارة القرى. تجنب حرارة يونيو–أغسطس.',
    3, true
  ),
  (
    'mariout',
    'Mariout', 'مريوط',
    '🌊', '#5B8DB8',
    'Lake Mariout''s salt marshes, Bedouin heritage, and the agricultural belt west of Alexandria.',
    'مستنقعات بحيرة مريوط الملحية، تراث البدو، والحزام الزراعي غرب الإسكندرية.',
    'The forgotten lake', 'البحيرة المنسية',
    ARRAY['Alexandria','Beheira'],
    'Mar–May: birdwatching peak on Lake Mariout. Sep–Nov: grape harvest in coastal vineyards.',
    'مارس–مايو: ذروة مراقبة الطيور في بحيرة مريوط. سبتمبر–نوفمبر: موسم حصاد العنب في الكروم الساحلية.',
    4, true
  ),
  (
    'fayyum',
    'Fayyum', 'الفيوم',
    '🌿', '#6B8F5B',
    'Wadi El Rayan waterfalls, Lake Qarun, ancient Coptic monasteries, and pottery villages that have made the same designs for 4,000 years.',
    'شلالات وادي الريان، بحيرة قارون، الأديرة القبطية القديمة، وقرى الفخار التي تصنع نفس التصاميم منذ 4000 عام.',
    'Egypt''s green oasis', 'واحة مصر الخضراء',
    ARRAY['Fayyum'],
    'Oct–Apr: waterfalls at Wadi El Rayan are most impressive after autumn rains.',
    'أكتوبر–أبريل: شلالات وادي الريان في أبهى صورها بعد أمطار الخريف.',
    5, true
  ),
  (
    'frontiers',
    'Frontiers', 'الحدود',
    '⛰️', '#8B5CF6',
    'Siwa Oasis, the White Desert, the Red Sea coast away from the resorts, and the southern Sinai mountains.',
    'واحة سيوة، الصحراء البيضاء، ساحل البحر الأحمر بعيداً عن المنتجعات، وجبال جنوب سيناء.',
    'The edges of Egypt', 'أطراف مصر',
    ARRAY['Matrouh','New Valley','South Sinai','Red Sea'],
    'Oct–Mar: ideal for Siwa and White Desert camping. Apr–Jun: Red Sea diving visibility peaks.',
    'أكتوبر–مارس: مثالي للتخييم في سيوة والصحراء البيضاء. أبريل–يونيو: ذروة رؤية الغوص في البحر الأحمر.',
    6, true
  )
ON CONFLICT (id) DO UPDATE SET
  tagline_en          = EXCLUDED.tagline_en,
  tagline_ar          = EXCLUDED.tagline_ar,
  governorates        = EXCLUDED.governorates,
  season_highlights_en = EXCLUDED.season_highlights_en,
  season_highlights_ar = EXCLUDED.season_highlights_ar,
  sort_order          = EXCLUDED.sort_order,
  is_active           = EXCLUDED.is_active;

CREATE INDEX IF NOT EXISTS idx_regions_active_sort ON public.regions(is_active, sort_order);
