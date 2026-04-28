import { useState, useRef, useCallback, useMemo } from "react";
import { ArrowLeft, Share2, Heart, MessageCircle, MapPin, Bus, Train, ChevronRight, Plus, Minus, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { fetchByIdOrSlug } from "@/lib/fetchByIdOrSlug";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

/* ── static fallbacks ────────────────────────────────────────── */
const fallbackTags = [
  { label: "Nature", bg: "bg-[#E8F8F7]", border: "border-[#5DCAA5]", text: "text-[#085041]" },
  { label: "Lake Manzala", bg: "bg-[#F8F8F8]", border: "border-black/[0.08]", text: "text-[#666]" },
  { label: "4 hours", bg: "bg-[#F8F8F8]", border: "border-black/[0.08]", text: "text-[#666]" },
  { label: "Women-friendly", bg: "bg-[#EAF3DE]", border: "border-[#639922]", text: "text-[#27500A]" },
  { label: "Seasonal: Oct–Mar", bg: "bg-[#FAEEDA]", border: "border-[#FAC775]", text: "text-[#633806]" },
];

const fallbackSteps = [
  { num: 1, title: "Board the traditional felucca", desc: "Meet Hassan at Manzala main dock. Life jackets provided. 30 min · Arabic + English", color: "bg-[#E8F8F7]" },
  { num: 2, title: "Spot migratory birds", desc: "Scan the lake for flamingos, herons and cormorants. Binoculars provided. 2 hrs", color: "bg-[#B5D4F4]" },
  { num: 3, title: "Local tea and stories", desc: "Wind down at a fisherman's café. Hassan shares Manzala's fishing heritage. 30 min", color: "bg-[#FAC775]" },
];

const thingsToKnow = [
  { icon: "👥", label: "Guest requirements", desc: "Ages 8+. Life jackets provided." },
  { icon: "🥾", label: "Activity level", desc: "Light — seated on the boat." },
  { icon: "🎒", label: "What to bring", desc: "Binoculars, sun cream, layers." },
  { icon: "📵", label: "Offline friendly", desc: "Download map before your trip." },
  { icon: "🤝", label: "Rural etiquette", desc: "Read our 2-min guide before booking." },
  { icon: "❌", label: "Cancellation", desc: "Free up to 24h before start." },
];

/* ── helpers ──────────────────────────────────────────────────── */
const StarRow = ({ count, size = 13 }: { count: number; size?: number }) => (
  <span style={{ fontSize: size, color: "#BA7517", letterSpacing: 1 }}>
    {"★".repeat(Math.round(count))}{"☆".repeat(5 - Math.round(count))}
  </span>
);

const Divider = () => <div className="h-px bg-black/[0.06] my-[10px]" />;

const formatTime = (t: string) => {
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${m} ${ampm}`;
};

const formatSlotDate = (dateStr: string) => {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
};

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
  const [sheetSlot, setSheetSlot] = useState(0);
  const [sheetGuests, setSheetGuests] = useState(1);

  // ── Fetch experience ──
  const { data: exp, isLoading } = useQuery({
    queryKey: ["experience", id],
    queryFn: () => fetchByIdOrSlug("experiences", id!),
    enabled: !!id,
  });

  // ── Fetch provider ──
  const providerId = exp?.provider_id;
  const { data: provider } = useQuery({
    queryKey: ["provider", providerId],
    queryFn: async () => {
      const { data, error } = await supabase.from("providers").select("*").eq("id", providerId).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!providerId,
  });

  // ── Fetch reviews ──
  const expId = exp?.id;
  const { data: dbReviews } = useQuery({
    queryKey: ["experience-reviews", expId],
    queryFn: async () => {
      const { data, error } = await supabase.from("experience_reviews").select("*").eq("experience_id", expId).order("created_at", { ascending: false }).limit(10);
      if (error) throw error;
      return data;
    },
    enabled: !!expId,
  });

  // ── Fetch availability slots ──
  const { data: dbSlots } = useQuery({
    queryKey: ["experience-slots", expId],
    queryFn: async () => {
      const { data, error } = await supabase.from("experience_slots").select("*").eq("experience_id", expId).order("slot_date", { ascending: true }).order("start_time", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!expId,
  });

  // ── Fetch related experiences (same region) ──
  const { data: relatedExps } = useQuery({
    queryKey: ["related-experiences", exp?.region_id, expId],
    queryFn: async () => {
      const { data, error } = await supabase.from("experiences").select("id, slug, title_en, title_ar, price, rating, duration_minutes, theme, image").eq("region_id", exp!.region_id).neq("id", expId!).limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!exp?.region_id && !!expId,
  });

  // ── Fetch transport (same region) ──
  const { data: regionTransport } = useQuery({
    queryKey: ["region-transport", exp?.region_id],
    queryFn: async () => {
      const { data, error } = await supabase.from("transport").select("id, name_en, name_ar, from_en, from_ar, to_en, to_ar, price, duration, transport_type").eq("region_id", exp!.region_id).limit(4);
      if (error) throw error;
      return data;
    },
    enabled: !!exp?.region_id,
  });

  // ── Fetch region name ──
  const { data: region } = useQuery({
    queryKey: ["region", exp?.region_id],
    queryFn: async () => {
      const { data, error } = await supabase.from("regions").select("name_en, name_ar").eq("id", exp!.region_id).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!exp?.region_id,
  });

  // ── Derived values ──
  const title = exp ? (lang === "ar" ? exp.title_ar : exp.title_en) : "";
  const description = exp ? (lang === "ar" ? (exp.description_ar || exp.description_en) : exp.description_en) : "";
  const hostName = provider
    ? (lang === "ar" ? provider.name_ar : provider.name_en) ?? ""
    : exp ? (lang === "ar" ? (exp.host_name_ar || exp.host_name_en) : exp.host_name_en) ?? "" : "";
  const regionName = region ? (lang === "ar" ? region.name_ar : region.name_en) : "Nile Delta";

  const slots = useMemo(() => {
    if (dbSlots && dbSlots.length > 0) {
      return dbSlots.map((s) => ({
        date: formatSlotDate(s.slot_date),
        time: `${formatTime(s.start_time)} – ${formatTime(s.end_time)}`,
        price: s.price,
        spots: s.spots_available,
        discounted: s.is_discounted,
        low: s.spots_available <= 3,
        rawDate: s.slot_date,
        rawStart: s.start_time,
        rawEnd: s.end_time,
      }));
    }
    return [
      { date: "Fri, Dec 26", time: "6:00 – 10:00 AM", price: 150, spots: 12, discounted: false, low: false },
      { date: "Fri, Dec 26", time: "3:00 – 7:00 PM", price: 120, spots: 14, discounted: true, low: false },
      { date: "Sat, Dec 27", time: "6:00 – 10:00 AM", price: 150, spots: 2, discounted: false, low: true },
    ];
  }, [dbSlots]);

  const reviews = useMemo(() => {
    if (dbReviews && dbReviews.length > 0) {
      return dbReviews.map((r) => ({
        initials: r.reviewer_initials || r.reviewer_name?.slice(0, 2)?.toUpperCase() || "??",
        name: r.reviewer_name,
        city: r.reviewer_city || "",
        rating: r.rating,
        text: r.review_text || "",
        verified: r.verified_attendee,
      }));
    }
    return [
      { initials: "SH", name: "Sharif", city: "Cairo · solo", rating: 4, text: "Fun way to connect with nature and hear real local stories about the lake...", verified: true },
      { initials: "NA", name: "Nadia", city: "Alexandria · family", rating: 5, text: "Hassan was incredibly patient with our kids. The flamingos were breathtaking...", verified: true },
    ];
  }, [dbReviews]);

  const hostInitials = provider
    ? (provider.name_en || "").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : (exp?.host_name_en || "HM").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  const hostSubtitle = provider
    ? `${provider.role === "service-provider" ? "Local guide" : provider.role} · ${provider.city_en || ""} · ${provider.years_active || 0} years`
    : "Local boatman · Lake Manzala · 8 years";

  const hostCredentials = provider
    ? [
        provider.bio_en ? provider.bio_en.split(".")[0] : null,
        provider.languages ? `Speaks: ${provider.languages}` : null,
        `On Sandal since ${new Date(provider.created_at).getFullYear()} · ${provider.review_count || 0} reviews`,
        provider.specialties && Array.isArray(provider.specialties)
          ? `Specializes in: ${(provider.specialties as unknown as { en?: string }[]).map((s) => s.en || "").join(", ")}`
          : null,
      ].filter(Boolean) as string[]
    : [
        "Born and raised in Manzala — knows every inch of the lake",
        "Speaks: Arabic, English (conversational)",
        "On Sandal since 2024 · 24 completed experiences",
        "Specializes in: flamingo season, fishing heritage, wetland ecology",
      ];

  const unitPrice = slots[selectedSlot]?.price ?? exp?.price ?? 150;
  const platformFee = Math.round(unitPrice * guests * 0.1);
  const total = unitPrice * guests + platformFee;
  const hostShare = Math.round(unitPrice * 0.85);

  const scrollToReviews = useCallback(() => {
    reviewsRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // ── Build tags from DB data ──
  const tags = useMemo(() => {
    if (!exp) return fallbackTags;
    const result = [];
    if (exp.theme) result.push({ label: exp.theme, bg: "bg-[#E8F8F7]", border: "border-[#5DCAA5]", text: "text-[#085041]" });
    if (exp.meeting_point_name) result.push({ label: exp.meeting_point_name, bg: "bg-[#F8F8F8]", border: "border-black/[0.08]", text: "text-[#666]" });
    if (exp.duration_minutes) {
      const hrs = Math.round(exp.duration_minutes / 60);
      result.push({ label: `${hrs} hour${hrs > 1 ? "s" : ""}`, bg: "bg-[#F8F8F8]", border: "border-black/[0.08]", text: "text-[#666]" });
    }
    if (result.length === 0) return fallbackTags;
    return result;
  }, [exp]);

  type SlotEntry = (typeof slots)[number] & { _idx: number };

  // Group sheet slots by date for the bottom sheet
  const sheetSlotGroups = useMemo(() => {
    const groups: { label: string; slots: SlotEntry[] }[] = [];
    slots.forEach((s, i) => {
      const dateLabel = s.date;
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.label === dateLabel) {
        lastGroup.slots.push({ ...s, _idx: i });
      } else {
        groups.push({ label: dateLabel, slots: [{ ...s, _idx: i }] });
      }
    });
    return groups;
  }, [slots]);

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

  if (!exp) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Experience not found</div>;
  }

  const photos = exp.images?.length ? exp.images : [exp.image || "/placeholder.svg"];

  return (
    <div className="min-h-screen bg-white font-['Cairo',sans-serif] pb-[140px]">

      {/* ── 1. TOP NAV ─────────────────────────────────────────── */}
      <div className="h-11 flex items-center justify-between px-4 bg-white sticky top-0 z-40">
        <button onClick={() => navigate(-1)} className="w-7 h-7 rounded-full bg-[#F8F8F8] border border-black/[0.08] flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-[#1A1A1A]" />
        </button>
        <span className="text-xs text-[#666] font-normal">{regionName} · Experiences</span>
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
        {exp.verified && (
          <span className="absolute top-2.5 left-2.5 bg-[#E8F8F7] border border-[#5DCAA5] text-[#085041] text-[9px] font-medium px-2 py-0.5 rounded-full">✓ Ambassador verified</span>
        )}
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
            <StarRow count={exp.rating || 0} />
            <span className="text-[13px] font-semibold text-[#1A1A1A]">{exp.rating || 0}</span>
            <button onClick={scrollToReviews} className="text-xs text-[#2BBFB3] underline">{exp.reviews_count || reviews.length} reviews</button>
            <span className="bg-[#EAF3DE] border border-[#639922] text-[#27500A] text-[10px] font-medium px-2 py-0.5 rounded-full">{reviews.filter(r => r.verified).length} verified attendees</span>
          </div>

          {/* AI summary */}
          {reviews.length > 0 && (
            <div className="bg-[#E8F8F7] border-l-[3px] border-l-[#2BBFB3] rounded-r-lg p-2.5 mb-2.5">
              <p className="text-[9px] font-medium text-[#2BBFB3] mb-1">✦ AI summary of {exp.reviews_count || reviews.length} reviews</p>
              <p className="text-[11px] italic text-[#085041] leading-[1.55]">
                Visitors love {hostName?.split(" ")[0] || "the host"}'s deep knowledge and patience. Most recommend this experience for its authenticity and connection to local culture.
              </p>
            </div>
          )}
        </div>

        <Divider />

        {/* 3C HOST CARD */}
        <div>
          <div className="flex items-start gap-3 mb-2">
            {provider?.avatar ? (
              <img src={provider.avatar} alt={hostName} className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-11 h-11 rounded-full bg-[#2BBFB3] flex items-center justify-center text-white text-[15px] font-semibold flex-shrink-0">{hostInitials}</div>
            )}
            <div>
              <p className="text-sm font-semibold text-[#1A1A1A]">{hostName}</p>
              <p className="text-[11px] text-[#666]">{hostSubtitle}</p>
            </div>
          </div>
          <div className="bg-[#F8F8F8] rounded-lg p-2.5 mb-2 space-y-1">
            {hostCredentials.map((c, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className="w-[5px] h-[5px] rounded-full bg-[#2BBFB3] mt-1 flex-shrink-0" />
                <span className="text-[11px] text-[#666]">{c}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate(`/inbox?personId=${providerId || exp.provider_id || ""}&name=${encodeURIComponent(hostName || "")}`)}
            className="w-full h-10 rounded-lg border border-[#2BBFB3] text-[#2BBFB3] text-xs font-semibold mb-1.5"
          >
            Message {hostName?.split(" ")[0] || "Host"}
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
            {[{ n: String(hostShare), l: `EGP to ${hostName?.split(" ")[0] || "Host"}` }, { n: String(unitPrice - hostShare), l: "Platform fee" }, { n: "0", l: "To intermediary" }].map((c, i) => (
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
            {fallbackSteps.map((s, i) => (
              <div key={s.num} className="flex gap-2.5 relative pb-2">
                {i < fallbackSteps.length - 1 && (
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
              <button onClick={() => setGuests(Math.min(exp.capacity_max || 12, guests + 1))} className="w-[30px] h-[30px] rounded-full border border-black/[0.12] flex items-center justify-center">
                <Plus className="w-3.5 h-3.5 text-[#1A1A1A]" />
              </button>
            </div>
          </div>
          <div className="py-2.5 space-y-1.5">
            <div className="flex justify-between"><span className="text-[13px] text-[#1A1A1A]">{guests} × {unitPrice} EGP</span><span className="text-[13px] text-[#1A1A1A]">{guests * unitPrice} EGP</span></div>
            <div className="flex justify-between"><span className="text-xs text-[#888]">Platform fee</span><span className="text-xs text-[#888]">{platformFee} EGP</span></div>
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
            <span className="absolute bottom-2.5 bg-white border border-black/[0.12] text-[#1A1A1A] text-[9px] px-1.5 py-0.5 rounded">{exp.meeting_point_name || "Meeting Point"}</span>
          </div>
          <div className="flex items-start gap-1.5">
            <span className="text-xs flex-shrink-0">🚌</span>
            <p className="text-[11px] text-[#666] leading-[1.5]">Hotel pickup available from Mansoura city center (+20 EGP). Select when booking. Download <span className="text-[#2BBFB3] underline">offline map</span> for areas with poor signal.</p>
          </div>
        </div>

        <Divider />

        {/* 3I GETTING THERE */}
        {regionTransport && regionTransport.length > 0 && (
          <>
            <div>
              <h2 className="text-sm font-semibold text-[#1A1A1A] mb-2">Getting there</h2>
              <div className="bg-[#E8F8F7] rounded-[10px] border border-[#5DCAA5] p-3">
                <p className="text-xs font-semibold text-[#085041] mb-2">Transport options in {regionName}</p>
                <div className="space-y-1.5">
                  {regionTransport.map((t) => {
                    const Icon = t.transport_type === "train" ? Train : Bus;
                    const name = lang === "ar" ? t.name_ar : t.name_en;
                    const from = lang === "ar" ? (t.from_ar || t.from_en) : t.from_en;
                    const to = lang === "ar" ? (t.to_ar || t.to_en) : t.to_en;
                    return (
                      <div key={t.id} className="flex items-center gap-2.5">
                        <div className="w-[26px] h-[26px] rounded-[7px] bg-[#2BBFB3] flex items-center justify-center flex-shrink-0">
                          <Icon className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-[11px] text-[#085041] leading-[1.4]">
                          {name}: {from} → {to} · {t.duration || "?"} · {t.price} EGP
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <Divider />
          </>
        )}

        {/* 3J REVIEWS */}
        <div ref={reviewsRef}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-[#1A1A1A]"><span className="text-[#BA7517]">★</span> {exp.rating || 0} · {exp.reviews_count || reviews.length} reviews</span>
            <button className="text-xs font-medium text-[#2BBFB3]">See all →</button>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            {reviews.slice(0, 4).map((r, i) => (
              <div key={i} className="border border-black/[0.08] rounded-[10px] p-2.5 bg-white">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[9px] font-medium text-[#085041]" style={{ backgroundColor: dbReviews?.[i]?.reviewer_avatar_bg || "#9FE1CB" }}>{r.initials}</div>
                  <div>
                    <p className="text-[11px] font-semibold text-[#1A1A1A]">{r.name}</p>
                    <p className="text-[10px] text-[#888]">{r.city}</p>
                  </div>
                </div>
                <StarRow count={r.rating} size={11} />
                <p className="text-[10px] text-[#666] leading-[1.45] mt-1 mb-1.5 line-clamp-3">{r.text}</p>
                {r.verified && (
                  <span className="inline-flex items-center gap-1 bg-[#EAF3DE] rounded-lg px-1.5 py-0.5">
                    <span className="w-[5px] h-[5px] rounded-full bg-[#27AE60]" />
                    <span className="text-[9px] font-medium text-[#27500A]">Verified attendee</span>
                  </span>
                )}
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
        {exp.verified && (
          <>
            <div className="flex gap-2.5 items-start border border-[#FAC775] rounded-[10px] p-3 bg-[#FAEEDA]">
              <div className="w-9 h-9 rounded-full bg-[#BA7517] flex items-center justify-center text-white text-base font-bold flex-shrink-0">✓</div>
              <div>
                <p className="text-xs font-semibold text-[#633806] mb-0.5">Ambassador verified experience</p>
                <p className="text-[10px] text-[#854F0B] leading-[1.5]">{hostName}'s listing was physically visited and verified by a local Ambassador. Location confirmed, safety checked, photos authenticated.</p>
              </div>
            </div>
            <Divider />
          </>
        )}

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
              {[{ n: String(hostShare), l: `EGP to ${hostName?.split(" ")[0] || "Host"}` }, { n: String(unitPrice - hostShare), l: "EGP to local fund" }, { n: String(exp.reviews_count || reviews.length), l: "Visitors this month" }].map((c, i) => (
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
        {relatedExps && relatedExps.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-[#1A1A1A] mb-2">More experiences in {regionName}</h2>
            <div className="flex gap-2.5 overflow-x-auto hide-scrollbar pb-1.5">
              {relatedExps.map((r) => {
                const rTitle = lang === "ar" ? r.title_ar : r.title_en;
                const hrs = r.duration_minutes ? `${Math.round(r.duration_minutes / 60)}h` : "";
                return (
                  <div key={r.id} className="flex-shrink-0 w-[138px] border border-black/[0.08] rounded-[10px] overflow-hidden bg-white">
                    <div className="h-[72px] bg-[#E8F8F7] overflow-hidden">
                      {r.image ? (
                        <img src={r.image} alt={rTitle} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-[#085041] font-medium px-2 text-center">{rTitle}</div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-[11px] font-semibold text-[#1A1A1A] leading-[1.3] mb-0.5 line-clamp-2">{rTitle}</p>
                      <p className="text-[10px] text-[#888] mb-1.5">{r.theme || ""} · {hrs} · {r.price} EGP · ★{r.rating}</p>
                      <button
                        onClick={() => navigate(`/experience/${r.slug || r.id}`)}
                        className="w-full h-7 rounded-md bg-[#2BBFB3] text-white text-[10px] font-semibold"
                      >
                        Book
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Description */}
        {description && (
          <>
            <div className="h-4" />
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
        <span className="text-xs text-[#085041] flex-1 min-w-0 truncate">Message {hostName?.split(" ")[0] || "Host"} · usually replies within 2h</span>
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
              <button onClick={() => setSheetGuests(Math.min(exp.capacity_max || 12, sheetGuests + 1))} className="w-[30px] h-[30px] rounded-full border border-black/[0.12] flex items-center justify-center"><Plus className="w-3.5 h-3.5" /></button>
            </div>
          </div>

          {/* slots grouped by date */}
          {sheetSlotGroups.map((group, gi) => (
            <div key={gi} className="px-4">
              <p className="text-sm font-bold text-[#1A1A1A] pt-2.5 pb-1.5">{group.label}</p>
              {group.slots.map((s) => (
                <button
                  key={s._idx}
                  onClick={() => setSheetSlot(s._idx)}
                  className={`w-full rounded-[10px] border p-3 mb-2 text-left transition-colors ${sheetSlot === s._idx ? "border-[#2BBFB3] bg-[#E8F8F7]" : "border-black/[0.08]"}`}
                >
                  <p className="text-sm font-semibold text-[#1A1A1A]">{s.time}</p>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-[#888]">{s.price} EGP / guest</span>
                    <span className={`text-xs ${s.low ? "text-[#A32D2D] font-medium" : "text-[#888]"}`}>{s.spots} spots available</span>
                  </div>
                </button>
              ))}
            </div>
          ))}

          {/* confirm */}
          <div className="px-4 pt-2">
            <button
              onClick={() => { setSheetOpen(false); navigate(`/booking?type=experience&id=${exp.id || id}`); }}
              className="w-full h-[46px] bg-[#2BBFB3] rounded-[10px] text-white text-sm font-bold"
            >
              Confirm — {(slots[sheetSlot]?.price || unitPrice) * sheetGuests + Math.round((slots[sheetSlot]?.price || unitPrice) * sheetGuests * 0.1)} EGP
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ExperienceDetail;
