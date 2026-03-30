import { ArrowLeft, Heart, Share2, Headphones, Play, Pause, Download, MapPin, Clock, Navigation, Wifi, WifiOff } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { audioTours, regions } from "@/lib/sampleData";
import DetailTestimonials from "@/components/DetailTestimonials";
import TourStopsMap from "@/components/TourStopsMap";

const AudioTourDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useI18n();
  const [isPlaying, setIsPlaying] = useState(false);

  const tour = audioTours.find((a) => a.id === id) || audioTours[0];
  const region = regions.find((r) => r.id === tour.regionId);

  const stops = [
    { en: "Starting point — Welcome & introduction", ar: "نقطة البداية — ترحيب ومقدمة" },
    { en: "Historical landmark — Stories from the past", ar: "معلم تاريخي — قصص من الماضي" },
    { en: "Local market — Sounds and flavors", ar: "السوق المحلي — أصوات ونكهات" },
    { en: "Hidden alley — Architecture spotlight", ar: "زقاق مخفي — تسليط الضوء على العمارة" },
    { en: "Waterfront — Nature and reflections", ar: "الواجهة البحرية — طبيعة وتأملات" },
    { en: "Cultural center — Art & community", ar: "مركز ثقافي — فن ومجتمع" },
    { en: "Scenic viewpoint — Panoramic view", ar: "نقطة مشاهدة — منظر بانورامي" },
    { en: "Final stop — Summary & farewell", ar: "المحطة الأخيرة — ملخص ووداع" },
  ].slice(0, tour.stops);

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Hero */}
      <div className="relative">
        <img src={tour.image} alt={tour.title[lang]} className="w-full h-64 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
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
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="bg-primary/90 text-primary-foreground px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
              <Headphones className="w-3 h-3" />
              {t("common.audioTour")}
            </span>
          </div>
          <h1 className="text-xl font-bold text-white">{tour.title[lang]}</h1>
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Meta tags */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-primary" /> {tour.region[lang]}</span>
          {region && <span>{region.emoji} {t(region.nameKey)}</span>}
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          <span className="flex items-center gap-1 text-xs font-medium bg-secondary text-secondary-foreground px-2.5 py-1.5 rounded-full">
            <Clock className="w-3.5 h-3.5" /> {tour.duration} {t("common.min")}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium bg-secondary text-secondary-foreground px-2.5 py-1.5 rounded-full">
            <Navigation className="w-3.5 h-3.5" /> {tour.stops} {t("common.stops")}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium bg-secondary text-secondary-foreground px-2.5 py-1.5 rounded-full">
            <WifiOff className="w-3.5 h-3.5" /> {lang === "ar" ? "متاح بدون إنترنت" : "Offline available"}
          </span>
        </div>

        {/* Audio Player Preview */}
        <div className="bg-surface rounded-xl p-4 mb-6 border border-border">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-elevated"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{lang === "ar" ? "استمع للجولة" : "Listen to Tour"}</p>
              <p className="text-xs text-muted-foreground">{tour.duration} {t("common.min")} · {tour.stops} {t("common.stops")}</p>
            </div>
            <button className="p-2 rounded-full bg-secondary">
              <Download className="w-4 h-4 text-secondary-foreground" />
            </button>
          </div>
          <div className="w-full bg-border rounded-full h-1.5">
            <div className="bg-primary h-1.5 rounded-full" style={{ width: isPlaying ? "15%" : "0%" }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-muted-foreground">{isPlaying ? "0:45" : "0:00"}</span>
            <span className="text-[10px] text-muted-foreground">{tour.duration}:00</span>
          </div>
        </div>

        {/* About */}
        <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "عن الجولة" : "About This Tour"}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {lang === "ar"
            ? "جولة صوتية ذاتية تأخذك عبر أجمل المعالم والقصص المحلية. استمع وأنت تمشي، واكتشف الأماكن المخفية والحكايات التي لا يعرفها إلا أهل المنطقة."
            : "A self-guided audio tour that takes you through the most beautiful landmarks and local stories. Listen as you walk, discovering hidden spots and tales known only to locals."}
        </p>

        {/* Narrator */}
        <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "الراوي" : "Narrator"}</h2>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-lg">🎙️</div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">{lang === "ar" ? "ياسمين حسين" : "Yasmine Hussein"}</p>
            <p className="text-xs text-muted-foreground">{lang === "ar" ? "راوية محلية · مؤرخة" : "Local narrator · Historian"}</p>
          </div>
        </div>

        {/* Tour Stops */}
        <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "محطات الجولة" : "Tour Stops"}</h2>
        <div className="relative mb-6">
          {stops.map((stop, i) => (
            <div key={i} className="flex gap-3 pb-4">
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">{i + 1}</div>
                {i < stops.length - 1 && <div className="w-0.5 flex-1 bg-primary/20 mt-1" />}
              </div>
              <p className="text-sm text-foreground pt-1">{stop[lang]}</p>
            </div>
          ))}
        </div>

        {/* Tips */}
        <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "نصائح" : "Tips"}</h2>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {[
            { icon: "🎧", text: lang === "ar" ? "أحضر سماعات" : "Bring headphones" },
            { icon: "👟", text: lang === "ar" ? "ارتدِ حذاء مريح" : "Wear comfy shoes" },
            { icon: "📱", text: lang === "ar" ? "حمّل مسبقاً" : "Download in advance" },
            { icon: "🧴", text: lang === "ar" ? "أحضر واقي شمس" : "Bring sunscreen" },
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
          <span className="text-lg font-bold text-primary-dark">
            {tour.price === 0 ? t("common.free") : `${tour.price} ${t("common.egp")}`}
          </span>
          <span className="text-xs text-muted-foreground block">{t("common.audioTour")}</span>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-3 rounded-xl bg-secondary text-secondary-foreground font-bold text-sm">
            <Download className="w-4 h-4 inline mr-1" />
            {lang === "ar" ? "تحميل" : "Download"}
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated"
          >
            <Play className="w-4 h-4 inline mr-1" />
            {lang === "ar" ? "استمع" : "Listen"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioTourDetail;
