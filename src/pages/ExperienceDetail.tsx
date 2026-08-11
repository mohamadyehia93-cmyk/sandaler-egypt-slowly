import { useState, useRef, useCallback, useMemo } from "react";
import WishlistButton from "@/components/WishlistButton";
import { ArrowLeft, Share2, MessageCircle, Bus, Train, Plus, Minus } from "lucide-react";
import MachineTranslatedNote from "@/components/MachineTranslatedNote";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";
import { useQuery } from "@tanstack/react-query";
import { fetchByIdOrSlug } from "@/lib/fetchByIdOrSlug";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import NotFoundView from "@/components/NotFound";
import { PROVIDER_PUBLIC_COLUMNS } from "@/lib/providerColumns";
import { mapsUrl } from "@/lib/cityCoords";

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

/**
 * INTEGRITY RULE for this page: every block below must be backed by a real column
 * on THIS row or a real query scoped to this row. No sample reviews, no invented
 * itinerary/policy/impact figures, no payment-protection claims (there is no
 * in-app payment processing — bookings are unpaid requests).
 */
const ExperienceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const ar = lang === "ar";
  const reviewsRef = useRef<HTMLDivElement>(null);

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
      const { data, error } = await supabase.from("providers").select(PROVIDER_PUBLIC_COLUMNS).eq("id", providerId).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!providerId,
  });

  // ── Fetch reviews for THIS experience only ──
  const expId = exp?.id;
  const { data: dbReviews } = useQuery({
    queryKey: ["experience-reviews", expId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("experience_reviews")
        .select("*")
        .eq("experience_id", expId)
        // Only reviews written by a real signed-in account. Seeded/sample rows
        // (user_id IS NULL) must never appear as social proof.
        .not("user_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data as any[];
    },
    enabled: !!expId,
  });

  // ── Fetch availability slots ──
  const { data: dbSlots } = useQuery({
    queryKey: ["experience-slots", expId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("experience_slots")
        .select("*")
        .eq("experience_id", expId)
        .gte("slot_date", new Date().toISOString().slice(0, 10))
        .order("slot_date", { ascending: true })
        .order("start_time", { ascending: true });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!expId,
  });

  // ── Fetch related experiences (same region) ──
  const { data: relatedExps } = useQuery({
    queryKey: ["related-experiences", exp?.region_id, expId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experiences")
        .select("id, slug, title_en, title_ar, price, rating, duration_minutes, theme, image")
        .eq("region_id", exp!.region_id)
        .neq("id", expId!)
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!exp?.region_id && !!expId,
  });

  // ── Transport that genuinely serves THIS listing's city ──
  const { data: cityTransport } = useQuery({
    queryKey: ["city-transport", exp?.city_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transport")
        .select("id, name_en, name_ar, from_en, from_ar, to_en, to_ar, price, duration, transport_type")
        .eq("city_id", exp!.city_id)
        .limit(4);
      if (error) throw error;
      return data;
    },
    enabled: !!exp?.city_id,
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
  const title = exp ? (ar ? exp.title_ar : exp.title_en) : "";
  const description = exp ? (ar ? (exp.description_ar || exp.description_en) : (exp.description_en || exp.description_ar)) : "";
  const hostName = provider
    ? (ar ? provider.name_ar : provider.name_en)
    : exp ? (ar ? (exp.host_name_ar || exp.host_name_en) : exp.host_name_en) : "";
  const regionName = region ? (ar ? region.name_ar : region.name_en) : "";

  // Real slots only — never a sample calendar.
  const slots = useMemo(() => {
    if (!dbSlots) return [];
    return dbSlots.map((s: any) => ({
      id: s.id,
      date: formatSlotDate(s.slot_date),
      time: `${formatTime(s.start_time)} – ${formatTime(s.end_time)}`,
      price: s.price,
      spots: s.spots_available,
      discounted: s.is_discounted,
      low: s.spots_available <= 3,
      rawDate: s.slot_date,
    }));
  }, [dbSlots]);

  // Real reviews only. The "verified attendee" badge is intentionally NOT rendered:
  // nothing in the schema proves the reviewer actually attended this experience.
  const reviews = useMemo(() => {
    if (!dbReviews) return [];
    return dbReviews.map((r: any) => ({
      initials: r.reviewer_initials || r.reviewer_name?.slice(0, 2)?.toUpperCase() || "??",
      name: r.reviewer_name,
      city: r.reviewer_city || "",
      rating: r.rating,
      text: r.review_text || "",
      bg: r.reviewer_avatar_bg || "#9FE1CB",
    }));
  }, [dbReviews]);

  const hostInitials = (provider?.name_en || exp?.host_name_en || "")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const hostSubtitle = provider
    ? [provider.city_en, provider.years_active ? `${provider.years_active} ${ar ? "سنوات خبرة" : "years active"}` : null]
        .filter(Boolean)
        .join(" · ")
    : "";

  // Only facts stored on the provider record.
  const hostCredentials = provider
    ? ([
        ar ? provider.bio_ar || provider.bio_en : provider.bio_en || provider.bio_ar,
        provider.languages ? t("experience.speaks", { languages: provider.languages }) : null,
        provider.specialties && Array.isArray(provider.specialties) && provider.specialties.length
          ? t("experience.specializes_in", { topics: (provider.specialties as any[]).map((s: any) => s.en || s).join(", ") })
          : null,
      ].filter(Boolean) as string[])
    : [];

  const unitPrice = slots[selectedSlot]?.price ?? exp?.price ?? 0;
  const subtotal = unitPrice * guests;

  const scrollToReviews = useCallback(() => {
    reviewsRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Tags come only from stored columns.
  const tags = useMemo(() => {
    if (!exp) return [];
    const result: { label: string }[] = [];
    if (exp.theme) result.push({ label: exp.theme });
    if (exp.meeting_point_name) result.push({ label: exp.meeting_point_name });
    if (exp.duration_minutes) {
      const hrs = Math.round(exp.duration_minutes / 60);
      result.push({ label: `${hrs} ${ar ? "ساعة" : hrs > 1 ? "hours" : "hour"}` });
    }
    if (exp.capacity_max) result.push({ label: `${ar ? "حتى" : "up to"} ${exp.capacity_max} ${ar ? "ضيوف" : "guests"}` });
    return result;
  }, [exp, ar]);

  const sheetSlotGroups = useMemo(() => {
    const groups: { label: string; slots: any[] }[] = [];
    slots.forEach((s, i) => {
      const last = groups[groups.length - 1];
      if (last && last.label === s.date) last.slots.push({ ...s, _idx: i });
      else groups.push({ label: s.date, slots: [{ ...s, _idx: i }] });
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

  if (!exp) return <NotFoundView context="experience" />;

  const photos = exp.images?.length ? exp.images : [exp.image || "/placeholder.svg"];
  const remarks = ar ? (exp as any).remarks_ar || (exp as any).remarks_en : (exp as any).remarks_en || (exp as any).remarks_ar;
  const hasRating = (exp.rating ?? 0) > 0 && reviews.length > 0;

  return (
    <div className="min-h-screen bg-background pb-[140px]">

      {/* ── TOP NAV ─────────────────────────────────────────────── */}
      <div className="h-11 flex items-center justify-between px-4 bg-card sticky top-0 z-40">
        <button onClick={() => navigate(-1)} className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <span className="text-xs text-muted-foreground font-normal truncate max-w-[55%]">
          {[regionName, t("experience.experiences_subtitle")].filter(Boolean).join(" · ")}
        </span>
        <div className="flex gap-2">
          <button className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center">
            <Share2 className="w-3.5 h-3.5 text-foreground" />
          </button>
          <WishlistButton
            itemType="experience"
            itemId={exp?.id}
            className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center transition-transform [&>svg]:w-3.5 [&>svg]:h-3.5"
          />
        </div>
      </div>

      {/* ── HERO PHOTO ──────────────────────────────────────────── */}
      <div className="relative h-[260px]">
        <img src={photos[0]} alt={title} className="w-full h-full object-cover" />
        {photos.length > 1 && (
          <span className="absolute bottom-2.5 right-2.5 bg-black/55 text-primary-foreground text-[11px] px-2 py-0.5 rounded-md">
            {t("experience.more_photos", { count: photos.length - 1 })}
          </span>
        )}
      </div>

      <div className="px-4">

        {/* ── TITLE + TAGS + (real) RATING ───────────────────────── */}
        <div className="pt-3.5">
          <h1 className="text-[17px] font-bold text-foreground leading-[1.35] mb-2">{title}</h1>
          <MachineTranslatedNote meta={(exp as any)?.translation_meta} field={ar ? "title_ar" : "title_en"} className="mb-1.5" />
          {tags.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto hide-scrollbar mb-2.5">
              {tags.map((tag, i) => (
                <span key={i} className="flex-shrink-0 px-2.5 py-[3px] rounded-full text-[10px] font-medium border bg-muted border-border text-muted-foreground">
                  {tag.label}
                </span>
              ))}
            </div>
          )}
          {hasRating && (
            <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
              <StarRow count={exp.rating || 0} />
              <span className="text-[13px] font-semibold text-foreground">{exp.rating}</span>
              <button onClick={scrollToReviews} className="text-xs text-primary underline">
                {t("experience.reviews_count", { count: reviews.length })}
              </button>
            </div>
          )}
        </div>

        {/* ── DESCRIPTION (the listing's own words, near the top) ── */}
        {description && (
          <>
            <Divider />
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-2">{t("experience.about_this_experience")}</h2>
              <p className="text-[13px] text-muted-foreground leading-relaxed whitespace-pre-line">{description}</p>
              <MachineTranslatedNote meta={(exp as any)?.translation_meta} field={ar ? "description_ar" : "description_en"} className="mt-1" />
            </div>
          </>
        )}

        {/* ── PRICE + GUESTS ─────────────────────────────────────── */}
        <Divider />
        <div>
          <div className="flex justify-between items-center py-3 border-y border-border">
            <div>
              <p className="text-[13px] font-semibold text-foreground">{t("experience.adults")}</p>
              <p className="text-[11px] text-muted-foreground">{unitPrice} {t("common.egp")} {t("common.per_person")}</p>
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
            <div className="flex justify-between">
              <span className="text-[13px] text-foreground">{guests} × {unitPrice} {t("common.egp")}</span>
              <span className="text-[13px] font-semibold text-foreground">{subtotal} {t("common.egp")}</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {ar
                ? "لا يتم الدفع داخل التطبيق — يُرسل طلبك إلى المضيف ليؤكد التوفر ويرتب الدفع."
                : "No payment is taken in the app — your request goes to the host, who confirms availability and arranges payment."}
            </p>
          </div>
        </div>

        {/* ── MEETING POINT ──────────────────────────────────────── */}
        {(exp.meeting_point_name || (exp.meeting_point_lat != null && exp.meeting_point_lng != null)) && (
          <>
            <Divider />
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-2">{t("experience.where_well_meet")}</h2>
              {exp.meeting_point_lat != null && exp.meeting_point_lng != null ? (
                <a
                  href={mapsUrl(Number(exp.meeting_point_lat), Number(exp.meeting_point_lng))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative block w-full h-[120px] bg-secondary rounded-[10px] border border-primary/40 flex items-center justify-center overflow-hidden"
                >
                  <span className="text-2xl">📍</span>
                  <span className="absolute bottom-2.5 bg-card border border-border text-primary-dark text-[9px] font-semibold px-1.5 py-0.5 rounded underline">
                    {exp.meeting_point_name || (ar ? "نقطة اللقاء" : "Meeting point")} · {ar ? "افتح في خرائط جوجل" : "Open in Google Maps"}
                  </span>
                </a>
              ) : (
                <p className="text-[13px] text-foreground">{exp.meeting_point_name}</p>
              )}
            </div>
          </>
        )}

        {/* ── REMARKS (host's own notes) ─────────────────────────── */}
        {remarks && (
          <>
            <Divider />
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-2">{ar ? "ملاحظات مهمة" : "Main Remarks"}</h2>
              <div className="bg-secondary border border-primary/40 rounded-[10px] p-3">
                <p className="text-xs text-foreground leading-[1.6] whitespace-pre-line">{remarks}</p>
              </div>
              <MachineTranslatedNote meta={(exp as any)?.translation_meta} field={ar ? "remarks_ar" : "remarks_en"} className="mt-1" />
            </div>
          </>
        )}

        {/* ── AVAILABILITY (real slots only) ─────────────────────── */}
        <Divider />
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-2">{t("experience.upcoming_availability")}</h2>
          {slots.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
              {slots.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSlot(i)}
                  className={`flex-shrink-0 w-[158px] rounded-[10px] p-2.5 border text-left transition-colors ${
                    selectedSlot === i ? "border-primary bg-secondary" : "border-border bg-card"
                  }`}
                >
                  <p className={`text-xs font-semibold ${selectedSlot === i ? "text-primary-dark" : "text-foreground"}`}>{s.date}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{s.time}</p>
                  <div className="flex justify-between items-center mt-1.5">
                    <span className="text-[11px] font-semibold text-primary">{s.price} {t("common.egp")}</span>
                    <span className={`text-[10px] ${s.low ? "text-destructive font-medium" : "text-muted-foreground"}`}>{s.spots} {t("experience.spots")}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              {ar
                ? "لم ينشر المضيف مواعيد بعد. راسله لتحديد موعد."
                : "The host hasn't published dates yet. Message them to agree a date."}
            </p>
          )}
        </div>

        {/* ── HOST ───────────────────────────────────────────────── */}
        {(hostName || provider) && (
          <>
            <Divider />
            <div>
              <div className="flex items-start gap-3 mb-2">
                {provider?.avatar ? (
                  <img src={provider.avatar} alt={hostName} className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[15px] font-semibold flex-shrink-0">
                    {hostInitials || "·"}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-foreground">{hostName}</p>
                  {hostSubtitle && <p className="text-[11px] text-muted-foreground">{hostSubtitle}</p>}
                </div>
              </div>
              {hostCredentials.length > 0 && (
                <div className="bg-muted rounded-lg p-2.5 mb-2 space-y-1">
                  {hostCredentials.map((c, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="w-[5px] h-[5px] rounded-full bg-primary mt-1 flex-shrink-0" />
                      <span className="text-[11px] text-muted-foreground">{c}</span>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => navigate(`/inbox?personId=${providerId || exp.provider_id || ""}&kind=provider`)}
                className="w-full h-10 rounded-lg border border-primary text-primary text-xs font-semibold"
              >
                {t("experience.message_host", { name: hostName?.split(" ")[0] || "" })}
              </button>
            </div>
          </>
        )}

        {/* ── REVIEWS (real or honest empty state) ───────────────── */}
        <Divider />
        <div ref={reviewsRef}>
          <h2 className="text-sm font-semibold text-foreground mb-2">
            {ar ? "التقييمات" : "Reviews"}
          </h2>
          {reviews.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {reviews.slice(0, 4).map((r, i) => (
                <div key={i} className="border border-border rounded-[10px] p-2.5 bg-card">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[9px] font-medium text-primary-dark" style={{ backgroundColor: r.bg }}>
                      {r.initials}
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-foreground">{r.name}</p>
                      {r.city && <p className="text-[10px] text-muted-foreground">{r.city}</p>}
                    </div>
                  </div>
                  <StarRow count={r.rating} size={11} />
                  {r.text && <p className="text-[10px] text-muted-foreground leading-[1.45] mt-1 line-clamp-3">{r.text}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">{ar ? "لا توجد تقييمات بعد." : "No reviews yet."}</p>
          )}
        </div>

        {/* ── GETTING THERE — only transport serving this city ───── */}
        {cityTransport && cityTransport.length > 0 && (
          <>
            <Divider />
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-2">{t("experience.getting_there")}</h2>
              <div className="bg-secondary rounded-[10px] border border-primary/40 p-3 space-y-1.5">
                {cityTransport.map((tr) => {
                  const Icon = tr.transport_type === "train" ? Train : Bus;
                  const name = ar ? tr.name_ar : tr.name_en;
                  const from = ar ? (tr.from_ar || tr.from_en) : tr.from_en;
                  const to = ar ? (tr.to_ar || tr.to_en) : tr.to_en;
                  return (
                    <div key={tr.id} className="flex items-center gap-2.5">
                      <div className="w-[26px] h-[26px] rounded-[7px] bg-primary flex items-center justify-center flex-shrink-0">
                        <Icon className="w-3 h-3 text-primary-foreground" />
                      </div>
                      <span className="text-[11px] text-primary-dark leading-[1.4]">
                        {name}{from && to ? `: ${from} → ${to}` : ""}{tr.duration ? ` · ${tr.duration}` : ""} · {tr.price} {t("common.egp")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ── MORE EXPERIENCES — last ────────────────────────────── */}
        {relatedExps && relatedExps.length > 0 && (
          <>
            <Divider />
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-2">
                {regionName ? t("experience.more_experiences_in", { region: regionName }) : (ar ? "تجارب أخرى" : "More experiences")}
              </h2>
              <div className="flex gap-2.5 overflow-x-auto hide-scrollbar pb-1.5">
                {relatedExps.map((r) => {
                  const rTitle = ar ? r.title_ar : r.title_en;
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
                        <p className="text-[10px] text-muted-foreground mb-1.5">
                          {[r.theme, hrs, `${r.price} ${t("common.egp")}`].filter(Boolean).join(" · ")}
                        </p>
                        <button
                          onClick={() => navigate(`/experience/${r.slug || r.id}`)}
                          className="w-full h-7 rounded-md bg-primary text-primary-foreground text-[10px] font-semibold"
                        >
                          {t("common.view")}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── MESSAGE BAR (in-app only) ───────────────────────────── */}
      <button
        onClick={() => navigate(`/inbox?personId=${providerId || exp.provider_id || ""}&kind=provider`)}
        className="fixed bottom-[80px] left-0 right-0 z-50 bg-secondary border-t border-primary/40 px-4 py-2.5 flex items-center gap-2.5 text-start"
      >
        <div className="w-[22px] h-[22px] rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <MessageCircle className="w-[11px] h-[11px] text-primary-foreground" />
        </div>
        <span className="text-xs text-primary-dark flex-1 min-w-0 truncate">
          {ar ? "راسل المضيف داخل التطبيق" : "Message the host in the app"}
        </span>
      </button>

      {/* ── STICKY BOOKING BAR ─────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-[0_-2px_12px_rgba(0,0,0,0.06)] px-4 py-3 pb-7 flex items-center justify-between">
        <div>
          <span className="text-xl font-bold text-primary">{unitPrice} {t("common.egp")}</span>
          <span className="text-[13px] text-muted-foreground"> {t("common.per_person")}</span>
        </div>
        <button
          onClick={() => (slots.length > 0 ? setSheetOpen(true) : navigate(`/booking?type=experience&id=${exp.id || id}`))}
          className="h-[46px] px-[26px] bg-primary rounded-[10px] text-primary-foreground text-sm font-bold"
        >
          {ar ? "اطلب الحجز" : "Request to book"}
        </button>
      </div>

      {/* ── BOOKING SHEET ──────────────────────────────────────── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-[20px] px-0 pb-8 pt-0 max-h-[85vh] overflow-y-auto">
          <div className="flex justify-center pt-2.5 pb-1">
            <div className="w-8 h-1 rounded-full bg-border" />
          </div>
          <SheetHeader className="px-4 pb-3">
            <SheetTitle className="text-base font-bold text-foreground">{t("experience.select_a_time")}</SheetTitle>
          </SheetHeader>

          <div className="px-4 pb-3 flex justify-between items-center border-b border-border">
            <p className="text-sm font-semibold text-foreground">
              {t(sheetGuests > 1 ? "experience.n_adults_other" : "experience.n_adults_one", { count: sheetGuests })}
            </p>
            <div className="flex items-center gap-3">
              <button onClick={() => setSheetGuests(Math.max(1, sheetGuests - 1))} className="w-[30px] h-[30px] rounded-full border border-border flex items-center justify-center"><Minus className="w-3.5 h-3.5" /></button>
              <span className="text-[15px] font-semibold w-5 text-center">{sheetGuests}</span>
              <button onClick={() => setSheetGuests(Math.min(exp.capacity_max || 12, sheetGuests + 1))} className="w-[30px] h-[30px] rounded-full border border-border flex items-center justify-center"><Plus className="w-3.5 h-3.5" /></button>
            </div>
          </div>

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
                    <span className="text-xs text-muted-foreground">{s.price} {t("common.egp")} {t("common.per_person")}</span>
                    <span className={`text-xs ${s.low ? "text-destructive font-medium" : "text-muted-foreground"}`}>{t("common.spots_available", { count: s.spots })}</span>
                  </div>
                </button>
              ))}
            </div>
          ))}

          <div className="px-4 pt-2">
            <button
              onClick={() => {
                setSheetOpen(false);
                const slotUuid = (slots[sheetSlot] as { id?: string } | undefined)?.id;
                const slotParam = slotUuid ? `&slot=${slotUuid}` : "";
                navigate(`/booking?type=experience&id=${exp.id || id}${slotParam}&guests=${sheetGuests}`);
              }}
              className="w-full h-[46px] bg-primary rounded-[10px] text-primary-foreground text-sm font-bold"
            >
              {ar ? "متابعة" : "Continue"} · {(slots[sheetSlot]?.price || unitPrice) * sheetGuests} {t("common.egp")}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ExperienceDetail;
