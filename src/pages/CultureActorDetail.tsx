import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Quote, Feather, BookOpen, Share2, Instagram, Twitter, MessageCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { fetchByIdOrSlug } from "@/lib/fetchByIdOrSlug";
import ProviderStatusView from "@/components/ProviderStatusView";
import FollowButton from "@/components/FollowButton";

type Region = { id: string; name_en: string; name_ar: string; emoji: string | null; color: string | null };
type Actor = {
  id: string;
  slug: string | null;
  name_en: string; name_ar: string;
  title_en: string | null; title_ar: string | null;
  image: string | null;
  region_id: string | null;
  bio_en: string | null; bio_ar: string | null;
  quote_en: string | null; quote_ar: string | null;
  expertise_en: string[] | null; expertise_ar: string[] | null;
  social_links: { instagram?: string; twitter?: string } | null;
};
type Post = {
  id: string; slug: string | null;
  title_en: string; title_ar: string;
  category: string | null; image: string | null;
  read_time_minutes: number | null;
};

const CultureActorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useI18n();

  const [actor, setActor] = useState<Actor | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [authorPosts, setAuthorPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) return;
      setLoading(true);
      try {
        const a = (await fetchByIdOrSlug("culture_actors", id)) as Actor | null;
        if (cancelled) return;
        setActor(a);
        if (a?.region_id) {
          const { data: r } = await supabase.from("regions").select("*").eq("id", a.region_id).maybeSingle();
          if (!cancelled) setRegion(r as Region | null);
        }
        if (a?.id) {
          const { data: p } = await supabase
            .from("posts")
            .select("id, slug, title_en, title_ar, category, image, read_time_minutes")
            .eq("author_id", a.id)
            .eq("status", "published")
            .order("created_at", { ascending: false })
            .limit(10);
          if (!cancelled) setAuthorPosts((p as Post[]) ?? []);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <div className="p-8 text-center text-muted-foreground">{lang === "ar" ? "جارٍ التحميل..." : "Loading..."}</div>;
  if (!actor) return <div className="p-8 text-center text-muted-foreground">{lang === "ar" ? "غير موجود" : "Culture Actor not found"}</div>;

  const name = lang === "ar" ? actor.name_ar : actor.name_en;
  const title = lang === "ar" ? (actor.title_ar ?? "") : (actor.title_en ?? "");
  const bio = lang === "ar" ? (actor.bio_ar ?? "") : (actor.bio_en ?? "");
  const quote = lang === "ar" ? (actor.quote_ar ?? "") : (actor.quote_en ?? "");
  const expertise = (lang === "ar" ? actor.expertise_ar : actor.expertise_en) ?? [];
  const regionName = region ? (lang === "ar" ? region.name_ar : region.name_en) : "";
  const accent = region?.color || "hsl(var(--primary))";
  const social = actor.social_links || {};

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero */}
      <div className="relative h-52">
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${accent}90, ${accent}30)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 rounded-full bg-background/80 backdrop-blur-sm z-10">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <button className="absolute top-4 right-4 p-2 rounded-full bg-background/80 backdrop-blur-sm z-10">
          <Share2 className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Avatar & Name */}
      <div className="px-4 -mt-20 relative z-10">
        {actor.image && (
          <img
            src={actor.image}
            alt={name}
            className="w-28 h-28 rounded-2xl object-cover border-4 border-background shadow-elevated"
          />
        )}
        <div className="mt-3">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary mb-2">
            <Feather className="w-3 h-3" />
            {lang === "ar" ? "فاعل ثقافي" : "Culture Actor"}
          </span>
          <h1 className="text-xl font-bold text-foreground">{name}</h1>
          {title && <p className="text-sm font-medium text-primary mt-0.5">{title}</p>}
          {region && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span>{region.emoji} {regionName}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <FollowButton targetType="culture_actor" targetId={actor.id} variant="primary" className="flex-1" />
          <button
            onClick={() => navigate(`/inbox?personId=${actor.id}&name=${encodeURIComponent(actor.name_en)}&nameAr=${encodeURIComponent(actor.name_ar)}&image=${encodeURIComponent(actor.image ?? "")}`)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-card border border-border text-foreground hover:bg-secondary transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-primary" />
            {lang === "ar" ? "رسالة" : "Message"}
          </button>
        </div>
      </div>

      {/* Today's Status */}
      <div className="px-4 mt-5">
        <ProviderStatusView sampleId={actor.slug ?? actor.id} accentText="text-primary" />
      </div>

      {/* Quote */}
      {quote && (
        <div className="px-4 mt-5">
          <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
            <Quote className="w-5 h-5 text-primary mb-2" />
            <p className="text-sm italic text-foreground leading-relaxed">"{quote}"</p>
          </div>
        </div>
      )}

      {/* Bio */}
      {bio && (
        <div className="px-4 mt-5">
          <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            {lang === "ar" ? "نبذة" : "About"}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{bio}</p>
        </div>
      )}

      {/* Expertise */}
      {expertise.length > 0 && (
        <div className="px-4 mt-5">
          <h2 className="text-sm font-semibold text-foreground mb-3">
            {lang === "ar" ? "مجالات الخبرة" : "Areas of Expertise"}
          </h2>
          <div className="flex flex-wrap gap-2">
            {expertise.map((skill, i) => (
              <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-secondary text-foreground font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Social Links */}
      {(social.instagram || social.twitter) && (
        <div className="px-4 mt-5">
          <div className="flex gap-3">
            {social.instagram && (
              <a href={social.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-card border border-border shadow-card text-sm font-medium text-foreground">
                <Instagram className="w-4 h-4 text-primary" />
                Instagram
              </a>
            )}
            {social.twitter && (
              <a href={social.twitter} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-card border border-border shadow-card text-sm font-medium text-foreground">
                <Twitter className="w-4 h-4 text-primary" />
                Twitter
              </a>
            )}
          </div>
        </div>
      )}

      {/* Articles by this actor */}
      {authorPosts.length > 0 && (
        <div className="px-4 mt-6">
          <h2 className="text-sm font-semibold text-foreground mb-3">
            {lang === "ar" ? "مقالات بقلمه" : "Articles by this Author"}
          </h2>
          <div className="space-y-3">
            {authorPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => navigate(`/post/${post.slug ?? post.id}`)}
                className="flex gap-3 rounded-lg bg-card shadow-card border border-border overflow-hidden cursor-pointer"
              >
                {post.image && (
                  <img src={post.image} alt={lang === "ar" ? post.title_ar : post.title_en} className="w-24 h-20 object-cover flex-shrink-0" />
                )}
                <div className="py-2.5 pe-3 flex flex-col justify-center">
                  {post.category && (
                    <span className="text-[10px] font-medium text-primary mb-0.5">{post.category}</span>
                  )}
                  <h3 className="text-xs font-semibold text-foreground line-clamp-2">
                    {lang === "ar" ? post.title_ar : post.title_en}
                  </h3>
                  <span className="text-[10px] text-muted-foreground mt-1">
                    {post.read_time_minutes ?? 5} {lang === "ar" ? "د" : "min"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CultureActorDetail;
