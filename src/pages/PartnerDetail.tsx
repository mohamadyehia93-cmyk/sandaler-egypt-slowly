import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Users, Target, Handshake, Calendar, Award } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { fetchByIdOrSlug } from "@/lib/fetchByIdOrSlug";
import { Skeleton } from "@/components/ui/skeleton";
import NotFoundView from "@/components/NotFound";

/**
 * HONESTY RULE: this page renders only the partner row it is viewing.
 * It used to read from src/lib/sampleData (partnersData), so a real partner id
 * could resolve to another organisation's logo, mission and impact numbers —
 * and the "Visit Website" / "Contact Partner" buttons did nothing at all.
 */
const PartnerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useI18n();
  const ar = lang === "ar";

  const { data: partner, isLoading } = useQuery({
    queryKey: ["partner", id],
    queryFn: () => fetchByIdOrSlug("partners", id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 space-y-4">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!partner) return <NotFoundView context="partner" />;

  const name = ar ? partner.name_ar : partner.name_en;
  const type = ar ? partner.type_ar : partner.type_en;
  const location = ar ? partner.location_ar : partner.location_en;
  const about = ar ? partner.about_ar : partner.about_en;
  const mission = ar ? partner.mission_ar : partner.mission_en;
  const impactLabel = ar ? partner.impact_label_ar : partner.impact_label_en;
  const focusAreas: string[] = (ar ? partner.focus_areas_ar : partner.focus_areas_en) || [];
  const contributions: string[] = (ar ? partner.contributions_ar : partner.contributions_en) || [];
  const color = partner.color || "hsl(var(--primary))";

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="relative h-44">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${color}90, ${color}30)` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 rounded-full bg-background/80 backdrop-blur-sm z-10"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
      </div>

      <div className="px-4 -mt-16 relative z-10">
        <div className="w-20 h-20 rounded-2xl bg-card border-4 border-background shadow-elevated flex items-center justify-center text-4xl overflow-hidden">
          {partner.logo && partner.logo.startsWith("http")
            ? <img src={partner.logo} alt={name} className="w-full h-full object-cover" />
            : <span>{partner.logo || "🤝"}</span>}
        </div>
        <div className="mt-3">
          {type && (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary mb-2">
              <Handshake className="w-3 h-3" />
              {type}
            </span>
          )}
          <h1 className="text-xl font-bold text-foreground">{name}</h1>
          {location && (
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span>{location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats — each cell only renders when the column actually has a value */}
      {(partner.since || partner.impact_number || partner.projects) && (
        <div className="px-4 mt-5 grid grid-cols-3 gap-3">
          {partner.since && (
            <div className="bg-card rounded-xl p-3 border border-border text-center">
              <Calendar className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{partner.since}</p>
              <p className="text-[10px] text-muted-foreground">{ar ? "شريك منذ" : "Partner since"}</p>
            </div>
          )}
          {partner.impact_number && (
            <div className="bg-card rounded-xl p-3 border border-border text-center">
              <Users className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{partner.impact_number}</p>
              {impactLabel && <p className="text-[10px] text-muted-foreground">{impactLabel}</p>}
            </div>
          )}
          {partner.projects ? (
            <div className="bg-card rounded-xl p-3 border border-border text-center">
              <Award className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{partner.projects}</p>
              <p className="text-[10px] text-muted-foreground">{ar ? "مشروع" : "Projects"}</p>
            </div>
          ) : null}
        </div>
      )}

      {about && (
        <div className="px-4 mt-5">
          <h2 className="text-sm font-semibold text-foreground mb-2">{ar ? "نبذة" : "About"}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{about}</p>
        </div>
      )}

      {mission && (
        <div className="px-4 mt-5">
          <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
            <Target className="w-5 h-5 text-primary mb-2" />
            <h3 className="text-sm font-semibold text-foreground mb-1">{ar ? "المهمة" : "Mission"}</h3>
            <p className="text-sm italic text-muted-foreground leading-relaxed">{mission}</p>
          </div>
        </div>
      )}

      {focusAreas.length > 0 && (
        <div className="px-4 mt-5">
          <h2 className="text-sm font-semibold text-foreground mb-3">{ar ? "مجالات التركيز" : "Focus Areas"}</h2>
          <div className="flex flex-wrap gap-2">
            {focusAreas.map((area, i) => (
              <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-secondary text-foreground font-medium">{area}</span>
            ))}
          </div>
        </div>
      )}

      {contributions.length > 0 && (
        <div className="px-4 mt-5">
          <h2 className="text-sm font-semibold text-foreground mb-3">{ar ? "المساهمات الرئيسية" : "Key Contributions"}</h2>
          <div className="space-y-2">
            {contributions.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 bg-card rounded-lg p-3 border border-border">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">{i + 1}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerDetail;
