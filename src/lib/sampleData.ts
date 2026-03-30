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
  ],
  "frontiers": [
    { id: "siwa", name: { en: "Siwa", ar: "سيوة" } },
    { id: "dahab", name: { en: "Dahab", ar: "دهب" } },
    { id: "marsa-alam", name: { en: "Marsa Alam", ar: "مرسى علم" } },
  ],
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
