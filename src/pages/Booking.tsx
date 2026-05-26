import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Users, CreditCard, ShieldCheck, CheckCircle2, Minus, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchByIdOrSlug } from "@/lib/fetchByIdOrSlug";
import { Skeleton } from "@/components/ui/skeleton";
import NotFoundView from "@/components/NotFound";
import { useAuth } from "@/hooks/useAuth";
import { useBooking } from "@/hooks/useBooking";

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

  const [guests, setGuests] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [step, setStep] = useState<"details" | "payment" | "confirmed">("details");

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
  const unitPrice = item.price ?? item.price_per_night ?? 0;
  const isStay = type === "stay";
  const isProduct = type === "product";
  const nights = isStay ? 2 : 0;
  const quantity = isProduct ? guests : 1;
  const subtotal = isProduct ? unitPrice * quantity : isStay ? unitPrice * nights : unitPrice * guests;
  // Experiences carry 10% platform fee (Ambassador verification + content production overhead);
  // stays/products/trips/transport are simpler transactions at 5%. The differential is intentional.
  const isExperience = type === "experience";
  const serviceFee = Math.round(subtotal * (isExperience ? 0.10 : 0.05));
  const total = subtotal + serviceFee;

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

  if (step === "confirmed") {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5">
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {t("booking.booking_confirmed_alt")}
        </h1>
        <p className="text-sm text-muted-foreground mb-2">{itemTitle}</p>
        <p className="text-lg font-bold text-primary mb-1">{total} {t("common.egp")}</p>
        <p className="text-xs text-muted-foreground mb-8">
          {t("booking.confirmation_message")}
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm"
        >
          {t("booking.back_to_home")}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-28">
      <header className="flex items-center gap-3 px-4 py-3 bg-background sticky top-0 z-40 border-b border-border">
        <button onClick={() => step === "payment" ? setStep("details") : navigate(-1)} className="p-1.5 rounded-full hover:bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">
          {step === "details" ? t("booking.booking_details_title") : t("booking.payment_title")}
        </h1>
      </header>

      {/* Progress Steps */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          {["details", "payment"].map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step === s ? "bg-primary text-primary-foreground" : i === 0 ? "bg-primary text-primary-foreground" : "bg-border text-muted-foreground"
              }`}>
                {i + 1}
              </div>
              <span className={`text-xs font-medium ${step === s ? "text-foreground" : "text-muted-foreground"}`}>
                {i === 0 ? t("booking.details_step") : t("booking.payment_step")}
              </span>
              {i === 0 && <div className="flex-1 h-0.5 bg-border mx-1" />}
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pt-3">
        {/* Item Summary Card */}
        <div className="flex gap-3 p-3 rounded-xl bg-card shadow-card border border-border mb-5">
          <img src={itemImage} alt={itemTitle} className="w-20 h-16 rounded-lg object-cover flex-shrink-0" />
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <p className="text-sm font-semibold text-foreground truncate">{itemTitle}</p>
            <span className="text-xs text-primary font-bold mt-0.5">{unitPrice} {t("common.egp")}{isStay ? t("common.per_night") : ""}</span>
          </div>
        </div>

        {step === "details" && (
          <>
            {/* Date Selection */}
            {!isProduct && (
              <div className="mb-4">
                <label className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  {t("booking.date_label")}
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full mt-2 p-3 rounded-xl bg-card border border-border text-sm text-foreground"
                />
              </div>
            )}

            {/* Guests / Quantity */}
            <div className="mb-5">
              <label className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                {isProduct ? t("booking.quantity") : t("booking.guests")}
              </label>
              <div className="flex items-center gap-4 mt-2 p-3 rounded-xl bg-card border border-border">
                <button
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center"
                >
                  <Minus className="w-4 h-4 text-foreground" />
                </button>
                <span className="text-lg font-bold text-foreground min-w-[2ch] text-center">{guests}</span>
                <button
                  onClick={() => setGuests(Math.min(10, guests + 1))}
                  className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 text-foreground" />
                </button>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="rounded-xl bg-card shadow-card border border-border p-4 mb-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                {t("booking.price_summary")}
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{priceLabel}</span>
                  <span className="text-foreground">{subtotal} {t("common.egp")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("booking.service_fee")}</span>
                  <span className="text-foreground">{serviceFee} {t("common.egp")}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between">
                  <span className="text-sm font-bold text-foreground">{t("booking.total")}</span>
                  <span className="text-base font-bold text-primary">{total} {t("common.egp")}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {step === "payment" && (
          <>
            {/* Payment Methods */}
            <h2 className="text-sm font-semibold text-foreground mb-3">
              {t("booking.select_payment_method")}
            </h2>
            <div className="space-y-2 mb-5">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-colors text-start ${
                    paymentMethod === method.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card"
                  }`}
                >
                  {method.emoji ? (
                    <span className="text-xl">{method.emoji}</span>
                  ) : method.icon ? (
                    <method.icon className="w-5 h-5 text-muted-foreground" />
                  ) : null}
                  <span className="text-sm font-medium text-foreground">{method.label}</span>
                  {paymentMethod === method.id && (
                    <CheckCircle2 className="w-4 h-4 text-primary ms-auto" />
                  )}
                </button>
              ))}
            </div>

            {/* Card Form (if card selected) */}
            {paymentMethod === "card" && (
              <div className="space-y-3 mb-5">
                <input
                  placeholder={t("booking.card_number")}
                  className="w-full p-3 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground"
                />
                <div className="flex gap-3">
                  <input
                    placeholder="MM/YY"
                    className="flex-1 p-3 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground"
                  />
                  <input
                    placeholder="CVV"
                    className="w-24 p-3 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <input
                  placeholder={t("booking.name_on_card")}
                  className="w-full p-3 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground"
                />
              </div>
            )}

            {/* Order Summary */}
            <div className="rounded-xl bg-card shadow-card border border-border p-4 mb-5">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">{itemTitle}</span>
                <span className="text-sm text-foreground">{subtotal} {t("common.egp")}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">{t("booking.service_fee")}</span>
                <span className="text-sm text-foreground">{serviceFee} {t("common.egp")}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="text-sm font-bold text-foreground">{t("booking.total")}</span>
                <span className="text-base font-bold text-primary">{total} {t("common.egp")}</span>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-surface border border-border mb-5">
              <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
              <p className="text-[10px] text-muted-foreground">
                {t("booking.secure_notice")}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Inline checkout notices (experience flow only) */}
      {isExperience && !slotId && step === "payment" && (
        <div className="mx-4 mb-3 p-3 rounded-lg bg-warning/10 border border-warning text-sm">
          {t("booking.slot_required_warning")}
        </div>
      )}
      {bookingError && (
        <div className="mx-4 mb-3 p-3 rounded-lg bg-destructive/10 border border-destructive text-sm text-destructive">
          {bookingError}
        </div>
      )}

      {/* Sticky Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 flex items-center justify-between z-50">
        <div>
          <span className="text-lg font-bold text-foreground">{total} {t("common.egp")}</span>
          <span className="text-xs text-muted-foreground block">{t("booking.total_label")}</span>
        </div>
        {step === "details" ? (
          <button
            onClick={() => setStep("payment")}
            className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated"
          >
            {t("booking.continue_to_payment")}
          </button>
        ) : (
          <button
            onClick={async () => {
              if (isExperience) {
                if (!user) {
                  navigate(`/login?return=${encodeURIComponent(window.location.pathname + window.location.search)}`);
                  return;
                }
                if (!slotId) return; // Surfaced inline above; no-op so user can read the notice
                await startBookingCheckout({
                  experienceId: id,
                  slotId,
                  guests,
                  totalAmountEgp: total,
                  visitorEmail: user.email || "",
                });
                // On success the browser redirects to Stripe. On failure bookingError is set.
              } else {
                // TODO(Sprint 3): wire stays/products/trips/transport to Stripe (or Fawry/Paymob per type)
                setStep("confirmed");
              }
            }}
            disabled={!paymentMethod || isProcessing || (isExperience && !slotId)}
            className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated disabled:opacity-50"
          >
            {isProcessing ? t("booking.processing") : t("booking.pay_now")}
          </button>
        )}
      </div>
    </div>
  );
};

export default Booking;
