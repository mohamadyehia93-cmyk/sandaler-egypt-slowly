import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ChevronRight, UserPlus, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { causes } from "@/lib/sampleData";
import {
  useMyFollows,
  useToggleFollow,
} from "@/hooks/useFollows";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Cause = (typeof causes)[number];

/** Stable org target id matches OrganizationDetail logic. */
function orgTargetIdFor(c: Cause): string {
  const programs = causes
    .filter((x) => x.org.name.en === c.org.name.en)
    .sort((a, b) => a.id.localeCompare(b.id));
  return `org-${programs[0].id}`;
}

const FollowingFeed = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: follows = [], isLoading } = useMyFollows();
  const toggleFollow = useToggleFollow();

  const followedOrgIds = useMemo(
    () =>
      new Set(
        follows
          .filter((f) => f.target_type === "organization")
          .map((f) => f.target_id)
      ),
    [follows]
  );

  // "Posts" = programs/causes from followed organizations.
  const feed = useMemo(() => {
    return causes.filter((c) => followedOrgIds.has(orgTargetIdFor(c)));
  }, [followedOrgIds]);

  // Suggested orgs: dedupe by org name, pick up to 5 with the most supporters.
  const suggestions = useMemo(() => {
    const byOrg = new Map<string, Cause>();
    for (const c of causes) {
      const key = c.org.name.en;
      const cur = byOrg.get(key);
      if (!cur || c.supporters > cur.supporters) byOrg.set(key, c);
    }
    return Array.from(byOrg.values())
      .filter((c) => !followedOrgIds.has(orgTargetIdFor(c)))
      .sort((a, b) => b.supporters - a.supporters)
      .slice(0, 6);
  }, [followedOrgIds]);

  // --- Not signed in ---
  if (!user) {
    return (
      <div className="px-4 py-10 text-center">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <UserPlus className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-sm font-bold text-foreground mb-1">
          {lang === "ar" ? "سجّل الدخول لمتابعة المنظمات" : "Sign in to follow organizations"}
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          {lang === "ar"
            ? "تابع المنظمات وشاهد آخر منشوراتها هنا."
            : "Follow organizations to see their latest posts here."}
        </p>
        <Button size="sm" onClick={() => navigate("/login")}>
          {lang === "ar" ? "تسجيل الدخول" : "Sign in"}
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="px-4 py-10 text-center text-xs text-muted-foreground">
        {lang === "ar" ? "جارٍ التحميل..." : "Loading..."}
      </div>
    );
  }

  return (
    <div className="px-4 space-y-3">
      {/* Feed posts from followed orgs */}
      {feed.length > 0 ? (
        feed.map((c) => (
          <article
            key={c.id}
            className="bg-background rounded-xl border border-border overflow-hidden"
          >
            <button
              onClick={() => navigate(`/organization/${c.id}`)}
              className="flex items-center gap-3 p-3 pb-2 w-full text-start"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl shrink-0">
                {c.org.logo}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {c.org.name[lang]}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {c.category[lang]}
                </p>
              </div>
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                {lang === "ar" ? "متابَع" : "Following"}
              </span>
            </button>

            <button
              onClick={() => navigate(`/cause/${c.id}`)}
              className="w-full text-start"
            >
              <p className="px-3 pb-2 text-sm font-semibold text-foreground line-clamp-2">
                {c.title[lang]}
              </p>
              <p className="px-3 pb-2 text-xs text-muted-foreground line-clamp-2">
                {c.summary[lang]}
              </p>
              {c.image && (
                <img
                  src={c.image}
                  alt=""
                  className="w-full h-44 object-cover"
                />
              )}
              <div className="flex items-center justify-between px-3 py-2.5 border-t border-border">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Heart className="w-3.5 h-3.5 text-primary" />
                  {c.supporters} {lang === "ar" ? "داعم" : "supporters"}
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-primary">
                  {lang === "ar" ? "اعرف المزيد" : "Learn more"}
                  <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </span>
              </div>
            </button>
          </article>
        ))
      ) : (
        // --- Empty state: suggestions ---
        <div>
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-sm font-bold text-foreground mb-1">
              {lang === "ar"
                ? "لا تتابع أي منظمة بعد"
                : "You're not following anyone yet"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {lang === "ar"
                ? "تابع منظمة لعرض آخر منشوراتها هنا."
                : "Follow an organization to see its latest posts here."}
            </p>
          </div>
          <h4 className="text-xs font-bold text-foreground mb-2 uppercase tracking-wide">
            {lang === "ar" ? "اقتراحات لك" : "Suggested for you"}
          </h4>
          <div className="space-y-2">
            {suggestions.map((c) => {
              const targetId = orgTargetIdFor(c);
              return (
                <div
                  key={c.id}
                  className="flex items-center gap-3 bg-background rounded-xl border border-border p-3"
                >
                  <button
                    onClick={() => navigate(`/organization/${c.id}`)}
                    className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-xl shrink-0"
                  >
                    {c.org.logo}
                  </button>
                  <button
                    onClick={() => navigate(`/organization/${c.id}`)}
                    className="flex-1 min-w-0 text-start"
                  >
                    <p className="text-xs font-semibold text-foreground truncate">
                      {c.org.name[lang]}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {c.category[lang]} · {c.supporters}{" "}
                      {lang === "ar" ? "داعم" : "supporters"}
                    </p>
                  </button>
                  <button
                    onClick={() =>
                      toggleFollow.mutate(
                        {
                          targetType: "organization",
                          targetId,
                          currentlyFollowing: false,
                        },
                        {
                          onSuccess: () =>
                            toast.success(
                              lang === "ar" ? "تتم المتابعة الآن" : "Now following"
                            ),
                          onError: () =>
                            toast.error(
                              lang === "ar"
                                ? "تعذّر المتابعة"
                                : "Couldn't follow"
                            ),
                        }
                      )
                    }
                    disabled={toggleFollow.isPending}
                    className="shrink-0 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    {lang === "ar" ? "متابعة" : "Follow"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowingFeed;
