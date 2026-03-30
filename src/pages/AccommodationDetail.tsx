import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, MapPin, Users, Clock, DoorOpen, Heart, Check, ShoppingCart } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { accommodation, hosts } from "@/lib/sampleData";

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
        <button className="absolute top-4 right-4 p-2 rounded-full bg-background/80 backdrop-blur-sm">
          <Heart className="w-5 h-5 text-foreground" />
        </button>
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

        {/* Host */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface mb-5">
          <div className="w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center text-lg">🏠</div>
          <div>
            <p className="text-sm font-semibold text-foreground">{lang === "ar" ? "المضيف" : "Hosted by"} {place.host[lang]}</p>
            <p className="text-xs text-muted-foreground">{place.type[lang]} · {place.location[lang]}</p>
          </div>
        </div>

        {/* Description */}
        <h2 className="text-base font-bold text-primary-dark mb-2">{lang === "ar" ? "عن المكان" : "About This Place"}</h2>
        <p className="text-sm text-foreground leading-relaxed mb-5">{place.description[lang]}</p>

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
