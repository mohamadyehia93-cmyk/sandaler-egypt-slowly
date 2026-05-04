import { useState, useRef, useCallback, useMemo } from "react";
import { ArrowLeft, Share2, Heart, MessageCircle, MapPin, Bus, Train, ChevronRight, Plus, Minus, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { fetchByIdOrSlug } from "@/lib/fetchByIdOrSlug";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import NotFoundView from "@/components/NotFound";

/* ── static fallbacks ────────────────────────────────────────── */
const fallbackTags = [
  { label: "Nature", bg: "bg-secondary", border: "border-primary/40", text: "text-primary-dark" },
  { label: "Lake Manzala", bg: "bg-muted", border: "border-border", text: "text-muted-foreground" },
  { label: "4 hours", bg: "bg-muted", border: "border-border", text: "text-muted-foreground" },
  { label: "Women-friendly", bg: "bg-success/10", border: "border-success/40", text: "text-success" },
  { label: "Seasonal: Oct–Mar", bg: "bg-warning/10", border: "border-warning/40", text: "text-warning" },
];

const fallbackSteps = [
  { num: 1, title: "Board the traditional felucca", desc: "Meet Hassan at Manzala main dock. Life jackets provided. 30 min · Arabic + English", color: "bg-secondary" },
  { num: 2, title: "Spot migratory birds", desc: "Scan the lake for flamingos, herons and cormorants. Binoculars provided. 2 hrs", color: "bg-secondary" },
  { num: 3, title: "Local tea and stories", desc: "Wind down at a fisherman's café. Hassan shares Manzala's fishing heritage. 30 min", color: "bg-warning/30" },
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
      const { data, error } = await (supabase as any).from("experience_reviews").select("*").eq("experience_id", expId).order("created_at", { ascending: false }).limit(10);
      if (error) throw error;
      return data as any[];
    },
    enabled: !!expId,
  });

  // ── Fetch availability slots ──
  const { data: dbSlots } = useQuery({
    queryKey: ["experience-slots", expId],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("experience_slots").select("*").eq("experience_id", expId).order("slot_date", { ascending: true }).order("start_time", { ascending: true });
      if (error) throw error;
      return data as any[];
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
      const { data, error } = await (supabase as any).from("regions").select("name_en, name_ar").eq("id", exp!.region_id).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!exp?.region_id,
  });

  // ── Derived values ──
  const title = exp ? (lang === "ar" ? exp.title_ar : exp.title_en) : "";
  const description = exp ? (lang === "ar" ? (exp.description_ar || exp.description_en) : exp.description_en) : "";
  const hostName = provider
    ? (lang === "ar" ? provider.name_ar : provider.name_en)
    : exp ? (lang === "ar" ? (exp.host_name_ar || exp.host_name_en) : exp.host_name_en) : "";
  const regionName = region ? (lang === "ar" ? region.name_ar : region.name_en) : "Nile Delta";

  const slots = useMemo(() => {
    if (dbSlots && dbSlots.length > 0) {
      return dbSlots.map((s: any) => ({
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
      return dbReviews.map((r: any) => ({
        initials: r.reviewer_initials || r.reviewer_name?.slice(0, 2)?.toUpperCase() || "??",
        name: r.reviewer_name,
        city: r.reviewer_city || "",
        rating: r.rating,
        text: r.review_text || "",
        bg: `bg-[${r.reviewer_avatar_bg || "#9FE1CB"}]`,
        verified: r.verified_attendee,
      }));
    }
    return [
      { initials: "SH", name: "Sharif", city: "Cairo · solo", rating: 4, text: "Fun way to connect with nature and hear real local stories about the lake...", bg: "bg-secondary", verified: true },
      { initials: "NA", name: "Nadia", city: "Alexandria · family", rating: 5, text: "Hassan was incredibly patient with our kids. The flamingos were breathtaking...", bg: "bg-secondary", verified: true },
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
          ? `Specializes in: ${(provider.specialties as any[]).map((s: any) => s.en || s).join(", ")}`
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
    if (exp.theme) result.push({ label: exp.theme, bg: "bg-secondary", border: "border-primary/40", text: "text-primary-dark" });
    if (exp.meeting_point_name) result.push({ label: exp.meeting_point_name, bg: "bg-muted", border: "border-border", text: "text-muted-foreground" });
    if (exp.duration_minutes) {
      const hrs = Math.round(exp.duration_minutes / 60);
      result.push({ label: `${hrs} hour${hrs > 1 ? "s" : ""}`, bg: "bg-muted", border: "border-border", text: "text-muted-foreground" });
    }
    if (result.length === 0) return fallbackTags;
    return result;
  }, [exp]);

  // Group sheet slots by date for the bottom sheet
  const sheetSlotGroups = useMemo(() => {
    const groups: { label: string; slots: typeof slots }[] = [];
    slots.forEach((s, i) => {
      const dateLabel = s.date;
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.label === dateLabel) {
        lastGroup.slots.push({ ...s, _idx: i } as any);
      } else {
        groups.push({ label: dateLabel, slots: [{ ...s, _idx: i } as any] });
      }
    });
    return groups;
  }, [slots]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 space-y-4">
        <Skeleton className="h-56 w-full rounded-xl" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!exp) {
    return <NotFoundView context="experience" />;
  }

  const photos = exp.images?.length ? exp.images : [exp.image || "/placeholder.svg"];

  return (
    <div className="min-h-screen bg-background pb-[140px]">

      {/* ── 1. TOP NAV ─────────────────────────────────────────── */}
      <div className="h-11 flex items-center justify-between px-4 bg-card sticky top-0 z-40">
        <button onClick={() => navigate(-1)} className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <span className="text-xs text-muted-foreground font-normal">{regionName} · Experiences</span>
        <div className="flex gap-2">
          <button className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center">
            <Share2 className="w-3.5 h-3.5 text-foreground" />
          </button>
          <button
            onClick={() => setSaved(!saved)}
            className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center transition-transform"
            style={saved ? { transform: "scale(1.15)" } : {}}
          >
            <Heart className={`w-3.5 h-3.5 transition-colors ${saved ? "fill-primary text-primary" : "text-foreground"}`} />
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
              <span className="absolute bottom-1.5 right-1.5 bg-black/55 text-primary-foreground text-[11px] px-2 py-0.5 rounded-md">+{photos.length - 3} photos</span>
            )}
          </div>
        </div>
        {exp.verified && (
          <span className="absolute top-2.5 left-2.5 bg-secondary border border-primary/40 text-primary-dark text-[9px] font-medium px-2 py-0.5 rounded-full">✓ Ambassador verified</span>
        )}
      </div>

      {/* ── 3. CONTENT ─────────────────────────────────────────── */}
      <div className="px-4">

        {/* 3A TITLE + TAGS + RATING */}
        <div className="pt-3.5">
          <h1 className="text-[17px] font-bold text-foreground leading-[1.35] mb-2">{title}</h1>
          <div className="flex gap-1.5 overflow-x-auto hide-scrollbar mb-2.5">
            {tags.map((t, i) => (
              <span key={i} className={`flex-shrink-0 px-2.5 py-[3px] rounded-full text-[10px] font-medium border ${t.bg} ${t.border} ${t.text}`}>{t.label}</span>
            ))}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
            <StarRow count={exp.rating || 0} />
            <span className="text-[13px] font-semibold text-foreground">{exp.rating || 0}</span>
            <button onClick={scrollToReviews} className="text-xs text-primary underline">{exp.reviews_count || reviews.length} reviews</button>
            <span className="bg-success/10 border border-success/40 text-success text-[10px] font-medium px-2 py-0.5 rounded-full">{reviews.filter(r => r.verified).length} verified attendees</span>
          </div>

          {/* AI summary */}
          {reviews.length > 0 && (
            <div className="bg-secondary border-l-[3px] border-l-primary rounded-r-lg p-2.5 mb-2.5">
              <p className="text-[9px] font-medium text-primary mb-1">✦ AI summary of {exp.reviews_count || reviews.length} reviews</p>
              <p className="text-[11px] italic text-primary-dark leading-[1.55]">
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
              <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[15px] font-semibold flex-shrink-0">{hostInitials}</div>
            )}
            <div>
              <p className="text-sm font-semibold text-foreground">{hostName}</p>
              <p className="text-[11px] text-muted-foreground">{hostSubtitle}</p>
            </div>
          </div>
          <div className="bg-muted rounded-lg p-2.5 mb-2 space-y-1">
            {hostCredentials.map((c, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className="w-[5px] h-[5px] rounded-full bg-primary mt-1 flex-shrink-0" />
                <span className="text-[11px] text-muted-foreground">{c}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate(`/inbox?personId=${providerId || exp.provider_id || ""}&name=${encodeURIComponent(hostName || "")}`)}
            className="w-full h-10 rounded-lg border border-primary text-primary text-xs font-semibold mb-1.5"
          >
            Message {hostName?.split(" ")[0] || "Host"}
          </button>
          <div className="flex items-start gap-1.5">
            <span className="text-xs flex-shrink-0">🔒</span>
            <p className="text-[10px] text-muted-foreground leading-[1.5]">Always book and pay through Sandal to protect your experience. Support: +20 100 XXX XXXX</p>
          </div>
        </div>

        <Divider />

        {/* 3D REVENUE TRANSPARENCY */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-2">Where your money goes</h2>
          <div className="grid grid-cols-3 gap-2">
            {[{ n: String(hostShare), l: `EGP to ${hostName?.split(" ")[0] || "Host"}` }, { n: String(unitPrice - hostShare), l: "Platform fee" }, { n: "0", l: "To intermediary" }].map((c, i) => (
              <div key={i} className="border border-border rounded-lg p-2.5 text-center bg-card">
                <p className="text-xl font-bold text-primary">{c.n}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{c.l}</p>
              </div>
            ))}
          </div>
        </div>

        <Divider />

        {/* 3E WHAT YOU'LL DO — Timeline */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-2.5">What you'll do</h2>
          <div className="space-y-0">
            {fallbackSteps.map((s, i) => (
              <div key={s.num} className="flex gap-2.5 relative pb-2">
                {i < fallbackSteps.length - 1 && (
                  <div className="absolute left-[13px] top-[36px] w-[1.5px] bg-primary/30" style={{ height: "calc(100% - 8px)" }} />
                )}
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[11px] font-semibold flex-shrink-0 z-10">{s.num}</div>
                <div className={`w-12 h-12 rounded-lg ${s.color} flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground mb-0.5">{s.title}</p>
                  <p className="text-[11px] text-muted-foreground leading-[1.45]">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Divider />

        {/* 3F UPCOMING AVAILABILITY */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-2">Upcoming availability</h2>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {slots.map((s, i) => (
              <button
                key={i}
                onClick={() => setSelectedSlot(i)}
                className={`flex-shrink-0 w-[158px] rounded-[10px] p-2.5 border text-left transition-colors ${
                  selectedSlot === i ? "border-primary bg-secondary" : "border-border bg-card"
                }`}
              >
                <p className={`text-xs font-semibold ${selectedSlot === i ? "text-primary-dark" : "text-foreground"}`}>{s.date}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{s.time}</p>
                <div className="flex justify-between items-center mt-1.5">
                  <span className={`text-[11px] font-semibold ${s.discounted ? "text-warning" : "text-primary"}`}>{s.price} EGP</span>
                  <span className={`text-[10px] ${s.low ? "text-destructive font-medium" : "text-muted-foreground"}`}>{s.spots} spots</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <Divider />

        {/* 3G GUEST SELECTOR + PRICE BREAKDOWN */}
        <div>
          <div className="flex justify-between items-center py-3 border-y border-border">
            <div>
              <p className="text-[13px] font-semibold text-foreground">Adults</p>
              <button className="text-[11px] text-primary underline">+ Add children (half price)</button>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-[30px] h-[30px] rounded-full border border-border flex items-center justify-center">
                <Minus className="w-3.5 h-3.5 text-foreground" />
              </button>
              <span className="text-[15px] font-semibold text-foreground w-5 text-center">{guests}</span>
              <button onClick={() => setGuests(Math.min(exp.capacity_max || 12, guests + 1))} className="w-[30px] h-[30px] rounded-full border border-border flex items-center justify-center">
                <Plus className="w-3.5 h-3.5 text-foreground" />
              </button>
            </div>
          </div>
          <div className="py-2.5 space-y-1.5">
            <div className="flex justify-between"><span className="text-[13px] text-foreground">{guests} × {unitPrice} EGP</span><span className="text-[13px] text-foreground">{guests * unitPrice} EGP</span></div>
            <div className="flex justify-between"><span className="text-xs text-muted-foreground">Platform fee</span><span className="text-xs text-muted-foreground">{platformFee} EGP</span></div>
            <div className="flex justify-between"><span className="text-[11px] text-muted-foreground">Free cancellation until Dec 25</span><span className="text-xs font-medium text-success">✓</span></div>
            <div className="h-px bg-black/[0.06]" />
            <div className="flex justify-between"><span className="text-sm font-semibold text-foreground">Total</span><span className="text-sm font-semibold text-foreground">{total} EGP</span></div>
          </div>
        </div>

        <Divider />

        {/* 3H MEETING POINT MAP */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-2">Where we'll meet</h2>
          <div className="relative w-full h-[120px] bg-secondary rounded-[10px] border border-primary/40 mb-2 flex items-center justify-center overflow-hidden">
            <span className="text-2xl">📍</span>
            <span className="absolute bottom-2.5 bg-card border border-border text-foreground text-[9px] px-1.5 py-0.5 rounded">{exp.meeting_point_name || "Meeting Point"}</span>
          </div>
          <div className="flex items-start gap-1.5">
            <span className="text-xs flex-shrink-0">🚌</span>
            <p className="text-[11px] text-muted-foreground leading-[1.5]">Hotel pickup available from Mansoura city center (+20 EGP). Select when booking. Download <span className="text-primary underline">offline map</span> for areas with poor signal.</p>
          </div>
        </div>

        <Divider />

        {/* 3I GETTING THERE */}
        {regionTransport && regionTransport.length > 0 && (
          <>
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-2">Getting there</h2>
              <div className="bg-secondary rounded-[10px] border border-primary/40 p-3">
                <p className="text-xs font-semibold text-primary-dark mb-2">Transport options in {regionName}</p>
                <div className="space-y-1.5">
                  {regionTransport.map((t) => {
                    const Icon = t.transport_type === "train" ? Train : Bus;
                    const name = lang === "ar" ? t.name_ar : t.name_en;
                    const from = lang === "ar" ? (t.from_ar || t.from_en) : t.from_en;
                    const to = lang === "ar" ? (t.to_ar || t.to_en) : t.to_en;
                    return (
                      <div key={t.id} className="flex items-center gap-2.5">
                        <div className="w-[26px] h-[26px] rounded-[7px] bg-primary flex items-center justify-center flex-shrink-0">
                          <Icon className="w-3 h-3 text-primary-foreground" />
                        </div>
                        <span className="text-[11px] text-primary-dark leading-[1.4]">
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
            <span className="text-sm font-semibold text-foreground"><span className="text-warning">★</span> {exp.rating || 0} · {exp.reviews_count || reviews.length} reviews</span>
            <button className="text-xs font-medium text-primary">See all →</button>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            {reviews.slice(0, 4).map((r, i) => (
              <div key={i} className="border border-border rounded-[10px] p-2.5 bg-card">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[9px] font-medium text-primary-dark" style={{ backgroundColor: dbReviews?.[i]?.reviewer_avatar_bg || "#9FE1CB" }}>{r.initials}</div>
                  <div>
                    <p className="text-[11px] font-semibold text-foreground">{r.name}</p>
                    <p className="text-[10px] text-muted-foreground">{r.city}</p>
                  </div>
                </div>
                <StarRow count={r.rating} size={11} />
                <p className="text-[10px] text-muted-foreground leading-[1.45] mt-1 mb-1.5 line-clamp-3">{r.text}</p>
                {r.verified && (
                  <span className="inline-flex items-center gap-1 bg-success/10 rounded-lg px-1.5 py-0.5">
                    <span className="w-[5px] h-[5px] rounded-full bg-success" />
                    <span className="text-[9px] font-medium text-success">Verified attendee</span>
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <Divider />

        {/* 3K THINGS TO KNOW */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-2.5">Things to know</h2>
          <div className="grid grid-cols-2 gap-2">
            {thingsToKnow.map((t, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className="text-base mt-0.5 flex-shrink-0">{t.icon}</span>
                <div>
                  <p className="text-[11px] font-semibold text-foreground mb-0.5">{t.label}</p>
                  <p className="text-[10px] text-muted-foreground leading-[1.4]">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Divider />

        {/* 3L AMBASSADOR VETTING BADGE */}
        {exp.verified && (
          <>
            <div className="flex gap-2.5 items-start border border-warning/40 rounded-[10px] p-3 bg-warning/10">
              <div className="w-9 h-9 rounded-full bg-warning flex items-center justify-center text-primary-foreground text-base font-bold flex-shrink-0">✓</div>
              <div>
                <p className="text-xs font-semibold text-warning mb-0.5">Ambassador verified experience</p>
                <p className="text-[10px] text-warning leading-[1.5]">{hostName}'s listing was physically visited and verified by a local Ambassador. Location confirmed, safety checked, photos authenticated.</p>
              </div>
            </div>
            <Divider />
          </>
        )}

        {/* 3M SAFETY NOTE */}
        <div className="bg-muted rounded-lg p-2.5">
          <p className="text-[10px] text-muted-foreground leading-[1.55]">Always book and pay through Sandal to protect your experience. Sandal holds payment until after your visit is confirmed complete. Support: +20 100 XXX XXXX</p>
        </div>

        <Divider />

        {/* 3N IMPACT DASHBOARD */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-2">Your visit's impact</h2>
          <div className="bg-muted rounded-[10px] p-3">
            <div className="grid grid-cols-3 gap-2">
              {[{ n: String(hostShare), l: `EGP to ${hostName?.split(" ")[0] || "Host"}` }, { n: String(unitPrice - hostShare), l: "EGP to local fund" }, { n: String(exp.reviews_count || reviews.length), l: "Visitors this month" }].map((c, i) => (
                <div key={i} className="bg-card border border-border rounded-lg p-2.5 text-center">
                  <p className="text-lg font-bold text-primary">{c.n}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{c.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Divider />

        {/* 3O RELATED EXPERIENCES */}
        {relatedExps && relatedExps.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-2">More experiences in {regionName}</h2>
            <div className="flex gap-2.5 overflow-x-auto hide-scrollbar pb-1.5">
              {relatedExps.map((r) => {
                const rTitle = lang === "ar" ? r.title_ar : r.title_en;
                const hrs = r.duration_minutes ? `${Math.round(r.duration_minutes / 60)}h` : "";
                return (
                  <div key={r.id} className="flex-shrink-0 w-[138px] border border-border rounded-[10px] overflow-hidden bg-card">
                    <div className="h-[72px] bg-secondary overflow-hidden">
                      {r.image ? (
                        <img src={r.image} alt={rTitle} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-primary-dark font-medium px-2 text-center">{rTitle}</div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-[11px] font-semibold text-foreground leading-[1.3] mb-0.5 line-clamp-2">{rTitle}</p>
                      <p className="text-[10px] text-muted-foreground mb-1.5">{r.theme || ""} · {hrs} · {r.price} EGP · ★{r.rating}</p>
                      <button
                        onClick={() => navigate(`/experience/${r.slug || r.id}`)}
                        className="w-full h-7 rounded-md bg-primary text-primary-foreground text-[10px] font-semibold"
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
            <h2 className="text-sm font-semibold text-foreground mb-2">About This Experience</h2>
            <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">{description}</p>
          </>
        )}
      </div>

      {/* ── 4. PERSISTENT CHAT BAR ─────────────────────────────── */}
      <div className="fixed bottom-[80px] left-0 right-0 z-50 bg-secondary border-t border-primary/40 px-4 py-2.5 flex items-center gap-2.5">
        <div className="w-[22px] h-[22px] rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <MessageCircle className="w-[11px] h-[11px] text-primary-foreground" />
        </div>
        <span className="text-xs text-primary-dark flex-1 min-w-0 truncate">Message {hostName?.split(" ")[0] || "Host"} · usually replies within 2h</span>
        <a href="https://wa.me/" target="_blank" rel="noopener" className="bg-primary text-primary-foreground text-[9px] font-semibold px-2 py-0.5 rounded-[10px] flex-shrink-0">
          WhatsApp ↗
        </a>
      </div>

      {/* ── 5. STICKY BOTTOM BOOKING BAR ───────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-[0_-2px_12px_rgba(0,0,0,0.06)] px-4 py-3 pb-7 flex items-center justify-between">
        <div>
          <span className="text-xl font-bold text-primary">{unitPrice} EGP</span>
          <span className="text-[13px] text-muted-foreground"> /person</span>
          <p className="text-[11px] font-medium text-success">✓ Free cancellation</p>
        </div>
        <button onClick={() => setSheetOpen(true)} className="h-[46px] px-[26px] bg-primary rounded-[10px] text-primary-foreground text-sm font-bold">
          Book now
        </button>
      </div>

      {/* ── 6. BOOKING BOTTOM SHEET ────────────────────────────── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-[20px] px-0 pb-8 pt-0 max-h-[85vh] overflow-y-auto">
          <div className="flex justify-center pt-2.5 pb-1">
            <div className="w-8 h-1 rounded-full bg-border" />
          </div>
          <SheetHeader className="px-4 pb-3">
            <SheetTitle className="text-base font-bold text-foreground">Select a time</SheetTitle>
          </SheetHeader>

          {/* adults */}
          <div className="px-4 pb-3 flex justify-between items-center border-b border-border">
            <div>
              <p className="text-sm font-semibold text-foreground">{sheetGuests} adult{sheetGuests > 1 ? "s" : ""}</p>
              <button className="text-xs text-primary underline">Add children</button>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setSheetGuests(Math.max(1, sheetGuests - 1))} className="w-[30px] h-[30px] rounded-full border border-border flex items-center justify-center"><Minus className="w-3.5 h-3.5" /></button>
              <span className="text-[15px] font-semibold w-5 text-center">{sheetGuests}</span>
              <button onClick={() => setSheetGuests(Math.min(exp.capacity_max || 12, sheetGuests + 1))} className="w-[30px] h-[30px] rounded-full border border-border flex items-center justify-center"><Plus className="w-3.5 h-3.5" /></button>
            </div>
          </div>

          {/* slots grouped by date */}
          {sheetSlotGroups.map((group, gi) => (
            <div key={gi} className="px-4">
              <p className="text-sm font-bold text-foreground pt-2.5 pb-1.5">{group.label}</p>
              {group.slots.map((s: any) => (
                <button
                  key={s._idx}
                  onClick={() => setSheetSlot(s._idx)}
                  className={`w-full rounded-[10px] border p-3 mb-2 text-left transition-colors ${sheetSlot === s._idx ? "border-primary bg-secondary" : "border-border"}`}
                >
                  <p className="text-sm font-semibold text-foreground">{s.time}</p>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-muted-foreground">{s.price} EGP / guest</span>
                    <span className={`text-xs ${s.low ? "text-destructive font-medium" : "text-muted-foreground"}`}>{s.spots} spots available</span>
                  </div>
                </button>
              ))}
            </div>
          ))}

          {/* confirm */}
          <div className="px-4 pt-2">
            <button
              onClick={() => { setSheetOpen(false); navigate(`/booking?type=experience&id=${exp.id || id}`); }}
              className="w-full h-[46px] bg-primary rounded-[10px] text-primary-foreground text-sm font-bold"
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
