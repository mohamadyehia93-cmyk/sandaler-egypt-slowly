export const regions = [
  { id: "nile-delta", nameKey: "region.nileDelta", emoji: "🌿", color: "#2BBFB3" },
  { id: "suez-canal", nameKey: "region.suezCanal", emoji: "⚓", color: "#1A7A74" },
  { id: "upper-egypt", nameKey: "region.upperEgypt", emoji: "🏛️", color: "#E8A838" },
  { id: "frontiers", nameKey: "region.frontiers", emoji: "⛰️", color: "#8B5CF6" },
];

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
  { id: "e1", title: { en: "Bird Watching in Manzala Lake", ar: "مراقبة الطيور في بحيرة المنزلة" }, region: { en: "Nile Delta", ar: "دلتا النيل" }, theme: "nature" as ExperienceTheme, price: 150, date: "Dec 26, 2024", image: "https://images.unsplash.com/photo-1621631187532-8d2c0c9718d8?w=400&q=80", rating: 4.8, reviews: 24 },
  { id: "e4", title: { en: "Sunset Felucca Ride in Rosetta", ar: "رحلة فلوكة عند الغروب في رشيد" }, region: { en: "Nile Delta", ar: "دلتا النيل" }, theme: "nature" as ExperienceTheme, price: 180, date: "Jan 5, 2025", image: "https://images.unsplash.com/photo-1568322445389-f64c5bb0df1d?w=400&q=80", rating: 4.7, reviews: 31 },
  // Nature — Upper Egypt
  { id: "e10", title: { en: "Nile Sunrise Kayaking in Luxor", ar: "تجديف بالكاياك عند شروق النيل بالأقصر" }, region: { en: "Upper Egypt", ar: "صعيد مصر" }, theme: "nature" as ExperienceTheme, price: 220, date: "Jan 12, 2025", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=80", rating: 4.9, reviews: 15 },

  // History — Nile Delta
  { id: "e5", title: { en: "Rosetta Stone Trail Walk", ar: "جولة درب حجر رشيد" }, region: { en: "Nile Delta", ar: "دلتا النيل" }, theme: "history" as ExperienceTheme, price: 120, date: "Jan 8, 2025", image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=400&q=80", rating: 4.6, reviews: 18 },
  // History — Suez Canal
  { id: "e6", title: { en: "Port Said Heritage Walking Tour", ar: "جولة تراث بورسعيد المشي" }, region: { en: "Suez Canal", ar: "قناة السويس" }, theme: "history" as ExperienceTheme, price: 160, date: "Jan 20, 2025", image: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=400&q=80", rating: 4.5, reviews: 22 },
  // History — Upper Egypt
  { id: "e11", title: { en: "Ancient Temples of Edfu & Kom Ombo", ar: "معابد إدفو وكوم أمبو القديمة" }, region: { en: "Upper Egypt", ar: "صعيد مصر" }, theme: "history" as ExperienceTheme, price: 350, date: "Feb 5, 2025", image: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=400&q=80", rating: 4.9, reviews: 38 },

  // Food — Nile Delta
  { id: "e7", title: { en: "Cooking with Grandma in Rosetta", ar: "الطبخ مع جدتي في رشيد" }, region: { en: "Nile Delta", ar: "دلتا النيل" }, theme: "food" as ExperienceTheme, price: 200, date: "Jan 15, 2025", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80", rating: 4.9, reviews: 35 },
  // Food — Suez Canal
  { id: "e12", title: { en: "Fresh Catch & Cook on Lake Timsah", ar: "صيد وطبخ طازج على بحيرة التمساح" }, region: { en: "Suez Canal", ar: "قناة السويس" }, theme: "food" as ExperienceTheme, price: 280, date: "Feb 10, 2025", image: "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400&q=80", rating: 4.7, reviews: 12 },

  // Adventure — Frontiers
  { id: "e3", title: { en: "Desert Sandboarding in Siwa", ar: "التزلج على الرمال في سيوة" }, region: { en: "Frontiers", ar: "الحدود" }, theme: "adventure" as ExperienceTheme, price: 250, date: "Dec 26, 2024", image: "https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=400&q=80", rating: 4.9, reviews: 42 },
  // Adventure — Nile Delta
  { id: "e13", title: { en: "Night Fishing on Lake Burullus", ar: "الصيد الليلي في بحيرة البرلس" }, region: { en: "Nile Delta", ar: "دلتا النيل" }, theme: "adventure" as ExperienceTheme, price: 170, date: "Jan 22, 2025", image: "https://images.unsplash.com/photo-1590077428593-a55bb07c4665?w=400&q=80", rating: 4.6, reviews: 19 },

  // Culture — Upper Egypt
  { id: "e8", title: { en: "Nubian Village Pottery Workshop", ar: "ورشة فخار القرية النوبية" }, region: { en: "Upper Egypt", ar: "صعيد مصر" }, theme: "culture" as ExperienceTheme, price: 180, date: "Feb 2, 2025", image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&q=80", rating: 4.8, reviews: 27 },
  // Culture — Nile Delta
  { id: "e14", title: { en: "Palm Weaving with Damietta Artisans", ar: "نسج النخيل مع حرفيي دمياط" }, region: { en: "Nile Delta", ar: "دلتا النيل" }, theme: "culture" as ExperienceTheme, price: 140, date: "Jan 30, 2025", image: "https://images.unsplash.com/photo-1515562141589-67f0d569b6c4?w=400&q=80", rating: 4.7, reviews: 16 },

  // Community — Nile Delta
  { id: "e9", title: { en: "Volunteer at Rosetta Children's Library", ar: "تطوع في مكتبة أطفال رشيد" }, region: { en: "Nile Delta", ar: "دلتا النيل" }, theme: "community" as ExperienceTheme, price: 0, date: "Ongoing", image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=400&q=80", rating: 5.0, reviews: 11 },
  // Community — Upper Egypt
  { id: "e15", title: { en: "Teach English in Aswan Village", ar: "علّم الإنجليزية في قرية أسوان" }, region: { en: "Upper Egypt", ar: "صعيد مصر" }, theme: "community" as ExperienceTheme, price: 0, date: "Ongoing", image: "https://images.unsplash.com/photo-1497375638960-ca368c7231e4?w=400&q=80", rating: 4.8, reviews: 9 },
];

export const audioTours = [
  { id: "a1", title: { en: "In Rosetta: City of a Million Palm Trees", ar: "في رشيد: مدينة المليون نخلة" }, region: { en: "Nile Delta", ar: "دلتا النيل" }, duration: 45, stops: 8, price: 0, image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400&q=80" },
  { id: "a2", title: { en: "From Hive to Gulf", ar: "من الخلية إلى الخليج" }, region: { en: "Suez Canal", ar: "قناة السويس" }, duration: 30, stops: 6, price: 0, image: "https://images.unsplash.com/photo-1590077428593-a55bb07c4665?w=400&q=80" },
  { id: "a3", title: { en: "Migratory Birds — Lake Manzala", ar: "الطيور المهاجرة — بحيرة المنزلة" }, region: { en: "Nile Delta", ar: "دلتا النيل" }, duration: 60, stops: 10, price: 20, image: "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400&q=80" },
];

export const trips = [
  { id: "t1", title: { en: "Full Day Trip to Ismailia from Cairo", ar: "رحلة يوم كامل إلى الإسماعيلية من القاهرة" }, route: { en: "Cairo → Ismailia", ar: "القاهرة → الإسماعيلية" }, price: 1000, date: "Jan 10, 2025", image: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=400&q=80" },
  { id: "t2", title: { en: "Full Day Trip to Port Said from Cairo", ar: "رحلة يوم كامل إلى بورسعيد من القاهرة" }, route: { en: "Cairo → Port Said", ar: "القاهرة → بورسعيد" }, price: 1000, date: "Jan 15, 2025", image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=80" },
  { id: "t3", title: { en: "Gastronomy on the Lakes", ar: "فن الطهي على البحيرات" }, route: { en: "Cairo → Edku", ar: "القاهرة → إدكو" }, price: 3000, date: "Feb 1, 2025", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80" },
];

export const accommodation = [
  { id: "ac1", title: { en: "Delta Family Homestay", ar: "إقامة عائلية في الدلتا" }, type: { en: "Homestay", ar: "إقامة عائلية" }, location: { en: "Damietta", ar: "دمياط" }, price: 300, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80", rating: 4.5 },
  { id: "ac2", title: { en: "Lake Mariout Eco-Lodge", ar: "نزل بيئي على بحيرة مريوط" }, type: { en: "Eco-lodge", ar: "نزل بيئي" }, location: { en: "Mariout", ar: "مريوط" }, price: 500, image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80", rating: 4.8 },
  { id: "ac3", title: { en: "Ismailia Canal House", ar: "بيت القناة بالإسماعيلية" }, type: { en: "Guesthouse", ar: "بيت ضيافة" }, location: { en: "Ismailia", ar: "الإسماعيلية" }, price: 400, image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80", rating: 4.6 },
];

export const transport = [
  { id: "tr1", title: { en: "Shared Bus to Ismailia", ar: "باص مشترك إلى الإسماعيلية" }, type: { en: "Bus", ar: "باص" }, price: 50, icon: "🚌" },
  { id: "tr2", title: { en: "Felucca Ride Lake Manzala", ar: "رحلة فلوكة في بحيرة المنزلة" }, type: { en: "Felucca", ar: "فلوكة" }, price: 200, icon: "⛵" },
  { id: "tr3", title: { en: "Tuk-Tuk Rosetta Old Town", ar: "توك توك في رشيد القديمة" }, type: { en: "Tuk-tuk", ar: "توك توك" }, price: 150, icon: "🛺" },
];

export const products = [
  { id: "p1", title: { en: "Sea-Inspired Handmade Jewelry", ar: "مجوهرات يدوية مستوحاة من البحر" }, price: 600, village: { en: "Damietta", ar: "دمياط" }, badge: { en: "Handmade", ar: "يدوي" }, image: "https://images.unsplash.com/photo-1515562141589-67f0d569b6c4?w=400&q=80" },
  { id: "p2", title: { en: "Palm Tree Heritage Chair", ar: "كرسي تراثي من النخيل" }, price: 1000, village: { en: "Rosetta", ar: "رشيد" }, badge: { en: "Heritage", ar: "تراث" }, image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80" },
  { id: "p3", title: { en: "Organic Honey – Lake Edku", ar: "عسل عضوي — بحيرة إدكو" }, price: 250, village: { en: "Edku", ar: "إدكو" }, badge: { en: "Organic", ar: "عضوي" }, image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&q=80" },
  { id: "p4", title: { en: "Hand-woven Textile", ar: "نسيج يدوي" }, price: 450, village: { en: "Fayyum", ar: "الفيوم" }, badge: { en: "Women-led", ar: "بقيادة نساء" }, image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&q=80" },
];

export const latestPosts = [
  { id: "lp1", title: { en: "The Forgotten Forts of the Delta", ar: "القلاع المنسية في الدلتا" }, category: { en: "History", ar: "تاريخ" }, image: "https://images.unsplash.com/photo-1568322445389-f64c5bb0df1d?w=400&q=80" },
  { id: "lp2", title: { en: "Cooking with Grandma in Rosetta", ar: "الطبخ مع جدتي في رشيد" }, category: { en: "Food", ar: "طعام" }, image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80" },
  { id: "lp3", title: { en: "Life on Lake Manzala", ar: "الحياة على بحيرة المنزلة" }, category: { en: "Culture", ar: "ثقافة" }, image: "https://images.unsplash.com/photo-1590077428593-a55bb07c4665?w=400&q=80" },
  { id: "lp4", title: { en: "Sunrise over the Suez Canal", ar: "شروق الشمس فوق قناة السويس" }, category: { en: "Nature", ar: "طبيعة" }, image: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=400&q=80" },
];
