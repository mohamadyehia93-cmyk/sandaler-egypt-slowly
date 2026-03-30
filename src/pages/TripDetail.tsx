import { ArrowLeft, Heart, Share2, MapPin, Clock, Users, Calendar } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { trips, regions } from "@/lib/sampleData";
import DetailTestimonials from "@/components/DetailTestimonials";

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useI18n();

  const trip = trips.find((tr) => tr.id === id) || trips[0];
  const region = regions.find((r) => r.id === trip.regionId);

  const itinerary = [
    { en: "Pickup from Cairo meeting point", ar: "الالتقاء من نقطة التجمع بالقاهرة" },
    { en: "Drive to destination with scenic stops", ar: "القيادة إلى الوجهة مع توقفات ذات مناظر خلابة" },
    { en: "Guided tour of key landmarks", ar: "جولة مع مرشد في المعالم الرئيسية" },
    { en: "Traditional lunch at a local restaurant", ar: "غداء تقليدي في مطعم محلي" },
    { en: "Free time for exploration & shopping", ar: "وقت حر للاستكشاف والتسوق" },
    { en: "Return to Cairo", ar: "العودة إلى القاهرة" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Image */}
      <div className="relative">
        <img src={trip.image} alt={trip.title[lang]} className="w-full h-64 object-cover" />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 rounded-full bg-background/80 backdrop-blur-sm">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="p-2 rounded-full bg-background/80 backdrop-blur-sm">
            <Share2 className="w-5 h-5 text-foreground" />
          </button>
          <button className="p-2 rounded-full bg-background/80 backdrop-blur-sm">
            <Heart className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Title & Route */}
        <h1 className="text-xl font-bold text-foreground mb-1">{trip.title[lang]}</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-primary" /> {trip.route[lang]}</span>
          {region && (
            <span className="flex items-center gap-1">{region.emoji} {t(region.nameKey)}</span>
          )}
        </div>

        {/* Tags */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <span className="flex items-center gap-1 text-xs font-medium bg-secondary text-secondary-foreground px-2.5 py-1.5 rounded-full">
            <Clock className="w-3.5 h-3.5" /> {lang === "ar" ? "يوم كامل" : "Full Day"}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium bg-secondary text-secondary-foreground px-2.5 py-1.5 rounded-full">
            <Users className="w-3.5 h-3.5" /> {lang === "ar" ? "حتى ٢٠ شخص" : "Up to 20 guests"}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium bg-secondary text-secondary-foreground px-2.5 py-1.5 rounded-full">
            <Calendar className="w-3.5 h-3.5" /> {trip.date}
          </span>
        </div>

        {/* Description */}
        <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "عن الرحلة" : "About This Trip"}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {lang === "ar"
            ? "انضم إلينا في رحلة يوم كامل لاستكشاف أجمل المعالم والتجارب المحلية. تشمل الرحلة النقل والإرشاد والغداء."
            : "Join us for a full-day trip to explore the most beautiful landmarks and local experiences. The trip includes transportation, guided tours, and lunch."}
        </p>

        {/* Itinerary */}
        <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "برنامج الرحلة" : "Itinerary"}</h2>
        <div className="relative mb-6">
          {itinerary.map((step, i) => (
            <div key={i} className="flex gap-3 pb-4">
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">{i + 1}</div>
                {i < itinerary.length - 1 && <div className="w-0.5 flex-1 bg-primary/20 mt-1" />}
              </div>
              <p className="text-sm text-foreground pt-1">{step[lang]}</p>
            </div>
          ))}
        </div>

        {/* What's Included */}
        <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "ما يشمله السعر" : "What's Included"}</h2>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {[
            { icon: "🚐", text: lang === "ar" ? "نقل مكيف" : "AC Transport" },
            { icon: "🍽️", text: lang === "ar" ? "غداء تقليدي" : "Traditional Lunch" },
            { icon: "🗣️", text: lang === "ar" ? "مرشد محلي" : "Local Guide" },
            { icon: "📸", text: lang === "ar" ? "توقفات للتصوير" : "Photo Stops" },
            { icon: "💧", text: lang === "ar" ? "مياه ومشروبات" : "Water & Drinks" },
            { icon: "❌", text: lang === "ar" ? "إلغاء مجاني قبل ٤٨ ساعة" : "Free cancel 48h before" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-surface">
              <span className="text-base">{item.icon}</span>
              <span className="text-xs text-foreground">{item.text}</span>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <DetailTestimonials />
      </div>

      {/* Sticky Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 flex items-center justify-between z-50">
        <div>
          <span className="text-lg font-bold text-primary-dark">{trip.price} {t("common.egp")}</span>
          <span className="text-xs text-muted-foreground block">{lang === "ar" ? "للشخص" : "per person"}</span>
        </div>
        <button className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated">
          {t("common.book")}
        </button>
      </div>
    </div>
  );
};

export default TripDetail;
