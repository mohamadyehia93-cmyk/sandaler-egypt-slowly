import { useState, useRef, useCallback } from "react";
import { ArrowLeft, Share2, Heart, MessageCircle, MapPin, Bus, Train, ChevronRight, Plus, Minus, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { fetchByIdOrSlug } from "@/lib/fetchByIdOrSlug";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

/* ── sample fallback data for preview ────────────────────────── */
const sampleExperience = {
  title_en: "Bird Watching in Manzala Lake",
  title_ar: "مراقبة الطيور في بحيرة المنزلة",
  description_en: "Board a traditional felucca with a local boatman and explore one of Egypt's largest coastal lakes. Spot flamingos, herons and cormorants against the backdrop of a living wetland ecosystem.",
  description_ar: "اركب فلوكة تقليدية مع بحار محلي واستكشف واحدة من أكبر البحيرات الساحلية في مصر.",
  image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
  images: [
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&q=80",
    "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&q=80",
  ],
  rating: 4.8,
  reviews_count: 24,
  price: 150,
  duration_minutes: 240,
  capacity_max: 12,
  meeting_point_name: "Manzala Main Dock",
  host_name_en: "Hassan Mahmoud",
  host_name_ar: "حسن محمود",
  host_image: null,
  theme: "Nature",
  provider_id: null,
};

/* ── static content ──────────────────────────────────────────── */
const tags = [
  { label: "Nature", bg: "bg-[#E8F8F7]", border: "border-[#5DCAA5]", text: "text-[#085041]" },
  { label: "Lake Manzala", bg: "bg-[#F8F8F8]", border: "border-black/[0.08]", text: "text-[#666]" },
  { label: "4 hours", bg: "bg-[#F8F8F8]", border: "border-black/[0.08]", text: "text-[#666]" },
  { label: "Women-friendly", bg: "bg-[#EAF3DE]", border: "border-[#639922]", text: "text-[#27500A]" },
  { label: "Seasonal: Oct–Mar", bg: "bg-[#FAEEDA]", border: "border-[#FAC775]", text: "text-[#633806]" },
];

const steps = [
  { num: 1, title: "Board the traditional felucca", desc: "Meet Hassan at Manzala main dock. Life jackets provided. 30 min · Arabic + English", color: "bg-[#E8F8F7]" },
  { num: 2, title: "Spot migratory birds", desc: "Scan the lake for flamingos, herons and cormorants. Binoculars provided. 2 hrs", color: "bg-[#B5D4F4]" },
  { num: 3, title: "Local tea and stories", desc: "Wind down at a fisherman's café. Hassan shares Manzala's fishing heritage. 30 min", color: "bg-[#FAC775]" },
];

const slots = [
  { date: "Fri, Dec 26", time: "6:00 – 10:00 AM", price: 150, spots: 12, discounted: false, low: false },
  { date: "Fri, Dec 26", time: "3:00 – 7:00 PM", price: 120, spots: 14, discounted: true, low: false },
  { date: "Sat, Dec 27", time: "6:00 – 10:00 AM", price: 150, spots: 2, discounted: false, low: true },
];

const thingsToKnow = [
  { icon: "👥", label: "Guest requirements", desc: "Ages 8+. Life jackets provided." },
  { icon: "🥾", label: "Activity level", desc: "Light — seated on the boat." },
  { icon: "🎒", label: "What to bring", desc: "Binoculars, sun cream, layers." },
  { icon: "📵", label: "Offline friendly", desc: "Download map before your trip." },
  { icon: "🤝", label: "Rural etiquette", desc: "Read our 2-min guide before booking." },
  { icon: "❌", label: "Cancellation", desc: "Free up to 24h before start." },
];

const reviews = [
  { initials: "SH", name: "Sharif", city: "Cairo · solo", rating: 4, text: "Fun way to connect with nature and hear real local stories about the lake...", bg: "bg-[#9FE1CB]" },
  { initials: "NA", name: "Nadia", city: "Alexandria · family", rating: 5, text: "Hassan was incredibly patient with our kids. The flamingos were breathtaking...", bg: "bg-[#B5D4F4]" },
];

const related = [
  { title: "Delta home cooking with Om Fatma", meta: "Food · 3h · 200 EGP · ★4.9", cta: "+ Bundle", color: "bg-[#9FE1CB]" },
  { title: "Rosetta Ottoman quarter walk", meta: "History · 2h · 150 EGP · ★4.7", cta: "Book", color: "bg-[#E8F8F7]" },
  { title: "Sunset felucca — Rosetta", meta: "Water · 2h · 180 EGP · ★4.8", cta: "Book", color: "bg-[#B5D4F4]" },
];

/* ── helpers ──────────────────────────────────────────────────── */
const StarRow = ({ count, size = 13 }: { count: number; size?: number }) => (
  <span style={{ fontSize: size, color: "#BA7517", letterSpacing: 1 }}>
    {"★".repeat(Math.round(count))}{"☆".repeat(5 - Math.round(count))}
  </span>
);

const Divider = () => <div className="h-px bg-black/[0.06] my-[10px]" />;

/* ═══════════════════════════════════════════════════════════════ */
const ExperienceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useI18n();
  const reviewsRef = useRef<HTMLDivElement>(null);

  const [saved, setSaved] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(0);
  const [guests, setGuests] = useState(2);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetSlot, setSheetSlot] = useState(1);
  const [sheetGuests, setSheetGuests] = useState(1);

  const { data: dbExp, isLoading } = useQuery({
    queryKey: ["experience", id],
    queryFn: () => fetchByIdOrSlug("experiences", id!),
    enabled: !!id,
  });

  const exp = dbExp || sampleExperience;
  const title = lang === "ar" ? exp.title_ar : exp.title_en;
  const description = lang === "ar" ? (exp.description_ar || exp.description_en) : exp.description_en;
  const hostName = lang === "ar" ? (exp.host_name_ar || exp.host_name_en) : exp.host_name_en;
  const unitPrice = slots[selectedSlot]?.price ?? exp.price ?? 150;
  const total = unitPrice * guests + Math.round(unitPrice * guests * 0.1);

  const scrollToReviews = useCallback(() => {
    reviewsRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-4 space-y-4">
        <Skeleton className="h-56 w-full rounded-xl" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const photos = exp.images?.length ? exp.images : [exp.image || "/placeholder.svg"];

  return (
    <div className="min-h-screen bg-white font-['Cairo',sans-serif] pb-[140px]">

      {/* ── 1. TOP NAV ─────────────────────────────────────────── */}
      <div className="h-11 flex items-center justify-between px-4 bg-white sticky top-0 z-40">
        <button onClick={() => navigate(-1)} className="w-7 h-7 rounded-full bg-[#F8F8F8] border border-black/[0.08] flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-[#1A1A1A]" />
        </button>
        <span className="text-xs text-[#666] font-normal">Nile Delta · Experiences</span>
        <div className="flex gap-2">
          <button className="w-7 h-7 rounded-full bg-[#F8F8F8] border border-black/[0.08] flex items-center justify-center">
            <Share2 className="w-3.5 h-3.5 text-[#1A1A1A]" />
          </button>
          <button
            onClick={() => setSaved(!saved)}
            className="w-7 h-7 rounded-full bg-[#F8F8F8] border border-black/[0.08] flex items-center justify-center transition-transform"
            style={saved ? { transform: "scale(1.15)" } : {}}
          >
            <Heart className={`w-3.5 h-3.5 transition-colors ${saved ? "fill-[#2BBFB3] text-[#2BBFB3]" : "text-[#1A1A1A]"}`} />
          </button>
        </div>
      </div>

      {/* ── 2. PHOTO GRID ──────────────────────────────────────── */}
      <div className="grid grid-cols-[1fr_1fr] gap-0.5 h-[220px] relative">
        <img src={photos[0]} alt={title} className="w-full h-[220px] object-cover" />
        <div className="grid grid-rows-2 gap-0.5">
          <img src={photos[1] || photos[0]} alt="" className="w-full h-full object-cover" />
          <div className="relative">
            <img src={photos[2] || photos[0]} alt="" className="w-full h-full object-cover" />
            {photos.length > 3 && (
              <span className="absolute bottom-1.5 right-1.5 bg-black/55 text-white text-[11px] px-2 py-0.5 rounded-md">+{photos.length - 3} photos</span>
            )}
          </div>
        </div>
        {/* Ambassador badge */}
        <span className="absolute top-2.5 left-2.5 bg-[#E8F8F7] border border-[#5DCAA5] text-[#085041] text-[9px] font-medium px-2 py-0.5 rounded-full">✓ Ambassador verified</span>
      </div>

      {/* ── 3. CONTENT ─────────────────────────────────────────── */}
      <div className="px-4">

        {/* 3A TITLE + TAGS + RATING */}
        <div className="pt-3.5">
          <h1 className="text-[17px] font-bold text-[#1A1A1A] leading-[1.35] mb-2">{title}</h1>
          <div className="flex gap-1.5 overflow-x-auto hide-scrollbar mb-2.5">
            {tags.map((t, i) => (
              <span key={i} className={`flex-shrink-0 px-2.5 py-[3px] rounded-full text-[10px] font-medium border ${t.bg} ${t.border} ${t.text}`}>{t.label}</span>
            ))}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
            <StarRow count={exp.rating || 4.8} />
            <span className="text-[13px] font-semibold text-[#1A1A1A]">{exp.rating || 4.8}</span>
            <button onClick={scrollToReviews} className="text-xs text-[#2BBFB3] underline">{exp.reviews_count || 24} reviews</button>
            <span className="bg-[#EAF3DE] border border-[#639922] text-[#27500A] text-[10px] font-medium px-2 py-0.5 rounded-full">22 verified attendees</span>
          </div>

          {/* AI summary */}
          <div className="bg-[#E8F8F7] border-l-[3px] border-l-[#2BBFB3] rounded-r-lg p-2.5 mb-2.5">
            <p className="text-[9px] font-medium text-[#2BBFB3] mb-1">✦ AI summary of {exp.reviews_count || 24} reviews</p>
            <p className="text-[11px] italic text-[#085041] leading-[1.55]">
              Visitors love Hassan's deep knowledge of bird migration patterns and his patience with first-time birdwatchers. Most recommend arriving before 7AM for the best flamingo viewing.
            </p>
          </div>
        </div>

        <Divider />

        {/* 3C HOST CARD */}
        <div>
          <div className="flex items-start gap-3 mb-2">
            <div className="w-11 h-11 rounded-full bg-[#2BBFB3] flex items-center justify-center text-white text-[15px] font-semibold flex-shrink-0">HM</div>
            <div>
              <p className="text-sm font-semibold text-[#1A1A1A]">{hostName || "Hassan Mahmoud"}</p>
              <p className="text-[11px] text-[#666]">Local boatman · Lake Manzala · 8 years</p>
            </div>
          </div>
          <div className="bg-[#F8F8F8] rounded-lg p-2.5 mb-2 space-y-1">
            {["Born and raised in Manzala — knows every inch of the lake", "Speaks: Arabic, English (conversational)", "On Sandal since 2024 · 24 completed experiences", "Specializes in: flamingo season, fishing heritage, wetland ecology"].map((c, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className="w-[5px] h-[5px] rounded-full bg-[#2BBFB3] mt-1 flex-shrink-0" />
                <span className="text-[11px] text-[#666]">{c}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate(`/inbox?personId=${exp.provider_id || "hassan"}&name=${encodeURIComponent(hostName || "Hassan Mahmoud")}`)}
            className="w-full h-10 rounded-lg border border-[#2BBFB3] text-[#2BBFB3] text-xs font-semibold mb-1.5"
          >
            Message {hostName?.split(" ")[0] || "Hassan"}
          </button>
          <div className="flex items-start gap-1.5">
            <span className="text-xs flex-shrink-0">🔒</span>
            <p className="text-[10px] text-[#888] leading-[1.5]">Always book and pay through Sandal to protect your experience. Support: +20 100 XXX XXXX</p>
          </div>
        </div>

        <Divider />

        {/* 3D REVENUE TRANSPARENCY */}
        <div>
          <h2 className="text-sm font-semibold text-[#1A1A1A] mb-2">Where your money goes</h2>
          <div className="grid grid-cols-3 gap-2">
            {[{ n: "85", l: "EGP to Hassan" }, { n: "15", l: "Platform fee" }, { n: "0", l: "To intermediary" }].map((c, i) => (
              <div key={i} className="border border-black/[0.08] rounded-lg p-2.5 text-center bg-white">
                <p className="text-xl font-bold text-[#2BBFB3]">{c.n}</p>
                <p className="text-[10px] text-[#666] mt-0.5">{c.l}</p>
              </div>
            ))}
          </div>
        </div>

        <Divider />

        {/* 3E WHAT YOU'LL DO — Timeline */}
        <div>
          <h2 className="text-sm font-semibold text-[#1A1A1A] mb-2.5">What you'll do</h2>
          <div className="space-y-0">
            {steps.map((s, i) => (
              <div key={s.num} className="flex gap-2.5 relative pb-2">
                {/* vertical line */}
                {i < steps.length - 1 && (
                  <div className="absolute left-[13px] top-[36px] w-[1.5px] bg-[#2BBFB3]/30" style={{ height: "calc(100% - 8px)" }} />
                )}
                <div className="w-7 h-7 rounded-full bg-[#2BBFB3] flex items-center justify-center text-white text-[11px] font-semibold flex-shrink-0 z-10">{s.num}</div>
                <div className={`w-12 h-12 rounded-lg ${s.color} flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#1A1A1A] mb-0.5">{s.title}</p>
                  <p className="text-[11px] text-[#666] leading-[1.45]">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Divider />

        {/* 3F UPCOMING AVAILABILITY */}
        <div>
          <h2 className="text-sm font-semibold text-[#1A1A1A] mb-2">Upcoming availability</h2>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {slots.map((s, i) => (
              <button
                key={i}
                onClick={() => setSelectedSlot(i)}
                className={`flex-shrink-0 w-[158px] rounded-[10px] p-2.5 border text-left transition-colors ${
                  selectedSlot === i ? "border-[#2BBFB3] bg-[#E8F8F7]" : "border-black/[0.08] bg-white"
                }`}
              >
                <p className={`text-xs font-semibold ${selectedSlot === i ? "text-[#085041]" : "text-[#1A1A1A]"}`}>{s.date}</p>
                <p className="text-[11px] text-[#666] mt-0.5">{s.time}</p>
                <div className="flex justify-between items-center mt-1.5">
                  <span className={`text-[11px] font-semibold ${s.discounted ? "text-[#BA7517]" : "text-[#2BBFB3]"}`}>{s.price} EGP</span>
                  <span className={`text-[10px] ${s.low ? "text-[#A32D2D] font-medium" : "text-[#666]"}`}>{s.spots} spots</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <Divider />

        {/* 3G GUEST SELECTOR + PRICE BREAKDOWN */}
        <div>
          <div className="flex justify-between items-center py-3 border-y border-black/[0.06]">
            <div>
              <p className="text-[13px] font-semibold text-[#1A1A1A]">Adults</p>
              <button className="text-[11px] text-[#2BBFB3] underline">+ Add children (half price)</button>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-[30px] h-[30px] rounded-full border border-black/[0.12] flex items-center justify-center">
                <Minus className="w-3.5 h-3.5 text-[#1A1A1A]" />
              </button>
              <span className="text-[15px] font-semibold text-[#1A1A1A] w-5 text-center">{guests}</span>
              <button onClick={() => setGuests(Math.min(12, guests + 1))} className="w-[30px] h-[30px] rounded-full border border-black/[0.12] flex items-center justify-center">
                <Plus className="w-3.5 h-3.5 text-[#1A1A1A]" />
              </button>
            </div>
          </div>
          <div className="py-2.5 space-y-1.5">
            <div className="flex justify-between"><span className="text-[13px] text-[#1A1A1A]">{guests} × {unitPrice} EGP</span><span className="text-[13px] text-[#1A1A1A]">{guests * unitPrice} EGP</span></div>
            <div className="flex justify-between"><span className="text-xs text-[#888]">Platform fee</span><span className="text-xs text-[#888]">{Math.round(unitPrice * guests * 0.1)} EGP</span></div>
            <div className="flex justify-between"><span className="text-[11px] text-[#888]">Free cancellation until Dec 25</span><span className="text-xs font-medium text-[#27AE60]">✓</span></div>
            <div className="h-px bg-black/[0.06]" />
            <div className="flex justify-between"><span className="text-sm font-semibold text-[#1A1A1A]">Total</span><span className="text-sm font-semibold text-[#1A1A1A]">{total} EGP</span></div>
          </div>
        </div>

        <Divider />

        {/* 3H MEETING POINT MAP */}
        <div>
          <h2 className="text-sm font-semibold text-[#1A1A1A] mb-2">Where we'll meet</h2>
          <div className="relative w-full h-[120px] bg-[#E1F5EE] rounded-[10px] border border-[#5DCAA5] mb-2 flex items-center justify-center overflow-hidden">
            <span className="text-2xl">📍</span>
            <span className="absolute bottom-2.5 bg-white border border-black/[0.12] text-[#1A1A1A] text-[9px] px-1.5 py-0.5 rounded">Manzala Main Dock</span>
          </div>
          <div className="flex items-start gap-1.5">
            <span className="text-xs flex-shrink-0">🚌</span>
            <p className="text-[11px] text-[#666] leading-[1.5]">Hotel pickup available from Mansoura city center (+20 EGP). Select when booking. Download <span className="text-[#2BBFB3] underline">offline map</span> for areas with poor signal.</p>
          </div>
        </div>

        <Divider />

        {/* 3I GETTING THERE FROM CAIRO */}
        <div>
          <h2 className="text-sm font-semibold text-[#1A1A1A] mb-2">Getting there from Cairo</h2>
          <div className="bg-[#E8F8F7] rounded-[10px] border border-[#5DCAA5] p-3">
            <p className="text-xs font-semibold text-[#085041] mb-2">From Cairo to Manzala Lake</p>
            <div className="space-y-1.5">
              {[
                { Icon: Bus, text: "Bus: Cairo Turgoman → Mansoura · 2.5h · 55 EGP · then taxi 15 min" },
                { Icon: Train, text: "Train: Cairo Ramses → Mansoura · 3h · 45 EGP" },
              ].map((o, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-[26px] h-[26px] rounded-[7px] bg-[#2BBFB3] flex items-center justify-center flex-shrink-0">
                    <o.Icon className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-[11px] text-[#085041] leading-[1.4]">{o.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Divider />

        {/* 3J REVIEWS */}
        <div ref={reviewsRef}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-[#1A1A1A]"><span className="text-[#BA7517]">★</span> {exp.rating || 4.8} · {exp.reviews_count || 24} reviews</span>
            <button className="text-xs font-medium text-[#2BBFB3]">See all →</button>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            {reviews.map((r, i) => (
              <div key={i} className="border border-black/[0.08] rounded-[10px] p-2.5 bg-white">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className={`w-[26px] h-[26px] rounded-full ${r.bg} flex items-center justify-center text-[9px] font-medium text-[#085041]`}>{r.initials}</div>
                  <div>
                    <p className="text-[11px] font-semibold text-[#1A1A1A]">{r.name}</p>
                    <p className="text-[10px] text-[#888]">{r.city}</p>
                  </div>
                </div>
                <StarRow count={r.rating} size={11} />
                <p className="text-[10px] text-[#666] leading-[1.45] mt-1 mb-1.5 line-clamp-3">{r.text}</p>
                <span className="inline-flex items-center gap-1 bg-[#EAF3DE] rounded-lg px-1.5 py-0.5">
                  <span className="w-[5px] h-[5px] rounded-full bg-[#27AE60]" />
                  <span className="text-[9px] font-medium text-[#27500A]">Verified attendee</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <Divider />

        {/* 3K THINGS TO KNOW */}
        <div>
          <h2 className="text-sm font-semibold text-[#1A1A1A] mb-2.5">Things to know</h2>
          <div className="grid grid-cols-2 gap-2">
            {thingsToKnow.map((t, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className="text-base mt-0.5 flex-shrink-0">{t.icon}</span>
                <div>
                  <p className="text-[11px] font-semibold text-[#1A1A1A] mb-0.5">{t.label}</p>
                  <p className="text-[10px] text-[#666] leading-[1.4]">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Divider />

        {/* 3L AMBASSADOR VETTING BADGE */}
        <div className="flex gap-2.5 items-start border border-[#FAC775] rounded-[10px] p-3 bg-[#FAEEDA]">
          <div className="w-9 h-9 rounded-full bg-[#BA7517] flex items-center justify-center text-white text-base font-bold flex-shrink-0">✓</div>
          <div>
            <p className="text-xs font-semibold text-[#633806] mb-0.5">Ambassador verified experience</p>
            <p className="text-[10px] text-[#854F0B] leading-[1.5]">Hassan's listing was physically visited and verified by Noha (Damietta Ambassador) on Dec 1, 2024. Location confirmed, safety checked, photos authenticated.</p>
          </div>
        </div>

        <Divider />

        {/* 3M SAFETY NOTE */}
        <div className="bg-[#F8F8F8] rounded-lg p-2.5">
          <p className="text-[10px] text-[#888] leading-[1.55]">Always book and pay through Sandal to protect your experience. Sandal holds payment until after your visit is confirmed complete. Support: +20 100 XXX XXXX</p>
        </div>

        <Divider />

        {/* 3N IMPACT DASHBOARD */}
        <div>
          <h2 className="text-sm font-semibold text-[#1A1A1A] mb-2">Your visit's impact</h2>
          <div className="bg-[#F8F8F8] rounded-[10px] p-3">
            <div className="grid grid-cols-3 gap-2">
              {[{ n: "85", l: "EGP to Hassan" }, { n: "15", l: "EGP to local fund" }, { n: "24", l: "Visitors this month" }].map((c, i) => (
                <div key={i} className="bg-white border border-black/[0.08] rounded-lg p-2.5 text-center">
                  <p className="text-lg font-bold text-[#2BBFB3]">{c.n}</p>
                  <p className="text-[9px] text-[#888] mt-0.5">{c.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Divider />

        {/* 3O RELATED EXPERIENCES */}
        <div>
          <h2 className="text-sm font-semibold text-[#1A1A1A] mb-2">More experiences in Nile Delta</h2>
          <div className="flex gap-2.5 overflow-x-auto hide-scrollbar pb-1.5">
            {related.map((r, i) => (
              <div key={i} className="flex-shrink-0 w-[138px] border border-black/[0.08] rounded-[10px] overflow-hidden bg-white">
                <div className={`h-[72px] ${r.color} flex items-center justify-center text-[10px] text-[#085041] font-medium px-2 text-center`}>{r.title}</div>
                <div className="p-2">
                  <p className="text-[11px] font-semibold text-[#1A1A1A] leading-[1.3] mb-0.5 line-clamp-2">{r.title}</p>
                  <p className="text-[10px] text-[#888] mb-1.5">{r.meta}</p>
                  <button className="w-full h-7 rounded-md bg-[#2BBFB3] text-white text-[10px] font-semibold">{r.cta}</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* bottom spacer for description */}
        <div className="h-4" />
        {description && (
          <>
            <h2 className="text-sm font-semibold text-[#1A1A1A] mb-2">About This Experience</h2>
            <p className="text-[13px] text-[#666] leading-relaxed mb-4">{description}</p>
          </>
        )}
      </div>

      {/* ── 4. PERSISTENT CHAT BAR ─────────────────────────────── */}
      <div className="fixed bottom-[80px] left-0 right-0 z-50 bg-[#E8F8F7] border-t border-[#5DCAA5] px-4 py-2.5 flex items-center gap-2.5">
        <div className="w-[22px] h-[22px] rounded-full bg-[#2BBFB3] flex items-center justify-center flex-shrink-0">
          <MessageCircle className="w-[11px] h-[11px] text-white" />
        </div>
        <span className="text-xs text-[#085041] flex-1 min-w-0 truncate">Message {hostName?.split(" ")[0] || "Hassan"} · usually replies within 2h</span>
        <a href="https://wa.me/" target="_blank" rel="noopener" className="bg-[#2BBFB3] text-white text-[9px] font-semibold px-2 py-0.5 rounded-[10px] flex-shrink-0">
          WhatsApp ↗
        </a>
      </div>

      {/* ── 5. STICKY BOTTOM BOOKING BAR ───────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-black/[0.08] shadow-[0_-2px_12px_rgba(0,0,0,0.06)] px-4 py-3 pb-7 flex items-center justify-between">
        <div>
          <span className="text-xl font-bold text-[#2BBFB3]">{unitPrice} EGP</span>
          <span className="text-[13px] text-[#888]"> /person</span>
          <p className="text-[11px] font-medium text-[#27AE60]">✓ Free cancellation</p>
        </div>
        <button onClick={() => setSheetOpen(true)} className="h-[46px] px-[26px] bg-[#2BBFB3] rounded-[10px] text-white text-sm font-bold">
          Book now
        </button>
      </div>

      {/* ── 6. BOOKING BOTTOM SHEET ────────────────────────────── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-[20px] px-0 pb-8 pt-0 max-h-[85vh] overflow-y-auto">
          <div className="flex justify-center pt-2.5 pb-1">
            <div className="w-8 h-1 rounded-full bg-black/[0.12]" />
          </div>
          <SheetHeader className="px-4 pb-3">
            <SheetTitle className="text-base font-bold text-[#1A1A1A]">Select a time</SheetTitle>
          </SheetHeader>

          {/* adults */}
          <div className="px-4 pb-3 flex justify-between items-center border-b border-black/[0.06]">
            <div>
              <p className="text-sm font-semibold text-[#1A1A1A]">{sheetGuests} adult{sheetGuests > 1 ? "s" : ""}</p>
              <button className="text-xs text-[#2BBFB3] underline">Add children</button>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setSheetGuests(Math.max(1, sheetGuests - 1))} className="w-[30px] h-[30px] rounded-full border border-black/[0.12] flex items-center justify-center"><Minus className="w-3.5 h-3.5" /></button>
              <span className="text-[15px] font-semibold w-5 text-center">{sheetGuests}</span>
              <button onClick={() => setSheetGuests(Math.min(12, sheetGuests + 1))} className="w-[30px] h-[30px] rounded-full border border-black/[0.12] flex items-center justify-center"><Plus className="w-3.5 h-3.5" /></button>
            </div>
          </div>

          {/* date header */}
          <div className="px-4 py-2 flex justify-between items-center">
            <span className="text-[13px] font-semibold text-[#888]">April 2026</span>
            <span className="text-[#2BBFB3] text-sm">📅</span>
          </div>

          {/* slots */}
          {[
            { group: "Tomorrow, April 9", time: "8:30 AM – 3:45 PM", price: "€ 39 / guest", spots: "10 spots available" },
            { group: "Friday, April 10", time: "8:30 AM – 3:45 PM", price: "€ 35 / guest", spots: "9 spots available" },
            { group: "Saturday, April 11", time: "8:30 AM – 3:45 PM", price: "€ 39 / guest", spots: "10 spots available" },
          ].map((s, i) => (
            <div key={i} className="px-4">
              <p className="text-sm font-bold text-[#1A1A1A] pt-2.5 pb-1.5">{s.group}</p>
              <button
                onClick={() => setSheetSlot(i)}
                className={`w-full rounded-[10px] border p-3 mb-2 text-left transition-colors ${sheetSlot === i ? "border-[#2BBFB3] bg-[#E8F8F7]" : "border-black/[0.08]"}`}
              >
                <p className="text-sm font-semibold text-[#1A1A1A]">{s.time}</p>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-[#888]">{s.price}</span>
                  <span className="text-xs text-[#888]">{s.spots}</span>
                </div>
              </button>
            </div>
          ))}

          {/* confirm */}
          <div className="px-4 pt-2">
            <button
              onClick={() => { setSheetOpen(false); navigate(`/booking?type=experience&id=${exp.id || id}`); }}
              className="w-full h-[46px] bg-[#2BBFB3] rounded-[10px] text-white text-sm font-bold"
            >
              Confirm — {total} EGP
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ExperienceDetail;
