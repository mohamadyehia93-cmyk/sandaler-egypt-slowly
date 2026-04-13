export type ProviderRole = 
  | "culture-actor"
  | "service-provider"
  | "accommodation-host"
  | "transport-provider"
  | "trip-organizer"
  | "product-seller"
  | "organization"
  | "ambassador";

export interface ProviderListing {
  id: string;
  title: { en: string; ar: string };
  image: string;
  rating?: number;
  price?: string;
}

export interface Provider {
  id: string;
  role: ProviderRole;
  name: { en: string; ar: string };
  avatar: string;
  coverImage: string;
  city: { en: string; ar: string };
  region: { en: string; ar: string };
  bio: { en: string; ar: string };
  tagline: { en: string; ar: string };
  languages: { en: string; ar: string };
  yearsActive: number;
  verified: boolean;
  followers: number;
  rating: number;
  reviewCount: number;
  specialties: { en: string; ar: string }[];
  listings: ProviderListing[];
  stats: { label: { en: string; ar: string }; value: string }[];
}

export const providers: Provider[] = [
  {
    id: "p1",
    role: "culture-actor",
    name: { en: "Ahmed Hassan", ar: "أحمد حسن" },
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    coverImage: "https://images.unsplash.com/photo-1539768942893-daf53e736b68?w=800&q=80",
    city: { en: "Rosetta", ar: "رشيد" },
    region: { en: "Nile Delta", ar: "دلتا النيل" },
    bio: { en: "A cultural journalist and storyteller who has spent 15 years documenting the hidden traditions of Egypt's Nile Delta. Ahmed's articles and photo essays have been featured in national publications and his audio narratives bring ancient tales to life for a modern audience.", ar: "صحفي ثقافي وراوي قصص أمضى ١٥ عاماً في توثيق التقاليد المخفية لدلتا النيل المصرية. مقالات أحمد ومقالاته المصورة نُشرت في منشورات وطنية وسردياته الصوتية تُحيي الحكايات القديمة لجمهور عصري." },
    tagline: { en: "Telling the stories that shaped the Delta", ar: "أروي القصص التي شكّلت الدلتا" },
    languages: { en: "Arabic, English", ar: "العربية، الإنجليزية" },
    yearsActive: 15,
    verified: true,
    followers: 1240,
    rating: 4.9,
    reviewCount: 87,
    specialties: [
      { en: "Heritage Research", ar: "بحث تراثي" },
      { en: "Photo Essays", ar: "مقالات مصورة" },
      { en: "Audio Narratives", ar: "سرديات صوتية" },
    ],
    listings: [
      { id: "post-1", title: { en: "The Last Reed Weavers of Manzala", ar: "آخر ناسجي البوص في المنزلة" }, image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&q=80", rating: 4.8 },
      { id: "post-2", title: { en: "Rosetta's Forgotten Ottoman Kitchens", ar: "مطابخ رشيد العثمانية المنسية" }, image: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=400&q=80", rating: 4.9 },
    ],
    stats: [
      { label: { en: "Articles", ar: "مقالات" }, value: "12" },
      { label: { en: "Audio Stories", ar: "قصص صوتية" }, value: "5" },
      { label: { en: "Views", ar: "مشاهدات" }, value: "24K" },
    ],
  },
  {
    id: "p2",
    role: "service-provider",
    name: { en: "Hassan Mahmoud", ar: "حسن محمود" },
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
    coverImage: "https://images.unsplash.com/photo-1506953823645-bab42a90ceb5?w=800&q=80",
    city: { en: "Manzala", ar: "المنزلة" },
    region: { en: "Nile Delta", ar: "دلتا النيل" },
    bio: { en: "A lifelong birdwatcher and wetlands conservationist who grew up on the shores of Lake Manzala. Hassan can identify over 200 bird species by sound alone and has led nature expeditions across the Delta for 12 years.", ar: "مراقب طيور وعالم أراضٍ رطبة نشأ على ضفاف بحيرة المنزلة. يستطيع حسن التعرف على أكثر من ٢٠٠ نوع طائر من صوته فقط وقاد رحلات طبيعية عبر الدلتا لمدة ١٢ عاماً." },
    tagline: { en: "Nature guide & bird expert", ar: "مرشد طبيعة وخبير طيور" },
    languages: { en: "Arabic, English", ar: "العربية، الإنجليزية" },
    yearsActive: 12,
    verified: true,
    followers: 890,
    rating: 4.8,
    reviewCount: 156,
    specialties: [
      { en: "Bird Watching", ar: "مراقبة طيور" },
      { en: "Nature Walks", ar: "جولات طبيعية" },
      { en: "Delta Cooking", ar: "طبخ دلتاوي" },
    ],
    listings: [
      { id: "bird-watching-manzala", title: { en: "Bird Watching in Manzala Lake", ar: "مراقبة الطيور في بحيرة المنزلة" }, image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&q=80", rating: 4.8, price: "350 EGP" },
      { id: "cooking-grandma-rosetta", title: { en: "Traditional Delta Cooking", ar: "طبخ دلتا تقليدي" }, image: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=400&q=80", rating: 4.9, price: "400 EGP" },
    ],
    stats: [
      { label: { en: "Experiences", ar: "تجارب" }, value: "5" },
      { label: { en: "Guests Hosted", ar: "ضيوف" }, value: "340" },
      { label: { en: "Bookings", ar: "حجوزات" }, value: "89" },
    ],
  },
  {
    id: "p3",
    role: "accommodation-host",
    name: { en: "Fatma Nubian", ar: "فاطمة النوبية" },
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80",
    coverImage: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800&q=80",
    city: { en: "Aswan", ar: "أسوان" },
    region: { en: "Upper Egypt", ar: "صعيد مصر" },
    bio: { en: "A Nubian grandmother and artist who opens her colorful traditional home to travelers. Fatma's guesthouse on the west bank of Aswan offers authentic Nubian hospitality — from home-cooked feasts to pottery workshops in her garden studio.", ar: "جدة نوبية وفنانة تفتح بيتها التقليدي الملون للمسافرين. بيت ضيافة فاطمة على الضفة الغربية بأسوان يقدم ضيافة نوبية أصيلة — من الولائم المنزلية إلى ورش الفخار في حديقتها." },
    tagline: { en: "Your Nubian home on the Nile", ar: "بيتك النوبي على النيل" },
    languages: { en: "Arabic, Nubian, English", ar: "العربية، النوبية، الإنجليزية" },
    yearsActive: 11,
    verified: true,
    followers: 2100,
    rating: 4.9,
    reviewCount: 234,
    specialties: [
      { en: "Nubian Homestay", ar: "إقامة نوبية" },
      { en: "Pottery Workshops", ar: "ورش فخار" },
      { en: "Home Cooking", ar: "طبخ منزلي" },
    ],
    listings: [
      { id: "s1", title: { en: "Fatma's Nubian Guesthouse", ar: "بيت ضيافة فاطمة النوبي" }, image: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=400&q=80", rating: 4.9, price: "650 EGP/night" },
    ],
    stats: [
      { label: { en: "Properties", ar: "عقارات" }, value: "2" },
      { label: { en: "Nights Hosted", ar: "ليالي استضافة" }, value: "1.2K" },
      { label: { en: "Superhost", ar: "مضيف متميز" }, value: "⭐" },
    ],
  },
  {
    id: "p4",
    role: "transport-provider",
    name: { en: "Captain Youssef", ar: "الريّس يوسف" },
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80",
    coverImage: "https://images.unsplash.com/photo-1506953823645-bab42a90ceb5?w=800&q=80",
    city: { en: "Rosetta", ar: "رشيد" },
    region: { en: "Nile Delta", ar: "دلتا النيل" },
    bio: { en: "A third-generation felucca captain from Rosetta. Youssef's family has sailed the Nile for over a century. He knows every bend of the river and shares incredible stories of Rosetta's maritime history during each ride.", ar: "ريّس فلوكة من الجيل الثالث في رشيد. عائلة يوسف أبحرت في النيل لأكثر من قرن. يعرف كل منعطف في النهر ويشارك قصصاً مذهلة عن تاريخ رشيد البحري." },
    tagline: { en: "Three generations on the Nile", ar: "ثلاثة أجيال على النيل" },
    languages: { en: "Arabic", ar: "العربية" },
    yearsActive: 20,
    verified: true,
    followers: 560,
    rating: 4.7,
    reviewCount: 98,
    specialties: [
      { en: "Felucca Rides", ar: "رحلات فلوكة" },
      { en: "Sunset Cruises", ar: "رحلات غروب" },
      { en: "River History Tours", ar: "جولات تاريخ النهر" },
    ],
    listings: [
      { id: "t1", title: { en: "Nile Felucca Ride — Rosetta", ar: "رحلة فلوكة نيلية — رشيد" }, image: "https://images.unsplash.com/photo-1506953823645-bab42a90ceb5?w=400&q=80", rating: 4.7, price: "200 EGP" },
    ],
    stats: [
      { label: { en: "Rides", ar: "رحلات" }, value: "2.4K" },
      { label: { en: "Years", ar: "سنوات" }, value: "20" },
      { label: { en: "Routes", ar: "مسارات" }, value: "6" },
    ],
  },
  {
    id: "p5",
    role: "trip-organizer",
    name: { en: "Semsemia Trips", ar: "سمسمية تريبس" },
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80",
    coverImage: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80",
    city: { en: "Ismailia", ar: "الإسماعيلية" },
    region: { en: "Suez Canal", ar: "قناة السويس" },
    bio: { en: "A community-driven trip organizer based in Ismailia, specializing in immersive day trips and weekend adventures across the Canal Zone. Named after the traditional semsemia instrument, their trips blend culture, food, and nature.", ar: "منظم رحلات مجتمعي في الإسماعيلية، متخصص في رحلات يومية وعطلات نهاية أسبوع عبر منطقة القناة. سُمي على اسم آلة السمسمية التقليدية، رحلاتهم تمزج الثقافة والطعام والطبيعة." },
    tagline: { en: "Discover the Canal, one trip at a time", ar: "اكتشف القناة، رحلة بعد رحلة" },
    languages: { en: "Arabic, English", ar: "العربية، الإنجليزية" },
    yearsActive: 4,
    verified: true,
    followers: 3200,
    rating: 4.8,
    reviewCount: 312,
    specialties: [
      { en: "Day Trips", ar: "رحلات يومية" },
      { en: "Food Tours", ar: "جولات طعام" },
      { en: "Cultural Tours", ar: "جولات ثقافية" },
    ],
    listings: [
      { id: "trip-1", title: { en: "Full Day Trip to Ismailia", ar: "رحلة يوم كامل للإسماعيلية" }, image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80", rating: 4.8, price: "800 EGP" },
      { id: "trip-2", title: { en: "Gastronomy on the Lakes", ar: "فنون الطعام على البحيرات" }, image: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=400&q=80", rating: 4.9, price: "1200 EGP" },
    ],
    stats: [
      { label: { en: "Trips", ar: "رحلات" }, value: "6" },
      { label: { en: "Travelers", ar: "مسافرون" }, value: "1.8K" },
      { label: { en: "5★ Reviews", ar: "تقييمات ٥★" }, value: "280" },
    ],
  },
  {
    id: "p6",
    role: "product-seller",
    name: { en: "Fatma Abdullah", ar: "فاطمة عبدالله" },
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80",
    coverImage: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80",
    city: { en: "Fuwwah", ar: "فوة" },
    region: { en: "Nile Delta", ar: "دلتا النيل" },
    bio: { en: "A master artisan from Fuwwah specializing in sea-inspired handmade jewelry and traditional palm crafts. Fatma learned her craft from her grandmother and now sells her unique pieces to travelers visiting the Delta.", ar: "حرفية من فوة متخصصة في المجوهرات اليدوية المستوحاة من البحر وحرف النخيل التقليدية. تعلمت فاطمة حرفتها من جدتها وتبيع الآن قطعها الفريدة للمسافرين." },
    tagline: { en: "Handmade treasures from the Delta", ar: "كنوز يدوية من الدلتا" },
    languages: { en: "Arabic", ar: "العربية" },
    yearsActive: 8,
    verified: true,
    followers: 780,
    rating: 4.7,
    reviewCount: 67,
    specialties: [
      { en: "Handmade Jewelry", ar: "مجوهرات يدوية" },
      { en: "Palm Crafts", ar: "حرف نخيل" },
      { en: "Carpet Weaving", ar: "نسج سجاد" },
    ],
    listings: [
      { id: "prod-1", title: { en: "Sea-Inspired Handmade Jewelry", ar: "مجوهرات بحرية يدوية" }, image: "https://images.unsplash.com/photo-1515562141589-67f0d569b234?w=400&q=80", rating: 4.8, price: "180 EGP" },
      { id: "prod-2", title: { en: "Palm Tree Heritage Chair", ar: "كرسي نخيل تراثي" }, image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80", rating: 4.6, price: "450 EGP" },
    ],
    stats: [
      { label: { en: "Products", ar: "منتجات" }, value: "8" },
      { label: { en: "Sold", ar: "مبيعات" }, value: "340" },
      { label: { en: "Repeat Buyers", ar: "عملاء متكررون" }, value: "45" },
    ],
  },
  {
    id: "p7",
    role: "organization",
    name: { en: "Children's Library Tanta", ar: "مكتبة أطفال طنطا" },
    avatar: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&q=80",
    coverImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
    city: { en: "Tanta", ar: "طنطا" },
    region: { en: "Nile Delta", ar: "دلتا النيل" },
    bio: { en: "A grassroots organization dedicated to promoting literacy and cultural pride among children in the Delta region. Founded in 2019, the library runs free reading programs, storytelling sessions, and heritage workshops for underprivileged youth.", ar: "منظمة شعبية مكرسة لتعزيز القراءة والفخر الثقافي بين أطفال منطقة الدلتا. تأسست عام ٢٠١٩ وتدير برامج قراءة مجانية وجلسات حكي وورش تراث للشباب المحرومين." },
    tagline: { en: "Building futures through stories", ar: "نبني مستقبلاً بالقصص" },
    languages: { en: "Arabic, English", ar: "العربية، الإنجليزية" },
    yearsActive: 5,
    verified: true,
    followers: 4500,
    rating: 5.0,
    reviewCount: 89,
    specialties: [
      { en: "Education", ar: "تعليم" },
      { en: "Heritage Preservation", ar: "حفظ تراث" },
      { en: "Youth Programs", ar: "برامج شبابية" },
    ],
    listings: [
      { id: "cause-1", title: { en: "Sponsor a Reading Kit", ar: "ارعَ حقيبة قراءة" }, image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80" },
      { id: "cause-2", title: { en: "Volunteer as a Reading Mentor", ar: "تطوع كمرشد قراءة" }, image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&q=80" },
    ],
    stats: [
      { label: { en: "Programs", ar: "برامج" }, value: "4" },
      { label: { en: "Volunteers", ar: "متطوعون" }, value: "156" },
      { label: { en: "Children Reached", ar: "أطفال" }, value: "2.4K" },
    ],
  },
  {
    id: "p8",
    role: "ambassador",
    name: { en: "Sara Ahmed", ar: "سارة أحمد" },
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80",
    coverImage: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80",
    city: { en: "Mansoura", ar: "المنصورة" },
    region: { en: "Nile Delta", ar: "دلتا النيل" },
    bio: { en: "A community organizer and Sandal Ambassador for the Nile Delta zone. Sara verifies local providers, onboards new hosts, and ensures quality standards across her region. She's passionate about sustainable tourism that benefits local communities.", ar: "منظمة مجتمعية وسفيرة صندل لمنطقة دلتا النيل. تتحقق سارة من المزودين المحليين وتُدرب المضيفين الجدد وتضمن معايير الجودة. شغوفة بالسياحة المستدامة التي تفيد المجتمعات المحلية." },
    tagline: { en: "Connecting travelers to authentic Egypt", ar: "أربط المسافرين بمصر الأصيلة" },
    languages: { en: "Arabic, English", ar: "العربية، الإنجليزية" },
    yearsActive: 3,
    verified: true,
    followers: 1800,
    rating: 5.0,
    reviewCount: 45,
    specialties: [
      { en: "Quality Verification", ar: "ضمان جودة" },
      { en: "Provider Onboarding", ar: "تدريب مزودين" },
      { en: "Community Building", ar: "بناء مجتمع" },
    ],
    listings: [],
    stats: [
      { label: { en: "Verified", ar: "موثق" }, value: "24" },
      { label: { en: "Onboarded", ar: "مُدرَّب" }, value: "18" },
      { label: { en: "Zone Coverage", ar: "تغطية" }, value: "85%" },
    ],
  },
];
