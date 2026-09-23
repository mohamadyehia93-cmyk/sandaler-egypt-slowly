import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MessageSquare, Star, PenLine } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Everything the visitor has written, read straight from their own rows:
 * experience reviews, community posts and article comments. No aggregates,
 * no estimates — an empty section stays visibly empty.
 */
const MyActivity = () => {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const ar = lang === "ar";
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["my-activity", user?.id ?? null],
    enabled: !!user,
    queryFn: async () => {
      const uid = user!.id;
      const [reviews, posts, comments] = await Promise.all([
        supabase
          .from("experience_reviews")
          .select("id, rating, review_text, created_at, experience_id")
          .eq("user_id", uid)
          .order("created_at", { ascending: false }),
        supabase
          .from("community_posts")
          .select("id, content, category, created_at")
          .eq("author_id", uid)
          .order("created_at", { ascending: false }),
        supabase
          .from("post_comments")
          .select("id, text, post_key, created_at")
          .eq("user_id", uid)
          .order("created_at", { ascending: false }),
      ]);

      // experience_reviews has no FK to experiences, so the titles are looked up
      // in a second query rather than through an embed.
      const reviewRows = reviews.data ?? [];
      const ids = [...new Set(reviewRows.map((r) => r.experience_id))];
      const titles = new Map<string, { title_en: string; title_ar: string | null; slug: string | null }>();
      if (ids.length) {
        const { data: exps } = await supabase
          .from("experiences")
          .select("id, title_en, title_ar, slug")
          .in("id", ids);
        (exps ?? []).forEach((e) => titles.set(e.id, e));
      }

      return {
        reviews: reviewRows.map((r) => ({ ...r, experience: titles.get(r.experience_id) ?? null })),
        posts: posts.data ?? [],
        comments: comments.data ?? [],
      };
    },
  });

  const empty =
    !!data && data.reviews.length === 0 && data.posts.length === 0 && data.comments.length === 0;

  const dateOf = (v: string) => new Date(v).toLocaleDateString(ar ? "ar-EG" : "en-GB");

  return (
    <div className="min-h-screen bg-surface">
      <header className="flex items-center gap-3 px-4 py-3 bg-background sticky top-0 z-40 border-b border-border">
        <button onClick={() => navigate(-1)} aria-label={lang === "ar" ? "رجوع" : "Back"} className="tap-target rounded-full hover:bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground rtl:rotate-180" />
        </button>
        <h1 className="text-lg font-bold text-foreground">{ar ? "نشاطك" : "Your activity"}</h1>
      </header>

      <div className="px-4 pt-5 space-y-6">
        {!user ? (
          <p className="text-sm text-muted-foreground text-center py-16">
            {ar ? "سجّل الدخول لعرض نشاطك." : "Sign in to see your activity."}
          </p>
        ) : isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : empty ? (
          <div className="text-center py-16">
            <PenLine className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {ar
                ? "لم تكتب شيئاً بعد. تقييماتك ومنشوراتك ستظهر هنا."
                : "You haven't written anything yet. Your reviews and posts will show up here."}
            </p>
          </div>
        ) : (
          <>
            {data!.reviews.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-foreground mb-2 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-primary" />
                  {ar ? "تقييماتك" : "Your reviews"} ({data!.reviews.length})
                </h2>
                <div className="space-y-2">
                  {data!.reviews.map((r) => {
                    const exp = r.experience;
                    const title = (ar ? exp?.title_ar || exp?.title_en : exp?.title_en) || "";
                    return (
                      <button
                        key={r.id}
                        onClick={() => navigate(`/experience/${exp?.slug || r.experience_id}`)}
                        className="w-full bg-card rounded-xl shadow-card p-3 text-left"
                      >
                        <p className="text-sm font-medium text-foreground">{title}</p>
                        <p className="text-xs text-primary mt-0.5">{"★".repeat(r.rating)}</p>
                        {r.review_text && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.review_text}</p>
                        )}
                        <p className="text-[11px] text-muted-foreground mt-1">{dateOf(r.created_at)}</p>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {data!.posts.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-foreground mb-2 flex items-center gap-1.5">
                  <PenLine className="w-4 h-4 text-primary" />
                  {ar ? "منشوراتك" : "Your posts"} ({data!.posts.length})
                </h2>
                <div className="space-y-2">
                  {data!.posts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => navigate("/community")}
                      className="w-full bg-card rounded-xl shadow-card p-3 text-left"
                    >
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">{p.category}</p>
                      <p className="text-sm text-foreground mt-0.5 line-clamp-3">{p.content}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">{dateOf(p.created_at)}</p>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {data!.comments.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-foreground mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  {ar ? "تعليقاتك" : "Your comments"} ({data!.comments.length})
                </h2>
                <div className="space-y-2">
                  {data!.comments.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => navigate(`/post/${c.post_key}`)}
                      className="w-full bg-card rounded-xl shadow-card p-3 text-left"
                    >
                      <p className="text-sm text-foreground line-clamp-3">{c.text}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">{dateOf(c.created_at)}</p>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyActivity;
