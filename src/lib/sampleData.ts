export const regions = [
  { id: "nile-delta", nameKey: "region.nileDelta", emoji: "🌿", color: "#2BBFB3" },
  { id: "suez-canal", nameKey: "region.suezCanal", emoji: "⚓", color: "#1A7A74" },
  { id: "upper-egypt", nameKey: "region.upperEgypt", emoji: "🏛️", color: "#E8A838" },
  { id: "frontiers", nameKey: "region.frontiers", emoji: "⛰️", color: "#8B5CF6" },
];

export const regionCities: Record<string, { id: string; name: { en: string; ar: string } }[]> = {
  "nile-delta": [
    { id: "rosetta", name: { en: "Rosetta", ar: "رشيد" } },
    { id: "damietta", name: { en: "Damietta", ar: "دمياط" } },
    { id: "edku", name: { en: "Edku", ar: "إدكو" } },
    { id: "manzala", name: { en: "Manzala", ar: "المنزلة" } },
    { id: "mansoura", name: { en: "Mansoura", ar: "المنصورة" } },
    { id: "tanta", name: { en: "Tanta", ar: "طنطا" } },
    { id: "bilbeis", name: { en: "Bilbeis", ar: "بلبيس" } },
    { id: "el-mahalla", name: { en: "El Mahalla El Kubra", ar: "المحلة الكبرى" } },
    { id: "fuwwah", name: { en: "Fuwwah", ar: "فوة" } },
    { id: "desouk", name: { en: "Desouk", ar: "دسوق" } },
  ],
  "suez-canal": [
    { id: "ismailia", name: { en: "Ismailia", ar: "الإسماعيلية" } },
    { id: "port-said", name: { en: "Port Said", ar: "بورسعيد" } },
    { id: "suez", name: { en: "Suez", ar: "السويس" } },
  ],
  "upper-egypt": [
    { id: "aswan", name: { en: "Aswan", ar: "أسوان" } },
    { id: "luxor", name: { en: "Luxor", ar: "الأقصر" } },
    { id: "edfu", name: { en: "Edfu", ar: "إدفو" } },
    { id: "esna", name: { en: "Esna", ar: "إسنا" } },
    { id: "sohag", name: { en: "Sohag", ar: "سوهاج" } },
    { id: "qena", name: { en: "Qena", ar: "قنا" } },
    { id: "assiut", name: { en: "Assiut", ar: "أسيوط" } },
    { id: "minya", name: { en: "Minya", ar: "المنيا" } },
    { id: "fayoum", name: { en: "Fayoum", ar: "الفيوم" } },
  ],
  "frontiers": [
    { id: "siwa", name: { en: "Siwa", ar: "سيوة" } },
    { id: "dahab", name: { en: "Dahab", ar: "دهب" } },
    { id: "marsa-alam", name: { en: "Marsa Alam", ar: "مرسى علم" } },
    { id: "quseir", name: { en: "Quseir", ar: "القصير" } },
    { id: "hurghada", name: { en: "Hurghada", ar: "الغردقة" } },
    { id: "marsa-matrouh", name: { en: "Marsa Matrouh", ar: "مرسى مطروح" } },
    { id: "el-arish", name: { en: "El Arish", ar: "العريش" } },
  ],
};

export type CityInfo = {
  id: string;
  regionId: string;
  name: { en: string; ar: string };
  governorate: { en: string; ar: string };
  population: string;
  about: { en: string; ar: string };
  highlights: { en: string[]; ar: string[] };
  knownFor: { en: string[]; ar: string[] };
  bestTime: { en: string; ar: string };
  image: string;
};

export const cityData: Record<string, CityInfo> = {
  // === NILE DELTA ===
  rosetta: {
    id: "rosetta", regionId: "nile-delta",
    name: { en: "Rosetta", ar: "رشيد" },
    governorate: { en: "Beheira", ar: "البحيرة" },
    population: "~75,000",
    about: {
      en: "Rosetta (Rashid) is a historic port city at the mouth of the Nile's western branch on the Mediterranean. It is world-famous as the site where the Rosetta Stone was discovered in 1799 by French soldiers during Napoleon's campaign. The city boasts one of the finest collections of Ottoman-era architecture in Egypt, with over 20 restored merchant houses featuring intricate red-and-black brickwork. Surrounded by palm groves, Rosetta is also known as the 'City of a Million Palm Trees.'",
      ar: "رشيد مدينة ميناء تاريخية عند مصب فرع النيل الغربي على البحر المتوسط. اشتهرت عالمياً بأنها المكان الذي اكتُشف فيه حجر رشيد عام ١٧٩٩. تضم المدينة واحدة من أروع مجموعات العمارة العثمانية في مصر مع أكثر من ٢٠ منزلاً تجارياً مرمماً. تُعرف أيضاً بمدينة المليون نخلة."
    },
    highlights: { en: ["Rosetta Stone discovery site", "Ottoman merchant houses", "Abu Mandour Mosque", "Nile estuary & Mediterranean views"], ar: ["موقع اكتشاف حجر رشيد", "البيوت العثمانية", "مسجد أبو مندور", "مصب النيل والبحر المتوسط"] },
    knownFor: { en: ["Ottoman architecture", "Palm weaving crafts", "Traditional delta cuisine", "Historical significance"], ar: ["العمارة العثمانية", "حرف نسج النخيل", "المطبخ التقليدي", "الأهمية التاريخية"] },
    bestTime: { en: "October – April (mild weather)", ar: "أكتوبر – أبريل (طقس معتدل)" },
    image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80",
  },
  damietta: {
    id: "damietta", regionId: "nile-delta",
    name: { en: "Damietta", ar: "دمياط" },
    governorate: { en: "Damietta", ar: "دمياط" },
    population: "~400,000",
    about: {
      en: "Damietta is a major port city on the Mediterranean coast at the eastern branch of the Nile Delta. It has been a significant trading hub since ancient times, famously withstanding Crusader sieges in the 13th century. Today it is Egypt's furniture-making capital, with thousands of workshops producing handcrafted wooden furniture. The city is also renowned for its sweets, especially the iconic 'Damietta Meshaltit' cheese and its artisanal confections.",
      ar: "دمياط مدينة ميناء رئيسية على ساحل البحر المتوسط عند الفرع الشرقي لدلتا النيل. كانت مركزاً تجارياً مهماً منذ العصور القديمة واشتهرت بصمودها أمام الحملات الصليبية. اليوم هي عاصمة صناعة الأثاث في مصر وتشتهر بالجبن الدمياطي والحلويات."
    },
    highlights: { en: ["Furniture workshops & souks", "Damietta Port", "Ras El Bar beach resort", "Historic old quarter"], ar: ["ورش ومحلات الأثاث", "ميناء دمياط", "منتجع رأس البر", "الحي القديم"] },
    knownFor: { en: ["Furniture craftsmanship", "Damietta cheese", "Palm weaving", "Seafood"], ar: ["صناعة الأثاث", "الجبن الدمياطي", "نسج النخيل", "المأكولات البحرية"] },
    bestTime: { en: "May – September (beach season)", ar: "مايو – سبتمبر (موسم الشاطئ)" },
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
  },
  edku: {
    id: "edku", regionId: "nile-delta",
    name: { en: "Edku", ar: "إدكو" },
    governorate: { en: "Beheira", ar: "البحيرة" },
    population: "~70,000",
    about: {
      en: "Edku is a small town on the Mediterranean coast near Lake Edku, one of the northern delta lagoons. The lake is a vital ecosystem for migratory birds and sustains local fishing communities. The town is known for its organic honey production and quiet, rural charm. Lake Edku connects to the sea through a narrow channel, creating a unique brackish habitat.",
      ar: "إدكو بلدة صغيرة على ساحل البحر المتوسط قرب بحيرة إدكو، إحدى بحيرات الدلتا الشمالية. البحيرة نظام بيئي حيوي للطيور المهاجرة وتدعم مجتمعات الصيد المحلية. تشتهر بإنتاج العسل العضوي وهدوء الريف."
    },
    highlights: { en: ["Lake Edku", "Organic honey farms", "Fishing villages", "Bird watching"], ar: ["بحيرة إدكو", "مزارع العسل العضوي", "قرى الصيد", "مراقبة الطيور"] },
    knownFor: { en: ["Organic honey", "Lake fishing", "Migratory birds", "Rural tranquility"], ar: ["العسل العضوي", "صيد البحيرة", "الطيور المهاجرة", "هدوء الريف"] },
    bestTime: { en: "November – March (bird migration)", ar: "نوفمبر – مارس (هجرة الطيور)" },
    image: "https://images.unsplash.com/photo-1590077428593-a55bb07c4665?w=800&q=80",
  },
  manzala: {
    id: "manzala", regionId: "nile-delta",
    name: { en: "Manzala", ar: "المنزلة" },
    governorate: { en: "Dakahlia", ar: "الدقهلية" },
    population: "~80,000",
    about: {
      en: "Manzala sits on the shores of Lake Manzala, the largest of Egypt's northern delta lakes and one of the most important wetlands in the Mediterranean basin. The lake is home to thousands of migratory birds and supports fishing families who have lived on its waters for generations. Despite environmental challenges, Manzala remains a vital ecological area and a window into the traditional delta way of life.",
      ar: "المنزلة تقع على شواطئ بحيرة المنزلة، أكبر بحيرات الدلتا الشمالية وواحدة من أهم الأراضي الرطبة في حوض البحر المتوسط. البحيرة موطن لآلاف الطيور المهاجرة وتدعم عائلات الصيد التي عاشت على مياهها لأجيال."
    },
    highlights: { en: ["Lake Manzala wetlands", "Bird Island", "Traditional fishing boats", "Sunrise fishing trips"], ar: ["أراضي بحيرة المنزلة الرطبة", "جزيرة الطيور", "قوارب الصيد التقليدية", "رحلات صيد عند الشروق"] },
    knownFor: { en: ["Bird watching", "Traditional fishing", "Wetland ecology", "Lake cuisine"], ar: ["مراقبة الطيور", "الصيد التقليدي", "بيئة الأراضي الرطبة", "مأكولات البحيرة"] },
    bestTime: { en: "October – March (migration season)", ar: "أكتوبر – مارس (موسم الهجرة)" },
    image: "https://images.unsplash.com/photo-1590077428593-a55bb07c4665?w=800&q=80",
  },
  mansoura: {
    id: "mansoura", regionId: "nile-delta",
    name: { en: "Mansoura", ar: "المنصورة" },
    governorate: { en: "Dakahlia", ar: "الدقهلية" },
    population: "~632,000",
    about: {
      en: "Mansoura ('The Victorious') is one of Egypt's largest delta cities, located on the eastern bank of the Damietta branch of the Nile. The city earned its name after the Egyptian victory over the Seventh Crusade led by King Louis IX of France in 1250, where the French king was captured. Today Mansoura is a vibrant university city, home to Mansoura University, and serves as a major commercial and cultural hub for the eastern delta. The Nile corniche offers beautiful riverside walks and the old quarter retains much of its historic charm.",
      ar: "المنصورة ('المنتصرة') واحدة من أكبر مدن الدلتا، تقع على الضفة الشرقية لفرع دمياط. سُميت بهذا الاسم بعد انتصار المصريين على الحملة الصليبية السابعة بقيادة الملك لويس التاسع عام ١٢٥٠. اليوم مدينة جامعية نابضة بالحياة ومركز تجاري وثقافي رئيسي."
    },
    highlights: { en: ["Dar Ibn Luqman Museum (Crusader prison)", "Nile Corniche", "Mansoura University campus", "Historic old quarter"], ar: ["متحف دار ابن لقمان", "كورنيش النيل", "حرم جامعة المنصورة", "الحي القديم"] },
    knownFor: { en: ["Battle of Mansoura 1250", "University city", "Nile riverside culture", "Delta gastronomy"], ar: ["معركة المنصورة ١٢٥٠", "مدينة جامعية", "ثقافة ضفاف النيل", "مطبخ الدلتا"] },
    bestTime: { en: "October – April (pleasant weather)", ar: "أكتوبر – أبريل (طقس لطيف)" },
    image: "https://images.unsplash.com/photo-1568322445389-f64c5bb0df1d?w=800&q=80",
  },
  tanta: {
    id: "tanta", regionId: "nile-delta",
    name: { en: "Tanta", ar: "طنطا" },
    governorate: { en: "Gharbia", ar: "الغربية" },
    population: "~530,000",
    about: {
      en: "Tanta is the largest city in the Nile Delta and capital of the Gharbia Governorate. It is best known for the annual Moulid of Sayyed Ahmed el-Badawi, one of Egypt's largest religious festivals attracting millions of visitors each October. The city is a major agricultural trading center, historically famous for its cotton markets. Tanta is also celebrated for its roasted chickpeas and sweets, especially 'halawet el-moulid' candy during the festival season.",
      ar: "طنطا أكبر مدينة في دلتا النيل وعاصمة محافظة الغربية. تشتهر بمولد السيد أحمد البدوي، أحد أكبر المهرجانات الدينية في مصر الذي يجذب الملايين كل أكتوبر. مركز تجاري زراعي رئيسي اشتهر تاريخياً بأسواق القطن وتشتهر بالحمص المحمص وحلاوة المولد."
    },
    highlights: { en: ["El-Sayyed El-Badawi Mosque", "Annual Moulid festival", "Historic cotton markets", "Tanta University"], ar: ["مسجد السيد البدوي", "مولد السيد البدوي السنوي", "أسواق القطن التاريخية", "جامعة طنطا"] },
    knownFor: { en: ["Moulid festival", "Roasted chickpeas & sweets", "Cotton trading heritage", "Sufi culture"], ar: ["مولد السيد البدوي", "الحمص والحلويات", "تراث تجارة القطن", "الثقافة الصوفية"] },
    bestTime: { en: "October (Moulid festival)", ar: "أكتوبر (موسم المولد)" },
    image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80",
  },
  bilbeis: {
    id: "bilbeis", regionId: "nile-delta",
    name: { en: "Bilbeis", ar: "بلبيس" },
    governorate: { en: "Sharqia", ar: "الشرقية" },
    population: "~250,000",
    about: {
      en: "Bilbeis is one of Egypt's oldest cities, located at the eastern edge of the Nile Delta in the Sharqia Governorate. It served as a fortress city guarding the eastern approach to Cairo since Pharaonic times. The city was a key battleground during the Crusader invasions and retains remnants of its medieval fortifications. Today Bilbeis is known for its agricultural surroundings, traditional markets, and its position on the ancient trade route to the Sinai.",
      ar: "بلبيس من أقدم مدن مصر، تقع على الحافة الشرقية لدلتا النيل. كانت مدينة حصن تحرس المدخل الشرقي للقاهرة منذ العصر الفرعوني. كانت ساحة معركة رئيسية خلال الغزوات الصليبية ولا تزال تحتفظ ببقايا تحصيناتها. اليوم تشتهر بأسواقها التقليدية وموقعها على طريق التجارة القديم."
    },
    highlights: { en: ["Ancient fortress ruins", "Traditional souks", "Agricultural heartland", "Gateway to Sinai trade route"], ar: ["أطلال القلعة القديمة", "الأسواق التقليدية", "قلب الأراضي الزراعية", "بوابة طريق تجارة سيناء"] },
    knownFor: { en: ["Ancient fortress city", "Crusader-era history", "Agricultural markets", "Traditional crafts"], ar: ["مدينة القلعة القديمة", "تاريخ عصر الحروب الصليبية", "الأسواق الزراعية", "الحرف التقليدية"] },
    bestTime: { en: "November – March (cool weather)", ar: "نوفمبر – مارس (طقس بارد)" },
    image: "https://images.unsplash.com/photo-1568322445389-f64c5bb0df1d?w=800&q=80",
  },
  "el-mahalla": {
    id: "el-mahalla", regionId: "nile-delta",
    name: { en: "El Mahalla El Kubra", ar: "المحلة الكبرى" },
    governorate: { en: "Gharbia", ar: "الغربية" },
    population: "~535,000",
    about: {
      en: "El Mahalla El Kubra is one of the largest industrial cities in the Nile Delta and home to the Misr Spinning and Weaving Company, the largest textile factory in the Middle East, founded in 1927. The city has a proud labor history and played a pivotal role in Egypt's modern social movements. Beyond industry, El Mahalla is known for its rich textile heritage, vibrant markets, and traditional delta culture. The city's weavers produce some of Egypt's finest cotton and linen fabrics.",
      ar: "المحلة الكبرى واحدة من أكبر المدن الصناعية في الدلتا وموطن شركة مصر للغزل والنسيج، أكبر مصنع نسيج في الشرق الأوسط تأسس عام ١٩٢٧. تتميز بتاريخ عمالي عريق وتراث نسيج غني وأسواق نابضة بالحياة."
    },
    highlights: { en: ["Misr Spinning & Weaving Company", "Textile heritage museum", "Traditional cotton markets", "Historic workers' quarter"], ar: ["شركة مصر للغزل والنسيج", "متحف تراث النسيج", "أسواق القطن التقليدية", "حي العمال التاريخي"] },
    knownFor: { en: ["Textile industry", "Cotton & linen fabrics", "Labor movement history", "Traditional weaving"], ar: ["صناعة النسيج", "أقمشة القطن والكتان", "تاريخ الحركة العمالية", "النسيج التقليدي"] },
    bestTime: { en: "October – April", ar: "أكتوبر – أبريل" },
    image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&q=80",
  },
  fuwwah: {
    id: "fuwwah", regionId: "nile-delta",
    name: { en: "Fuwwah", ar: "فوة" },
    governorate: { en: "Kafr El Sheikh", ar: "كفر الشيخ" },
    population: "~80,000",
    about: {
      en: "Fuwwah is a small delta town on the Rosetta branch of the Nile, historically renowned as Egypt's carpet-weaving capital. The town has produced hand-loomed kilims and carpets for centuries, a craft tradition that earned it recognition from UNESCO. Fuwwah's weavers use traditional techniques passed down through generations, creating distinctive geometric patterns with natural dyes. The town also features several Ottoman-era mosques and a charming riverside setting.",
      ar: "فوة بلدة صغيرة على فرع رشيد من النيل، اشتهرت تاريخياً كعاصمة نسج السجاد في مصر. أنتجت البلدة السجاد والكليم اليدوي لقرون، وهي حرفة معترف بها من اليونسكو. يستخدم النساجون تقنيات تقليدية متوارثة وأصباغ طبيعية. تضم أيضاً عدة مساجد عثمانية."
    },
    highlights: { en: ["Hand-loomed carpet workshops", "Ottoman mosques", "Nile riverside walks", "UNESCO-recognized craft heritage"], ar: ["ورش السجاد اليدوي", "المساجد العثمانية", "ممشى النيل", "تراث حرفي معترف به من اليونسكو"] },
    knownFor: { en: ["Carpet & kilim weaving", "UNESCO craft heritage", "Ottoman architecture", "Nile riverside charm"], ar: ["نسج السجاد والكليم", "تراث حرفي يونسكو", "العمارة العثمانية", "سحر ضفاف النيل"] },
    bestTime: { en: "October – April", ar: "أكتوبر – أبريل" },
    image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&q=80",
  },
  desouk: {
    id: "desouk", regionId: "nile-delta",
    name: { en: "Desouk", ar: "دسوق" },
    governorate: { en: "Kafr El Sheikh", ar: "كفر الشيخ" },
    population: "~150,000",
    about: {
      en: "Desouk is a delta town on the Rosetta branch of the Nile in Kafr El Sheikh Governorate. It is best known as the home of the shrine of Ibrahim El-Desouki, one of the four poles of Sunni Sufism and founder of the Desouqi Sufi order. The annual moulid (festival) of El-Desouki draws hundreds of thousands of pilgrims and features Sufi chanting, dhikr circles, and colorful processions. The town offers an authentic glimpse into Egyptian Sufi spiritual traditions.",
      ar: "دسوق بلدة على فرع رشيد من النيل. تشتهر بضريح إبراهيم الدسوقي، أحد الأقطاب الأربعة في التصوف السني ومؤسس الطريقة الدسوقية. المولد السنوي يجذب مئات الآلاف من الحجاج ويضم الإنشاد الصوفي وحلقات الذكر والمواكب."
    },
    highlights: { en: ["Ibrahim El-Desouki Mosque & Shrine", "Annual Sufi moulid festival", "Dhikr circles & Sufi chanting", "Nile riverside"], ar: ["مسجد وضريح إبراهيم الدسوقي", "مولد الدسوقي السنوي", "حلقات الذكر والإنشاد", "ضفاف النيل"] },
    knownFor: { en: ["Sufi heritage", "El-Desouki moulid", "Spiritual pilgrimage", "Delta hospitality"], ar: ["التراث الصوفي", "مولد الدسوقي", "الحج الروحي", "كرم ضيافة الدلتا"] },
    bestTime: { en: "October (moulid season)", ar: "أكتوبر (موسم المولد)" },
    image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80",
  },
  // === SUEZ CANAL ===
  ismailia: {
    id: "ismailia", regionId: "suez-canal",
    name: { en: "Ismailia", ar: "الإسماعيلية" },
    governorate: { en: "Ismailia", ar: "الإسماعيلية" },
    population: "~400,000",
    about: {
      en: "Ismailia is a garden city on the western bank of the Suez Canal, situated on the shores of Lake Timsah. Founded in 1863 during the construction of the Suez Canal, it was named after Khedive Ismail. The city is known for its tree-lined boulevards, colonial-era architecture, and relaxed atmosphere. Lake Timsah offers kayaking, fishing, and waterfront dining, while the Ismailia Museum houses Pharaonic and Greco-Roman artifacts from the canal zone.",
      ar: "الإسماعيلية مدينة حدائق على الضفة الغربية لقناة السويس على شاطئ بحيرة التمساح. تأسست عام ١٨٦٣ أثناء بناء القناة وسُميت باسم الخديوي إسماعيل. تشتهر بشوارعها المشجرة وعمارتها الاستعمارية وأجوائها الهادئة."
    },
    highlights: { en: ["Lake Timsah", "Ismailia Museum", "De Lesseps' House", "Garden city boulevards"], ar: ["بحيرة التمساح", "متحف الإسماعيلية", "منزل دي لسبس", "شوارع المدينة المشجرة"] },
    knownFor: { en: ["Suez Canal history", "Garden city atmosphere", "Lake Timsah water sports", "Colonial architecture"], ar: ["تاريخ قناة السويس", "أجواء المدينة الحدائقية", "رياضات بحيرة التمساح", "العمارة الاستعمارية"] },
    bestTime: { en: "October – April", ar: "أكتوبر – أبريل" },
    image: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800&q=80",
  },
  "port-said": {
    id: "port-said", regionId: "suez-canal",
    name: { en: "Port Said", ar: "بورسعيد" },
    governorate: { en: "Port Said", ar: "بورسعيد" },
    population: "~750,000",
    about: {
      en: "Port Said is a vibrant coastal city at the northern entrance of the Suez Canal where it meets the Mediterranean Sea. Founded in 1859, the city features a distinctive European Quarter with ornate balconied buildings reflecting French, Italian, and Greek architectural influences. It was a free trade zone for decades and remains a duty-free shopping destination. Port Said played a heroic role during the 1956 Suez Crisis and the city celebrates its resistance every December 23.",
      ar: "بورسعيد مدينة ساحلية نابضة بالحياة عند المدخل الشمالي لقناة السويس. تأسست عام ١٨٥٩ وتتميز بحي أوروبي مميز بمبانٍ ذات شرفات تعكس تأثيرات معمارية فرنسية وإيطالية ويونانية. لعبت دوراً بطولياً خلال أزمة السويس ١٩٥٦."
    },
    highlights: { en: ["European Quarter", "Suez Canal waterfront", "Port Said Lighthouse", "Military Museum"], ar: ["الحي الأوروبي", "واجهة قناة السويس", "منارة بورسعيد", "المتحف الحربي"] },
    knownFor: { en: ["Colonial architecture", "Duty-free shopping", "1956 resistance history", "Seafood cuisine"], ar: ["العمارة الاستعمارية", "التسوق المعفي", "تاريخ مقاومة ١٩٥٦", "المأكولات البحرية"] },
    bestTime: { en: "March – May, October – November", ar: "مارس – مايو، أكتوبر – نوفمبر" },
    image: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800&q=80",
  },
  suez: {
    id: "suez", regionId: "suez-canal",
    name: { en: "Suez", ar: "السويس" },
    governorate: { en: "Suez", ar: "السويس" },
    population: "~730,000",
    about: {
      en: "Suez sits at the southern end of the Suez Canal where it meets the Red Sea's Gulf of Suez. The city has been a strategic gateway between Africa and Asia for millennia. It played a crucial role during the 1973 October War and still carries the spirit of resilience. Today the city is an industrial and petroleum hub, but also offers access to Ain Sokhna's beaches and the Ataka Mountains, providing a mix of urban energy and nearby natural escapes.",
      ar: "السويس تقع في الطرف الجنوبي لقناة السويس حيث تلتقي بخليج السويس من البحر الأحمر. كانت بوابة استراتيجية بين أفريقيا وآسيا لآلاف السنين. لعبت دوراً حاسماً في حرب أكتوبر ١٩٧٣. اليوم مركز صناعي وبترولي مع قرب من شواطئ العين السخنة."
    },
    highlights: { en: ["Southern canal entrance", "Ataka Mountains", "Ain Sokhna nearby", "October War memorials"], ar: ["مدخل القناة الجنوبي", "جبال عتاقة", "العين السخنة القريبة", "نصب حرب أكتوبر"] },
    knownFor: { en: ["Strategic canal position", "1973 War history", "Industrial heritage", "Gateway to Red Sea"], ar: ["الموقع الاستراتيجي", "تاريخ حرب ٧٣", "التراث الصناعي", "بوابة البحر الأحمر"] },
    bestTime: { en: "October – April", ar: "أكتوبر – أبريل" },
    image: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800&q=80",
  },
  // === UPPER EGYPT ===
  aswan: {
    id: "aswan", regionId: "upper-egypt",
    name: { en: "Aswan", ar: "أسوان" },
    governorate: { en: "Aswan", ar: "أسوان" },
    population: "~350,000",
    about: {
      en: "Aswan is Egypt's southernmost major city, sitting on the east bank of the Nile at the first cataract. It has been Egypt's gateway to Africa since ancient times and is renowned for its Nubian culture, vibrant painted villages, and stunning river scenery. Key attractions include the Philae Temple dedicated to Isis, the Unfinished Obelisk, the Aswan High Dam, and the peaceful Elephantine Island. Aswan's warm winters and golden sunsets make it one of Egypt's most beloved destinations.",
      ar: "أسوان أقصى مدينة رئيسية جنوب مصر، على الضفة الشرقية للنيل عند الشلال الأول. بوابة مصر إلى أفريقيا منذ القدم وتشتهر بثقافتها النوبية وقراها الملونة ومناظر النيل الخلابة. معبد فيلة والمسلة الناقصة والسد العالي من أبرز معالمها."
    },
    highlights: { en: ["Philae Temple", "Nubian villages", "Aswan High Dam", "Elephantine Island"], ar: ["معبد فيلة", "القرى النوبية", "السد العالي", "جزيرة الفنتين"] },
    knownFor: { en: ["Nubian culture", "Ancient temples", "Winter sun destination", "Felucca sailing"], ar: ["الثقافة النوبية", "المعابد القديمة", "وجهة شتوية", "ركوب الفلوكة"] },
    bestTime: { en: "October – March (warm & dry)", ar: "أكتوبر – مارس (دافئ وجاف)" },
    image: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800&q=80",
  },
  luxor: {
    id: "luxor", regionId: "upper-egypt",
    name: { en: "Luxor", ar: "الأقصر" },
    governorate: { en: "Luxor", ar: "الأقصر" },
    population: "~500,000",
    about: {
      en: "Luxor, ancient Thebes, is often called the 'World's Greatest Open-Air Museum.' The city is divided by the Nile into the East Bank (city of the living) with Karnak and Luxor Temples, and the West Bank (city of the dead) with the Valley of the Kings, Hatshepsut's Temple, and the Colossi of Memnon. Luxor contains roughly one-third of the world's antiquities and is one of the most visited archaeological sites on Earth.",
      ar: "الأقصر، طيبة القديمة، تُلقب بأعظم متحف مفتوح في العالم. تنقسم بالنيل إلى البر الشرقي (مدينة الأحياء) بمعبدي الكرنك والأقصر، والبر الغربي (مدينة الأموات) بوادي الملوك ومعبد حتشبسوت وتمثالي ممنون. تضم نحو ثلث آثار العالم."
    },
    highlights: { en: ["Valley of the Kings", "Karnak Temple", "Hatshepsut Temple", "Hot air balloon rides"], ar: ["وادي الملوك", "معبد الكرنك", "معبد حتشبسوت", "رحلات المنطاد"] },
    knownFor: { en: ["Ancient Thebes", "World's greatest open-air museum", "Pharaonic tombs", "Nile cruises"], ar: ["طيبة القديمة", "أعظم متحف مفتوح", "المقابر الفرعونية", "رحلات النيل"] },
    bestTime: { en: "October – March", ar: "أكتوبر – مارس" },
    image: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800&q=80",
  },
  edfu: {
    id: "edfu", regionId: "upper-egypt",
    name: { en: "Edfu", ar: "إدفو" },
    governorate: { en: "Aswan", ar: "أسوان" },
    population: "~140,000",
    about: {
      en: "Edfu is a small city on the west bank of the Nile between Luxor and Aswan, home to the Temple of Horus — the best-preserved ancient temple in all of Egypt. Built during the Ptolemaic period between 237–57 BC, the temple's massive pylon entrance and detailed hieroglyphic inscriptions offer an unparalleled glimpse into ancient Egyptian religious life. Edfu is a key stop on Nile cruise itineraries.",
      ar: "إدفو مدينة صغيرة على الضفة الغربية للنيل بين الأقصر وأسوان، تضم معبد حورس — أفضل معبد قديم محفوظ في مصر. بُني خلال العصر البطلمي بين ٢٣٧–٥٧ ق.م ويقدم لمحة فريدة عن الحياة الدينية المصرية القديمة."
    },
    highlights: { en: ["Temple of Horus", "Ancient hieroglyphic inscriptions", "Nile cruise stop", "Traditional sugar cane fields"], ar: ["معبد حورس", "نقوش هيروغليفية قديمة", "محطة رحلات النيل", "حقول قصب السكر"] },
    knownFor: { en: ["Temple of Horus", "Ptolemaic architecture", "Nile cruise destination", "Sugar cane agriculture"], ar: ["معبد حورس", "العمارة البطلمية", "وجهة رحلات النيل", "زراعة القصب"] },
    bestTime: { en: "October – March", ar: "أكتوبر – مارس" },
    image: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800&q=80",
  },
  esna: {
    id: "esna", regionId: "upper-egypt",
    name: { en: "Esna", ar: "إسنا" },
    governorate: { en: "Luxor", ar: "الأقصر" },
    population: "~80,000",
    about: {
      en: "Esna is a small Upper Egyptian town about 55 km south of Luxor on the west bank of the Nile. It is known for the Temple of Khnum, the ram-headed god of creation, which features a beautifully preserved hypostyle hall with 24 columns decorated with astronomical ceiling paintings. The Esna Lock, where Nile cruise ships pass through, is one of the most photographed moments of any Nile cruise. The town's souks and traditional architecture offer an authentic Upper Egyptian experience.",
      ar: "إسنا بلدة صغيرة في صعيد مصر على بعد ٥٥ كم جنوب الأقصر. تشتهر بمعبد خنوم، إله الخلق برأس الكبش، الذي يضم قاعة أعمدة محفوظة بشكل جميل. قفل إسنا حيث تمر سفن النيل السياحية من أشهر لحظات رحلات النيل."
    },
    highlights: { en: ["Temple of Khnum", "Esna Lock (Nile barrage)", "Traditional souks", "Astronomical ceiling paintings"], ar: ["معبد خنوم", "قفل إسنا", "الأسواق التقليدية", "رسومات السقف الفلكية"] },
    knownFor: { en: ["Temple of Khnum", "Nile Lock passage", "Traditional weaving", "Authentic Upper Egyptian life"], ar: ["معبد خنوم", "ممر قفل النيل", "النسيج التقليدي", "حياة الصعيد الأصيلة"] },
    bestTime: { en: "October – March", ar: "أكتوبر – مارس" },
    image: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800&q=80",
  },
  sohag: {
    id: "sohag", regionId: "upper-egypt",
    name: { en: "Sohag", ar: "سوهاج" },
    governorate: { en: "Sohag", ar: "سوهاج" },
    population: "~210,000",
    about: {
      en: "Sohag is a major Upper Egyptian city on the west bank of the Nile, serving as the capital of Sohag Governorate. The region is a cradle of early Christianity in Egypt, home to the White Monastery (Deir el-Abyad) and Red Monastery (Deir el-Ahmar), two of the oldest Coptic monasteries dating to the 4th–5th centuries. The nearby ancient city of Abydos, sacred to Osiris, contains the magnificent Temple of Seti I with its famous King List. Sohag is also known for its traditional textile industry.",
      ar: "سوهاج مدينة رئيسية في صعيد مصر، عاصمة محافظة سوهاج. المنطقة مهد المسيحية المبكرة في مصر بالدير الأبيض والدير الأحمر من أقدم الأديرة القبطية. مدينة أبيدوس القريبة المقدسة عند أوزيريس تضم معبد سيتي الأول بقائمة الملوك الشهيرة."
    },
    highlights: { en: ["White Monastery", "Red Monastery", "Abydos Temple of Seti I", "Sohag National Museum"], ar: ["الدير الأبيض", "الدير الأحمر", "معبد سيتي الأول بأبيدوس", "متحف سوهاج القومي"] },
    knownFor: { en: ["Coptic monasteries", "Abydos archaeological site", "Traditional textiles", "Early Christian heritage"], ar: ["الأديرة القبطية", "موقع أبيدوس الأثري", "المنسوجات التقليدية", "التراث المسيحي المبكر"] },
    bestTime: { en: "October – March", ar: "أكتوبر – مارس" },
    image: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800&q=80",
  },
  qena: {
    id: "qena", regionId: "upper-egypt",
    name: { en: "Qena", ar: "قنا" },
    governorate: { en: "Qena", ar: "قنا" },
    population: "~230,000",
    about: {
      en: "Qena is the capital of Qena Governorate, located on a bend of the Nile in Upper Egypt. The city serves as the gateway to the spectacular Temple of Dendera, one of the best-preserved temple complexes in Egypt, dedicated to Hathor, the goddess of love and joy. The temple's famous zodiac ceiling is a masterpiece of ancient astronomical art. Qena is also known as the pottery capital of Upper Egypt, producing distinctive red and black earthenware using techniques unchanged for thousands of years.",
      ar: "قنا عاصمة محافظة قنا، تقع على منحنى النيل في صعيد مصر. البوابة إلى معبد دندرة المذهل، من أفضل المعابد المحفوظة في مصر، المكرس لحتحور إلهة الحب والفرح. سقف البروج الشهير تحفة فنية فلكية قديمة. تشتهر أيضاً بصناعة الفخار."
    },
    highlights: { en: ["Dendera Temple Complex", "Zodiac ceiling", "Traditional pottery workshops", "Nile bend scenery"], ar: ["مجمع معابد دندرة", "سقف البروج", "ورش الفخار التقليدية", "مناظر منحنى النيل"] },
    knownFor: { en: ["Dendera Temple", "Pottery & earthenware", "Hathor worship site", "Sugar cane production"], ar: ["معبد دندرة", "الفخار والأواني", "موقع عبادة حتحور", "إنتاج قصب السكر"] },
    bestTime: { en: "October – March", ar: "أكتوبر – مارس" },
    image: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800&q=80",
  },
  assiut: {
    id: "assiut", regionId: "upper-egypt",
    name: { en: "Assiut", ar: "أسيوط" },
    governorate: { en: "Assiut", ar: "أسيوط" },
    population: "~500,000",
    about: {
      en: "Assiut is the largest city in Upper Egypt and a major university center, home to Assiut University founded in 1957. Strategically positioned at the point where the Nile Valley is narrowest, it has been a vital crossroads since Pharaonic times, controlling trade routes to the Western Desert oases. The city is home to the Assiut Barrage, one of the oldest barrages on the Nile, and the nearby Meir tombs feature some of the finest Middle Kingdom rock-cut paintings. It is also an important center for Egypt's Coptic Christian community, with the Monastery of the Virgin Mary at Drunka drawing millions of pilgrims annually.",
      ar: "أسيوط أكبر مدينة في صعيد مصر ومركز جامعي رئيسي. تقع في أضيق نقطة في وادي النيل وكانت ملتقى طرق تجارية منذ العصر الفرعوني. تضم قناطر أسيوط ومقابر مير بلوحاتها المنحوتة الرائعة ودير العذراء بدرنكة الذي يجذب ملايين الحجاج سنوياً."
    },
    highlights: { en: ["Assiut Barrage", "Meir Tombs", "Monastery of the Virgin Mary at Drunka", "Assiut University"], ar: ["قناطر أسيوط", "مقابر مير", "دير العذراء بدرنكة", "جامعة أسيوط"] },
    knownFor: { en: ["University city", "Coptic pilgrimage center", "Ancient trade crossroads", "Nile barrage"], ar: ["مدينة جامعية", "مركز حج قبطي", "ملتقى تجارة قديم", "قناطر النيل"] },
    bestTime: { en: "October – March", ar: "أكتوبر – مارس" },
    image: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800&q=80",
  },
  minya: {
    id: "minya", regionId: "upper-egypt",
    name: { en: "Minya", ar: "المنيا" },
    governorate: { en: "Minya", ar: "المنيا" },
    population: "~365,000",
    about: {
      en: "Minya, known as the 'Bride of Upper Egypt,' is a city on the west bank of the Nile about 245 km south of Cairo. The region is rich in archaeological sites including Tell el-Amarna, the short-lived capital of the heretic pharaoh Akhenaten, and the Beni Hasan tombs with their remarkable Middle Kingdom wall paintings depicting daily life. Minya also has a significant Coptic heritage, with the Al-Kosheh monastery and Tuna el-Gebel necropolis. The city features elegant 19th-century architecture along its corniche.",
      ar: "المنيا، 'عروس الصعيد'، مدينة على الضفة الغربية للنيل على بعد ٢٤٥ كم جنوب القاهرة. المنطقة غنية بالمواقع الأثرية مثل تل العمارنة عاصمة إخناتون ومقابر بني حسن بلوحاتها الجدارية الرائعة. تتميز بعمارة أنيقة من القرن التاسع عشر على الكورنيش."
    },
    highlights: { en: ["Tell el-Amarna", "Beni Hasan tombs", "Tuna el-Gebel necropolis", "19th-century corniche architecture"], ar: ["تل العمارنة", "مقابر بني حسن", "مقبرة تونة الجبل", "عمارة الكورنيش"] },
    knownFor: { en: ["Akhenaten's capital", "Middle Kingdom tombs", "Bride of Upper Egypt", "Coptic heritage"], ar: ["عاصمة إخناتون", "مقابر الدولة الوسطى", "عروس الصعيد", "التراث القبطي"] },
    bestTime: { en: "October – March", ar: "أكتوبر – مارس" },
    image: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800&q=80",
  },
  fayoum: {
    id: "fayoum", regionId: "upper-egypt",
    name: { en: "Fayoum", ar: "الفيوم" },
    governorate: { en: "Fayoum", ar: "الفيوم" },
    population: "~400,000",
    about: {
      en: "Fayoum is Egypt's largest oasis, located about 100 km southwest of Cairo. Fed by the Bahr Yussef canal from the Nile, it has been continuously inhabited for over 8,000 years. The region is home to Lake Qarun, one of the oldest natural lakes in the world, and the Wadi El-Rayan protected area with its stunning waterfalls. Fayoum is famous for the 'Fayoum Portraits' — remarkably lifelike Greco-Roman funerary paintings found in the area. The Valley of the Whales (Wadi Al-Hitan), a UNESCO World Heritage Site, contains fossilized whale skeletons millions of years old.",
      ar: "الفيوم أكبر واحة في مصر على بعد ١٠٠ كم جنوب غرب القاهرة. يغذيها بحر يوسف من النيل وسكنت بشكل مستمر لأكثر من ٨٠٠٠ سنة. تضم بحيرة قارون ووادي الريان بشلالاته. تشتهر بصور الفيوم اليونانية الرومانية ووادي الحيتان موقع التراث العالمي."
    },
    highlights: { en: ["Wadi Al-Hitan (Valley of the Whales)", "Lake Qarun", "Wadi El-Rayan waterfalls", "Fayoum Portraits"], ar: ["وادي الحيتان", "بحيرة قارون", "شلالات وادي الريان", "صور الفيوم"] },
    knownFor: { en: ["UNESCO Valley of the Whales", "Ancient oasis life", "Fayoum Portraits", "Desert & lake landscapes"], ar: ["وادي الحيتان يونسكو", "حياة الواحة القديمة", "صور الفيوم", "مناظر الصحراء والبحيرة"] },
    bestTime: { en: "October – April", ar: "أكتوبر – أبريل" },
    image: "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=800&q=80",
  },
  // === FRONTIERS ===
  siwa: {
    id: "siwa", regionId: "frontiers",
    name: { en: "Siwa", ar: "سيوة" },
    governorate: { en: "Matrouh", ar: "مطروح" },
    population: "~25,000",
    about: {
      en: "Siwa Oasis is one of Egypt's most remote and enchanting destinations, located near the Libyan border in the Western Desert. The oasis has its own distinct Berber (Amazigh) culture and language. Alexander the Great famously visited the Oracle of Amun here in 331 BC. Key attractions include the ruins of Shali Fortress, Cleopatra's Spring, the Temple of the Oracle, and the Great Sand Sea for sandboarding and stargazing. Siwa is also known for its organic dates, olives, and salt lakes.",
      ar: "واحة سيوة من أكثر وجهات مصر عزلة وسحراً، بالقرب من الحدود الليبية. لها ثقافة ولغة أمازيغية مميزة. زارها الإسكندر الأكبر لمعبد وحي آمون عام ٣٣١ ق.م. تشمل المعالم قلعة شالي وعين كليوباترا وبحر الرمال العظيم."
    },
    highlights: { en: ["Oracle Temple of Amun", "Shali Fortress", "Cleopatra's Spring", "Great Sand Sea"], ar: ["معبد وحي آمون", "قلعة شالي", "عين كليوباترا", "بحر الرمال العظيم"] },
    knownFor: { en: ["Berber culture", "Alexander the Great's oracle visit", "Sandboarding", "Organic dates & olives"], ar: ["الثقافة الأمازيغية", "زيارة الإسكندر للوحي", "التزلج على الرمال", "التمور والزيتون العضوي"] },
    bestTime: { en: "October – April (avoid summer heat)", ar: "أكتوبر – أبريل (تجنب حرارة الصيف)" },
    image: "https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=800&q=80",
  },
  dahab: {
    id: "dahab", regionId: "frontiers",
    name: { en: "Dahab", ar: "دهب" },
    governorate: { en: "South Sinai", ar: "جنوب سيناء" },
    population: "~15,000",
    about: {
      en: "Dahab ('Gold' in Arabic) is a laid-back Red Sea coastal town in South Sinai, beloved by divers, windsurfers, and backpackers. Once a Bedouin fishing village, it has evolved into one of the world's top diving destinations, home to the famous Blue Hole — a deep underwater sinkhole. Dahab offers world-class windsurfing and kitesurfing at Laguna Beach, desert safaris to the Coloured Canyon, and easy access to Mount Sinai. Its Bedouin-run seafront cafes and relaxed atmosphere set it apart from larger Red Sea resorts.",
      ar: "دهب ('الذهب' بالعربية) مدينة ساحلية هادئة على البحر الأحمر في جنوب سيناء، محبوبة من الغواصين وراكبي الأمواج. كانت قرية صيد بدوية وأصبحت من أفضل وجهات الغوص في العالم بالحفرة الزرقاء الشهيرة."
    },
    highlights: { en: ["Blue Hole diving", "Laguna Beach windsurfing", "Coloured Canyon", "Bedouin seafront cafes"], ar: ["غوص الحفرة الزرقاء", "ركوب الأمواج بلاجونا", "الوادي الملون", "مقاهي البدو البحرية"] },
    knownFor: { en: ["World-class diving", "Windsurfing & kitesurfing", "Backpacker culture", "Bedouin hospitality"], ar: ["غوص عالمي", "ركوب الأمواج", "ثقافة الرحالة", "كرم البدو"] },
    bestTime: { en: "Year-round (best: March – May, Sep – Nov)", ar: "على مدار السنة (أفضل: مارس–مايو، سبتمبر–نوفمبر)" },
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
  },
  "marsa-alam": {
    id: "marsa-alam", regionId: "frontiers",
    name: { en: "Marsa Alam", ar: "مرسى علم" },
    governorate: { en: "Red Sea", ar: "البحر الأحمر" },
    population: "~15,000",
    about: {
      en: "Marsa Alam is a quiet Red Sea resort town in southeastern Egypt, known for its pristine coral reefs and encounters with dolphins, sea turtles, and dugongs. Unlike the busier resorts of Hurghada and Sharm El Sheikh, Marsa Alam offers a more secluded, eco-oriented experience. The nearby Abu Dabbab bay is one of the few places where you can swim with dugongs. Wadi El Gemal National Park to the south protects a vast area of desert and coastline.",
      ar: "مرسى علم مدينة منتجعات هادئة على البحر الأحمر، تشتهر بشعابها المرجانية البكر ولقاءات الدلافين والسلاحف البحرية وعرائس البحر. أبو دباب من الأماكن القليلة للسباحة مع عرائس البحر. محمية وادي الجمال تحمي منطقة شاسعة."
    },
    highlights: { en: ["Abu Dabbab dugong bay", "Pristine coral reefs", "Wadi El Gemal National Park", "Dolphin encounters"], ar: ["خليج أبو دباب", "شعاب مرجانية بكر", "محمية وادي الجمال", "لقاءات الدلافين"] },
    knownFor: { en: ["Dugong encounters", "Eco-diving", "Secluded beaches", "Marine biodiversity"], ar: ["لقاءات عرائس البحر", "الغوص البيئي", "شواطئ منعزلة", "التنوع البحري"] },
    bestTime: { en: "Year-round (best: March – May, Sep – Nov)", ar: "على مدار السنة" },
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
  },
  quseir: {
    id: "quseir", regionId: "frontiers",
    name: { en: "Quseir", ar: "القصير" },
    governorate: { en: "Red Sea", ar: "البحر الأحمر" },
    population: "~50,000",
    about: {
      en: "Quseir (also spelled El Quseir) is one of Egypt's oldest ports on the Red Sea coast, with a history stretching back to Pharaonic times when it served as a departure point for expeditions to the Land of Punt. The Ottoman-era fortress overlooking the harbor, built in the 16th century, is the town's centerpiece. Quseir's old quarter features traditional Red Sea architecture with coral-block buildings and carved wooden balconies. The town offers excellent diving on less-crowded reefs and a genuine small-town Red Sea atmosphere untouched by mass tourism.",
      ar: "القصير من أقدم موانئ مصر على البحر الأحمر، يعود تاريخها للعصر الفرعوني كنقطة انطلاق لرحلات أرض بونت. القلعة العثمانية من القرن السادس عشر هي قلب المدينة. الحي القديم يضم عمارة البحر الأحمر التقليدية بمبانٍ من كتل المرجان وشرفات خشبية منحوتة."
    },
    highlights: { en: ["Ottoman fortress", "Old quarter coral-block houses", "Unspoiled diving reefs", "Ancient port of Punt trade"], ar: ["القلعة العثمانية", "بيوت المرجان القديمة", "شعاب غوص بكر", "ميناء تجارة بونت القديم"] },
    knownFor: { en: ["Ancient Red Sea port", "Ottoman heritage", "Quiet diving paradise", "Coral-block architecture"], ar: ["ميناء البحر الأحمر القديم", "التراث العثماني", "جنة غوص هادئة", "عمارة المرجان"] },
    bestTime: { en: "October – April", ar: "أكتوبر – أبريل" },
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
  },
  hurghada: {
    id: "hurghada", regionId: "frontiers",
    name: { en: "Hurghada", ar: "الغردقة" },
    governorate: { en: "Red Sea", ar: "البحر الأحمر" },
    population: "~300,000",
    about: {
      en: "Hurghada is Egypt's premier Red Sea resort city, stretching along 40 km of coastline. What was once a small fishing village has transformed into an international beach destination with world-class diving and snorkeling. The Giftun Islands offshore are a protected marine area with stunning coral gardens. Hurghada's marina district (New Marina) features upscale restaurants and yacht clubs, while El Dahar (the old town) preserves the traditional bazaar atmosphere. The city is also a gateway for desert excursions to the Eastern Desert.",
      ar: "الغردقة مدينة المنتجعات الأولى على البحر الأحمر في مصر، تمتد على ٤٠ كم من الساحل. تحولت من قرية صيد صغيرة إلى وجهة شاطئية دولية بغوص عالمي. جزر الجفتون محمية بحرية بحدائق مرجانية مذهلة. المارينا الجديدة بمطاعمها والدهار القديم بأسواقه."
    },
    highlights: { en: ["Giftun Islands marine park", "New Marina waterfront", "El Dahar old town bazaar", "Desert safari excursions"], ar: ["محمية جزر الجفتون", "واجهة المارينا الجديدة", "سوق الدهار القديم", "رحلات سفاري الصحراء"] },
    knownFor: { en: ["Red Sea diving & snorkeling", "Beach resorts", "Marine biodiversity", "Year-round sunshine"], ar: ["غوص وسنوركل البحر الأحمر", "منتجعات شاطئية", "التنوع البحري", "شمس على مدار السنة"] },
    bestTime: { en: "Year-round (best: March – May, Sep – Nov)", ar: "على مدار السنة" },
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
  },
  "marsa-matrouh": {
    id: "marsa-matrouh", regionId: "frontiers",
    name: { en: "Marsa Matrouh", ar: "مرسى مطروح" },
    governorate: { en: "Matrouh", ar: "مطروح" },
    population: "~150,000",
    about: {
      en: "Marsa Matrouh is Egypt's classic Mediterranean summer getaway, known for its gentle turquoise bays and white sandy beaches along the North Coast. Cleopatra's Beach, set in a natural rock pool, is one of Egypt's most beautiful swimming spots. The city has drawn visitors since ancient times — Cleopatra and Mark Antony are said to have bathed here. Rommel's Museum, housed in the caves where Field Marshal Rommel planned his WWII campaigns, adds historical depth. Ageeba Beach, with its dramatic cliff-framed cove, is considered one of the most beautiful beaches in the Mediterranean.",
      ar: "مرسى مطروح منتجع مصر الكلاسيكي على البحر المتوسط، تشتهر بخلجانها الفيروزية وشواطئها البيضاء. شاطئ كليوباترا في حوض صخري طبيعي من أجمل أماكن السباحة في مصر. متحف روميل في الكهوف التي خطط منها حملاته. شاطئ عجيبة بمنحدراته الدرامية من أجمل شواطئ المتوسط."
    },
    highlights: { en: ["Cleopatra's Beach", "Ageeba Beach", "Rommel's Cave Museum", "Turquoise Mediterranean bays"], ar: ["شاطئ كليوباترا", "شاطئ عجيبة", "متحف كهف روميل", "خلجان المتوسط الفيروزية"] },
    knownFor: { en: ["Mediterranean beaches", "Cleopatra's Bath", "WWII history", "Egyptian summer culture"], ar: ["شواطئ المتوسط", "حمام كليوباترا", "تاريخ الحرب العالمية الثانية", "ثقافة الصيف المصرية"] },
    bestTime: { en: "June – September (beach season)", ar: "يونيو – سبتمبر (موسم الشاطئ)" },
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
  },
  "el-arish": {
    id: "el-arish", regionId: "frontiers",
    name: { en: "El Arish", ar: "العريش" },
    governorate: { en: "North Sinai", ar: "شمال سيناء" },
    population: "~165,000",
    about: {
      en: "El Arish is the capital of North Sinai Governorate, sitting on the Mediterranean coast at the northern edge of the Sinai Peninsula. The city has a long Bedouin heritage and features palm-lined beaches, a historic souk known for its Bedouin crafts, and the remains of a Mamluk-era fortress. The Zaranik Protectorate nearby is an important wetland for migratory birds on the Africa-Eurasia flyway. El Arish is known for its distinctive palm-frond handicrafts and Bedouin textile traditions.",
      ar: "العريش عاصمة محافظة شمال سيناء، على ساحل البحر المتوسط عند الحافة الشمالية لشبه جزيرة سيناء. تتميز بتراث بدوي عريق وشواطئ مظللة بالنخيل وسوق تاريخي بحرف بدوية. محمية الزرانيق أرض رطبة مهمة للطيور المهاجرة."
    },
    highlights: { en: ["Palm-lined Mediterranean beaches", "Bedouin craft souk", "Zaranik Protectorate", "Mamluk fortress remains"], ar: ["شواطئ المتوسط المظللة بالنخيل", "سوق الحرف البدوية", "محمية الزرانيق", "بقايا القلعة المملوكية"] },
    knownFor: { en: ["Bedouin culture & crafts", "Palm-frond handicrafts", "Migratory bird wetlands", "Sinai gateway"], ar: ["الثقافة والحرف البدوية", "حرف سعف النخيل", "أراضي الطيور المهاجرة", "بوابة سيناء"] },
    bestTime: { en: "March – May, October – November", ar: "مارس – مايو، أكتوبر – نوفمبر" },
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
  },
};

export const heroSlides = [
  { id: 1, title: { en: "Discover the Nile Delta", ar: "اكتشف دلتا النيل" }, subtitle: { en: "Where the river meets the sea", ar: "حيث يلتقي النهر بالبحر" }, image: "https://images.unsplash.com/photo-1539768942893-daf53e736b68?w=800&q=80" },
  { id: 2, title: { en: "Suez Canal Stories", ar: "قصص قناة السويس" }, subtitle: { en: "History flows through here", ar: "التاريخ يجري هنا" }, image: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800&q=80" },
  { id: 3, title: { en: "Fayyum Oasis", ar: "واحة الفيوم" }, subtitle: { en: "Desert beauty awaits", ar: "جمال الصحراء في انتظارك" }, image: "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=800&q=80" },
];

export type ExperienceTheme = "nature" | "history" | "food" | "adventure" | "culture" | "community";

export const experienceThemes: { key: ExperienceTheme; label: { en: string; ar: string }; emoji: string }[] = [
  { key: "nature", label: { en: "Nature", ar: "طبيعة" }, emoji: "🌿" },
  { key: "history", label: { en: "History & Heritage", ar: "تاريخ وتراث" }, emoji: "🏛️" },
  { key: "food", label: { en: "Food & Gastronomy", ar: "طعام وفن الطهي" }, emoji: "🍽️" },
  { key: "adventure", label: { en: "Adventure", ar: "مغامرة" }, emoji: "🏄" },
  { key: "culture", label: { en: "Art & Culture", ar: "فن وثقافة" }, emoji: "🎨" },
  { key: "community", label: { en: "Community", ar: "مجتمع" }, emoji: "🤝" },
];

export const experiences = [
  // Nature — Nile Delta
  { id: "e1", title: { en: "Bird Watching in Manzala Lake", ar: "مراقبة الطيور في بحيرة المنزلة" }, region: { en: "Nile Delta", ar: "دلتا النيل" }, regionId: "nile-delta", cityId: "manzala", theme: "nature" as ExperienceTheme, price: 150, date: "Dec 26, 2024", image: "https://images.unsplash.com/photo-1621631187532-8d2c0c9718d8?w=400&q=80", rating: 4.8, reviews: 24 },
  { id: "e4", title: { en: "Sunset Felucca Ride in Rosetta", ar: "رحلة فلوكة عند الغروب في رشيد" }, region: { en: "Nile Delta", ar: "دلتا النيل" }, regionId: "nile-delta", cityId: "rosetta", theme: "nature" as ExperienceTheme, price: 180, date: "Jan 5, 2025", image: "https://images.unsplash.com/photo-1568322445389-f64c5bb0df1d?w=400&q=80", rating: 4.7, reviews: 31 },
  // Nature — Upper Egypt
  { id: "e10", title: { en: "Nile Sunrise Kayaking in Luxor", ar: "تجديف بالكاياك عند شروق النيل بالأقصر" }, region: { en: "Upper Egypt", ar: "صعيد مصر" }, regionId: "upper-egypt", cityId: "luxor", theme: "nature" as ExperienceTheme, price: 220, date: "Jan 12, 2025", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=80", rating: 4.9, reviews: 15 },

  // History — Nile Delta
  { id: "e5", title: { en: "Rosetta Stone Trail Walk", ar: "جولة درب حجر رشيد" }, region: { en: "Nile Delta", ar: "دلتا النيل" }, regionId: "nile-delta", cityId: "rosetta", theme: "history" as ExperienceTheme, price: 120, date: "Jan 8, 2025", image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=400&q=80", rating: 4.6, reviews: 18 },
  // History — Suez Canal
  { id: "e6", title: { en: "Port Said Heritage Walking Tour", ar: "جولة تراث بورسعيد المشي" }, region: { en: "Suez Canal", ar: "قناة السويس" }, regionId: "suez-canal", cityId: "port-said", theme: "history" as ExperienceTheme, price: 160, date: "Jan 20, 2025", image: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=400&q=80", rating: 4.5, reviews: 22 },
  // History — Upper Egypt
  { id: "e11", title: { en: "Ancient Temples of Edfu & Kom Ombo", ar: "معابد إدفو وكوم أمبو القديمة" }, region: { en: "Upper Egypt", ar: "صعيد مصر" }, regionId: "upper-egypt", cityId: "edfu", theme: "history" as ExperienceTheme, price: 350, date: "Feb 5, 2025", image: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=400&q=80", rating: 4.9, reviews: 38 },

  // Food — Nile Delta
  { id: "e7", title: { en: "Cooking with Grandma in Rosetta", ar: "الطبخ مع جدتي في رشيد" }, region: { en: "Nile Delta", ar: "دلتا النيل" }, regionId: "nile-delta", cityId: "rosetta", theme: "food" as ExperienceTheme, price: 200, date: "Jan 15, 2025", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80", rating: 4.9, reviews: 35 },
  // Food — Suez Canal
  { id: "e12", title: { en: "Fresh Catch & Cook on Lake Timsah", ar: "صيد وطبخ طازج على بحيرة التمساح" }, region: { en: "Suez Canal", ar: "قناة السويس" }, regionId: "suez-canal", cityId: "ismailia", theme: "food" as ExperienceTheme, price: 280, date: "Feb 10, 2025", image: "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400&q=80", rating: 4.7, reviews: 12 },

  // Adventure — Frontiers
  { id: "e3", title: { en: "Desert Sandboarding in Siwa", ar: "التزلج على الرمال في سيوة" }, region: { en: "Frontiers", ar: "الحدود" }, regionId: "frontiers", cityId: "siwa", theme: "adventure" as ExperienceTheme, price: 250, date: "Dec 26, 2024", image: "https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=400&q=80", rating: 4.9, reviews: 42 },
  // Adventure — Nile Delta
  { id: "e13", title: { en: "Night Fishing on Lake Burullus", ar: "الصيد الليلي في بحيرة البرلس" }, region: { en: "Nile Delta", ar: "دلتا النيل" }, regionId: "nile-delta", cityId: "manzala", theme: "adventure" as ExperienceTheme, price: 170, date: "Jan 22, 2025", image: "https://images.unsplash.com/photo-1590077428593-a55bb07c4665?w=400&q=80", rating: 4.6, reviews: 19 },
  // Adventure — Frontiers
  { id: "e16", title: { en: "Snorkeling in Dahab Blue Hole", ar: "غوص في الحفرة الزرقاء بدهب" }, region: { en: "Frontiers", ar: "الحدود" }, regionId: "frontiers", cityId: "dahab", theme: "adventure" as ExperienceTheme, price: 300, date: "Mar 1, 2025", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=80", rating: 4.8, reviews: 55 },

  // Culture — Upper Egypt
  { id: "e8", title: { en: "Nubian Village Pottery Workshop", ar: "ورشة فخار القرية النوبية" }, region: { en: "Upper Egypt", ar: "صعيد مصر" }, regionId: "upper-egypt", cityId: "aswan", theme: "culture" as ExperienceTheme, price: 180, date: "Feb 2, 2025", image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&q=80", rating: 4.8, reviews: 27 },
  // Culture — Nile Delta
  { id: "e14", title: { en: "Palm Weaving with Damietta Artisans", ar: "نسج النخيل مع حرفيي دمياط" }, region: { en: "Nile Delta", ar: "دلتا النيل" }, regionId: "nile-delta", cityId: "damietta", theme: "culture" as ExperienceTheme, price: 140, date: "Jan 30, 2025", image: "https://images.unsplash.com/photo-1515562141589-67f0d569b6c4?w=400&q=80", rating: 4.7, reviews: 16 },

  // Community — Nile Delta
  { id: "e9", title: { en: "Volunteer at Rosetta Children's Library", ar: "تطوع في مكتبة أطفال رشيد" }, region: { en: "Nile Delta", ar: "دلتا النيل" }, regionId: "nile-delta", cityId: "rosetta", theme: "community" as ExperienceTheme, price: 0, date: "Ongoing", image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=400&q=80", rating: 5.0, reviews: 11 },
  // Community — Upper Egypt
  { id: "e15", title: { en: "Teach English in Aswan Village", ar: "علّم الإنجليزية في قرية أسوان" }, region: { en: "Upper Egypt", ar: "صعيد مصر" }, regionId: "upper-egypt", cityId: "aswan", theme: "community" as ExperienceTheme, price: 0, date: "Ongoing", image: "https://images.unsplash.com/photo-1497375638960-ca368c7231e4?w=400&q=80", rating: 4.8, reviews: 9 },
];

export const audioTours = [
  { id: "a1", title: { en: "In Rosetta: City of a Million Palm Trees", ar: "في رشيد: مدينة المليون نخلة" }, region: { en: "Nile Delta", ar: "دلتا النيل" }, regionId: "nile-delta", cityId: "rosetta", duration: 45, stops: 8, price: 0, image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400&q=80" },
  { id: "a2", title: { en: "From Hive to Gulf", ar: "من الخلية إلى الخليج" }, region: { en: "Suez Canal", ar: "قناة السويس" }, regionId: "suez-canal", cityId: "ismailia", duration: 30, stops: 6, price: 0, image: "https://images.unsplash.com/photo-1590077428593-a55bb07c4665?w=400&q=80" },
  { id: "a3", title: { en: "Migratory Birds — Lake Manzala", ar: "الطيور المهاجرة — بحيرة المنزلة" }, region: { en: "Nile Delta", ar: "دلتا النيل" }, regionId: "nile-delta", cityId: "manzala", duration: 60, stops: 10, price: 20, image: "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400&q=80" },
  { id: "a4", title: { en: "Temples of the South", ar: "معابد الجنوب" }, region: { en: "Upper Egypt", ar: "صعيد مصر" }, regionId: "upper-egypt", cityId: "luxor", duration: 50, stops: 7, price: 15, image: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=400&q=80" },
  { id: "a5", title: { en: "Siwa's Ancient Oracle", ar: "وحي سيوة القديم" }, region: { en: "Frontiers", ar: "الحدود" }, regionId: "frontiers", cityId: "siwa", duration: 35, stops: 5, price: 10, image: "https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=400&q=80" },
];

export const causes = [
  {
    id: "c1",
    title: { en: "Save Lake Manzala Wetlands", ar: "إنقاذ أراضي بحيرة المنزلة الرطبة" },
    summary: { en: "Protecting critical bird habitats and fishing communities from pollution.", ar: "حماية موائل الطيور ومجتمعات الصيد من التلوث." },
    description: { en: "Lake Manzala is one of Egypt's most important wetlands, home to thousands of migratory birds and supporting local fishing families for generations. Rising pollution threatens both wildlife and livelihoods. Your support funds cleanup operations, community education, and sustainable fishing practices.", ar: "بحيرة المنزلة من أهم الأراضي الرطبة في مصر، موطن لآلاف الطيور المهاجرة وتدعم عائلات الصيد المحلية منذ أجيال. التلوث المتزايد يهدد الحياة البرية وسبل العيش. دعمكم يموّل عمليات التنظيف والتوعية المجتمعية وممارسات الصيد المستدام." },
    org: { name: { en: "Delta Eco Foundation", ar: "مؤسسة دلتا البيئية" }, founded: "2018", members: 45, logo: "🌿" },
    image: "https://images.unsplash.com/photo-1590077428593-a55bb07c4665?w=400&q=80",
    regionId: "nile-delta",
    cityId: "manzala",
    raised: 125000,
    goal: 300000,
    supporters: 342,
    category: { en: "Environment", ar: "بيئة" },
  },
  {
    id: "c2",
    title: { en: "Rosetta Women Weavers Cooperative", ar: "تعاونية نساء رشيد للنسيج" },
    summary: { en: "Empowering women through traditional palm-weaving craftsmanship.", ar: "تمكين النساء من خلال حرفة نسج النخيل التقليدية." },
    description: { en: "This cooperative trains women in Rosetta to revive ancestral palm-weaving techniques, providing sustainable income and preserving cultural heritage. Funds go toward workshop equipment, training programs, and fair-trade market access.", ar: "هذه التعاونية تدرب نساء رشيد على إحياء تقنيات نسج النخيل التراثية، وتوفر دخلاً مستداماً وتحافظ على التراث الثقافي. الأموال تذهب لمعدات الورش وبرامج التدريب والوصول لأسواق التجارة العادلة." },
    org: { name: { en: "Rosetta Heritage Society", ar: "جمعية تراث رشيد" }, founded: "2015", members: 30, logo: "🧶" },
    image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&q=80",
    regionId: "nile-delta",
    cityId: "rosetta",
    raised: 80000,
    goal: 150000,
    supporters: 198,
    category: { en: "Community", ar: "مجتمع" },
  },
  {
    id: "c3",
    title: { en: "Restore Port Said Heritage Buildings", ar: "ترميم مباني بورسعيد التراثية" },
    summary: { en: "Preserving the European Quarter's architectural legacy.", ar: "الحفاظ على الإرث المعماري للحي الأوروبي." },
    description: { en: "Port Said's European Quarter holds some of Egypt's finest colonial-era architecture, now deteriorating. This initiative restores facades, documents history, and creates guided heritage walks that benefit local businesses.", ar: "الحي الأوروبي في بورسعيد يحتوي على أروع العمارة من الحقبة الاستعمارية في مصر، وهي تتدهور الآن. هذه المبادرة ترمم الواجهات وتوثق التاريخ وتنشئ جولات تراثية تفيد الأعمال المحلية." },
    org: { name: { en: "Canal Heritage Trust", ar: "صندوق تراث القناة" }, founded: "2020", members: 22, logo: "🏛️" },
    image: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=400&q=80",
    regionId: "suez-canal",
    cityId: "port-said",
    raised: 200000,
    goal: 500000,
    supporters: 456,
    category: { en: "Heritage", ar: "تراث" },
  },
  {
    id: "c4",
    title: { en: "Nubian Language Preservation", ar: "الحفاظ على اللغة النوبية" },
    summary: { en: "Documenting and teaching the endangered Nubian language to new generations.", ar: "توثيق وتعليم اللغة النوبية المهددة للأجيال الجديدة." },
    description: { en: "The Nubian language is at risk of extinction. This project creates educational materials, runs community classes in Aswan villages, and builds a digital archive of spoken Nubian. Volunteers can help with documentation and teaching.", ar: "اللغة النوبية مهددة بالانقراض. هذا المشروع ينشئ مواد تعليمية ويدير فصول مجتمعية في قرى أسوان ويبني أرشيفاً رقمياً للنوبية المنطوقة. يمكن للمتطوعين المساعدة في التوثيق والتعليم." },
    org: { name: { en: "Nubian Heritage Center", ar: "مركز التراث النوبي" }, founded: "2012", members: 60, logo: "📚" },
    image: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=400&q=80",
    regionId: "upper-egypt",
    cityId: "aswan",
    raised: 95000,
    goal: 200000,
    supporters: 278,
    category: { en: "Culture", ar: "ثقافة" },
  },
  {
    id: "c5",
    title: { en: "Siwa Solar Water Initiative", ar: "مبادرة سيوة للمياه بالطاقة الشمسية" },
    summary: { en: "Bringing clean water to remote desert communities using solar power.", ar: "توفير مياه نظيفة للمجتمعات الصحراوية النائية بالطاقة الشمسية." },
    description: { en: "Remote communities around Siwa Oasis lack reliable clean water access. This initiative installs solar-powered purification systems, trains local technicians, and ensures long-term sustainability. Each unit serves 50+ families.", ar: "المجتمعات النائية حول واحة سيوة تفتقر لمصادر مياه نظيفة موثوقة. هذه المبادرة تركب أنظمة تنقية بالطاقة الشمسية وتدرب فنيين محليين وتضمن الاستدامة طويلة المدى. كل وحدة تخدم ٥٠+ عائلة." },
    org: { name: { en: "Desert Green Initiative", ar: "مبادرة الصحراء الخضراء" }, founded: "2019", members: 18, logo: "☀️" },
    image: "https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=400&q=80",
    regionId: "frontiers",
    cityId: "siwa",
    raised: 180000,
    goal: 350000,
    supporters: 523,
    category: { en: "Sustainability", ar: "استدامة" },
  },
];

export const trips = [
  { id: "t1", title: { en: "Full Day Trip to Ismailia from Cairo", ar: "رحلة يوم كامل إلى الإسماعيلية من القاهرة" }, route: { en: "Cairo → Ismailia", ar: "القاهرة → الإسماعيلية" }, price: 1000, date: "Jan 10, 2025", image: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=400&q=80", regionId: "suez-canal", theme: "history" as ExperienceTheme },
  { id: "t2", title: { en: "Full Day Trip to Port Said from Cairo", ar: "رحلة يوم كامل إلى بورسعيد من القاهرة" }, route: { en: "Cairo → Port Said", ar: "القاهرة → بورسعيد" }, price: 1000, date: "Jan 15, 2025", image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=80", regionId: "suez-canal", theme: "culture" as ExperienceTheme },
  { id: "t3", title: { en: "Gastronomy on the Lakes", ar: "فن الطهي على البحيرات" }, route: { en: "Cairo → Edku", ar: "القاهرة → إدكو" }, price: 3000, date: "Feb 1, 2025", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80", regionId: "nile-delta", theme: "food" as ExperienceTheme },
];

export const accommodation = [
  { id: "ac1", title: { en: "Delta Family Homestay", ar: "إقامة عائلية في الدلتا" }, type: { en: "Homestay", ar: "إقامة عائلية" }, location: { en: "Damietta", ar: "دمياط" }, price: 300, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80", rating: 4.5, regionId: "nile-delta", cityId: "damietta" },
  { id: "ac2", title: { en: "Rosetta Riverside Inn", ar: "نزل رشيد على النهر" }, type: { en: "Guesthouse", ar: "بيت ضيافة" }, location: { en: "Rosetta", ar: "رشيد" }, price: 350, image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80", rating: 4.8, regionId: "nile-delta", cityId: "rosetta" },
  { id: "ac3", title: { en: "Ismailia Canal House", ar: "بيت القناة بالإسماعيلية" }, type: { en: "Guesthouse", ar: "بيت ضيافة" }, location: { en: "Ismailia", ar: "الإسماعيلية" }, price: 400, image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80", rating: 4.6, regionId: "suez-canal", cityId: "ismailia" },
  { id: "ac4", title: { en: "Port Said Heritage Hotel", ar: "فندق تراث بورسعيد" }, type: { en: "Hotel", ar: "فندق" }, location: { en: "Port Said", ar: "بورسعيد" }, price: 600, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80", rating: 4.4, regionId: "suez-canal", cityId: "port-said" },
  { id: "ac5", title: { en: "Nubian Village Stay", ar: "إقامة في القرية النوبية" }, type: { en: "Homestay", ar: "إقامة عائلية" }, location: { en: "Aswan", ar: "أسوان" }, price: 280, image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80", rating: 4.9, regionId: "upper-egypt", cityId: "aswan" },
  { id: "ac6", title: { en: "Siwa Oasis Eco-Lodge", ar: "نزل سيوة البيئي" }, type: { en: "Eco-lodge", ar: "نزل بيئي" }, location: { en: "Siwa", ar: "سيوة" }, price: 500, image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80", rating: 4.7, regionId: "frontiers", cityId: "siwa" },
  { id: "ac7", title: { en: "Dahab Beachfront Lodge", ar: "نزل شاطئ دهب" }, type: { en: "Lodge", ar: "نزل" }, location: { en: "Dahab", ar: "دهب" }, price: 450, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80", rating: 4.6, regionId: "frontiers", cityId: "dahab" },
];

export const transport = [
  { id: "tr1", title: { en: "Shared Bus to Ismailia", ar: "باص مشترك إلى الإسماعيلية" }, type: { en: "Bus", ar: "باص" }, price: 50, icon: "🚌", regionId: "suez-canal", cityId: "ismailia" },
  { id: "tr2", title: { en: "Felucca Ride Lake Manzala", ar: "رحلة فلوكة في بحيرة المنزلة" }, type: { en: "Felucca", ar: "فلوكة" }, price: 200, icon: "⛵", regionId: "nile-delta", cityId: "manzala" },
  { id: "tr3", title: { en: "Tuk-Tuk Rosetta Old Town", ar: "توك توك في رشيد القديمة" }, type: { en: "Tuk-tuk", ar: "توك توك" }, price: 150, icon: "🛺", regionId: "nile-delta", cityId: "rosetta" },
  { id: "tr4", title: { en: "Felucca Ride in Aswan", ar: "رحلة فلوكة في أسوان" }, type: { en: "Felucca", ar: "فلوكة" }, price: 180, icon: "⛵", regionId: "upper-egypt", cityId: "aswan" },
  { id: "tr5", title: { en: "Desert Jeep Safari", ar: "سفاري جيب صحراوي" }, type: { en: "Jeep", ar: "جيب" }, price: 350, icon: "🚙", regionId: "frontiers", cityId: "siwa" },
  { id: "tr6", title: { en: "Port Said Ferry", ar: "عبّارة بورسعيد" }, type: { en: "Ferry", ar: "عبّارة" }, price: 30, icon: "🚢", regionId: "suez-canal", cityId: "port-said" },
];

export const products = [
  { id: "p1", title: { en: "Sea-Inspired Handmade Jewelry", ar: "مجوهرات يدوية مستوحاة من البحر" }, price: 600, village: { en: "Damietta", ar: "دمياط" }, badge: { en: "Handmade", ar: "يدوي" }, image: "https://images.unsplash.com/photo-1515562141589-67f0d569b6c4?w=400&q=80", regionId: "nile-delta", cityId: "damietta" },
  { id: "p2", title: { en: "Palm Tree Heritage Chair", ar: "كرسي تراثي من النخيل" }, price: 1000, village: { en: "Rosetta", ar: "رشيد" }, badge: { en: "Heritage", ar: "تراث" }, image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80", regionId: "nile-delta", cityId: "rosetta" },
  { id: "p3", title: { en: "Organic Honey – Lake Edku", ar: "عسل عضوي — بحيرة إدكو" }, price: 250, village: { en: "Edku", ar: "إدكو" }, badge: { en: "Organic", ar: "عضوي" }, image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&q=80", regionId: "nile-delta", cityId: "edku" },
  { id: "p4", title: { en: "Nubian Hand-woven Textile", ar: "نسيج نوبي يدوي" }, price: 450, village: { en: "Aswan", ar: "أسوان" }, badge: { en: "Women-led", ar: "بقيادة نساء" }, image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&q=80", regionId: "upper-egypt", cityId: "aswan" },
  { id: "p5", title: { en: "Siwa Olive Oil", ar: "زيت زيتون سيوة" }, price: 180, village: { en: "Siwa", ar: "سيوة" }, badge: { en: "Organic", ar: "عضوي" }, image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&q=80", regionId: "frontiers", cityId: "siwa" },
  { id: "p6", title: { en: "Port Said Seashell Crafts", ar: "حرف صدف بورسعيد" }, price: 300, village: { en: "Port Said", ar: "بورسعيد" }, badge: { en: "Handmade", ar: "يدوي" }, image: "https://images.unsplash.com/photo-1515562141589-67f0d569b6c4?w=400&q=80", regionId: "suez-canal", cityId: "port-said" },
  { id: "p7", title: { en: "Dahab Bedouin Jewelry", ar: "مجوهرات بدوية من دهب" }, price: 400, village: { en: "Dahab", ar: "دهب" }, badge: { en: "Handmade", ar: "يدوي" }, image: "https://images.unsplash.com/photo-1515562141589-67f0d569b6c4?w=400&q=80", regionId: "frontiers", cityId: "dahab" },
];

export const latestPosts = [
  { id: "lp1", title: { en: "The Forgotten Forts of the Delta", ar: "القلاع المنسية في الدلتا" }, category: { en: "History", ar: "تاريخ" }, image: "https://images.unsplash.com/photo-1568322445389-f64c5bb0df1d?w=400&q=80", regionId: "nile-delta" },
  { id: "lp2", title: { en: "Cooking with Grandma in Rosetta", ar: "الطبخ مع جدتي في رشيد" }, category: { en: "Food", ar: "طعام" }, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80", regionId: "nile-delta" },
  { id: "lp3", title: { en: "Life on Lake Manzala", ar: "الحياة على بحيرة المنزلة" }, category: { en: "Culture", ar: "ثقافة" }, image: "https://images.unsplash.com/photo-1590077428593-a55bb07c4665?w=400&q=80", regionId: "nile-delta" },
  { id: "lp4", title: { en: "Sunrise over the Suez Canal", ar: "شروق الشمس فوق قناة السويس" }, category: { en: "Nature", ar: "طبيعة" }, image: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=400&q=80", regionId: "suez-canal" },
  { id: "lp5", title: { en: "Nubian Colors of Aswan", ar: "ألوان النوبة في أسوان" }, category: { en: "Culture", ar: "ثقافة" }, image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&q=80", regionId: "upper-egypt" },
  { id: "lp6", title: { en: "Siwa: The Last Oasis", ar: "سيوة: الواحة الأخيرة" }, category: { en: "Nature", ar: "طبيعة" }, image: "https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=400&q=80", regionId: "frontiers" },
  { id: "lp7", title: { en: "Port Said's European Quarter", ar: "الحي الأوروبي في بورسعيد" }, category: { en: "History", ar: "تاريخ" }, image: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=400&q=80", regionId: "suez-canal" },
];

export const whosWho = [
  // Nile Delta
  { id: "ww1", name: { en: "Amira El-Sayed", ar: "أميرة السيد" }, role: { en: "Master Palm Weaver", ar: "حرفية نسج النخيل" }, bio: { en: "Third-generation artisan keeping Damietta's weaving traditions alive. Amira learned from her grandmother at age 7 and now trains young women in sustainable craft techniques.", ar: "حرفية من الجيل الثالث تحافظ على تراث دمياط في النسج. تعلمت أميرة من جدتها في سن السابعة وتدرب الآن الشابات على تقنيات الحرف المستدامة." }, image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80", regionId: "nile-delta", cityId: "damietta", interests: { en: ["Palm weaving", "Textile design", "Teaching crafts", "Sustainability"], ar: ["نسج النخيل", "تصميم المنسوجات", "تعليم الحرف", "الاستدامة"] }, favoritePlaces: { en: ["Damietta Old Souk", "Palm Grove Workshop", "Nile Corniche"], ar: ["سوق دمياط القديم", "ورشة بستان النخيل", "كورنيش النيل"] }, meetingTimes: { en: "Sat–Thu, 9 AM – 1 PM", ar: "السبت–الخميس، ٩ ص – ١ م" }, languages: { en: ["Arabic", "English"], ar: ["العربية", "الإنجليزية"] }, yearsActive: 25 },
  { id: "ww2", name: { en: "Hassan Farouk", ar: "حسن فاروق" }, role: { en: "Fisherman & Storyteller", ar: "صياد وراوي قصص" }, bio: { en: "40 years on Lake Manzala, Hassan shares tales of the delta's waterways. He leads sunrise fishing trips and evening storytelling circles by the lake.", ar: "٤٠ عاماً على بحيرة المنزلة، حسن يروي حكايات ممرات الدلتا. يقود رحلات صيد عند الشروق وحلقات حكي مسائية بجانب البحيرة." }, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80", regionId: "nile-delta", cityId: "manzala", interests: { en: ["Fishing", "Storytelling", "Bird watching", "Boat building"], ar: ["الصيد", "رواية القصص", "مراقبة الطيور", "بناء القوارب"] }, favoritePlaces: { en: ["Lake Manzala Shore", "Old Fisherman's Café", "Bird Island"], ar: ["شاطئ بحيرة المنزلة", "مقهى الصياد القديم", "جزيرة الطيور"] }, meetingTimes: { en: "Daily, 5 AM – 10 AM & 4 PM – 7 PM", ar: "يومياً، ٥ ص – ١٠ ص و ٤ م – ٧ م" }, languages: { en: ["Arabic"], ar: ["العربية"] }, yearsActive: 40 },
  { id: "ww3", name: { en: "Fatma Abdelrahman", ar: "فاطمة عبدالرحمن" }, role: { en: "Community Cook", ar: "طاهية مجتمعية" }, bio: { en: "Rosetta's beloved grandma who teaches traditional delta cuisine. Her kitchen is always open for visitors wanting to learn authentic Egyptian recipes.", ar: "جدة رشيد المحبوبة التي تعلّم المطبخ التقليدي للدلتا. مطبخها مفتوح دائماً للزوار الراغبين في تعلم الوصفات المصرية الأصيلة." }, image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80", regionId: "nile-delta", cityId: "rosetta", interests: { en: ["Traditional cooking", "Herb gardening", "Family recipes", "Community meals"], ar: ["الطبخ التقليدي", "زراعة الأعشاب", "وصفات عائلية", "وجبات مجتمعية"] }, favoritePlaces: { en: ["Rosetta Market", "Her Home Kitchen", "Abu Mandour Mosque area"], ar: ["سوق رشيد", "مطبخ منزلها", "منطقة مسجد أبو مندور"] }, meetingTimes: { en: "Sun–Fri, 10 AM – 2 PM", ar: "الأحد–الجمعة، ١٠ ص – ٢ م" }, languages: { en: ["Arabic", "Basic English"], ar: ["العربية", "إنجليزية بسيطة"] }, yearsActive: 35 },
  // Suez Canal
  { id: "ww4", name: { en: "Captain Mahmoud", ar: "الكابتن محمود" }, role: { en: "Canal Heritage Guide", ar: "مرشد تراث القناة" }, bio: { en: "Retired sailor turned historian, sharing Port Said's maritime legacy. He conducts walking tours through the European Quarter and waterfront districts.", ar: "بحار متقاعد تحول إلى مؤرخ، يشارك إرث بورسعيد البحري. يقود جولات مشي في الحي الأوروبي والواجهة البحرية." }, image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80", regionId: "suez-canal", cityId: "port-said", interests: { en: ["Maritime history", "Architecture", "Navigation", "Photography"], ar: ["التاريخ البحري", "العمارة", "الملاحة", "التصوير"] }, favoritePlaces: { en: ["Port Said Lighthouse", "De Lesseps Statue Site", "Canal Waterfront"], ar: ["منارة بورسعيد", "موقع تمثال دي لسبس", "واجهة القناة"] }, meetingTimes: { en: "Sat–Wed, 8 AM – 12 PM", ar: "السبت–الأربعاء، ٨ ص – ١٢ م" }, languages: { en: ["Arabic", "English", "French"], ar: ["العربية", "الإنجليزية", "الفرنسية"] }, yearsActive: 30 },
  { id: "ww5", name: { en: "Nadia Ismail", ar: "نادية إسماعيل" }, role: { en: "Eco-Tourism Pioneer", ar: "رائدة السياحة البيئية" }, bio: { en: "Founded Ismailia's first eco-tourism cooperative on Lake Timsah. She promotes sustainable tourism and runs kayaking and birdwatching excursions.", ar: "أسست أول تعاونية سياحة بيئية بالإسماعيلية على بحيرة التمساح. تروّج للسياحة المستدامة وتنظم رحلات كاياك ومراقبة طيور." }, image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80", regionId: "suez-canal", cityId: "ismailia", interests: { en: ["Eco-tourism", "Kayaking", "Wildlife conservation", "Community development"], ar: ["السياحة البيئية", "الكاياك", "حماية الحياة البرية", "تنمية المجتمع"] }, favoritePlaces: { en: ["Lake Timsah", "Ismailia Museum", "Forsan Island"], ar: ["بحيرة التمساح", "متحف الإسماعيلية", "جزيرة الفرسان"] }, meetingTimes: { en: "Daily, 7 AM – 11 AM", ar: "يومياً، ٧ ص – ١١ ص" }, languages: { en: ["Arabic", "English"], ar: ["العربية", "الإنجليزية"] }, yearsActive: 12 },
  // Upper Egypt
  { id: "ww6", name: { en: "Sobhi Nubian", ar: "صبحي النوبي" }, role: { en: "Pottery Master", ar: "أستاذ الفخار" }, bio: { en: "Keeps ancient Nubian pottery techniques alive in his Aswan workshop. Visitors can join hands-on classes and take home their own creations.", ar: "يحافظ على تقنيات الفخار النوبي القديمة في ورشته بأسوان. يمكن للزوار المشاركة في دروس عملية وأخذ إبداعاتهم للمنزل." }, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80", regionId: "upper-egypt", cityId: "aswan", interests: { en: ["Pottery", "Nubian heritage", "Teaching", "Clay sculpture"], ar: ["الفخار", "التراث النوبي", "التعليم", "نحت الطين"] }, favoritePlaces: { en: ["Nubian Village", "Elephantine Island", "Aswan Souk"], ar: ["القرية النوبية", "جزيرة الفنتين", "سوق أسوان"] }, meetingTimes: { en: "Sat–Thu, 10 AM – 4 PM", ar: "السبت–الخميس، ١٠ ص – ٤ م" }, languages: { en: ["Arabic", "Nubian", "English"], ar: ["العربية", "النوبية", "الإنجليزية"] }, yearsActive: 28 },
  { id: "ww7", name: { en: "Dr. Layla Mostafa", ar: "د. ليلى مصطفى" }, role: { en: "Archaeologist", ar: "عالمة آثار" }, bio: { en: "Leading excavations at Edfu temple and local heritage education. She runs weekend tours that bring ancient stories to life for families and students.", ar: "تقود أعمال التنقيب في معبد إدفو وتعليم التراث المحلي. تنظم جولات عطلة نهاية الأسبوع لإحياء القصص القديمة للعائلات والطلاب." }, image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80", regionId: "upper-egypt", cityId: "edfu", interests: { en: ["Archaeology", "Egyptology", "Education", "Ancient languages"], ar: ["علم الآثار", "علم المصريات", "التعليم", "اللغات القديمة"] }, favoritePlaces: { en: ["Temple of Horus at Edfu", "Kom Ombo Temple", "Edfu Heritage Center"], ar: ["معبد حورس في إدفو", "معبد كوم أمبو", "مركز إدفو التراثي"] }, meetingTimes: { en: "Fri–Sat, 8 AM – 12 PM", ar: "الجمعة–السبت، ٨ ص – ١٢ م" }, languages: { en: ["Arabic", "English", "French", "Hieroglyphics"], ar: ["العربية", "الإنجليزية", "الفرنسية", "الهيروغليفية"] }, yearsActive: 18 },
  // Frontiers
  { id: "ww8", name: { en: "Omar Siwan", ar: "عمر السيوي" }, role: { en: "Desert Guide", ar: "مرشد صحراوي" }, bio: { en: "Born in Siwa, Omar leads sandboarding and stargazing expeditions. He knows every dune and salt lake in the oasis and shares Berber traditions with visitors.", ar: "وُلد في سيوة، عمر يقود رحلات التزلج على الرمال ومراقبة النجوم. يعرف كل كثبان وبحيرة ملح في الواحة ويشارك تقاليد الأمازيغ مع الزوار." }, image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80", regionId: "frontiers", cityId: "siwa", interests: { en: ["Sandboarding", "Stargazing", "Berber culture", "Desert survival"], ar: ["التزلج على الرمال", "مراقبة النجوم", "ثقافة الأمازيغ", "البقاء في الصحراء"] }, favoritePlaces: { en: ["Great Sand Sea", "Cleopatra's Spring", "Shali Fortress"], ar: ["بحر الرمال العظيم", "عين كليوباترا", "قلعة شالي"] }, meetingTimes: { en: "Daily, 6 AM – 10 AM & 4 PM – sunset", ar: "يومياً، ٦ ص – ١٠ ص و ٤ م – الغروب" }, languages: { en: ["Arabic", "Siwi Berber", "English"], ar: ["العربية", "السيوية الأمازيغية", "الإنجليزية"] }, yearsActive: 15 },
  { id: "ww9", name: { en: "Yasmine Bedouin", ar: "ياسمين البدوية" }, role: { en: "Dive Instructor", ar: "مدربة غوص" }, bio: { en: "Dahab's first local female dive instructor at the Blue Hole. She's passionate about marine conservation and teaches freediving and scuba courses year-round.", ar: "أول مدربة غوص محلية في دهب عند الحفرة الزرقاء. شغوفة بحماية البيئة البحرية وتعلّم دورات الغوص الحر والسكوبا على مدار العام." }, image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80", regionId: "frontiers", cityId: "dahab", interests: { en: ["Freediving", "Marine conservation", "Underwater photography", "Yoga"], ar: ["الغوص الحر", "حماية البيئة البحرية", "التصوير تحت الماء", "اليوغا"] }, favoritePlaces: { en: ["Blue Hole", "Lighthouse Reef", "Dahab Boardwalk"], ar: ["الحفرة الزرقاء", "شعاب المنارة", "ممشى دهب"] }, meetingTimes: { en: "Daily, 7 AM – 5 PM", ar: "يومياً، ٧ ص – ٥ م" }, languages: { en: ["Arabic", "English", "Italian"], ar: ["العربية", "الإنجليزية", "الإيطالية"] }, yearsActive: 10 },
];
