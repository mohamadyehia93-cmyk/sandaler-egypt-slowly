import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, CreditCard, Minus, Plus, Info, Check, MessageCircle, MapPin } from "lucide-react";
import MonthDatePicker from "@/components/listing/MonthDatePicker";
import { fmtNumber, formatClock, formatSlotDay } from "@/components/listing/format";
import { PROVIDER_PUBLIC_COLUMNS } from "@/lib/providerColumns";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";
import { useEffect, useRef, useState } from "react";
import { saveFormDraft, loadFormDraft, clearFormDraft } from "@/lib/formDraft";
import { useQuery } from "@tanstack/react-query";
import { fetchByIdOrSlug } from "@/lib/fetchByIdOrSlug";
import { Skeleton } from "@/components/ui/skeleton";
import NotFoundView from "@/components/NotFound";
import { useAuth } from "@/hooks/useAuth";
import { useBooking } from "@/hooks/useBooking";
import { supabase } from "@/integrations/supabase/client";


type BookingType = "experience" | "trip" | "stay" | "transport" | "product";

const tableMap: Record<BookingType, string> = {
  experience: "experiences",
  trip: "trips",
  stay: "accommodations",
  transport: "transport",
  product: "products",
};

const Booking = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { lang } = useLanguage();

  const type = (params.get("type") || "experience") as BookingType;
  const id = params.get("id") || "";
  const slotId = params.get("slot");

  const { user } = useAuth();
  const { startBookingCheckout, isProcessing, error: bookingError } = useBooking();

  const { data: item, isLoading } = useQuery({
    queryKey: ["booking-item", type, id],
    queryFn: () => fetchByIdOrSlug(tableMap[type], id),
    enabled: !!id,
  });

  // Real published slots for this experience — the Date field is driven by these,
  // never by a free-text picker that lets a request through with no usable date.
  const { data: slots } = useQuery({
    queryKey: ["booking-slots", item?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("experience_slots")
        .select("id, slot_date, start_time, end_time, price, spots_available")
        .eq("experience_id", item!.id)
        .gte("slot_date", new Date().toISOString().slice(0, 10))
        .order("slot_date", { ascending: true })
        .order("start_time", { ascending: true });
      if (error) throw error;
      return data as any[];
    },
    enabled: type === "experience" && !!item?.id,
  });

  // Host / organiser shown on the summary card (owner columns hold providers.id).
  const ownerCol = ({ experience: "provider_id", trip: "organizer_id", stay: "host_id", transport: "provider_id", product: "seller_id" } as Record<string, string>)[type];
  const ownerId: string | null = (item as any)?.[ownerCol] || null;
  const { data: owner } = useQuery({
    queryKey: ["provider", ownerId],
    queryFn: async () => {
      const { data } = await supabase.from("providers").select(PROVIDER_PUBLIC_COLUMNS).eq("id", ownerId!).maybeSingle();
      return data as any;
    },
    enabled: !!ownerId,
  });
  const { data: itemCity } = useQuery({
    queryKey: ["city-name", (item as any)?.city_id],
    queryFn: async () => {
      const { data } = await supabase.from("cities").select("name_en, name_ar").eq("id", (item as any).city_id).maybeSingle();
      return data;
    },
    enabled: !!(item as any)?.city_id,
  });

  const [guests, setGuests] = useState(Number(params.get("guests")) || 1);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState<string>(slotId || "");
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [step, setStep] = useState<"details" | "payment" | "confirmed">("details");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  /**
   * Sign-in rescue.
   *
   * The sign-in wall used to fire on the very last tap, and every field typed in
   * steps 1-2 (date, guests, name, phone, note) was thrown away — the person came
   * back to an empty form and usually gave up. So the whole request is written to
   * localStorage before we send them to sign in, and restored when they return.
   *
   * The key is deliberately tied to the listing, not to the account: the draft is
   * created while nobody is signed in, and has to survive the moment of signing
   * in. It is device-local, holds nothing private beyond what the person typed,
   * and is deleted as soon as the request is sent.
   */
  const bookingDraftKey = `booking:${type}:${id}`;
  const bookingDraftUser = "guest";
  type BookingDraft = {
    guests: number;
    selectedDate: string;
    selectedSlotId: string;
    contactName: string;
    contactPhone: string;
    note: string;
  };
  const saveBookingDraft = () =>
    saveFormDraft<BookingDraft>(
      bookingDraftKey,
      bookingDraftUser,
      { guests, selectedDate, selectedSlotId, contactName, contactPhone, note },
      1,
    );
  const clearBookingDraft = () => clearFormDraft(bookingDraftKey, bookingDraftUser);

  const restoredRef = useRef(false);
  useEffect(() => {
    if (restoredRef.current || !id) return;
    restoredRef.current = true;
    const draft = loadFormDraft<BookingDraft>(bookingDraftKey, bookingDraftUser);
    if (!draft) return;
    const d = draft.data;
    if (d.guests) setGuests(d.guests);
    if (d.selectedDate) setSelectedDate(d.selectedDate);
    if (d.selectedSlotId) setSelectedSlotId(d.selectedSlotId);
    if (d.contactName) setContactName(d.contactName);
    if (d.contactPhone) setContactPhone(d.contactPhone);
    if (d.note) setNote(d.note);
    // Put them back where they left off: one tap from sending.
    setStep("payment");
  }, [id, bookingDraftKey]);



  if (isLoading) return (
    <div className="min-h-screen bg-surface p-4 space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  );

  if (!item) return <NotFoundView context="generic" />;

  const itemTitle = (lang === "ar"
    ? (item.title_ar || item.name_ar || "")
    : (item.title_en || item.name_en || ""));
  const itemImage = item.image || "";
  const isStay = type === "stay";
  const isProduct = type === "product";
  const isExperience = type === "experience";
  const chosenSlot = (slots || []).find((s: any) => s.id === selectedSlotId);
  const unitPrice = chosenSlot?.price ?? item.price ?? item.price_per_night ?? 0;
  const nights = isStay ? 1 : 0;
  const quantity = isProduct ? guests : 1;
  const subtotal = isProduct ? unitPrice * quantity : isStay ? unitPrice * nights : unitPrice * guests;
  // Estimated only. No card is charged anywhere in this flow, so this is presented
  // as an estimate the host will confirm — never as a captured amount.
  const serviceFee = Math.round(subtotal * (isExperience ? 0.10 : 0.05));
  const total = subtotal + serviceFee;
  // There is no payment processor wired up, so there is NO paid path in the UI.
  // Every submission is an unpaid request. Do not re-enable this without real checkout.
  const paidPath = false;



  const priceLabel = isStay
    ? `${unitPrice} ${t("common.egp")} × ${nights} ${t("booking.nights")}`
    : isProduct
    ? `${unitPrice} ${t("common.egp")} × ${quantity}`
    : `${unitPrice} ${t("common.egp")} × ${guests} ${t("booking.guests_word")}`;

  const paymentMethods = [
    { id: "card", icon: CreditCard, label: t("booking.credit_debit_card") },
    { id: "wallet", emoji: "📱", label: t("booking.mobile_wallet") },
    { id: "cash", emoji: "💵", label: t("booking.pay_on_arrival") },
  ];

  const ar = lang === "ar";

  // reservation_requests.item_type vocabulary (differs from the route's `type` param)
  const requestItemType = ({
    trip: "trip",
    stay: "accommodation",
    transport: "transport",
    product: "product",
  } as Record<string, string>)[type] || "trip";


  const egp = t("common.egp");
  const n = (v: number) => fmtNumber(v, ar);
  const ownerName = owner ? (ar ? owner.name_ar || owner.name_en : owner.name_en) : null;
  const cityName = itemCity ? (ar ? itemCity.name_ar || itemCity.name_en : itemCity.name_en) : null;
  const it = item as any;
  const cancellation = (ar ? it.cancellation_policy_ar || it.cancellation_policy_en : it.cancellation_policy_en || it.cancellation_policy_ar) || null;
  const maxGuests = it.capacity_max || 10;
  const messageHost = ownerId ? () => navigate(`/inbox?personId=${ownerId}&kind=provider`) : undefined;
  const hostWord = type === "trip" ? (ar ? "المنظِّم" : "organiser") : ar ? "المضيف" : "host";
  const honestLine = ar
    ? "لا يتم الدفع داخل التطبيق. يؤكد المضيف التوفر ويرتب الدفع معك."
    : "No payment is taken in the app. The host confirms availability and arranges payment with you.";
  const inputCls = "w-full h-12 px-4 rounded-xl bg-background border border-border text-[15px] text-foreground placeholder:text-muted-foreground";

  const summaryCard = (
    <div className="rounded-2xl border border-border bg-card shadow-card p-3 flex gap-3">
      <div className="w-24 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
        {itemImage && <img src={itemImage} alt="" className="w-full h-full object-cover" />}
      </div>
      <div className="min-w-0 flex flex-col justify-center">
        <p className={`listing-h2 ${ar ? "lang-ar" : "lang-en"} !text-base leading-snug text-foreground line-clamp-2`}>{itemTitle}</p>
        {ownerName && <p className="text-[13px] text-muted-foreground">{ar ? `مع ${ownerName}` : `with ${ownerName}`}</p>}
        {cityName && <p className="text-[13px] text-muted-foreground flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {cityName}</p>}
      </div>
    </div>
  );

  // Same checks as before, now behind one button: a dated experience needs a slot
  // chosen first, then the existing auth gate + insert logic runs unchanged.
  const submit = async () => {
    if (isExperience && slots && slots.length > 0 && !selectedSlotId) {
      setRequestError(ar ? "يرجى اختيار موعد أولاً." : "Please choose a date first.");
      return;
    }
    setRequestError(null);
    if (!user) {
      // Keep everything they typed, then send them to sign in.
      saveBookingDraft();
      navigate(`/login?return=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    if (isExperience) {
      // Tries paid checkout when a slot is chosen and falls back silently to an
      // unpaid booking REQUEST. status/payment_status are forced server-side.
      const outcome = await startBookingCheckout(
        { experienceId: item.id, slotId: selectedSlotId || null, guests, totalAmountEgp: total, visitorEmail: user.email || "" },
        ar
      );
      if (outcome === "requested") {
        clearBookingDraft();
        setStep("confirmed");
      }
      return;
    }
    // Non-experience types have no in-app payment: persist a real
    // reservation request. owner_id and status are set server-side by
    // the reservation_requests_insert_integrity trigger.
    setSubmitting(true);
    const { error } = await supabase.from("reservation_requests").insert({
      item_type: requestItemType,
      item_id: item.id,
      requester_id: user.id,
      guests,
      start_date: selectedDate || null,
      contact_name: contactName.trim(),
      contact_phone: contactPhone.trim(),
      note: note.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      setRequestError(ar ? `تعذر إرسال الطلب: ${error.message}` : `Could not send the request: ${error.message}`);
      return;
    }
    clearBookingDraft();
    setStep("confirmed");
  };
  const submitDisabled =
    isProcessing || submitting || (isExperience ? paidPath && !paymentMethod : !contactName.trim() || contactPhone.trim().length < 8);
  const submitLabel = isProcessing || submitting ? (ar ? "جاري الإرسال..." : "Sending...") : ar ? "أرسل الطلب" : "Send request";

  if (step === "confirmed") {
    const steps = ar
      ? [`يراجع ${hostWord} طلبك`, "تصلك رسالة منه داخل التطبيق", "تتفقان على الدفع وتلتقيان"]
      : [`The ${hostWord} reviews your request`, "You get a message in the app", "You agree payment and meet"];
    return (
      <div className="min-h-screen bg-background px-4 pt-12 pb-24">
        <div className="max-w-[560px] mx-auto">
          <div className="w-20 h-20 rounded-full bg-primary/10 text-primary-dark flex items-center justify-center mx-auto">
            <Check className="w-10 h-10" strokeWidth={2.5} />
          </div>
          <h1 className={`listing-title ${ar ? "lang-ar" : "lang-en"} text-foreground text-3xl text-center mt-4`}>{ar ? "تم إرسال الطلب" : "Request sent"}</h1>
          <p className="text-center text-[15px] text-muted-foreground mt-2">
            {ar ? `التقدير ${n(total)} ${egp} — لم يتم دفع أي مبلغ.` : `Estimated ${n(total)} ${egp} — no payment has been taken.`}
          </p>
          <div className="mt-6">{summaryCard}</div>
          <h2 className={`listing-h2 ${ar ? "lang-ar" : "lang-en"} text-foreground mt-8 mb-3`}>{ar ? "ماذا يحدث بعد ذلك" : "What happens next"}</h2>
          <ol className="space-y-3">
            {steps.map((x, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center flex-shrink-0">{n(i + 1)}</span>
                <span className="text-[15px] text-foreground">{x}</span>
              </li>
            ))}
          </ol>
          <div className="flex flex-col sm:flex-row gap-2 mt-8">
            {messageHost && (
              <button type="button" onClick={messageHost} className="flex-1 h-12 rounded-xl border border-primary text-primary-dark font-bold inline-flex items-center justify-center gap-1.5">
                <MessageCircle className="w-4 h-4" /> {ar ? `راسل ${hostWord}` : `Message the ${hostWord}`}
              </button>
            )}
            <button type="button" onClick={() => navigate("/bookings")} className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-bold">
              {ar ? "عرض حجوزاتي" : "See my bookings"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28 lg:pb-12">
      <header className="flex items-center gap-2 px-4 py-3 max-w-[1040px] mx-auto">
        <button type="button" onClick={() => navigate(-1)} aria-label={ar ? "رجوع" : "Back"} className="tap-target rounded-full border border-border">
          <ArrowLeft className={`w-5 h-5 text-foreground ${ar ? "rotate-180" : ""}`} />
        </button>
        <h1 className={`listing-h2 ${ar ? "lang-ar" : "lang-en"} text-foreground`}>{ar ? "طلب حجز" : "Booking request"}</h1>
      </header>

      <div className="max-w-[1040px] mx-auto px-4 lg:flex lg:flex-row-reverse lg:gap-10 lg:items-start">
        <aside className="lg:w-[340px] lg:flex-shrink-0 lg:sticky lg:top-6 space-y-3">
          {summaryCard}
          <div className="hidden lg:block rounded-2xl border border-border bg-card p-4 text-[15px]">
            <div className="flex justify-between font-bold text-foreground"><span>{ar ? "الإجمالي التقديري" : "Estimated total"}</span><span>{n(total)} {egp}</span></div>
            <p className="mt-2 text-[13px] text-muted-foreground">{honestLine}</p>
          </div>
        </aside>

        <main className="flex-1 min-w-0 max-w-[680px]">
          <h2 className={`listing-h2 ${ar ? "lang-ar" : "lang-en"} text-foreground mt-6 mb-1`}>{ar ? "طلبك" : "Your request"}</h2>

          {!user && (
            <div className="mt-3 rounded-xl border border-border bg-muted/40 p-3 flex gap-2">
              <Info className="w-4 h-4 text-primary-dark mt-1 shrink-0" />
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                {ar
                  ? "ستحتاج إلى حساب لإرسال الطلب. أكمل بياناتك الآن — سنحفظ ما كتبته ونعيدك إلى هنا بعد تسجيل الدخول."
                  : "You'll need an account to send the request. Fill this in now — we'll keep what you typed and bring you back here after you sign in."}
              </p>
            </div>
          )}

          {/* Date */}
          {!isProduct && (
            <section className="py-5 border-b border-border">
              <p className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {t("booking.date_label")}</p>
              {isExperience ? (
                slots && slots.length > 0 ? (
                  <>
                    {chosenSlot && (
                      <p className="text-[15px] font-semibold text-foreground mb-3">
                        {formatSlotDay(chosenSlot.slot_date, ar, { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · {formatClock(chosenSlot.start_time, ar)}–{formatClock(chosenSlot.end_time, ar)}
                      </p>
                    )}
                    <MonthDatePicker
                      slots={slots}
                      selectedId={selectedSlotId || null}
                      onSelect={(sid) => {
                        setSelectedSlotId(sid);
                        const sl = slots.find((x: any) => x.id === sid);
                        setSelectedDate(sl?.slot_date || "");
                      }}
                      ar={ar}
                      currency={egp}
                    />
                  </>
                ) : (
                  <p className="p-3 rounded-xl bg-warning/10 border border-warning text-[13px] text-foreground">
                    {ar
                      ? "لم ينشر المضيف مواعيد متاحة بعد، لذلك لا يمكن إرسال طلب بموعد. راسل المضيف للاتفاق على موعد."
                      : "The host hasn't published any available dates yet, so a request cannot be dated. Message the host to agree a date."}
                  </p>
                )
              ) : (
                <input type="date" value={selectedDate} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setSelectedDate(e.target.value)} className={inputCls} aria-label={t("booking.date_label")} />
              )}
            </section>
          )}

          {/* Guests */}
          <section className="py-4 border-b border-border flex items-center justify-between">
            <span className="text-[15px] font-semibold text-foreground">{isProduct ? t("booking.quantity") : t("booking.guests")}</span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setGuests(Math.max(1, guests - 1))} aria-label={ar ? "تقليل" : "Decrease"} className="tap-target rounded-full border border-border"><Minus className="w-4 h-4" /></button>
              <span className="text-base font-semibold w-6 text-center" aria-live="polite">{n(guests)}</span>
              <button type="button" onClick={() => setGuests(Math.min(maxGuests, guests + 1))} aria-label={ar ? "زيادة" : "Increase"} className="tap-target rounded-full border border-border"><Plus className="w-4 h-4" /></button>
            </div>
          </section>

          {/* Price */}
          <section className="py-4 border-b border-border space-y-1.5 text-[15px]">
            <div className="flex justify-between"><span className="text-muted-foreground">{n(unitPrice)} {egp} × {n(isStay ? nights : isProduct ? quantity : guests)}</span><span>{n(subtotal)} {egp}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{t("booking.service_fee")} — {ar ? "تقديري، لم يُحصَّل" : "estimate, not charged"}</span><span>{n(serviceFee)} {egp}</span></div>
            <div className="flex justify-between font-bold text-foreground pt-1.5 border-t border-border"><span>{ar ? "الإجمالي التقديري" : "Estimated total"}</span><span>{n(total)} {egp}</span></div>
          </section>

          {cancellation && (
            <section className="py-4 border-b border-border">
              <p className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">{ar ? "سياسة الإلغاء" : "Cancellation"}</p>
              <p className="mt-1 text-[15px] text-foreground whitespace-pre-line">{cancellation}</p>
            </section>
          )}

          {/* Contact — only sent for request types that store it */}
          {!isExperience && (
            <section className="py-5 border-b border-border space-y-3">
              <p className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">{ar ? "بيانات التواصل" : "Your contact details"}</p>
              <input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder={ar ? "الاسم الكامل" : "Full name"} aria-label={ar ? "الاسم الكامل" : "Full name"} className={inputCls} />
              <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder={ar ? "رقم الهاتف" : "Phone number"} aria-label={ar ? "رقم الهاتف" : "Phone number"} className={inputCls} dir="ltr" type="tel" />
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder={ar ? `ملاحظة إلى ${hostWord} (اختياري)` : `Note to the ${hostWord} (optional)`} aria-label={ar ? "ملاحظة" : "Note"}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-[15px] text-foreground placeholder:text-muted-foreground resize-none" />
            </section>
          )}

          {/* Honest line */}
          <div className="mt-5 rounded-xl bg-primary/5 border border-primary/20 p-4 flex gap-3">
            <CreditCard className="w-5 h-5 text-primary-dark flex-shrink-0 mt-0.5" />
            <p className="text-[15px] leading-relaxed text-foreground">{honestLine}</p>
          </div>

          {(bookingError || requestError) && (
            <div role="alert" className="mt-4 p-3 rounded-xl bg-destructive/10 border border-destructive text-sm text-destructive">{bookingError || requestError}</div>
          )}

          <button type="button" onClick={submit} disabled={submitDisabled} className="hidden lg:flex mt-6 w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold items-center justify-center disabled:opacity-50">
            {submitLabel}
          </button>
        </main>
      </div>

      {/* Mobile bar: total + the one primary button */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 bg-card border-t border-border shadow-elevated pb-[env(safe-area-inset-bottom,0px)]">
        <div className="max-w-[680px] mx-auto px-4 py-2.5 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xl font-bold text-foreground leading-tight">{n(total)} {egp}</p>
            <p className="text-[13px] text-muted-foreground">{ar ? "تقديري · بدون دفع" : "Estimate · no payment"}</p>
          </div>
          <button type="button" onClick={submit} disabled={submitDisabled} className="h-12 px-6 rounded-xl bg-primary text-primary-foreground text-[15px] font-bold disabled:opacity-50">
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Booking;
