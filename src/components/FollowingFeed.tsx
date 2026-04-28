import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ChevronRight, UserPlus, Sparkles, Building2, Users as UsersIcon, User as UserIcon, Feather } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import {
  causes,
  cultureActors,
  whosWho,
  latestPosts,
} from "@/lib/sampleData";
import { useMyFollows } from "@/hooks/useFollows";
import { Button } from "@/components/ui/button";
import FollowButton from "@/components/FollowButton";

type Cause = (typeof causes)[number];

/** Stable org target id matches OrganizationDetail logic. */
function orgTargetIdFor(c: Cause): string | null {
  if (!c?.org?.name?.en) return null;
  const programs = causes
    .filter((x) => x?.org?.name?.en === c.org.name.en)
    .sort((a, b) => a.id.localeCompare(b.id));
  return programs[0] ? `org-${programs[0].id}` : null;
}

/** Visitor profile data we can suggest. */
const visitorSuggestions = [
  { id: "sarah-m", name: { en: "Sarah M.", ar: "سارة م." }, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80", role: { en: "Traveler", ar: "مسافرة" } },
  { id: "ahmed-k", name: { en: "Ahmed K.", ar: "أحمد ك." }, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80", role: { en: "Traveler", ar: "مسافر" } },
];

const FollowingFeed = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: follows = [], isLoading } = useMyFollows();

  // Group follows by type for quick lookup
  const followedIdsByType = useMemo(() => {
    const out: Record<string, Set<string>> = {};
    for (const f of follows) {
      (out[f.target_type] ||= new Set()).add(f.target_id);
    }
    return out;
  }, [follows]);

  const followsOrg = useMemo(() => followedIdsByType["organization"] ?? new Set<string>(), [followedIdsByType]);
  const followsCultureActor = useMemo(() => followedIdsByType["culture_actor"] ?? new Set<string>(), [followedIdsByType]);
  const followsPerson = useMemo(() => followedIdsByType["person"] ?? new Set<string>(), [followedIdsByType]);
  const followsVisitor = useMemo(() => followedIdsByType["visitor"] ?? new Set<string>(), [followedIdsByType]);
  const followsProvider = useMemo(() => followedIdsByType["provider"] ?? new Set<string>(), [followedIdsByType]);

  // ----- Build feed sections -----

  // Organizations: their programs/causes count as "posts"
  const orgPosts = useMemo(
    () =>
      causes.filter((c) => {
        const id = orgTargetIdFor(c);
        return id ? followsOrg.has(id) : false;
      }),
    [followsOrg]
  );

  // Culture actors / persons / providers / visitors: their authored posts in latestPosts
  const followedAuthorIds = useMemo(() => {
    const set = new Set<string>();
    followsCultureActor.forEach((id) => set.add(id));
    followsPerson.forEach((id) => set.add(id));
    followsProvider.forEach((id) => set.add(id));
    followsVisitor.forEach((id) => set.add(id));
    return set;
  }, [followsCultureActor, followsPerson, followsProvider, followsVisitor]);

  const peoplePosts = useMemo(
    () => latestPosts.filter((p) => followedAuthorIds.has(p.authorId)),
    [followedAuthorIds]
  );

  const totalFollowed =
    followsOrg.size +
    followsCultureActor.size +
    followsPerson.size +
    followsVisitor.size +
    followsProvider.size;

  // ----- Suggestions when nothing followed -----
  const suggestions = useMemo(() => {
    // Orgs: dedupe by name, top by supporters
    const orgByName = new Map<string, Cause>();
    for (const c of causes) {
      const key = c?.org?.name?.en;
      if (!key) continue;
      const cur = orgByName.get(key);
      if (!cur || c.supporters > cur.supporters) orgByName.set(key, c);
    }
    const orgs = Array.from(orgByName.values())
      .filter((c) => {
        const id = orgTargetIdFor(c);
        return id ? !followsOrg.has(id) : false;
      })
      .sort((a, b) => b.supporters - a.supporters)
      .slice(0, 3);

    const actors = cultureActors
      .filter((a) => !followsCultureActor.has(a.id))
      .slice(0, 3);

    const people = whosWho
      .filter((p) => !followsPerson.has(p.id))
      .slice(0, 3);

    const visitors = visitorSuggestions
      .filter((v) => !followsVisitor.has(v.id))
      .slice(0, 2);

    return { orgs, actors, people, visitors };
  }, [followsOrg, followsCultureActor, followsPerson, followsVisitor]);

  // ----- Renders -----

  if (!user) {
    return (
      <div className="px-4 py-10 text-center">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <UserPlus className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-sm font-bold text-foreground mb-1">
          {lang === "ar" ? "سجّل الدخول للمتابعة" : "Sign in to follow"}
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          {lang === "ar"
            ? "تابع المنظمات والأشخاص والحرفيين لرؤية منشوراتهم هنا."
            : "Follow organizations, hosts, experts and people to see their posts here."}
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

  const hasAnyContent = orgPosts.length > 0 || peoplePosts.length > 0;

  return (
    <div className="px-4 space-y-5 pb-2">
      {totalFollowed === 0 || !hasAnyContent ? (
        <EmptySuggestions suggestions={suggestions} lang={lang} navigate={navigate} />
      ) : (
        <>
          {/* Organizations section */}
          {orgPosts.length > 0 && (
            <SectionHeader
              icon={Building2}
              title={lang === "ar" ? "من المنظمات" : "From Organizations"}
              count={orgPosts.length}
              lang={lang}
            />
          )}
          {orgPosts.map((c) => (
            <article
              key={`org-${c.id}`}
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

              <button onClick={() => navigate(`/cause/${c.id}`)} className="w-full text-start">
                <p className="px-3 pb-2 text-sm font-semibold text-foreground line-clamp-2">
                  {c.title[lang]}
                </p>
                <p className="px-3 pb-2 text-xs text-muted-foreground line-clamp-2">
                  {c.summary[lang]}
                </p>
                {c.image && (
                  <img src={c.image} alt="" className="w-full h-44 object-cover" />
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
          ))}

          {/* People section (culture actors / experts / providers / visitors who authored a post) */}
          {peoplePosts.length > 0 && (
            <SectionHeader
              icon={UsersIcon}
              title={lang === "ar" ? "من الأشخاص الذين تتابعهم" : "From People You Follow"}
              count={peoplePosts.length}
              lang={lang}
            />
          )}
          {peoplePosts.map((p) => (
            <article
              key={`p-${p.id}`}
              className="bg-background rounded-xl border border-border overflow-hidden"
            >
              <button
                onClick={() => navigate(`/culture-actor/${p.authorId}`)}
                className="flex items-center gap-3 p-3 pb-2 w-full text-start"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <UserIcon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {p.author[lang]}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {p.category[lang]} · {p.readTime}{" "}
                    {lang === "ar" ? "د قراءة" : "min read"}
                  </p>
                </div>
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                  {lang === "ar" ? "متابَع" : "Following"}
                </span>
              </button>

              <button onClick={() => navigate(`/post/${p.id}`)} className="w-full text-start">
                <p className="px-3 pb-2 text-sm font-semibold text-foreground line-clamp-2">
                  {p.title[lang]}
                </p>
                {p.image && (
                  <img src={p.image} alt="" className="w-full h-40 object-cover" />
                )}
                <div className="flex items-center justify-between px-3 py-2.5 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    {new Date(p.date).toLocaleDateString(
                      lang === "ar" ? "ar-EG" : "en-US",
                      { dateStyle: "medium" }
                    )}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-primary">
                    {lang === "ar" ? "اقرأ" : "Read"}
                    <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </span>
                </div>
              </button>
            </article>
          ))}
        </>
      )}
    </div>
  );
};

const SectionHeader = ({
  icon: Icon,
  title,
  count,
  lang = "en",
}: {
  icon: typeof Building2;
  title: string;
  count: number;
  lang?: "en" | "ar";
}) => (
  <div className="flex items-center gap-2 pt-1">
    <Icon className="w-4 h-4 text-primary shrink-0" />
    <h3
      className={`text-xs font-bold text-foreground ${
        lang === "ar" ? "" : "uppercase tracking-wide"
      }`}
    >
      {title}
    </h3>
    <span className="text-[10px] text-muted-foreground">({count})</span>
  </div>
);

const EmptySuggestions = ({
  suggestions,
  lang,
  navigate,
}: {
  suggestions: {
    orgs: Cause[];
    actors: typeof cultureActors;
    people: typeof whosWho;
    visitors: typeof visitorSuggestions;
  };
  lang: "en" | "ar";
  navigate: (path: string) => void;
}) => {
  return (
    <div className="space-y-5">
      <div className="text-center py-6">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-sm font-bold text-foreground mb-1">
          {lang === "ar"
            ? "موجزك فارغ حتى الآن"
            : "Your feed is empty"}
        </h3>
        <p className="text-xs text-muted-foreground">
          {lang === "ar"
            ? "تابع منظمات وأشخاصاً لرؤية منشوراتهم هنا."
            : "Follow organizations and people to see their posts here."}
        </p>
      </div>

      {/* Orgs */}
      {suggestions.orgs.length > 0 && (
        <div>
          <SectionHeader icon={Building2} title={lang === "ar" ? "منظمات" : "Organizations"} count={suggestions.orgs.length} lang={lang} />
          <div className="space-y-2 mt-2">
            {suggestions.orgs.map((c) => {
              const targetId = orgTargetIdFor(c);
              if (!targetId) return null;
              return (
                <SuggestionRow
                  key={c.id}
                  emoji={c.org.logo}
                  name={c.org.name[lang]}
                  meta={`${c.category[lang]} · ${c.supporters} ${lang === "ar" ? "داعم" : "supporters"}`}
                  onOpen={() => navigate(`/organization/${c.id}`)}
                  followType="organization"
                  followId={targetId}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Culture actors */}
      {suggestions.actors.length > 0 && (
        <div>
          <SectionHeader icon={Feather} title={lang === "ar" ? "فاعلون ثقافيون" : "Culture Actors"} count={suggestions.actors.length} lang={lang} />
          <div className="space-y-2 mt-2">
            {suggestions.actors.map((a) => (
              <SuggestionRow
                key={a.id}
                image={a.image}
                name={a.name[lang]}
                meta={a.title[lang]}
                onOpen={() => navigate(`/culture-actor/${a.id}`)}
                followType="culture_actor"
                followId={a.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Who's Who experts */}
      {suggestions.people.length > 0 && (
        <div>
          <SectionHeader icon={UsersIcon} title={lang === "ar" ? "خبراء محليون" : "Local Experts"} count={suggestions.people.length} lang={lang} />
          <div className="space-y-2 mt-2">
            {suggestions.people.map((p) => (
              <SuggestionRow
                key={p.id}
                image={p.image}
                name={p.name[lang]}
                meta={p.role[lang]}
                onOpen={() => navigate(`/person/${p.id}`)}
                followType="person"
                followId={p.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Visitors */}
      {suggestions.visitors.length > 0 && (
        <div>
          <SectionHeader icon={UserIcon} title={lang === "ar" ? "مسافرون" : "Travelers"} count={suggestions.visitors.length} lang={lang} />
          <div className="space-y-2 mt-2">
            {suggestions.visitors.map((v) => (
              <SuggestionRow
                key={v.id}
                image={v.avatar}
                name={v.name[lang]}
                meta={v.role[lang]}
                onOpen={() => navigate(`/visitor/${v.id}`)}
                followType="visitor"
                followId={v.id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SuggestionRow = ({
  image,
  emoji,
  name,
  meta,
  onOpen,
  followType,
  followId,
}: {
  image?: string;
  emoji?: string;
  name: string;
  meta: string;
  onOpen: () => void;
  followType: "organization" | "culture_actor" | "person" | "visitor";
  followId: string;
}) => (
  <div className="flex items-center gap-3 bg-background rounded-xl border border-border p-3">
    <button
      onClick={onOpen}
      className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden"
    >
      {image ? (
        <img src={image} alt="" className="w-full h-full object-cover" />
      ) : (
        <span className="text-xl">{emoji}</span>
      )}
    </button>
    <button onClick={onOpen} className="flex-1 min-w-0 text-start">
      <p className="text-xs font-semibold text-foreground truncate">{name}</p>
      <p className="text-[10px] text-muted-foreground truncate">{meta}</p>
    </button>
    <FollowButton targetType={followType} targetId={followId} variant="compact" />
  </div>
);

export default FollowingFeed;
