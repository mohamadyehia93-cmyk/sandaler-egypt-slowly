import MessageOwnerButton from "@/components/MessageOwnerButton";
import WishlistButton from "@/components/WishlistButton";
import ShareButton from "@/components/ShareButton";
import LocationChips from "@/components/LocationChips";
import { ArrowLeft, Info, MapPin, Gift, HandHeart, UserCheck, MessageCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { fetchByIdOrSlug } from "@/lib/fetchByIdOrSlug";
import { supabase } from "@/integrations/supabase/client";
import { dbToLegacyCause } from "@/lib/dbAdapters";
import { useRegions } from "@/hooks/useListings";
import ProviderBioCard from "@/components/ProviderBioCard";
import NotFoundView from "@/components/NotFound";

const supportOptions = [
  { key: "gift", icon: Gift, label: { en: "Send a Gift", ar: "أرسل هدية" }, desc: { en: "Support through gift packages for the community", ar: "ادعم من خلال هدايا للمجتمع" }, color: "bg-amber-500/10 text-amber-600", path: "gift" },
  { key: "donate", icon: HandHeart, label: { en: "Donate", ar: "تبرّع" }, desc: { en: "Direct financial contribution to the cause", ar: "مساهمة مالية مباشرة للقضية" }, color: "bg-emerald-500/10 text-emerald-600", path: "donate" },
  { key: "volunteer", icon: UserCheck, label: { en: "Volunteer", ar: "تطوّع" }, desc: { en: "Give your time and skills on the ground", ar: "قدّم وقتك ومهاراتك على أرض الواقع" }, color: "bg-blue-500/10 text-blue-600", path: "volunteer" },
  { key: "consult", icon: MessageCircle, label: { en: "Consult", ar: "استشارة" }, desc: { en: "Offer professional expertise and guidance", ar: "قدّم خبرتك المهنية وإرشاداتك" }, color: "bg-purple-500/10 text-purple-600", path: "consult" },
];

const CauseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useI18n();
  const { data: dbRegions } = useRegions();

  const { data: dbCause } = useQuery({
    queryKey: ["cause", id],
    queryFn: () => fetchByIdOrSlug("causes", id!),
    enabled: !!id,
  });

  // Resolve the real owning organization (if any) so we never link to a non-existent one.
  const ownerId = (dbCause as any)?.owner_id ?? null;
  const { data: ownerOrg } = useQuery({
    queryKey: ["cause-owner-org", ownerId],
    enabled: !!ownerId,
    queryFn: async () => {
      const { data } = await supabase
        .from("organizations")
        .select("id, slug, name_en, name_ar, logo, status")
        .eq("owner_id", ownerId)
        .eq("status", "published")
        .limit(1);
      return data?.[0] ?? null;
    },
  });

  // DB row only. A missing cause must 404 — never fall back to a sample cause,
  // which would show a different organisation's fundraising numbers.
  const cause = dbToLegacyCause(dbCause);
  if (!cause) return <NotFoundView context="cause" />;
  const region = (dbRegions ?? []).find((r) => r.id === cause.regionId);
  // No payment path exists and no contribution has ever been recorded, so the
  // seeded goal / raised / supporters columns are never rendered as progress.
  const isManaged = !!ownerId;
  const orgHref = ownerOrg ? `/organization/${(ownerOrg as any).slug || (ownerOrg as any).id}` : null;


  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Hero */}
      <div className="relative">
        <img src={cause.image} alt={cause.title[lang]} className="w-full h-64 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 rounded-full bg-background/80 backdrop-blur-sm">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="absolute top-4 right-4 flex gap-2">
          <ShareButton title={cause.title[lang]} />
          <WishlistButton itemType="cause" itemId={dbCause?.id} />
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <span className="bg-primary/90 text-primary-foreground px-2.5 py-0.5 rounded-full text-xs font-medium mb-2 inline-block">
            {cause.category[lang]}
          </span>
          <h1 className="text-xl font-bold text-white">{cause.title[lang]}</h1>
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Meta */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-primary" /> {region ? (lang === "ar" ? region.name_ar || region.name_en : region.name_en) : ""}</span>
        </div>

        {!isManaged && (
          <div className="rounded-xl border border-border bg-card p-3 mb-6 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              {lang === "ar"
                ? "هذه القضية غير مُدارة على التطبيق حالياً: لا توجد جهة يمكنها استقبال التعهدات أو طلبات التطوع، وهي معروضة للتعريف فقط."
                : "This cause is not currently managed on Sandal: no organisation can receive pledges or volunteer requests, so it is listed for information only."}
            </p>
          </div>
        )}

        {/* About */}
        <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "عن القضية" : "About This Cause"}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{cause.description[lang]}</p>

        {/* Organization */}
        <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "المنظمة" : "The Organization"}</h2>
        {(() => {
          const Wrapper: any = orgHref ? "button" : "div";
          return (
            <Wrapper
              {...(orgHref ? { onClick: () => navigate(orgHref) } : {})}
              className={`w-full text-start bg-surface rounded-xl p-4 mb-6 border border-border ${orgHref ? "hover:border-primary transition-colors" : ""}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center text-2xl">{cause.org.logo}</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{cause.org.name[lang]}</p>
                </div>
                {orgHref && (
                  <span className="text-[10px] text-primary font-semibold">
                    {lang === "ar" ? "عرض الملف" : "View profile"} →
                  </span>
                )}
              </div>
            </Wrapper>
          );
        })()}

        {ownerId && (
          <div className="-mt-3 mb-6 flex">
            <MessageOwnerButton ownerId={ownerId} kind="auto" label={lang === "ar" ? "مراسلة المنظمة" : "Message organization"} />
          </div>
        )}



        <LocationChips cityId={(dbCause as any)?.city_id} regionId={(dbCause as any)?.region_id} className="mb-6" />

        {/* How to Support */}
        <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "كيف تدعم" : "How to Support"}</h2>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {supportOptions.map((opt) => (
            <button
              key={opt.key}
              disabled={!isManaged}
              onClick={() => navigate(`/cause/${id}/${opt.path}`)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border shadow-card transition-colors ${
                isManaged ? "hover:border-primary" : "opacity-50 cursor-not-allowed"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${opt.color}`}>
                <opt.icon className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold text-foreground">{opt.label[lang]}</span>
              <span className="text-[10px] text-muted-foreground text-center leading-tight">{opt.desc[lang]}</span>
            </button>
          ))}
        </div>

      </div>

      {/* Organization Bio */}
      {/* Was hardcoded providerId="p7": every cause showed the same unrelated
          organisation. Only render when this row actually has an owner. */}
      {dbCause?.owner_id && (
        <ProviderBioCard providerId={dbCause.owner_id} roleLabel={{ en: "Supporting Organization", ar: "المنظمة الداعمة" }} />
      )}

      {/* Sticky Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 flex items-center justify-end z-50">
        {isManaged ? (
          <button
            onClick={() => navigate(`/cause/${id}/donate`)}
            className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated"
          >
            {lang === "ar" ? "ادعم الآن" : "Support Now"}
          </button>
        ) : (
          <span className="text-xs text-muted-foreground text-center w-full">
            {lang === "ar" ? "الدعم غير متاح لهذه القضية حالياً" : "Support is unavailable for this cause right now"}
          </span>
        )}
      </div>
    </div>
  );
};

export default CauseDetail;
