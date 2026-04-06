import { ArrowLeft, Share2, MapPin, Star, Clock, Users, MessageCircle, ShieldCheck, Leaf, HandHeart, Headphones } from "lucide-react";
import WishlistButton from "@/components/WishlistButton";
import { useNavigate, useParams } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { fetchByIdOrSlug } from "@/lib/fetchByIdOrSlug";
import DetailTestimonials from "@/components/DetailTestimonials";
import ProviderBioCard from "@/components/ProviderBioCard";
import { Skeleton } from "@/components/ui/skeleton";

const ExperienceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useI18n();

  const { data: exp, isLoading } = useQuery({
    queryKey: ["experience", id],
    queryFn: () => fetchByIdOrSlug("experiences", id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 space-y-4">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!exp) return <div className="p-8 text-center text-muted-foreground">Not found</div>;

  const title = lang === "ar" ? exp.title_ar : exp.title_en;
  const description = lang === "ar" ? exp.description_ar : exp.description_en;
  const hostName = lang === "ar" ? exp.host_name_ar : exp.host_name_en;
  const durationLabel = exp.duration_minutes
    ? exp.duration_minutes >= 60
      ? `${Math.round(exp.duration_minutes / 60)} ${lang === "ar" ? "ساعات" : "hours"}`
      : `${exp.duration_minutes} ${lang === "ar" ? "دقيقة" : "min"}`
    : null;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Photo */}
      <div className="relative">
        <img src={exp.image || "/placeholder.svg"} alt={title} className="w-full h-64 object-cover" />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 rounded-full bg-background/80 backdrop-blur-sm">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="p-2 rounded-full bg-background/80 backdrop-blur-sm">
            <Share2 className="w-5 h-5 text-foreground" />
          </button>
          <WishlistButton />
        </div>
      </div>

      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-foreground mb-1">{title}</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
          {exp.rating > 0 && <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {exp.rating} ({exp.reviews_count})</span>}
          {exp.meeting_point_name && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {exp.meeting_point_name}</span>}
        </div>

        {/* Tags */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {durationLabel && (
            <span className="flex items-center gap-1 text-xs font-medium bg-secondary text-secondary-foreground px-2.5 py-1.5 rounded-full">
              <Clock className="w-3.5 h-3.5" /> {durationLabel}
            </span>
          )}
          {exp.capacity_max && (
            <span className="flex items-center gap-1 text-xs font-medium bg-secondary text-secondary-foreground px-2.5 py-1.5 rounded-full">
              <Users className="w-3.5 h-3.5" /> {lang === "ar" ? `حتى ${exp.capacity_max} ضيوف` : `Up to ${exp.capacity_max} guests`}
            </span>
          )}
          {exp.theme && (
            <span className="text-xs font-medium bg-secondary text-secondary-foreground px-2.5 py-1.5 rounded-full">
              {exp.theme}
            </span>
          )}
        </div>

        {/* Host */}
        {hostName && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface mb-6">
            {exp.host_image ? (
              <img src={exp.host_image} alt={hostName} className="w-12 h-12 rounded-full object-cover border-2 border-primary/20" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-lg">👤</div>
            )}
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{lang === "ar" ? "بإرشاد" : "Hosted by"} {hostName}</p>
              <p className="text-xs text-muted-foreground">{lang === "ar" ? "مرشد محلي معتمد" : "Verified local guide"}</p>
            </div>
          </div>
        )}

        {/* Description */}
        {description && (
          <>
            <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "عن التجربة" : "About This Experience"}</h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{description}</p>
          </>
        )}

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

        {/* Why Book */}
        <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "لماذا تحجز مع صندل؟" : "Why Book with Sandal?"}</h2>
        <div className="space-y-3 mb-6">
          {[
            { icon: ShieldCheck, title: { en: "Verified Local Hosts", ar: "مضيفون محليون موثقون" }, desc: { en: "Every host is personally vetted and trained.", ar: "كل مضيف يتم فحصه وتدريبه شخصياً." } },
            { icon: HandHeart, title: { en: "Community-First Impact", ar: "أثر مجتمعي أولاً" }, desc: { en: "80% of your booking goes directly to local communities.", ar: "٨٠٪ من حجزك يذهب مباشرة للمجتمعات المحلية." } },
            { icon: Leaf, title: { en: "Sustainable & Responsible", ar: "مستدام ومسؤول" }, desc: { en: "Low-footprint experiences designed to protect Egypt's heritage.", ar: "تجارب منخفضة الأثر مصممة لحماية تراث مصر." } },
            { icon: Headphones, title: { en: "24/7 Local Support", ar: "دعم محلي على مدار الساعة" }, desc: { en: "Our team is always available.", ar: "فريقنا متاح دائماً." } },
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

        {/* Provider Bio */}
        {exp.provider_id && <ProviderBioCard providerId={exp.provider_id} roleLabel={{ en: "Experience Host", ar: "مضيف التجربة" }} />}

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
