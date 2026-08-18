import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Share2, MapPin, Users, Globe, Heart, Sparkles, Target,
  Mail, Building2, HandCoins,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { fetchByIdOrSlug } from "@/lib/fetchByIdOrSlug";
import ProviderStatusView from "@/components/ProviderStatusView";
import DailyStatusCard from "@/components/DailyStatusCard";
import { useAuth } from "@/hooks/useAuth";
import NotFoundView from "@/components/NotFound";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { useIsFollowing, useToggleFollow, useFollowerCount } from "@/hooks/useFollows";
import { UserPlus, UserCheck } from "lucide-react";

type Region = { id: string; name_en: string; name_ar: string; emoji: string | null; color: string | null };
type Org = {
  id: string;
  slug: string | null;
  owner_id: string | null;
  name_en: string; name_ar: string;
  description_en: string | null; description_ar: string | null;
  mission_en: string | null; mission_ar: string | null;
  org_type: string | null;
  region_id: string | null; city_id: string | null;
  location_en: string | null; location_ar: string | null;
  logo: string | null; image: string | null;
  website: string | null;
  focus_areas_en: string[] | null; focus_areas_ar: string[] | null;
  status: string | null;
};
type Program = {
  id: string; slug: string | null;
  title_en: string; title_ar: string;
  description_en: string | null; description_ar: string | null;
  image: string | null; status: string;
};
type Cause = {
  id: string; slug: string | null;
  title_en: string; title_ar: string;
  summary_en: string | null; summary_ar: string | null;
  image: string | null;
};

const isImageUrl = (v: string | null) => !!v && /^(https?:|\/)/.test(v);

const OrganizationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useI18n();
  const { user } = useAuth();

  const [org, setOrg] = useState<Org | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [cityName, setCityName] = useState<string | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [causes, setCauses] = useState<Cause[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) return;
      setLoading(true);
      try {
        const o = (await fetchByIdOrSlug("organizations", id)) as Org | null;
        if (cancelled) return;
        setOrg(o);
        if (o?.region_id) {
          const { data: r } = await supabase.from("regions").select("*").eq("id", o.region_id).maybeSingle();
          if (!cancelled) setRegion((r as Region) ?? null);
        }
        if (o?.city_id) {
          const { data: c } = await supabase.from("cities").select("name_en, name_ar").eq("id", o.city_id).maybeSingle();
          if (!cancelled && c) setCityName(lang === "ar" ? (c.name_ar || c.name_en) : c.name_en);
        }
        if (o?.owner_id) {
          // Both programs.owner_id and causes.owner_id are resolved to the owning
          // account, so the org's work can be listed by its owner id.
          const [pRes, cRes] = await Promise.all([
            supabase
              .from("programs")
              .select("id, slug, title_en, title_ar, description_en, description_ar, image, status")
              .eq("owner_id", o.owner_id)
              .order("created_at", { ascending: false }),
            supabase
              .from("causes")
              .select("id, slug, title_en, title_ar, summary_en, summary_ar, image")
              .eq("owner_id", o.owner_id)
              .order("created_at", { ascending: false }),
          ]);
          if (!cancelled) {
            setPrograms((pRes.data as Program[]) ?? []);
            setCauses((cRes.data as Cause[]) ?? []);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, lang]);

  const orgTargetId = org ? `organization-${org.id}` : "";
  const following = useIsFollowing("organization", orgTargetId);
  const toggleFollow = useToggleFollow();
  const { data: followerCount = 0 } = useFollowerCount("organization", orgTargetId);

  const handleFollow = () => {
    if (!org) return;
    if (!user) {
      toast({ title: lang === "ar" ? "سجّل الدخول للمتابعة" : "Sign in to follow" });
      navigate("/login");
      return;
    }
    toggleFollow.mutate(
      { targetType: "organization", targetId: orgTargetId, currentlyFollowing: following },
      {
        onSuccess: ({ followed }) => {
          toast({
            title: followed
              ? lang === "ar" ? "تتابع المنظمة الآن" : "Now following"
              : lang === "ar" ? "تم إلغاء المتابعة" : "Unfollowed",
          });
        },
        onError: () => {
          toast({ title: lang === "ar" ? "تعذّر تحديث المتابعة" : "Couldn't update follow" });
        },
      }
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 p-4 space-y-4" aria-busy="true">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }
  if (!org) return <NotFoundView context="organization" />;

  const name = lang === "ar" ? (org.name_ar || org.name_en) : org.name_en;
  const mission = lang === "ar" ? (org.mission_ar || org.mission_en) : org.mission_en;
  const description = lang === "ar" ? (org.description_ar || org.description_en) : org.description_en;
  const location = lang === "ar" ? (org.location_ar || org.location_en) : org.location_en;
  const focusAreas = (lang === "ar" ? (org.focus_areas_ar || org.focus_areas_en) : org.focus_areas_en) ?? [];
  const regionName = region ? (lang === "ar" ? (region.name_ar || region.name_en) : region.name_en) : null;
  const place = location || cityName || regionName;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Cover */}
      <div className="relative h-44 bg-gradient-to-br from-primary/30 to-primary/10">
        {org.image && <img src={org.image} alt="" className="w-full h-full object-cover opacity-40" />}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 start-4 p-2 rounded-full bg-background/80 backdrop-blur-sm z-10"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-foreground rtl:rotate-180" />
        </button>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(window.location.href);
            toast({ title: lang === "ar" ? "تم نسخ الرابط" : "Link copied" });
          }}
          className="absolute top-4 end-4 p-2 rounded-full bg-background/80 backdrop-blur-sm z-10"
          aria-label="Share"
        >
          <Share2 className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Header card */}
      <div className="px-4 -mt-14 relative z-10">
        <div className="bg-card rounded-2xl shadow-elevated p-4">
          <div className="flex items-start gap-3">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl shrink-0 overflow-hidden">
              {isImageUrl(org.logo) ? (
                <img src={org.logo!} alt={name} className="w-full h-full object-cover" />
              ) : org.logo ? (
                org.logo
              ) : (
                <Building2 className="w-7 h-7 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-base font-bold text-foreground truncate">{name}</h1>
                {org.status !== "published" && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-semibold">
                    {lang === "ar" ? "مسودة" : "Draft"}
                  </span>
                )}
              </div>
              {org.org_type && (
                <p className="text-xs text-muted-foreground mt-0.5">{org.org_type}</p>
              )}
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground flex-wrap">
                {place && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {place}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span className="font-semibold text-foreground tabular-nums">{followerCount}</span>
                  {lang === "ar" ? "متابع" : "followers"}
                </span>
              </div>
            </div>
          </div>

          {focusAreas.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {focusAreas.map((f, i) => (
                <span key={i} className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full font-medium">
                  {f}
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-2 mt-4">
            {org.owner_id ? (
              <button
                onClick={() => navigate(`/inbox?personId=${org.owner_id}&kind=user`)}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-1.5"
              >
                <Mail className="w-4 h-4" />
                {lang === "ar" ? "تواصل" : "Contact"}
              </button>
            ) : (
              <button
                disabled
                className="flex-1 py-2.5 rounded-xl bg-secondary text-muted-foreground font-semibold text-xs flex items-center justify-center gap-1.5 cursor-not-allowed"
              >
                <Mail className="w-4 h-4 shrink-0" />
                {lang === "ar" ? "لم تنضم بعد" : "Hasn't joined yet"}
              </button>
            )}
            <button
              onClick={handleFollow}
              aria-pressed={following}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 border-2 ${
                following ? "bg-primary/10 border-primary text-primary" : "border-border bg-card text-foreground"
              }`}
            >
              {following ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              {following
                ? lang === "ar" ? "متابَع" : "Following"
                : lang === "ar" ? "متابعة" : "Follow"}
            </button>
          </div>
        </div>
      </div>

      {/* Today's Status */}
      <div className="px-4 mt-4">
        {user ? (
          <DailyStatusCard sampleId={`org-${org.id}`} accentBg="bg-primary" accentText="text-primary" />
        ) : (
          <ProviderStatusView sampleId={`org-${org.id}`} accentText="text-primary" />
        )}
      </div>

      {/* Mission */}
      {mission && (
        <div className="px-4 mt-5">
          <h2 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            {lang === "ar" ? "رسالتنا" : "Our Mission"}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{mission}</p>
        </div>
      )}

      {/* About */}
      {description && (
        <div className="px-4 mt-5">
          <h2 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            {lang === "ar" ? "عن المنظمة" : "About"}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      )}

      {/* Programs */}
      {programs.length > 0 && (
        <div className="px-4 mt-5">
          <h2 className="text-sm font-bold text-foreground mb-3">
            {lang === "ar" ? `البرامج (${programs.length})` : `Programs (${programs.length})`}
          </h2>
          <div className="space-y-2">
            {programs.map((p) => (
              <button key={p.id} type="button" onClick={() => navigate(`/program/${p.slug || p.id}`)} className="w-full flex items-center gap-3 bg-card rounded-xl border border-border p-3 text-start hover:border-primary transition-colors">
                <img src={p.image || "/placeholder.svg"} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground line-clamp-1">
                    {lang === "ar" ? (p.title_ar || p.title_en) : p.title_en}
                  </p>
                  <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">
                    {lang === "ar" ? (p.description_ar || p.description_en) : p.description_en}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Causes */}
      {causes.length > 0 && (
        <div className="px-4 mt-5">
          <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary" />
            {lang === "ar" ? `القضايا (${causes.length})` : `Causes (${causes.length})`}
          </h2>
          <div className="space-y-2">
            {causes.map((c) => {
              return (
                <div key={c.id} className="flex items-center gap-3 bg-card rounded-xl border border-border p-3">
                  <img src={c.image || "/placeholder.svg"} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground line-clamp-1">
                      {lang === "ar" ? (c.title_ar || c.title_en) : c.title_en}
                    </p>
                    <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                      {lang === "ar" ? (c.summary_ar || c.summary_en) : c.summary_en}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Contact */}
      {(org.website || place) && (
        <div className="px-4 mt-5">
          <h2 className="text-sm font-bold text-foreground mb-2">
            {lang === "ar" ? "تواصل معنا" : "Get in Touch"}
          </h2>
          <div className="bg-card rounded-xl border border-border divide-y divide-border">
            {org.website && (
              <a
                href={org.website.startsWith("http") ? org.website : `https://${org.website}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 px-3 py-3"
              >
                <Globe className="w-4 h-4 text-primary shrink-0" />
                <p className="text-xs text-primary underline break-all">{org.website}</p>
              </a>
            )}
            {place && (
              <div className="flex items-center gap-3 px-3 py-3">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <p className="text-xs text-foreground">{place}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationDetail;
