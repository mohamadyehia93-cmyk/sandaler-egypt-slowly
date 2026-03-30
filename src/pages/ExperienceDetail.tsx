import { ArrowLeft, Heart, Star, MapPin, Share2, Clock, Users, MessageCircle, ShieldCheck, Leaf, HandHeart, Headphones } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { experiences } from "@/lib/sampleData";
import DetailTestimonials from "@/components/DetailTestimonials";

const ExperienceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useI18n();

  const exp = experiences.find((e) => e.id === id) || experiences[0];

  const steps = [
    { en: "Meet at the village entrance", ar: "الالتقاء عند مدخل القرية" },
    { en: "Walk through the old town", ar: "المشي في المدينة القديمة" },
    { en: "Traditional lunch with a local family", ar: "غداء تقليدي مع عائلة محلية" },
    { en: "Visit the craft workshop", ar: "زيارة ورشة الحرف" },
    { en: "Sunset photo session", ar: "جلسة تصوير عند الغروب" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Photo Grid */}
      <div className="relative">
        <div className="grid grid-cols-2 gap-0.5 h-64">
          <img src={exp.image} alt="" className="w-full h-full object-cover col-span-2" />
        </div>
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
        {/* Title */}
        <h1 className="text-xl font-bold text-foreground mb-1">{exp.title[lang]}</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {exp.rating} ({exp.reviews})</span>
          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {exp.region[lang]}</span>
        </div>

        {/* Tags */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[{ icon: Clock, label: "3 hours" }, { icon: Users, label: "Up to 14 guests" }].map((tag, i) => (
            <span key={i} className="flex items-center gap-1 text-xs font-medium bg-secondary text-secondary-foreground px-2.5 py-1.5 rounded-full">
              <tag.icon className="w-3.5 h-3.5" /> {tag.label}
            </span>
          ))}
        </div>

        {/* Host */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-lg">👤</div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">{lang === "ar" ? "بإرشاد أحمد" : "Hosted by Ahmed"}</p>
            <p className="text-xs text-muted-foreground">{lang === "ar" ? "مرشد محلي · ٥ سنوات خبرة" : "Local guide · 5 years experience"}</p>
          </div>
          <button className="p-2 rounded-full bg-secondary">
            <MessageCircle className="w-4 h-4 text-secondary-foreground" />
          </button>
        </div>

        {/* What You'll Do */}
        <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "ماذا ستفعل" : "What You'll Do"}</h2>
        <div className="relative mb-6">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-3 pb-4">
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">{i + 1}</div>
                {i < steps.length - 1 && <div className="w-0.5 flex-1 bg-primary/20 mt-1" />}
              </div>
              <p className="text-sm text-foreground pt-1">{step[lang]}</p>
            </div>
          ))}
        </div>

        {/* Availability */}
        <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "المواعيد المتاحة" : "Upcoming Availability"}</h2>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6">
          {["Dec 26", "Dec 28", "Jan 2", "Jan 5"].map((d) => (
            <button key={d} className="min-w-[100px] py-3 px-4 rounded-lg border border-border bg-card text-center hover:border-primary transition-colors">
              <span className="text-xs text-muted-foreground block">{d}</span>
              <span className="text-[10px] text-accent block mt-0.5">14 spots</span>
            </button>
          ))}
        </div>

        {/* Things to Know */}
        <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "أشياء يجب معرفتها" : "Things to Know"}</h2>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {[
            { icon: "🎒", text: lang === "ar" ? "أحضر ماء ووجبة خفيفة" : "Bring water & snack" },
            { icon: "🏃", text: lang === "ar" ? "مستوى نشاط متوسط" : "Moderate activity" },
            { icon: "🗣️", text: lang === "ar" ? "عربي وإنجليزي" : "Arabic & English" },
            { icon: "❌", text: lang === "ar" ? "إلغاء مجاني قبل ٢٤ ساعة" : "Free cancel 24h before" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-surface">
              <span className="text-base">{item.icon}</span>
              <span className="text-xs text-foreground">{item.text}</span>
            </div>
          ))}
        </div>

        {/* Why Book with Sandal */}
        <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "لماذا تحجز مع صندل؟" : "Why Book with Sandal?"}</h2>
        <div className="space-y-3 mb-6">
          {[
            { icon: ShieldCheck, title: { en: "Verified Local Hosts", ar: "مضيفون محليون موثقون" }, desc: { en: "Every host is personally vetted and trained to ensure authentic, safe experiences.", ar: "كل مضيف يتم فحصه وتدريبه شخصياً لضمان تجارب أصيلة وآمنة." } },
            { icon: HandHeart, title: { en: "Community-First Impact", ar: "أثر مجتمعي أولاً" }, desc: { en: "80% of your booking goes directly to local communities and artisans.", ar: "٨٠٪ من حجزك يذهب مباشرة للمجتمعات المحلية والحرفيين." } },
            { icon: Leaf, title: { en: "Sustainable & Responsible", ar: "مستدام ومسؤول" }, desc: { en: "Low-footprint experiences designed to protect Egypt's heritage and nature.", ar: "تجارب منخفضة الأثر مصممة لحماية تراث مصر وطبيعتها." } },
            { icon: Headphones, title: { en: "24/7 Local Support", ar: "دعم محلي على مدار الساعة" }, desc: { en: "Our team is always available before, during, and after your experience.", ar: "فريقنا متاح دائماً قبل وأثناء وبعد تجربتك." } },
          ].map((item, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-xl bg-surface">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{item.title[lang]}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc[lang]}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <DetailTestimonials />
      </div>

      {/* Sticky Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 flex items-center justify-between z-50">
        <div>
          <span className="text-lg font-bold text-primary-dark">{exp.price} {t("common.egp")}</span>
          <span className="text-xs text-muted-foreground block">{lang === "ar" ? "للشخص" : "per person"}</span>
        </div>
        <button onClick={() => navigate(`/booking?type=experience&id=${exp.id}`)} className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated">
          {t("common.book")}
        </button>
      </div>
    </div>
  );
};

export default ExperienceDetail;
