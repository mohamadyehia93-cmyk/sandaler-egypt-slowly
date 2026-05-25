import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import { useTranslation } from "react-i18next";
import { SEO } from "@/components/SEO";
import { ArrowLeft, Share2, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import BottomNav from "@/components/BottomNav";

export default function RegionPage() {
  const { slug } = useParams<{ slug: string }>();
  const { lang, isRTL } = useLanguage();
  const { t } = useTranslation();

  const { data: region, isLoading } = useQuery({
    queryKey: ["region", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("regions")
        .select("id, name_en, name_ar, tagline_en, tagline_ar, about_en, about_ar, image, governorates, season_highlights_en, season_highlights_ar, color")
        .eq("id", slug!)
        .eq("is_active", true)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { data: experiences = [] } = useQuery({
    queryKey: ["region-experiences", slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("experiences")
        .select("id, slug, title_en, title_ar, price, image, rating")
        .eq("region_id", slug!)
        .eq("status", "published")
        .limit(6);
      return data ?? [];
    },
    enabled: !!slug,
  });

  const { data: posts = [] } = useQuery({
    queryKey: ["region-posts", slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("posts")
        .select("id, slug, title_en, title_ar, category, image, read_time_minutes")
        .eq("region_id", slug!)
        .eq("status", "published")
        .limit(4);
      return data ?? [];
    },
    enabled: !!slug,
  });

  const { data: audioTours = [] } = useQuery({
    queryKey: ["region-audio-tours", slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("audio_tours")
        .select("id, slug, title_en, title_ar, duration_minutes, stops_count, price, image")
        .eq("region_id", slug!)
        .eq("status", "published")
        .limit(4);
      return data ?? [];
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-cairo">
        <div className="w-10 h-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!region) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-cairo p-6 text-center">
        <h1 className="text-2xl font-bold mb-3">{t("region.not_found")}</h1>
        <Link to="/" className="text-primary underline">
          {t("region.return_home")}
        </Link>
      </div>
    );
  }

  const name = lang === "ar" ? region.name_ar : region.name_en;
  const tagline = lang === "ar" ? region.tagline_ar : region.tagline_en;
  const description = lang === "ar" ? region.about_ar : region.about_en;
  const seasonalText = lang === "ar" ? region.season_highlights_ar : region.season_highlights_en;
  const seoTitle =
    lang === "ar" ? `${name} — اكتشف مصر الريفية` : `${name} — Discover Rural Egypt`;

  const heroStyle = region.image
    ? {
        background: `linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.45) 100%), url(${region.image}) center/cover no-repeat`,
      }
    : { background: `linear-gradient(135deg, ${region.color ?? "#2BBFB3"} 0%, #1A7A74 100%)` };

  return (
    <>
      <SEO
        title={seoTitle}
        description={description ?? undefined}
        image={region.image ?? undefined}
        url={`/regions/${slug}`}
      />

      <div className={`min-h-screen bg-background font-cairo pb-20 ${isRTL ? "rtl" : "ltr"}`}>
        {/* HERO */}
        <div className="relative h-64 overflow-hidden" style={heroStyle}>
          <div className="absolute inset-0 flex flex-col">
            <div className="flex items-center justify-between p-4 pt-safe">
              <Link
                to="/"
                className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow"
                aria-label={t("common.back")}
              >
                <ArrowLeft className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
              </Link>
              <button
                className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow"
                aria-label={t("common.share")}
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 flex items-end p-4">
              <div className="bg-white/95 rounded-xl px-3 py-2.5 w-full max-w-md flex items-center gap-2 shadow">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground truncate">
                  {t("region.explore", { name })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* TITLE BLOCK */}
        <div className="px-4 py-4 border-b border-border">
          <h1 className="text-3xl font-bold mb-1">{name}</h1>
          {tagline && <p className="text-sm text-primary font-medium mb-2">{tagline}</p>}
          {region.governorates && region.governorates.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {region.governorates.join(" · ")}
            </p>
          )}
        </div>

        {/* TABS */}
        <Tabs defaultValue="discover" className="px-4 pt-2">
          <TabsList className="w-full grid grid-cols-4 mb-2">
            <TabsTrigger value="discover">{t("region.tab_discover")}</TabsTrigger>
            <TabsTrigger value="stories">{t("region.tab_stories")}</TabsTrigger>
            <TabsTrigger value="experiences">{t("region.tab_experiences")}</TabsTrigger>
            <TabsTrigger value="audio">{t("region.tab_audio")}</TabsTrigger>
          </TabsList>

          {/* ── DISCOVER TAB ── */}
          <TabsContent value="discover" className="py-4 space-y-6">
            {description && (
              <div>
                <h2 className="text-lg font-semibold mb-2">{t("region.about", { name })}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            )}

            {seasonalText && (
              <div className="bg-accent border-s-[3px] border-primary rounded-e-lg p-3">
                <div className="text-[10px] font-semibold text-primary uppercase tracking-wide mb-1">
                  {t("region.seasonal")}
                </div>
                <p className="text-xs text-foreground">{seasonalText}</p>
              </div>
            )}

            {posts.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">{t("region.tab_stories")}</h2>
                <div className="grid grid-cols-2 gap-3">
                  {posts.slice(0, 2).map((post) => (
                    <Link key={post.id} to={`/post/${post.slug ?? post.id}`}>
                      <Card className="overflow-hidden">
                        <div
                          className="h-32 bg-cover bg-center bg-muted"
                          style={post.image ? { backgroundImage: `url(${post.image})` } : undefined}
                        />
                        <div className="p-3">
                          <div className="text-[10px] text-primary uppercase tracking-wide mb-1 truncate">
                            {post.category}
                          </div>
                          <h3 className="text-sm font-semibold line-clamp-2">
                            {lang === "ar" ? post.title_ar : post.title_en}
                          </h3>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {experiences.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">{t("region.tab_experiences")}</h2>
                <div className="grid grid-cols-2 gap-3">
                  {experiences.slice(0, 4).map((exp) => (
                    <Link key={exp.id} to={`/experience/${exp.slug ?? exp.id}`}>
                      <Card className="overflow-hidden">
                        <div
                          className="h-28 bg-cover bg-center bg-muted"
                          style={exp.image ? { backgroundImage: `url(${exp.image})` } : undefined}
                        />
                        <div className="p-2.5">
                          <h3 className="text-xs font-semibold line-clamp-2 mb-1">
                            {lang === "ar" ? exp.title_ar : exp.title_en}
                          </h3>
                          <p className="text-[11px] text-primary font-semibold">
                            {exp.price === 0 ? t("region.free") : `${exp.price} ${t("common.egp")}`}
                          </p>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* ── STORIES TAB ── */}
          <TabsContent value="stories" className="py-4">
            {posts.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {posts.map((post) => (
                  <Link key={post.id} to={`/post/${post.slug ?? post.id}`}>
                    <Card className="overflow-hidden">
                      <div
                        className="h-48 bg-cover bg-center bg-muted"
                        style={post.image ? { backgroundImage: `url(${post.image})` } : undefined}
                      />
                      <div className="p-4">
                        <div className="text-[10px] text-primary uppercase tracking-wide mb-1">
                          {post.category}
                        </div>
                        <h3 className="font-semibold mb-1">
                          {lang === "ar" ? post.title_ar : post.title_en}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {post.read_time_minutes} {t("region.min_read")}
                        </p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">
                {t("region.no_stories")}
              </p>
            )}
          </TabsContent>

          {/* ── EXPERIENCES TAB ── */}
          <TabsContent value="experiences" className="py-4">
            {experiences.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {experiences.map((exp) => (
                  <Link key={exp.id} to={`/experience/${exp.slug ?? exp.id}`}>
                    <Card className="overflow-hidden">
                      <div
                        className="h-32 bg-cover bg-center bg-muted"
                        style={exp.image ? { backgroundImage: `url(${exp.image})` } : undefined}
                      />
                      <div className="p-3">
                        <h3 className="text-sm font-semibold line-clamp-2 mb-1">
                          {lang === "ar" ? exp.title_ar : exp.title_en}
                        </h3>
                        <p className="text-xs text-primary font-semibold">
                          {exp.price === 0 ? t("region.free") : `${exp.price} ${t("common.egp")}`}
                        </p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">
                {t("region.no_experiences")}
              </p>
            )}
          </TabsContent>

          {/* ── AUDIO TOURS TAB ── */}
          <TabsContent value="audio" className="py-4">
            {audioTours.length > 0 ? (
              <div className="space-y-3">
                {audioTours.map((tour) => (
                  <Link key={tour.id} to={`/audio-tour/${tour.slug ?? tour.id}`}>
                    <Card className="overflow-hidden flex">
                      <div
                        className="w-28 h-28 bg-cover bg-center bg-muted shrink-0"
                        style={tour.image ? { backgroundImage: `url(${tour.image})` } : undefined}
                      />
                      <div className="p-3 flex-1 min-w-0">
                        <h3 className="text-sm font-semibold line-clamp-2 mb-1">
                          {lang === "ar" ? tour.title_ar : tour.title_en}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {tour.duration_minutes} {t("region.min")} · {tour.stops_count} {t("region.stops")}
                        </p>
                        <p className="text-xs text-primary font-semibold mt-1">
                          {tour.price === 0 ? t("region.free") : `${tour.price} ${t("common.egp")}`}
                        </p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">
                {t("region.no_audio")}
              </p>
            )}
          </TabsContent>
        </Tabs>

        <BottomNav />
      </div>
    </>
  );
}
