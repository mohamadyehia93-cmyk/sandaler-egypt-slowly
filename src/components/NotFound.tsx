import { useNavigate } from "react-router-dom";
import { Compass } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export type NotFoundContext =
  | "experience"
  | "trip"
  | "audio-tour"
  | "person"
  | "city"
  | "region"
  | "post"
  | "stay"
  | "product"
  | "cause"
  | "partner"
  | "organization"
  | "highlight"
  | "host"
  | "transport"
  | "culture-actor"
  | "generic";

const COPY: Record<NotFoundContext, { en: string; ar: string }> = {
  experience: { en: "Experience not found", ar: "التجربة غير موجودة" },
  trip: { en: "Trip not found", ar: "الرحلة غير موجودة" },
  "audio-tour": { en: "Audio tour not found", ar: "الجولة الصوتية غير موجودة" },
  person: { en: "Person not found", ar: "الشخص غير موجود" },
  city: { en: "City not found", ar: "المدينة غير موجودة" },
  region: { en: "Region not found", ar: "المنطقة غير موجودة" },
  post: { en: "Post not found", ar: "المنشور غير موجود" },
  stay: { en: "Stay not found", ar: "مكان الإقامة غير موجود" },
  product: { en: "Product not found", ar: "المنتج غير موجود" },
  cause: { en: "Cause not found", ar: "القضية غير موجودة" },
  partner: { en: "Partner not found", ar: "الشريك غير موجود" },
  organization: { en: "Organization not found", ar: "المنظمة غير موجودة" },
  highlight: { en: "Highlight not found", ar: "المعلم غير موجود" },
  host: { en: "Host not found", ar: "المضيف غير موجود" },
  transport: { en: "Transport option not found", ar: "وسيلة النقل غير موجودة" },
  "culture-actor": { en: "Culture actor not found", ar: "الفاعل الثقافي غير موجود" },
  generic: { en: "Page not found", ar: "الصفحة غير موجودة" },
};

interface NotFoundProps {
  context?: NotFoundContext;
  message?: string;
}

const NotFound = ({ context = "generic", message }: NotFoundProps) => {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const title = message ?? COPY[context][lang];
  const subtitle =
    lang === "ar"
      ? "ربما تم نقل المحتوى أو حذفه. عد إلى الاستكشاف."
      : "It may have moved or been removed. Head back to explore.";

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Compass className="w-10 h-10 text-primary" strokeWidth={1.5} />
        </div>
        <h2 className="text-lg font-bold text-foreground mb-2">{title}</h2>
        <p className="text-sm text-muted-foreground mb-6">{subtitle}</p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          {lang === "ar" ? "العودة إلى الاستكشاف" : "Return to Explore"}
        </button>
      </div>
    </div>
  );
};

export default NotFound;
