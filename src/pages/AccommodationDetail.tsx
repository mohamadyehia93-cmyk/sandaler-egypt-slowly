import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, MapPin, Users, Clock, DoorOpen, Heart, Check, ShoppingCart, CalendarCheck } from "lucide-react";
import WishlistButton from "@/components/WishlistButton";
import { useI18n } from "@/lib/i18n";
import { accommodation, hosts } from "@/lib/sampleData";
import { accommodationToProvider } from "@/lib/providerMappings";
import ProviderBioCard from "@/components/ProviderBioCard";
import DetailTestimonials from "@/components/DetailTestimonials";

const AccommodationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useI18n();

  const place = accommodation.find((a) => a.id === id);
  if (!place) return <div className="p-8 text-center text-muted-foreground">Not found</div>;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero */}
      <div className="relative h-64">
        <img src={place.image} alt={place.title[lang]} className="w-full h-full object-cover" />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 rounded-full bg-background/80 backdrop-blur-sm">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <WishlistButton />
        <div className="absolute bottom-3 left-4">
          <span className="bg-primary/90 text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full">
            {place.type[lang]}
          </span>
        </div>
      </div>

      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-foreground mb-1">{place.title[lang]}</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {place.location[lang]}</span>
          <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {place.rating} ({place.reviews})</span>
        </div>

        {/* Quick Info */}
        <div className="flex gap-2 mb-5 flex-wrap">
          <span className="flex items-center gap-1 text-xs font-medium bg-secondary text-secondary-foreground px-2.5 py-1.5 rounded-full">
            <Users className="w-3.5 h-3.5" /> {lang === "ar" ? `حتى ${place.maxGuests} ضيوف` : `Up to ${place.maxGuests} guests`}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium bg-secondary text-secondary-foreground px-2.5 py-1.5 rounded-full">
            <DoorOpen className="w-3.5 h-3.5" /> {lang === "ar" ? "تسجيل الدخول" : "Check-in"} {place.checkIn}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium bg-secondary text-secondary-foreground px-2.5 py-1.5 rounded-full">
            <Clock className="w-3.5 h-3.5" /> {lang === "ar" ? "المغادرة" : "Check-out"} {place.checkOut}
          </span>
        </div>

        {/* Host Bio */}
        <ProviderBioCard providerId={accommodationToProvider[place.id]} roleLabel={{ en: "Your Host", ar: "مضيفك" }} />

        {/* Description */}
        <h2 className="text-base font-bold text-primary-dark mb-2 mt-6">{lang === "ar" ? "عن المكان" : "About This Place"}</h2>
        <p className="text-sm text-foreground leading-relaxed mb-5">{place.description[lang]}</p>

        {/* Availability */}
        <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "التوافر" : "Availability"}</h2>
        <div className="grid grid-cols-2 gap-2 mb-5">
          {(() => {
            // Generate deterministic availability based on listing id
            const seed = place.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
            const statuses: ("available" | "limited" | "booked")[] = ["available", "limited", "booked"];
            const slots = [
              { label: { en: "Today", ar: "اليوم" } },
              { label: { en: "Tomorrow", ar: "غداً" } },
              { label: { en: "This Weekend", ar: "نهاية الأسبوع" } },
              { label: { en: "Next Week", ar: "الأسبوع القادم" } },
              { label: { en: "In 2 Weeks", ar: "بعد أسبوعين" } },
              { label: { en: "Next Month", ar: "الشهر القادم" } },
            ];
            return slots.map((slot, i) => {
              const status = statuses[(seed + i * 7) % 3];
              const colorClass = status === "available" ? "text-green-500" : status === "limited" ? "text-amber-500" : "text-red-400";
              const textColorClass = status === "available" ? "text-green-600" : status === "limited" ? "text-amber-600" : "text-red-500";
              const statusLabel = status === "available"
                ? (lang === "ar" ? "متاح" : "Available")
                : status === "limited"
                ? (lang === "ar" ? "محدود" : "Limited")
                : (lang === "ar" ? "محجوز" : "Booked");
              return (
                <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-surface border border-border">
                  <CalendarCheck className={`w-3.5 h-3.5 flex-shrink-0 ${colorClass}`} />
                  <div>
                    <span className="text-xs font-medium text-foreground block">{slot.label[lang]}</span>
                    <span className={`text-[10px] font-medium ${textColorClass}`}>{statusLabel}</span>
                  </div>
                </div>
              );
            });
          })()}
        </div>

        {/* Amenities */}
        <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "المرافق والخدمات" : "What's Included"}</h2>
        <div className="grid grid-cols-2 gap-2 mb-5">
          {place.amenities[lang].map((a, i) => (
            <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-surface">
              <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="text-xs text-foreground">{a}</span>
            </div>
          ))}
        </div>

        {/* House Rules */}
        <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "قواعد المكان" : "House Rules"}</h2>
        <div className="space-y-2 mb-6">
          {[
            { icon: "🕐", text: lang === "ar" ? `تسجيل الدخول: ${place.checkIn}` : `Check-in: ${place.checkIn}` },
            { icon: "🕛", text: lang === "ar" ? `المغادرة: ${place.checkOut}` : `Check-out: ${place.checkOut}` },
            { icon: "🚭", text: lang === "ar" ? "ممنوع التدخين داخلياً" : "No smoking indoors" },
            { icon: "❌", text: lang === "ar" ? "إلغاء مجاني قبل ٤٨ ساعة" : "Free cancellation 48h before" },
          ].map((r, i) => (
            <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-surface">
              <span className="text-base">{r.icon}</span>
              <span className="text-xs text-foreground">{r.text}</span>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <DetailTestimonials />
      </div>

      {/* Sticky Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 flex items-center justify-between z-50">
        <div>
          <span className="text-lg font-bold text-primary-dark">{place.price} {t("common.egp")}</span>
          <span className="text-xs text-muted-foreground block">{t("common.perNight")}</span>
        </div>
        <button onClick={() => navigate(`/booking?type=stay&id=${place.id}`)} className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated">
          {t("common.book")}
        </button>
      </div>
    </div>
  );
};

export default AccommodationDetail;
