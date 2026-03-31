import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, MapPin, Route, Lightbulb, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { transport } from "@/lib/sampleData";
import WishlistButton from "@/components/WishlistButton";

const TransportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useI18n();

  const item = transport.find((tr) => tr.id === id);
  if (!item) return <div className="p-8 text-center text-muted-foreground">Not found</div>;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 bg-background sticky top-0 z-40 border-b border-border">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">{item.title[lang]}</h1>
      </header>

      {/* Icon Hero */}
      <div className="flex flex-col items-center py-8 bg-surface">
        <span className="text-6xl mb-3">{item.icon}</span>
        <h2 className="text-xl font-bold text-foreground mb-1">{item.title[lang]}</h2>
        <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">{item.type[lang]}</span>
      </div>

      <div className="px-4 pt-5">
        {/* Route */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-card shadow-card border border-border mb-5">
          <div className="flex flex-col items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <div className="w-0.5 h-8 bg-primary/30" />
            <div className="w-3 h-3 rounded-full border-2 border-primary bg-background" />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{lang === "ar" ? "من" : "From"}</p>
              <p className="text-sm font-semibold text-foreground">{item.from[lang]}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{lang === "ar" ? "إلى" : "To"}</p>
              <p className="text-sm font-semibold text-foreground">{item.to[lang]}</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground" />
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="p-3 rounded-lg bg-surface flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <div>
              <p className="text-[10px] text-muted-foreground">{lang === "ar" ? "المدة" : "Duration"}</p>
              <p className="text-sm font-semibold text-foreground">{item.duration[lang]}</p>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-surface flex items-center gap-2">
            <Route className="w-4 h-4 text-primary" />
            <div>
              <p className="text-[10px] text-muted-foreground">{lang === "ar" ? "التكرار" : "Frequency"}</p>
              <p className="text-sm font-semibold text-foreground">{item.frequency[lang]}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <h2 className="text-base font-bold text-primary-dark mb-2">{lang === "ar" ? "عن الرحلة" : "About This Ride"}</h2>
        <p className="text-sm text-foreground leading-relaxed mb-5">{item.description[lang]}</p>

        {/* Tips */}
        <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "نصائح" : "Tips"}</h2>
        <div className="space-y-2 mb-6">
          {item.tips[lang].map((tip, i) => (
            <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-surface">
              <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-foreground">{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 flex items-center justify-between z-50">
        <div>
          <span className="text-lg font-bold text-primary-dark">{item.price} {t("common.egp")}</span>
          <span className="text-xs text-muted-foreground block">{lang === "ar" ? "للشخص" : "per person"}</span>
        </div>
        <button onClick={() => navigate(`/booking?type=transport&id=${item.id}`)} className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated">
          {t("common.book")}
        </button>
      </div>
    </div>
  );
};

export default TransportDetail;
