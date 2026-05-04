import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Sparkles, Compass, Info, Clock, Camera, Lightbulb, BookOpen, Route as RouteIcon, Calendar } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cityData, experiences, latestPosts, trips } from "@/lib/sampleData";
import BottomNav from "@/components/BottomNav";
import NotFoundView from "@/components/NotFound";

const slugify = (s: string) =>
  s.toLowerCase()
    .replace(/[''`]/g, "")
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "");

type Bilingual = { en: string; ar: string };

type HighlightSeed = {
  category: Bilingual;
  overview: Bilingual;
  whatToSee: Bilingual[];
  bestTime: Bilingual;
  tips: Bilingual[];
  image?: string;
};

// Curated seeds for well-known highlights (keyed by english slug)
const HIGHLIGHT_SEEDS: Record<string, Partial<HighlightSeed>> = {
  "lake-timsah": {
    category: { en: "Natural Landmark", ar: "معلم طبيعي" },
    overview: {
      en: "Lake Timsah (Crocodile Lake) is one of the Bitter Lakes through which the Suez Canal flows. Its calm turquoise waters border Ismailia's leafy boulevards, making it a beloved spot for sailing, sunset walks, and lakeside cafés.",
      ar: "بحيرة التمساح إحدى البحيرات المرة التي تمر بها قناة السويس. مياهها الفيروزية الهادئة تحدّ شوارع الإسماعيلية المشجرة، وهي مكان محبوب للإبحار وممشى الغروب والمقاهي على الضفاف.",
    },
    whatToSee: [
      { en: "Public beach & sailing club", ar: "الشاطئ العام ونادي الإبحار" },
      { en: "Sunset views from the corniche", ar: "مشاهد الغروب من الكورنيش" },
      { en: "Forest park & picnic lawns", ar: "حديقة الغابة ومسطحات النزهة" },
    ],
    tips: [
      { en: "Visit late afternoon for the best light.", ar: "زر في فترة العصر للحصول على أفضل إضاءة." },
      { en: "Bring mosquito repellent in summer evenings.", ar: "أحضر طارد البعوض في أمسيات الصيف." },
    ],
  },
  "ismailia-museum": {
    category: { en: "Museum", ar: "متحف" },
    overview: {
      en: "A small but rich regional museum displaying artifacts from the Pharaonic, Greco-Roman and Islamic periods, plus exhibits on the digging of the Suez Canal and the life of the workers who built it.",
      ar: "متحف إقليمي صغير لكنه غني بقطع من العصور الفرعونية واليونانية الرومانية والإسلامية، مع معروضات عن حفر قناة السويس وحياة عمالها.",
    },
    whatToSee: [
      { en: "Roman mosaic of Phaedra & Hippolytus", ar: "فسيفساء فيدرا وهيبوليتوس الرومانية" },
      { en: "Sphinx of Ramses II", ar: "تمثال أبو الهول لرمسيس الثاني" },
      { en: "Suez Canal construction archive", ar: "أرشيف بناء قناة السويس" },
    ],
    tips: [
      { en: "Closed on Mondays — check timing before visiting.", ar: "مغلق يوم الإثنين — تأكد من المواعيد." },
    ],
  },
  "de-lesseps-house": {
    category: { en: "Historic House", ar: "بيت تاريخي" },
    overview: {
      en: "The 19th-century residence of Ferdinand de Lesseps, the French diplomat behind the Suez Canal. The house preserves original furniture, his private carriage, and personal correspondence from the canal era.",
      ar: "منزل من القرن التاسع عشر للدبلوماسي الفرنسي فرديناند دي لسبس صاحب فكرة قناة السويس. يحتفظ المنزل بأثاثه الأصلي وعربته الخاصة ومراسلاته من حقبة القناة.",
    },
    whatToSee: [
      { en: "De Lesseps' private salon", ar: "صالون دي لسبس الخاص" },
      { en: "Original ceremonial carriage", ar: "العربة الرسمية الأصلية" },
      { en: "Suez Canal opening memorabilia", ar: "مقتنيات افتتاح قناة السويس" },
    ],
    tips: [{ en: "Photography may require permission.", ar: "قد يتطلب التصوير إذناً." }],
  },
  "garden-city-boulevards": {
    category: { en: "Urban Heritage", ar: "تراث عمراني" },
    overview: {
      en: "Ismailia's planned French-colonial garden quarter, with broad tree-lined avenues, low pastel villas, and shady squares. Walking these boulevards offers a glimpse of how canal-era engineers and their families once lived.",
      ar: "حي الحدائق المخطط على الطراز الفرنسي الاستعماري في الإسماعيلية، بشوارع واسعة مشجرة وفلل بألوان فاتحة وميادين ظليلة. التجول فيه يكشف كيف عاش مهندسو حقبة القناة وعائلاتهم.",
    },
    whatToSee: [
      { en: "Mohamed Ali Quay villas", ar: "فلل كورنيش محمد علي" },
      { en: "Old Greek Orthodox church", ar: "الكنيسة اليونانية الأرثوذكسية القديمة" },
      { en: "Shaded café terraces", ar: "تراسات المقاهي الظليلة" },
    ],
    tips: [{ en: "Best explored on foot or by bicycle.", ar: "الاستكشاف الأفضل سيراً أو بالدراجة." }],
  },
};

// Heuristic category from name
const inferCategory = (name: string): Bilingual => {
  const n = name.toLowerCase();
  if (/(museum|متحف)/.test(n)) return { en: "Museum", ar: "متحف" };
  if (/(mosque|مسجد)/.test(n)) return { en: "Mosque", ar: "مسجد" };
  if (/(temple|معبد)/.test(n)) return { en: "Ancient Temple", ar: "معبد أثري" };
  if (/(monastery|دير)/.test(n)) return { en: "Monastery", ar: "دير" };
  if (/(lake|بحيرة)/.test(n)) return { en: "Natural Landmark", ar: "معلم طبيعي" };
  if (/(beach|شاطئ|منتجع)/.test(n)) return { en: "Beach & Resort", ar: "شاطئ ومنتجع" };
  if (/(market|souk|سوق|أسواق)/.test(n)) return { en: "Traditional Market", ar: "سوق تقليدي" };
  if (/(workshop|ورش)/.test(n)) return { en: "Craft Workshops", ar: "ورش حرفية" };
  if (/(university|جامعة)/.test(n)) return { en: "Educational Landmark", ar: "معلم تعليمي" };
  if (/(port|ميناء|canal|قناة)/.test(n)) return { en: "Port & Waterfront", ar: "ميناء وواجهة بحرية" };
  if (/(corniche|كورنيش|riverside|ضفاف)/.test(n)) return { en: "Riverside Promenade", ar: "ممشى نهري" };
  if (/(quarter|حي|district)/.test(n)) return { en: "Historic Quarter", ar: "حي تاريخي" };
  if (/(festival|moulid|مولد)/.test(n)) return { en: "Cultural Festival", ar: "احتفالية ثقافية" };
  if (/(tomb|مقابر|valley)/.test(n)) return { en: "Archaeological Site", ar: "موقع أثري" };
  return { en: "Local Highlight", ar: "معلم محلي" };
};

const HighlightDetail = () => {
  const { cityId, highlightSlug } = useParams();
  const navigate = useNavigate();
  const { lang } = useI18n();

  const city = cityData[cityId || ""];

  const match = useMemo(() => {
    if (!city) return null;
    const idx = city.highlights.en.findIndex((h) => slugify(h) === highlightSlug);
    if (idx === -1) return null;
    return { en: city.highlights.en[idx], ar: city.highlights.ar[idx] || city.highlights.en[idx] };
  }, [city, highlightSlug]);

  if (!city || !match) {
    return <NotFoundView context="highlight" />;
  }

  const seedKey = slugify(match.en);
  const seed = HIGHLIGHT_SEEDS[seedKey] || {};
  const category = seed.category || inferCategory(match.en);

  const overview: Bilingual = seed.overview || {
    en: `${match.en} is one of ${city.name.en}'s best-loved highlights. Set within ${city.governorate.en} governorate, it captures the spirit of ${city.knownFor.en[0]?.toLowerCase() || "the region"} and is a natural addition to any itinerary exploring ${city.name.en}.`,
    ar: `${match.ar} من أبرز معالم ${city.name.ar} المحبوبة. يقع في محافظة ${city.governorate.ar}، ويعكس روح ${city.knownFor.ar[0] || "المنطقة"}، ويُعد إضافة طبيعية لأي رحلة لاستكشاف ${city.name.ar}.`,
  };

  const whatToSee: Bilingual[] = seed.whatToSee || [
    { en: `Iconic views of ${match.en}`, ar: `مشاهد مميزة لـ${match.ar}` },
    { en: `Local stories told by residents`, ar: `حكايات محلية يرويها الأهالي` },
    { en: `Photo spots & quiet corners`, ar: `أماكن للتصوير وأركان هادئة` },
  ];

  const tips: Bilingual[] = seed.tips || [
    { en: `Pair your visit with other ${city.name.en} highlights nearby.`, ar: `اجمع زيارتك مع معالم ${city.name.ar} القريبة.` },
    { en: `Respect local customs and ask before photographing people.`, ar: `احترم العادات المحلية واستأذن قبل تصوير الأشخاص.` },
  ];

  const bestTime: Bilingual = seed.bestTime || city.bestTime;

  // Related content
  const relatedExperiences = experiences.filter((e) => e.cityId === cityId).slice(0, 6);
  const relatedTrips = trips.filter((t) => t.cityId === cityId).slice(0, 6);
  const relatedPosts = latestPosts.filter((p) => (p as any).cityId === cityId).slice(0, 6);

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 bg-background sticky top-0 z-40">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-secondary" aria-label="Back">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-base font-bold text-foreground line-clamp-1">{match[lang]}</h1>
      </header>

      {/* Hero */}
      <div className="relative h-52 mx-4 mt-2 rounded-xl overflow-hidden">
        <img src={seed.image || city.image} alt={match[lang]} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute top-3 left-3">
          <span className="bg-primary/90 text-primary-foreground text-[10px] font-semibold px-2.5 py-1 rounded-full">
            {category[lang]}
          </span>
        </div>
        <div className="absolute bottom-3 left-4 right-4">
          <h2 className="text-xl font-bold text-white mb-1">{match[lang]}</h2>
          <button
            onClick={() => navigate(`/city/${cityId}`)}
            className="flex items-center gap-1.5 text-white/90 text-xs hover:text-white"
          >
            <MapPin className="w-3 h-3" />
            <span>{city.name[lang]}, {city.governorate[lang]}</span>
          </button>
        </div>
      </div>

      <div className="space-y-6 pt-5">
        {/* Overview */}
        <section className="px-4">
          <div className="flex items-center gap-2 mb-2">
            <Compass className="w-4 h-4 text-primary" />
            <h3 className="text-base font-bold text-foreground">{lang === "ar" ? "نظرة عامة" : "Overview"}</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{overview[lang]}</p>
        </section>

        {/* What to See / Do */}
        <section className="px-4">
          <div className="flex items-center gap-2 mb-2">
            <Camera className="w-4 h-4 text-primary" />
            <h3 className="text-base font-bold text-foreground">{lang === "ar" ? "ما تشاهده" : "What to See"}</h3>
          </div>
          <ul className="space-y-2">
            {whatToSee.map((w, i) => (
              <li key={i} className="flex items-start gap-2 bg-card rounded-lg p-3 shadow-card border border-border">
                <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground">{w[lang]}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Best Time */}
        <section className="px-4">
          <div className="flex items-center gap-2 bg-card rounded-lg p-3 shadow-card border border-border">
            <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
            <div>
              <span className="text-xs text-muted-foreground">{lang === "ar" ? "أفضل وقت للزيارة" : "Best Time to Visit"}</span>
              <p className="text-sm font-medium text-foreground">{bestTime[lang]}</p>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className="px-4">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-primary" />
            <h3 className="text-base font-bold text-foreground">{lang === "ar" ? "نصائح للزائر" : "Visitor Tips"}</h3>
          </div>
          <ul className="space-y-2">
            {tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-muted-foreground leading-relaxed">{tip[lang]}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Related Experiences */}
        {relatedExperiences.length > 0 && (
          <section>
            <div className="px-4 flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="text-base font-bold text-foreground">
                {lang === "ar" ? `تجارب في ${city.name.ar}` : `Experiences in ${city.name.en}`}
              </h3>
            </div>
            <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
              {relatedExperiences.map((exp) => (
                <div
                  key={exp.id}
                  onClick={() => navigate(`/experience/${(exp as any).slug || exp.id}`)}
                  className="min-w-[200px] shrink-0 rounded-xl overflow-hidden shadow-card bg-card cursor-pointer"
                >
                  <div className="relative h-28">
                    <img src={exp.image} alt={exp.title[lang]} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2.5">
                    <h4 className="text-xs font-semibold text-foreground line-clamp-2 leading-snug">{exp.title[lang]}</h4>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related Trips */}
        {relatedTrips.length > 0 && (
          <section>
            <div className="px-4 flex items-center gap-2 mb-2">
              <RouteIcon className="w-4 h-4 text-primary" />
              <h3 className="text-base font-bold text-foreground">
                {lang === "ar" ? `رحلات قريبة` : `Trips Nearby`}
              </h3>
            </div>
            <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
              {relatedTrips.map((tr) => (
                <div
                  key={tr.id}
                  onClick={() => navigate(`/trip/${(tr as any).slug || tr.id}`)}
                  className="min-w-[200px] shrink-0 rounded-xl overflow-hidden shadow-card bg-card cursor-pointer"
                >
                  <div className="relative h-28">
                    <img src={tr.image} alt={tr.title[lang]} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2.5">
                    <h4 className="text-xs font-semibold text-foreground line-clamp-2 leading-snug">{tr.title[lang]}</h4>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section>
            <div className="px-4 flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <h3 className="text-base font-bold text-foreground">
                {lang === "ar" ? "مقالات ذات صلة" : "Related Posts"}
              </h3>
            </div>
            <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
              {relatedPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => navigate(`/post/${post.id}`)}
                  className="min-w-[220px] shrink-0 rounded-xl overflow-hidden shadow-card bg-card cursor-pointer"
                >
                  <div className="relative h-28">
                    <img src={post.image} alt={post.title[lang]} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 bg-primary/90 text-primary-foreground text-[10px] font-medium px-2 py-0.5 rounded-full">
                      {post.category[lang]}
                    </span>
                  </div>
                  <div className="p-3">
                    <h4 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug mb-1">{post.title[lang]}</h4>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {post.readTime} {lang === "ar" ? "د" : "min"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default HighlightDetail;
