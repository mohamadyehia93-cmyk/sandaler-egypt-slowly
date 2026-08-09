import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { usePostComments, useAddComment, type PostComment } from "@/hooks/usePostComments";

interface Props {
  /** Stable key for this post's comment thread (use the real post UUID). */
  postKey: string;
}

const PostComments = ({ postKey }: Props) => {
  const { lang } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const keys = useMemo(() => [postKey], [postKey]);

  const { data: comments, isLoading } = usePostComments(keys);
  const addComment = useAddComment(keys);

  const [draft, setDraft] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  const thread = useMemo(() => {
    const roots: PostComment[] = [];
    const childrenByParent: Record<string, PostComment[]> = {};
    (comments ?? []).forEach((c) => {
      if (c.parent_id) (childrenByParent[c.parent_id] ||= []).push(c);
      else roots.push(c);
    });
    return { roots, childrenByParent };
  }, [comments]);

  const buildAuthorPayload = () => ({
    author_name:
      (user!.user_metadata as any)?.display_name ||
      (user!.user_metadata as any)?.full_name ||
      (lang === "ar" ? "مستخدم" : "User"),
    author_avatar: null,
  });

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
      month: "short",
      day: "numeric",
    });

  const initials = (name: string) =>
    name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  const submit = async (text: string, parentId?: string) => {
    const body = text.trim();
    if (!body) return;
    try {
      await addComment.mutateAsync({
        post_key: postKey,
        text: body,
        parent_id: parentId ?? null,
        ...buildAuthorPayload(),
      });
      if (parentId) {
        setReplyDrafts((p) => ({ ...p, [parentId]: "" }));
        setReplyingTo(null);
      } else {
        setDraft("");
      }
    } catch {
      toast.error(lang === "ar" ? "فشل نشر التعليق" : "Failed to post comment");
    }
  };

  const renderComment = (c: PostComment, isReply = false) => (
    <div key={c.id} className={isReply ? "ms-9 mt-2" : "mt-3"}>
      <div className="flex gap-2">
        {c.author_avatar ? (
          <img src={c.author_avatar} alt={c.author_name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0">
            {initials(c.author_name || "?")}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="rounded-xl bg-muted/60 px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-foreground truncate">{c.author_name}</span>
              <span className="text-[10px] text-muted-foreground">{fmt(c.created_at)}</span>
            </div>
            <p className="text-xs text-foreground leading-relaxed mt-0.5 whitespace-pre-line">{c.text}</p>
          </div>
          {!isReply && (
            <button
              onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)}
              className="text-[10px] font-semibold text-primary mt-1 px-1"
            >
              {lang === "ar" ? "رد" : "Reply"}
            </button>
          )}
        </div>
      </div>

      {!isReply && (thread.childrenByParent[c.id] ?? []).map((r) => renderComment(r, true))}

      {!isReply && replyingTo === c.id && (
        <div className="ms-9 mt-2 flex items-center gap-2">
          <input
            value={replyDrafts[c.id] || ""}
            onChange={(e) => setReplyDrafts((p) => ({ ...p, [c.id]: e.target.value }))}
            onKeyDown={(e) => { if (e.key === "Enter") submit(replyDrafts[c.id] || "", c.id); }}
            placeholder={lang === "ar" ? "اكتب رداً..." : "Write a reply..."}
            className="flex-1 text-xs bg-background border border-border rounded-full px-3 py-2 outline-none focus:border-primary"
          />
          <button
            onClick={() => submit(replyDrafts[c.id] || "", c.id)}
            disabled={!(replyDrafts[c.id] || "").trim() || addComment.isPending}
            className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5 rtl:-scale-x-100" />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <section className="mt-8 px-4">
      <h2 className="flex items-center gap-2 text-base font-bold text-foreground mb-1">
        <MessageCircle className="w-4 h-4 text-primary" />
        {lang === "ar" ? "التعليقات" : "Comments"}
        {(comments?.length ?? 0) > 0 && (
          <span className="text-xs font-semibold text-muted-foreground">({comments!.length})</span>
        )}
      </h2>

      {isLoading ? (
        <div className="space-y-2 mt-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-12 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : thread.roots.length === 0 ? (
        <p className="text-xs text-muted-foreground mt-2">
          {lang === "ar" ? "لا توجد تعليقات بعد" : "No comments yet"}
        </p>
      ) : (
        <div>{thread.roots.map((c) => renderComment(c))}</div>
      )}

      {user ? (
        <div className="flex items-center gap-2 mt-4">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(draft); }}
            placeholder={lang === "ar" ? "أضف تعليقاً..." : "Add a comment..."}
            className="flex-1 text-xs bg-background border border-border rounded-full px-3 py-2.5 outline-none focus:border-primary"
          />
          <button
            onClick={() => submit(draft)}
            disabled={!draft.trim() || addComment.isPending}
            className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40"
          >
            <Send className="w-4 h-4 rtl:-scale-x-100" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => navigate("/login")}
          className="w-full mt-4 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/15 rounded-lg py-2.5 transition-colors"
        >
          {lang === "ar" ? "سجّل الدخول للتعليق" : "Sign in to comment"}
        </button>
      )}
    </section>
  );
};

export default PostComments;
