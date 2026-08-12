import MessageOwnerButton from "@/components/MessageOwnerButton";
import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, Share2, User, MapPin, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize, Camera, ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import CityBadge from "@/components/CityBadge";
import { fetchByIdOrSlug } from "@/lib/fetchByIdOrSlug";
import { supabase } from "@/integrations/supabase/client";
import { bylineNames, isEditorialPost, SANDAL_BYLINE, SANDAL_MARK } from "@/lib/postByline";

import { usePosts } from "@/hooks/useListings";
import WishlistButton from "@/components/WishlistButton";
import { contentTypeConfig } from "@/components/LatestPosts";
import NotFoundView from "@/components/NotFound";
import DetailSkeleton from "@/components/DetailSkeleton";
import PostComments from "@/components/PostComments";

const PhotoGallery = ({ photos }: { photos: string[] }) => {
  const [current, setCurrent] = useState(0);
  const total = photos.length;
  if (total < 2) return null;

  return (
    <div className="mx-4 mt-4 rounded-xl overflow-hidden border border-border shadow-sm relative">
      <div className="relative aspect-[4/3] bg-muted">
        <img src={photos[current]} alt={`Photo ${current + 1}`} className="w-full h-full object-cover" />
        <button
          onClick={() => setCurrent((c) => (c - 1 + total) % total)}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow"
        >
          <ChevronLeft className="w-4 h-4 text-foreground" />
        </button>
        <button
          onClick={() => setCurrent((c) => (c + 1) % total)}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow"
        >
          <ChevronRight className="w-4 h-4 text-foreground" />
        </button>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <Camera className="w-3 h-3" />
          {current + 1} / {total}
        </div>
        <div className="absolute bottom-3 right-3 flex gap-1">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-1.5 h-1.5 rounded-full transition ${i === current ? "bg-white" : "bg-white/40"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── Main Page ─── */
const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useI18n();

  const { data: row, isLoading } = useQuery({
    queryKey: ["post", id],
    queryFn: () => fetchByIdOrSlug("posts", id!),
    enabled: !!id,
  });
  const { data: allPosts } = usePosts();

  // Author bio card: resolve the REAL culture-actor profile owned by this author.
  // Never match against sample actors — that showed a stranger's bio on a post.
  const { data: actorRow } = useQuery({
    queryKey: ["post-author-actor", (row as any)?.author_id],
    enabled: !!(row as any)?.author_id,
    queryFn: async () => {
      const { data } = await supabase
        .from("culture_actors")
        .select("id, slug, name_en, name_ar, title_en, title_ar, bio_en, bio_ar, image, expertise_en, expertise_ar, quote_en, quote_ar, status")
        .eq("user_id", (row as any).author_id)
        .eq("status", "published")
        .limit(1);
      return data?.[0] ?? null;
    },
  });
  const actor = actorRow
    ? {
        id: (actorRow as any).slug || (actorRow as any).id,
        name: { en: (actorRow as any).name_en, ar: (actorRow as any).name_ar },
        title: { en: (actorRow as any).title_en || "", ar: (actorRow as any).title_ar || "" },
        bio: { en: (actorRow as any).bio_en || "", ar: (actorRow as any).bio_ar || "" },
        image: (actorRow as any).image || "",
        expertise: { en: (actorRow as any).expertise_en || [], ar: (actorRow as any).expertise_ar || [] },
        quote: { en: (actorRow as any).quote_en || "", ar: (actorRow as any).quote_ar || "" },
      }
    : null;

  // Real (signed-up) authors: resolve their live profile name + avatar.
  const realAuthorId = (row as any)?.author_id as string | null | undefined;
  const { data: authorProfile } = useQuery({
    queryKey: ["post-author-profile", realAuthorId],
    enabled: !!realAuthorId,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("user_id", realAuthorId!)
        .maybeSingle();
      return data;
    },
  });


  if (isLoading) return <DetailSkeleton variant="city" />;
  if (!row) return <NotFoundView context="post" />;

  // Normalize DB row to shape used below
  const post = {
    id: row.id,
    slug: row.slug,
    image: row.image || "/placeholder.svg",
    title: { en: row.title_en, ar: row.title_ar },
    body: { en: row.body_en || "", ar: row.body_ar || "" },
    category: { en: row.category || "", ar: row.category || "" },
    author: bylineNames(row),
    authorId: row.author_id,
    isEditorial: isEditorialPost(row),
    authorImage: row.author_image,

    date: row.created_at,
    readTime: row.read_time_minutes ?? 5,
    regionId: row.region_id,
    cityId: row.city_id,
    contentType: row.content_type,
  };

  const ct = post.contentType ? contentTypeConfig[post.contentType] : null;
  const CtIcon = ct?.icon;
  const contentType = post.contentType as string | undefined;

  const relatedPosts = (allPosts ?? [])
    .filter((p: any) => p && p.id !== post.id && p.region_id === post.regionId)
    .slice(0, 3)
    .map((p: any) => ({
      id: p.id,
      slug: p.slug,
      image: p.image || "/placeholder.svg",
      title: { en: p.title_en, ar: p.title_ar },
      category: { en: p.category || "", ar: p.category || "" },
      readTime: p.read_time_minutes ?? 5,
      contentType: p.content_type,
    }));

  const formattedDate = new Date(post.date).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  const paragraphs = (post.body[lang] || "").split("\n\n");

  const timeLabel = ct
    ? (ct === contentTypeConfig.podcast || ct === contentTypeConfig.documentary || ct === contentTypeConfig["recipe-video"])
      ? (lang === "ar" ? "دقيقة" : "min")
      : (lang === "ar" ? "دقائق قراءة" : "min read")
    : (lang === "ar" ? "دقائق قراءة" : "min read");

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero */}
      <div className="relative h-64">
        <img src={post.image} alt={post.title[lang]} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 rounded-full bg-background/80 backdrop-blur-sm">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="p-2 rounded-full bg-background/80 backdrop-blur-sm">
            <Share2 className="w-5 h-5 text-foreground" />
          </button>
          <WishlistButton itemType="post" itemId={post.id} variant="bookmark" />
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {ct && CtIcon && (
              <span className={`inline-flex items-center gap-1 ${ct.color} text-white text-[10px] font-semibold px-2 py-0.5 rounded-full`}>
                <CtIcon className="w-3 h-3" />
                {ct.label[lang]}
              </span>
            )}
            <span className="inline-block bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full">
              {post.category[lang]}
            </span>
            {(post as any).cityId && <CityBadge cityId={(post as any).cityId} variant="overlay" />}
          </div>
          <h1 className="text-xl font-bold text-white leading-tight">{post.title[lang]}</h1>
        </div>
      </div>

      {/* Media: only real uploaded images. There is no audio/video storage for
          posts yet, so no player is rendered — a simulated one would be a lie. */}
      {contentType === "photo-series" && (
        <PhotoGallery photos={((row as any)?.images as string[] | null) ?? []} />
      )}

      {/* Meta */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-4 border-b border-border">
        {post.isEditorial ? (
          <div className="flex items-center gap-2" data-testid="post-byline">
            <img
              src={SANDAL_MARK}
              alt={SANDAL_BYLINE[lang]}
              className="w-8 h-8 rounded-lg object-contain bg-primary/10 p-0.5"
            />
            <div>
              <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
                {SANDAL_BYLINE[lang]}
                <span className="text-[9px] font-medium bg-primary/10 text-primary px-1.5 py-px rounded uppercase tracking-wide">
                  {lang === "ar" ? "التحرير" : "Editorial"}
                </span>
              </p>
              <p className="text-[10px] text-muted-foreground">{formattedDate}</p>
            </div>
          </div>
        ) : (
          <div
            className="flex items-center gap-2 cursor-pointer"
            data-testid="post-byline"
            onClick={() => {
              if (actor) navigate(`/culture-actor/${actor.id}`);
              else if (post.authorId) navigate(`/visitor/${post.authorId}`);
            }}
          >
            {(() => {
              const img = actor?.image || authorProfile?.avatar_url || post.authorImage;
              const name = actor?.name[lang] || authorProfile?.display_name || post.author[lang];
              return img ? (
                <img src={img} alt={name} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
              );
            })()}
            <div>
              <p className="text-xs font-semibold text-primary">
                {actor?.name[lang] ||
                  authorProfile?.display_name ||
                  post.author[lang]}
              </p>
              <p className="text-[10px] text-muted-foreground">{formattedDate}</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-1 text-muted-foreground ms-auto">
          {ct && CtIcon ? <CtIcon className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
          <span className="text-xs">{post.readTime} {timeLabel}</span>
        </div>
      </div>

      {/* Message the author — never for Sandal editorial bylines (author_id NULL) */}
      {!post.isEditorial && post.authorId && (
        <div className="px-4 pt-3 flex">
          <MessageOwnerButton ownerId={post.authorId} kind="auto" label={lang === "ar" ? "مراسلة الكاتب" : "Message author"} />
        </div>
      )}


      {/* Body */}
      <article className="px-4 pt-5 space-y-4">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-sm text-foreground leading-relaxed whitespace-pre-line">{p}</p>
        ))}
      </article>

      {/* Author Bio Section */}
      {(() => {
        if (!actor) return null;
        return (
          <div className="mx-4 mt-6 rounded-xl bg-card border border-border p-4 shadow-sm">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
              {lang === "ar" ? "عن الكاتب" : "About the Author"}
            </h2>
            <div className="flex items-start gap-3">
              <img
                src={actor.image}
                alt={actor.name[lang]}
                className="w-14 h-14 rounded-full object-cover flex-shrink-0 border-2 border-primary/20 cursor-pointer"
                onClick={() => navigate(`/culture-actor/${actor.id}`)}
              />
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-bold text-foreground cursor-pointer hover:text-primary transition-colors"
                  onClick={() => navigate(`/culture-actor/${actor.id}`)}
                >
                  {actor.name[lang]}
                </p>
                <p className="text-[11px] text-primary font-medium">{actor.title[lang]}</p>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-3">{actor.bio[lang]}</p>
                {actor.expertise && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {actor.expertise[lang].slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-[9px] bg-primary/10 text-primary font-medium px-1.5 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                )}
                {actor.quote && (
                  <p className="text-[11px] italic text-muted-foreground mt-2 border-s-2 border-primary/30 ps-2">
                    "{actor.quote[lang]}"
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => navigate(`/culture-actor/${actor.id}`)}
              className="w-full mt-3 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/15 rounded-lg py-2 transition-colors"
            >
              {lang === "ar" ? "عرض الملف الشخصي" : "View Full Profile"}
            </button>
          </div>
        );
      })()}

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="mt-8 px-4">
          <h2 className="text-base font-bold text-foreground mb-3">
            {lang === "ar" ? "محتوى ذو صلة" : "Related Content"}
          </h2>
          <div className="space-y-3">
            {relatedPosts.map((rp) => {
              const rpCt = (rp as any).contentType ? contentTypeConfig[(rp as any).contentType] : null;
              const RpIcon = rpCt?.icon;
              return (
                <div
                  key={rp.id}
                  onClick={() => navigate(`/post/${rp.slug || rp.id}`)}
                  className="flex gap-3 rounded-lg bg-card shadow-card border border-border overflow-hidden cursor-pointer"
                >
                  <div className="relative w-24 h-20 flex-shrink-0">
                    <img src={rp.image} alt={rp.title[lang]} className="w-full h-full object-cover" />
                    {rpCt && RpIcon && (
                      <span className={`absolute top-1 left-1 p-0.5 rounded ${rpCt.color}`}>
                        <RpIcon className="w-2.5 h-2.5 text-white" />
                      </span>
                    )}
                  </div>
                  <div className="py-2.5 pe-3 flex flex-col justify-center">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="text-[10px] font-medium text-primary">{rp.category[lang]}</span>
                      {rpCt && <span className="text-[9px] text-muted-foreground">• {rpCt.label[lang]}</span>}
                    </div>
                    <h3 className="text-xs font-semibold text-foreground line-clamp-2">{rp.title[lang]}</h3>
                    <span className="text-[10px] text-muted-foreground mt-1">{rp.readTime} {lang === "ar" ? "د" : "min"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Comments */}
      <PostComments postKey={post.id} />
    </div>
  );
};

export default PostDetail;