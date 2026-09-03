import CityNameSelect from "@/components/dashboard/CityNameSelect";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, MessageCircle, Plus, HelpCircle, Lightbulb, Camera } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { usePostComments, useAddComment } from "@/hooks/usePostComments";
import { toast } from "sonner";
import FollowingFeed from "@/components/FollowingFeed";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

type PostCategory = "memory" | "tip" | "question";

/**
 * HONESTY RULE: this feed renders only rows from public.community_posts.
 * It previously shipped a hardcoded `samplePosts` array — invented authors,
 * stock-photo avatars, fake like counts and "2d ago" timestamps — and the
 * compose box only pushed into local state, so nothing a member wrote was
 * ever saved. Likes and Share were also non-functional and are gone.
 */
interface CommunityPost {
  id: string;
  author_id: string;
  author_name: string | null;
  category: PostCategory;
  content: string;
  location: string | null;
  images: string[];
  created_at: string;
}


const categoryConfig: Record<PostCategory, { icon: typeof Camera; label: { en: string; ar: string }; color: string }> = {
  memory: { icon: Camera, label: { en: "Memory", ar: "ذكرى" }, color: "bg-primary/10 text-primary" },
  tip: { icon: Lightbulb, label: { en: "Tip", ar: "نصيحة" }, color: "bg-accent/20 text-accent-foreground" },
  question: { icon: HelpCircle, label: { en: "Question", ar: "سؤال" }, color: "bg-secondary text-secondary-foreground" },
};

const Community = () => {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [showCompose, setShowCompose] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<PostCategory>("memory");
  const [newLocation, setNewLocation] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | PostCategory>("all");
  const [topTab, setTopTab] = useState<"feed" | "following">("feed");
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<Record<string, string | null>>({});

  const { user } = useAuth();
  const meta = (user?.user_metadata ?? {}) as { display_name?: string; full_name?: string };
  const displayName = meta.display_name || meta.full_name || (lang === "ar" ? "مستخدم" : "User");
  const queryClient = useQueryClient();
  const [posting, setPosting] = useState(false);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["community-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_posts")
        .select("id, author_id, author_name, category, content, location, images, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as CommunityPost[];
    },
  });

  const postKeys = useMemo(() => posts.map((p) => `community-${p.id}`), [posts]);
  const { data: dbComments } = usePostComments(postKeys);
  const addComment = useAddComment(postKeys);

  // Group into top-level comments + replies-by-parent per post
  const threadsByPost = useMemo(() => {
    type C = NonNullable<typeof dbComments>[number];
    const out: Record<string, { roots: C[]; childrenByParent: Record<string, C[]> }> = {};
    (dbComments ?? []).forEach((c) => {
      const t = (out[c.post_key] ||= { roots: [], childrenByParent: {} });
      if (c.parent_id) {
        (t.childrenByParent[c.parent_id] ||= []).push(c);
      } else {
        t.roots.push(c);
      }
    });
    return out;
  }, [dbComments]);

  const filteredPosts = activeFilter === "all" ? posts : posts.filter((p) => p.category === activeFilter);

  const toggleComments = (id: string) =>
    setOpenComments((prev) => ({ ...prev, [id]: !prev[id] }));

  const buildAuthorPayload = () => ({
    // Never expose the full email publicly — fall back to a generic label.
    author_name: displayName,
    // Never persist raw external OAuth photo URLs (e.g. lh3.googleusercontent.com)
    // in publicly readable comments — they are linkable PII. Render initials instead.
    author_avatar: null,
  });

  const requireAuth = () => {
    if (!user) {
      toast.error(lang === "ar" ? "يرجى تسجيل الدخول للتعليق" : "Please sign in to comment");
      navigate("/login");
      return false;
    }
    return true;
  };

  const handleAddComment = async (id: string) => {
    const text = (commentDrafts[id] || "").trim();
    if (!text) return;
    if (!requireAuth()) return;
    try {
      await addComment.mutateAsync({
        post_key: `community-${id}`,
        text,
        ...buildAuthorPayload(),
      });
      setCommentDrafts((prev) => ({ ...prev, [id]: "" }));
      setOpenComments((prev) => ({ ...prev, [id]: true }));
    } catch {
      toast.error(lang === "ar" ? "فشل نشر التعليق" : "Failed to post comment");
    }
  };

  const handleAddReply = async (postId: string, parentId: string) => {
    const text = (replyDrafts[parentId] || "").trim();
    if (!text) return;
    if (!requireAuth()) return;
    try {
      await addComment.mutateAsync({
        post_key: `community-${postId}`,
        text,
        parent_id: parentId,
        ...buildAuthorPayload(),
      });
      setReplyDrafts((prev) => ({ ...prev, [parentId]: "" }));
      setReplyingTo((prev) => ({ ...prev, [postId]: null }));
    } catch {
      toast.error(lang === "ar" ? "فشل نشر الرد" : "Failed to post reply");
    }
  };

  const handlePost = async () => {
    if (!newContent.trim()) return;
    if (!requireAuth()) return;
    setPosting(true);
    try {
      const { error } = await supabase.from("community_posts").insert({
        author_id: user!.id,
        author_name: displayName,
        category: newCategory,
        content: newContent.trim(),
        location: newLocation.trim() || null,
      });
      if (error) throw error;
      setNewContent("");
      setNewLocation("");
      setShowCompose(false);
      await queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      toast.success(lang === "ar" ? "تم النشر" : "Posted");
    } catch {
      toast.error(lang === "ar" ? "فشل النشر" : "Could not post");
    } finally {
      setPosting(false);
    }
  };

  const filters: { key: "all" | PostCategory; label: { en: string; ar: string } }[] = [
    { key: "all", label: { en: "All", ar: "الكل" } },
    { key: "memory", label: { en: "Memories", ar: "ذكريات" } },
    { key: "tip", label: { en: "Tips", ar: "نصائح" } },
    { key: "question", label: { en: "Questions", ar: "أسئلة" } },
  ];

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3 bg-background border-b border-border">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground">
            {lang === "ar" ? "المجتمع" : "Community"}
          </h1>
          <p className="text-xs text-muted-foreground">
            {lang === "ar" ? "شارك ذكرياتك وتجاربك" : "Share memories & experiences"}
          </p>
        </div>
        <Button size="sm" onClick={() => setShowCompose(!showCompose)} className="gap-1">
          <Plus className="w-4 h-4" />
          {lang === "ar" ? "نشر" : "Post"}
        </Button>
      </header>

      {/* Compose */}
      {showCompose && (
        <div className="mx-4 mt-3 p-4 bg-background rounded-xl border border-border shadow-sm">
          <div className="flex gap-2 mb-3">
            {(["memory", "tip", "question"] as PostCategory[]).map((cat) => {
              const cfg = categoryConfig[cat];
              const CatIcon = cfg.icon;
              return (
                <button
                  key={cat}
                  onClick={() => setNewCategory(cat)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    newCategory === cat ? "bg-primary text-primary-foreground" : cfg.color
                  }`}
                >
                  <CatIcon className="w-3.5 h-3.5" />
                  {cfg.label[lang]}
                </button>
              );
            })}
          </div>
          <Textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder={
              lang === "ar"
                ? "شارك تجربتك، نصيحة، أو سؤال..."
                : "Share a memory, tip, or question..."
            }
            className="mb-2 resize-none bg-secondary border-none text-sm"
            rows={3}
          />
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary flex-1">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <CityNameSelect
                  value={newLocation}
                  onChange={(cityName) => setNewLocation(cityName)}
                  className="h-6 w-full border-none bg-transparent text-xs p-0 focus:outline-none"
                  placeholder={lang === "ar" ? "المدينة" : "City"}
                />
              </div>
            </div>
            <Button size="sm" onClick={handlePost} disabled={!newContent.trim() || posting}>
              {lang === "ar" ? "نشر" : "Post"}
            </Button>
          </div>
        </div>
      )}

      {/* Top tabs: Feed vs Following */}
      <div className="flex gap-2 px-4 pt-3">
        {([
          { key: "feed", label: { en: "Feed", ar: "الموجز" } },
          { key: "following", label: { en: "Following", ar: "أتابع" } },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setTopTab(tab.key)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
              topTab === tab.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {tab.label[lang]}
          </button>
        ))}
      </div>

      {topTab === "following" ? (
        <div className="pt-3">
          <FollowingFeed />
        </div>
      ) : (
      <>
      {/* Filters */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto hide-scrollbar">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeFilter === f.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {f.label[lang]}
          </button>
        ))}
      </div>

      {/* Posts Feed */}
      <div className="px-4 space-y-3">
        {isLoading && <Skeleton className="h-28 w-full rounded-xl" />}
        {!isLoading && filteredPosts.length === 0 && (
          <div className="text-center py-10">
            <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {lang === "ar" ? "لا توجد منشورات بعد. كن أول من يشارك." : "No posts yet. Be the first to share."}
            </p>
          </div>
        )}
        {filteredPosts.map((post) => {
          const cfg = categoryConfig[post.category];
          const CatIcon = cfg.icon;
          return (
            <article key={post.id} className="bg-background rounded-xl border border-border overflow-hidden">
              {/* Post Header */}
              <div className="flex items-center gap-3 p-3 pb-0">
                <div
                  onClick={() => navigate(`/visitor/${post.author_id}`)}
                  className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold cursor-pointer flex-shrink-0"
                >
                  {(post.author_name || "?").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span onClick={() => navigate(`/visitor/${post.author_id}`)} className="text-sm font-semibold text-foreground cursor-pointer hover:text-primary transition-colors">{post.author_name || (lang === "ar" ? "مستخدم" : "User")}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.color}`}>
                      <CatIcon className="w-3 h-3" />
                      {cfg.label[lang]}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span>{new Date(post.created_at).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", { dateStyle: "medium" })}</span>
                    {post.location && (
                      <>
                        <span>·</span>
                        <MapPin className="w-3 h-3" />
                        <span>{post.location}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <p className="px-3 py-2 text-sm text-foreground leading-relaxed">{post.content}</p>

              {/* Images */}
              {(post.images?.length ?? 0) > 0 && (
                <div className="px-3 pb-2">
                  <img
                    src={post.images[0]}
                    alt=""
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-1 px-3 py-2 border-t border-border">
                <button
                  onClick={() => toggleComments(post.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    openComments[post.id] ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  {(() => {
                    const t = threadsByPost[`community-${post.id}`];
                    const total = t ? t.roots.length + Object.values(t.childrenByParent).reduce((a, arr) => a + arr.length, 0) : 0;
                    return total;
                  })()}
                </button>
              </div>

              {/* Comments */}
              {openComments[post.id] && (() => {
                const thread = threadsByPost[`community-${post.id}`] || { roots: [], childrenByParent: {} };
                const renderComment = (c: typeof thread.roots[number], isReply = false) => (
                  <div key={c.id} className={`flex gap-2 ${isReply ? "ms-9" : ""}`}>
                    {c.author_avatar ? (
                      <img src={c.author_avatar} alt={c.author_name} className={`${isReply ? "w-6 h-6" : "w-7 h-7"} rounded-full object-cover flex-shrink-0`} />
                    ) : (
                      <div className={`${isReply ? "w-6 h-6" : "w-7 h-7"} rounded-full bg-primary/15 text-primary flex items-center justify-center text-[10px] font-bold flex-shrink-0`}>
                        {c.author_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="bg-background rounded-2xl px-3 py-2 border border-border">
                        <p className="text-xs font-semibold text-foreground">{c.author_name}</p>
                        <p className="text-xs text-foreground leading-relaxed mt-0.5 break-words">{c.text}</p>
                      </div>
                      <div className="flex items-center gap-3 mt-1 ms-3">
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(c.created_at).toLocaleString(lang === "ar" ? "ar-EG" : "en-US", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                        {!isReply && (
                          <button
                            onClick={() => {
                              if (!user) { requireAuth(); return; }
                              setReplyingTo((prev) => ({ ...prev, [post.id]: prev[post.id] === c.id ? null : c.id }));
                            }}
                            className="text-[10px] font-semibold text-primary hover:underline"
                          >
                            {lang === "ar" ? "رد" : "Reply"}
                          </button>
                        )}
                      </div>

                      {/* Render children replies */}
                      {!isReply && (thread.childrenByParent[c.id] || []).length > 0 && (
                        <div className="mt-2 space-y-2">
                          {thread.childrenByParent[c.id].map((reply) => renderComment(reply, true))}
                        </div>
                      )}

                      {/* Inline reply composer */}
                      {!isReply && replyingTo[post.id] === c.id && (
                        <div className="flex items-center gap-2 mt-2">
                          <Input
                            autoFocus
                            value={replyDrafts[c.id] || ""}
                            onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [c.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleAddReply(post.id, c.id);
                              }
                            }}
                            placeholder={lang === "ar" ? `الرد على ${c.author_name}...` : `Reply to ${c.author_name}...`}
                            className="h-8 bg-background text-xs rounded-full"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleAddReply(post.id, c.id)}
                            disabled={!(replyDrafts[c.id] || "").trim() || addComment.isPending}
                          >
                            {lang === "ar" ? "رد" : "Reply"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );

                return (
                  <div className="border-t border-border bg-secondary/30 px-3 py-3 space-y-3">
                    {thread.roots.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-1">
                        {lang === "ar" ? "كن أول من يعلّق" : "Be the first to comment"}
                      </p>
                    )}
                    {thread.roots.map((c) => renderComment(c))}
                    <div className="flex items-center gap-2 pt-1">
                      <Input
                        value={commentDrafts[post.id] || ""}
                        onChange={(e) =>
                          setCommentDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleAddComment(post.id);
                          }
                        }}
                        placeholder={
                          user
                            ? lang === "ar" ? "اكتب تعليقًا..." : "Write a comment..."
                            : lang === "ar" ? "سجّل الدخول للتعليق" : "Sign in to comment"
                        }
                        className="h-9 bg-background text-xs rounded-full"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAddComment(post.id)}
                        disabled={!(commentDrafts[post.id] || "").trim() || addComment.isPending}
                      >
                        {lang === "ar" ? "إرسال" : "Send"}
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </article>
          );
        })}
      </div>
      </>
      )}

      <BottomNav />
    </div>
  );
};

export default Community;
