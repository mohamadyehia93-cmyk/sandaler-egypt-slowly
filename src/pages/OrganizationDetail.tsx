import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, MapPin, Users, Globe, Heart,
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
import { UserPlus, UserCheck, MessageCircle } from "lucide-react";
import ShareButton from "@/components/ShareButton";
import KeyFacts, { type KeyFact } from "@/components/listing/KeyFacts";
import Section from "@/components/listing/Section";
import ReadBeforeYouGo from "@/components/listing/ReadBeforeYouGo";
import WideCard, { WideRow } from "@/components/listing/WideCard";
import MiniDate from "@/components/listing/MiniDate";
import { fmtNumber, formatSlotDay } from "@/components/listing/format";

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
  volunteers_count?: number | null;
};
type Program = {
  id: string; slug: string | null;
  title_en: string; title_ar: string;
  description_en: string | null; description_ar: string | null;
  image: string | null; status: string;
  start_date: string | null; end_date: string | null; volunteers_needed: number | null;
};
type OrgEvent = {
  id: string; slug: string | null; title_en: string; title_ar: string | null; image: string | null;
  start_date: string; end_date: string | null; venue_en: string | null; venue_ar: string | null; is_free: boolean; price: number | null;
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
  const { lang } = useI18n();
  const { user } = useAuth();

  const [org, setOrg] = useState<Org | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [cityName, setCityName] = useState<string | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [causes, setCauses] = useState<Cause[]>([]);
  const [events, setEvents] = useState<OrgEvent[]>([]);
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
              .select("id, slug, title_en, title_ar, description_en, description_ar, image, status, start_date, end_date, volunteers_needed")
              .eq("owner_id", o.owner_id)
              .eq("status", "published")
              .order("created_at", { ascending: false }),
            supabase
              .from("causes")
              .select("id, slug, title_en, title_ar, summary_en, summary_ar, image")
              .eq("owner_id", o.owner_id)
              .eq("status", "published")
              .order("created_at", { ascending: false }),
          ]);
          // Events: events.organizer_id holds providers.id of the owning account.
          const { data: provs } = await supabase.from("providers").select("id").eq("user_id", o.owner_id);
          const provIds = (provs ?? []).map((x: { id: string }) => x.id);
          if (provIds.length) {
            const { data: ev } = await supabase.from("events")
              .select("id, slug, title_en, title_ar, image, start_date, end_date, venue_en, venue_ar, is_free, price")
              .in("organizer_id", provIds).eq("status", "published").order("start_date", { ascending: true }).limit(12);
            if (!cancelled) setEvents((ev as OrgEvent[]) ?? []);
          }
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
      <div className="min-h-screen bg-background p-4 space-y-4" aria-busy="true">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }
  if (!org) return <NotFoundView context="organization" />;

  const ar = lang === "ar";
  const name = (ar ? (org.name_ar || org.name_en) : org.name_en) || "";
  const mission = ar ? (org.mission_ar || org.mission_en) : org.mission_en;
  const description = ar ? (org.description_ar || org.description_en) : org.description_en;
  const location = ar ? (org.location_ar || org.location_en) : org.location_en;
  const focusAreas = (ar ? (org.focus_areas_ar || org.focus_areas_en) : org.focus_areas_en) ?? [];
  const regionName = region ? (ar ? (region.name_ar || region.name_en) : region.name_en) : null;
  const place = location || cityName || regionName;
  const todayIso = new Date().toISOString().slice(0, 10);

  // Status pill only from stored dates / counts — never guessed.
  const programmeStatus = (p: Program): string | null => {
    if (p.end_date && p.end_date < todayIso) return ar ? "انتهى" : "Ended";
    if (p.volunteers_needed && p.volunteers_needed > 0) return ar ? "مفتوح للمتطوعين" : "Open for volunteers";
    if (p.start_date && p.start_date <= todayIso) return ar ? "جارٍ" : "Ongoing";
    return null;
  };

  const facts: KeyFact[] = [];
  if (place) facts.push({ icon: MapPin, label: place });
  if (org.volunteers_count) facts.push({ icon: Users, label: ar ? `${fmtNumber(org.volunteers_count, ar)} متطوعين` : `${org.volunteers_count} volunteers` });
  if (followerCount > 0) facts.push({ icon: Heart, label: ar ? `${fmtNumber(followerCount, ar)} متابعين` : `${followerCount} ${followerCount === 1 ? "follower" : "followers"}` });
  const work = programs.length + causes.length;
  if (work) facts.push({ icon: HandCoins, label: ar ? `${fmtNumber(work, ar)} برامج وقضايا` : `${work} programmes & causes` });

  const actionBtn = "h-11 px-4 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-1.5";

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="relative h-44 lg:h-64 overflow-hidden bg-gradient-to-br from-primary/50 via-primary/20 to-accent/40">
        {org.image && <img src={org.image} alt="" className="w-full h-full object-cover" />}
        <div className="absolute top-3 inset-x-3 flex justify-between pt-[env(safe-area-inset-top,0px)]">
          <button type="button" onClick={() => navigate(-1)} aria-label={ar ? "رجوع" : "Back"} className="tap-target rounded-full bg-background/80 backdrop-blur-sm text-foreground">
            <ArrowLeft className={`w-5 h-5 ${ar ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      <div className="max-w-[680px] mx-auto px-4">
        <div className="-mt-12 relative z-10 w-24 h-24 rounded-full border-4 border-background shadow-card bg-card overflow-hidden flex items-center justify-center text-4xl">
          {isImageUrl(org.logo) ? <img src={org.logo!} alt={name} className="w-full h-full object-cover" /> : org.logo ? org.logo : <Building2 className="w-9 h-9 text-primary-dark" />}
        </div>
        <h1 className={`listing-title ${ar ? "lang-ar" : "lang-en"} text-foreground text-3xl mt-3`}>{name}</h1>
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-primary-dark mt-1">
          {[org.org_type || (ar ? "مؤسسة" : "Organisation"), cityName].filter(Boolean).join(" · ")}
          {org.status !== "published" && <span className="ms-2 normal-case tracking-normal text-muted-foreground">({ar ? "مسودة" : "Draft"})</span>}
        </p>
        {mission && <p className={`article-standfirst ${ar ? "lang-ar" : "lang-en"} text-foreground mt-3`}>{mission}</p>}

        <div className="flex flex-wrap gap-2 mt-4">
          {org.owner_id ? (
            <button type="button" onClick={() => navigate(`/inbox?personId=${org.owner_id}&kind=user`)} className={`${actionBtn} bg-primary text-primary-foreground`}>
              <MessageCircle className="w-4 h-4" /> {ar ? "راسل" : "Message"}
            </button>
          ) : (
            <span className={`${actionBtn} bg-muted text-muted-foreground`}><Mail className="w-4 h-4" /> {ar ? "لم تنضم بعد" : "Hasn't joined yet"}</span>
          )}
          <button type="button" onClick={handleFollow} aria-pressed={following}
            className={`${actionBtn} border ${following ? "border-primary bg-primary/10 text-primary-dark" : "border-border text-foreground"}`}>
            {following ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {following ? (ar ? "متابَع" : "Following") : (ar ? "متابعة" : "Follow")}
          </button>
          <ShareButton title={name} showLabel className={`${actionBtn} border border-border text-foreground`} iconClassName="w-4 h-4" />
        </div>
      </div>

      <div className="mt-5"><KeyFacts facts={facts} /></div>

      <div className="max-w-[680px] mx-auto px-4">
        <div className="pt-4">
          {user ? <DailyStatusCard sampleId={`org-${org.id}`} accentBg="bg-primary" accentText="text-primary" /> : <ProviderStatusView sampleId={`org-${org.id}`} accentText="text-primary" />}
        </div>

        {(description || focusAreas.length > 0) && (
          <Section title={ar ? "نبذة" : "About"} ar={ar}>
            {description && <p className="whitespace-pre-line">{description}</p>}
            {focusAreas.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {focusAreas.map((f, i) => <span key={i} className="px-2.5 py-1 rounded-full bg-muted text-[13px]">{f}</span>)}
              </div>
            )}
          </Section>
        )}

        {work > 0 && (
          <Section title={ar ? "البرامج والقضايا" : "Programmes & causes"} ar={ar}>
            <WideRow>
              {programs.map((p) => {
                const st = programmeStatus(p);
                return (
                  <WideCard key={p.id} ar={ar} path={`/program/${p.slug || p.id}`} image={p.image}
                    title={(ar ? p.title_ar || p.title_en : p.title_en) || ""}
                    meta={[ar ? "برنامج" : "Programme", p.start_date ? formatSlotDay(p.start_date, ar, { day: "numeric", month: "short", year: "numeric" }) : null].filter(Boolean).join(" · ")}
                    badge={st ? <span className={`rounded-full px-2.5 py-0.5 text-[13px] font-semibold ${st === "Ended" || st === "انتهى" ? "bg-muted text-muted-foreground" : "bg-background/95 text-primary-dark"}`}>{st}</span> : undefined} />
                );
              })}
              {causes.map((c) => (
                <WideCard key={c.id} ar={ar} path={`/cause/${c.slug || c.id}`} image={c.image}
                  title={(ar ? c.title_ar || c.title_en : c.title_en) || ""} meta={ar ? "قضية" : "Cause"} />
              ))}
            </WideRow>
          </Section>
        )}

        {events.length > 0 && (
          <Section title={ar ? "فعاليات هذه المؤسسة" : "Events by this organisation"} ar={ar}>
            <WideRow>
              {events.map((e) => {
                const d = new Date(e.start_date.slice(0, 10) + "T00:00:00");
                const past = (e.end_date || e.start_date).slice(0, 10) < todayIso;
                return (
                  <div key={e.id} className={past ? "opacity-60" : ""}>
                    <WideCard ar={ar} path={`/event/${e.slug || e.id}`} image={e.image}
                      title={(ar ? e.title_ar || e.title_en : e.title_en) || ""}
                      meta={[ar ? e.venue_ar || e.venue_en : e.venue_en, past ? (ar ? "انتهت" : "Ended") : null].filter(Boolean).join(" · ")}
                      badge={<MiniDate d={d} ar={ar} />} />
                  </div>
                );
              })}
            </WideRow>
          </Section>
        )}

        {(org.website || place) && (
          <Section title={ar ? "التواصل" : "Contact"} ar={ar}>
            <ul className="divide-y divide-border">
              {org.website && (
                <li>
                  <a href={org.website.startsWith("http") ? org.website : `https://${org.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 py-3 min-h-[44px] text-primary-dark underline break-all">
                    <Globe className="w-4 h-4 shrink-0" /> {org.website}
                  </a>
                </li>
              )}
              {place && <li className="flex items-center gap-3 py-3"><MapPin className="w-4 h-4 text-primary-dark shrink-0" /> {place}</li>}
            </ul>
          </Section>
        )}

        <ReadBeforeYouGo cityId={org.city_id} regionId={org.region_id} ar={ar} />
      </div>
    </div>
  );
};

export default OrganizationDetail;
