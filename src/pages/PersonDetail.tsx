import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, Globe, Award, Heart, Sparkles, MessageCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { fetchByIdOrSlug } from "@/lib/fetchByIdOrSlug";
import BottomNav from "@/components/BottomNav";
import FollowButton from "@/components/FollowButton";
import NotFoundView from "@/components/NotFound";
import ExpertCollections from "@/components/ExpertCollections";
import { Skeleton } from "@/components/ui/skeleton";

type Region = { id: string; name_en: string; name_ar: string; emoji: string | null; color: string | null };
type Person = {
  id: string;
  slug: string | null;
  user_id: string | null;
  name_en: string; name_ar: string;
  role_en: string | null; role_ar: string | null;
  bio_en: string | null; bio_ar: string | null;
  image: string | null;
  region_id: string | null;
  city_id: string | null;
  interests_en: string[] | null; interests_ar: string[] | null;
  favorite_places_en: string[] | null; favorite_places_ar: string[] | null;
  meeting_times_en: string | null; meeting_times_ar: string | null;
  languages_en: string[] | null; languages_ar: string[] | null;
  years_active: number | null;
  status: string | null;
};
type Experience = {
  id: string; slug: string | null;
  title_en: string; title_ar: string;
  image: string | null; price: number;
};

const PersonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useI18n();

  const [person, setPerson] = useState<Person | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [cityName, setCityName] = useState<string | null>(null);
  const [nearby, setNearby] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) return;
      setLoading(true);
      try {
        const p = (await fetchByIdOrSlug("whos_who", id)) as Person | null;
        if (cancelled) return;
        setPerson(p);
        if (p?.region_id) {
          const { data: r } = await supabase.from("regions").select("*").eq("id", p.region_id).maybeSingle();
          if (!cancelled) setRegion((r as Region) ?? null);
        }
        if (p?.city_id) {
          const { data: c } = await supabase.from("cities").select("name_en, name_ar").eq("id", p.city_id).maybeSingle();
          if (!cancelled && c) setCityName(lang === "ar" ? c.name_ar : c.name_en);
        }
        if (p?.city_id || p?.region_id) {
          let q = supabase
            .from("experiences")
            .select("id, slug, title_en, title_ar, image, price")
            .eq("status", "published")
            .limit(3);
          q = p.city_id ? q.eq("city_id", p.city_id) : q.eq("region_id", p.region_id!);
          const { data: ex } = await q;
          if (!cancelled) setNearby((ex as Experience[]) ?? []);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, lang]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface pb-20 p-4 space-y-4" aria-busy="true">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }
  if (!person) return <NotFoundView context="person" />;

  const name = lang === "ar" ? person.name_ar : person.name_en;
  const role = lang === "ar" ? person.role_ar : person.role_en;
  const bio = lang === "ar" ? person.bio_ar : person.bio_en;
  const interests = (lang === "ar" ? person.interests_ar : person.interests_en) ?? [];
  const places = (lang === "ar" ? person.favorite_places_ar : person.favorite_places_en) ?? [];
  const meetingTimes = lang === "ar" ? person.meeting_times_ar : person.meeting_times_en;
  const languages = (lang === "ar" ? person.languages_ar : person.languages_en) ?? [];
  const regionName = region ? (lang === "ar" ? region.name_ar : region.name_en) : null;
  const accent = region?.color || "hsl(var(--primary))";

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 bg-background sticky top-0 z-40">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground rtl:rotate-180" />
        </button>
        <h1 className="text-lg font-bold text-foreground truncate">{name}</h1>
        {person.status !== "published" && (
          <span className="ms-auto text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-semibold">
            {lang === "ar" ? "مسودة" : "Draft"}
          </span>
        )}
      </header>

      {/* Profile hero */}
      <div className="relative">
        <div className="h-40 w-full" style={{ background: `linear-gradient(135deg, ${accent}60, ${accent}20)` }} />
        <div className="px-4 -mt-16 relative z-10">
          <img
            src={person.image || "/placeholder.svg"}
            alt={name}
            className="w-28 h-28 rounded-2xl object-cover border-4 border-background shadow-elevated"
          />
        </div>
      </div>

      {/* Name & role */}
      <div className="px-4 pt-3 pb-2">
        <h2 className="text-xl font-bold text-foreground">{name}</h2>
        {role && (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary mt-1">
            <Award className="w-4 h-4" /> {role}
          </span>
        )}
        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground flex-wrap">
          {(cityName || regionName) && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {region?.emoji} {cityName || regionName}
            </span>
          )}
          {person.years_active ? (
            <>
              <span>·</span>
              <span>{person.years_active}+ {lang === "ar" ? "سنة خبرة" : "years"}</span>
            </>
          ) : null}
        </div>
      </div>

      {/* Bio */}
      {bio && (
        <div className="px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground mb-2">{lang === "ar" ? "نبذة" : "About"}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{bio}</p>
        </div>
      )}

      {/* Info cards */}
      <div className="px-4 space-y-3">
        {/* Knowledge collections authored by this person (collections.expert_id = auth user id) */}
        <ExpertCollections userId={person.user_id} />

        {interests.length > 0 && (
          <div className="bg-card rounded-xl p-4 shadow-card border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">{lang === "ar" ? "الاهتمامات" : "Interests"}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest, i) => (
                <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium">
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {places.length > 0 && (
          <div className="bg-card rounded-xl p-4 shadow-card border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4 text-destructive" />
              <h3 className="text-sm font-semibold text-foreground">{lang === "ar" ? "الأماكن المفضلة" : "Favorite Places"}</h3>
            </div>
            <div className="space-y-2">
              {places.map((place, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{place}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {meetingTimes && (
          <div className="bg-card rounded-xl p-4 shadow-card border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">{lang === "ar" ? "أوقات اللقاء" : "Best Times to Meet"}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{meetingTimes}</p>
          </div>
        )}

        {languages.length > 0 && (
          <div className="bg-card rounded-xl p-4 shadow-card border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">{lang === "ar" ? "اللغات" : "Languages"}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {languages.map((language, i) => (
                <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-secondary text-foreground font-medium">
                  {language}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Contact */}
        <div className="bg-card rounded-xl p-4 shadow-card border border-border">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">{lang === "ar" ? "تواصل" : "Contact"}</h3>
          </div>
          <div className="flex gap-2">
            <FollowButton targetType="person" targetId={person.id} variant="outline" className="flex-1" />
            {person.user_id ? (
              <button
                onClick={() => navigate(`/inbox?personId=${person.user_id}&kind=user`)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                {lang === "ar" ? "رسالة" : "Message"}
              </button>
            ) : (
              <button
                disabled
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-secondary text-muted-foreground font-semibold text-xs cursor-not-allowed"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                {lang === "ar" ? "لم ينضم بعد" : "Hasn't joined yet"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Nearby experiences */}
      {nearby.length > 0 && (
        <div className="px-4 pt-5 pb-2">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            {lang === "ar" ? "تجارب في المنطقة" : "Experiences Nearby"}
          </h3>
          <div className="space-y-3">
            {nearby.map((e) => (
              <div
                key={e.id}
                onClick={() => navigate(`/experience/${e.slug || e.id}`)}
                className="flex gap-3 bg-card rounded-xl overflow-hidden shadow-card border border-border cursor-pointer"
              >
                <img src={e.image || "/placeholder.svg"} alt={lang === "ar" ? e.title_ar : e.title_en} className="w-24 h-20 object-cover" />
                <div className="py-2 pe-3 flex-1 flex flex-col justify-center">
                  <h4 className="text-xs font-semibold text-foreground line-clamp-2">
                    {lang === "ar" ? e.title_ar : e.title_en}
                  </h4>
                  <span className="text-xs font-bold text-primary mt-1">
                    {e.price === 0 ? (lang === "ar" ? "مجاني" : "Free") : `${e.price} ${lang === "ar" ? "ج.م" : "EGP"}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default PersonDetail;
