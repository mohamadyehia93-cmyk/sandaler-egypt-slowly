import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Heart,
  ChevronRight,
  UserPlus,
  Sparkles,
  Building2,
  Users as UsersIcon,
  User as UserIcon,
  Feather,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useMyFollows } from "@/hooks/useFollows";
import { Button } from "@/components/ui/button";
import FollowButton from "@/components/FollowButton";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Follow rows store org ids as `organization-<uuid>`; legacy sample rows used `org-c7`. */
function orgUuidFromTargetId(targetId: string): string | null {
  const raw = targetId.replace(/^organization-/, "").replace(/^org-/, "");
  return UUID_RE.test(raw) ? raw : null;
}

type Row = Record<string, any>;

const FollowingFeed = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: follows = [], isLoading } = useMyFollows();

  const idsByType = useMemo(() => {
    const out: Record<string, string[]> = {};
    for (const f of follows) (out[f.target_type] ||= []).push(f.target_id);
    return out;
  }, [follows]);

  const orgIds = useMemo(
    () => (idsByType["organization"] ?? []).map(orgUuidFromTargetId).filter(Boolean) as string[],
    [idsByType]
  );
  const actorIds = useMemo(
    () => (idsByType["culture_actor"] ?? []).filter((id) => UUID_RE.test(id)),
    [idsByType]
  );
  const personIds = useMemo(
    () => (idsByType["person"] ?? []).filter((id) => UUID_RE.test(id)),
    [idsByType]
  );
  const providerIds = useMemo(
    () => (idsByType["provider"] ?? []).filter((id) => UUID_RE.test(id)),
    [idsByType]
  );

  /** Resolve followed entities against the real tables. Unresolvable (stale) ids are dropped. */
  const { data: followed, isLoading: loadingFollowed } = useQuery({
    queryKey: ["following-feed", orgIds, actorIds, personIds, providerIds],
    enabled: !!user,
    queryFn: async () => {
      const [orgs, actors, people, providers] = await Promise.all([
        orgIds.length
          ? supabase
              .from("organizations")
              .select("id, slug, name_en, name_ar, logo, image, owner_id, org_type, focus_areas_en, focus_areas_ar")
              .in("id", orgIds)
          : Promise.resolve({ data: [] as Row[] }),
        actorIds.length
          ? supabase
              .from("culture_actors")
              .select("id, slug, name_en, name_ar, title_en, title_ar, image, user_id")
              .in("id", actorIds)
          : Promise.resolve({ data: [] as Row[] }),
        personIds.length
          ? supabase
              .from("whos_who")
              .select("id, slug, name_en, name_ar, role_en, role_ar, image, user_id")
              .in("id", personIds)
          : Promise.resolve({ data: [] as Row[] }),
        providerIds.length
          ? supabase
              .from("providers")
              .select("id, slug, name_en, name_ar, tagline_en, tagline_ar, avatar, user_id, role")
              .in("id", providerIds)
          : Promise.resolve({ data: [] as Row[] }),
      ]);
      return {
        orgs: (orgs.data ?? []) as Row[],
        actors: (actors.data ?? []) as Row[],
        people: (people.data ?? []) as Row[],
        providers: (providers.data ?? []) as Row[],
      };
    },
  });

  const orgOwnerIds = (followed?.orgs ?? []).map((o) => o.owner_id).filter(Boolean);
  const authorUserIds = [
    ...(followed?.actors ?? []),
    ...(followed?.people ?? []),
    ...(followed?.providers ?? []),
  ]
    .map((r) => r.user_id)
    .filter(Boolean);

  /** Causes published by followed organizations. */
  const { data: orgCauses = [] } = useQuery({
    queryKey: ["following-feed-causes", orgOwnerIds],
    enabled: orgOwnerIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("causes")
        .select("id, slug, title_en, title_ar, summary_en, summary_ar, image, supporters, category_en, category_ar, owner_id")
        .in("owner_id", orgOwnerIds)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(20);
      return (data ?? []) as Row[];
    },
  });

  /** Posts published by followed people. */
  const { data: peoplePosts = [] } = useQuery({
    queryKey: ["following-feed-posts", authorUserIds],
    enabled: authorUserIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("posts")
        .select("id, slug, title_en, title_ar, image, category, read_time_minutes, author_id, author_name_en, author_name_ar, created_at")
        .in("author_id", authorUserIds)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(20);
      return (data ?? []) as Row[];
    },
  });

  /** Suggestions come from the real tables too. */
  const { data: suggestions } = useQuery({
    queryKey: ["following-feed-suggestions", orgIds, actorIds, personIds],
    enabled: !!user,
    queryFn: async () => {
      const [orgs, actors, people] = await Promise.all([
        supabase
          .from("organizations")
          .select("id, slug, name_en, name_ar, logo, image, org_type, volunteers_count")
          .eq("status", "published")
          .order("volunteers_count", { ascending: false, nullsFirst: false })
          .limit(8),
        supabase
          .from("culture_actors")
          .select("id, slug, name_en, name_ar, title_en, title_ar, image")
          .eq("status", "published")
          .limit(8),
        supabase
          .from("whos_who")
          .select("id, slug, name_en, name_ar, role_en, role_ar, image")
          .eq("status", "published")
          .limit(8),
      ]);
      return {
        orgs: ((orgs.data ?? []) as Row[]).filter((o) => !orgIds.includes(o.id)).slice(0, 3),
        actors: ((actors.data ?? []) as Row[]).filter((a) => !actorIds.includes(a.id)).slice(0, 3),
        people: ((people.data ?? []) as Row[]).filter((p) => !personIds.includes(p.id)).slice(0, 3),
      };
    },
  });

  const nameOf = (r: Row) => (lang === "ar" ? (r.name_ar || r.name_en) : r.name_en) || r.name_en || "";
  const href = (r: Row) => r.slug || r.id;

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

  if (isLoading || loadingFollowed) {
    return (
      <div className="px-4 py-10 text-center text-xs text-muted-foreground">
        {lang === "ar" ? "جارٍ التحميل..." : "Loading..."}
      </div>
    );
  }

  const followedPeople = [
    ...(followed?.actors ?? []).map((a) => ({ row: a, kind: "culture_actor" as const })),
    ...(followed?.people ?? []).map((p) => ({ row: p, kind: "person" as const })),
    ...(followed?.providers ?? []).map((p) => ({ row: p, kind: "provider" as const })),
  ];

  const hasAnyContent =
    (followed?.orgs?.length ?? 0) > 0 || followedPeople.length > 0;

  const routeForPerson = (kind: string, r: Row) =>
    kind === "culture_actor"
      ? `/culture-actor/${href(r)}`
      : kind === "person"
      ? `/person/${href(r)}`
      : `/provider/${href(r)}`;

  return (
    <div className="px-4 space-y-5 pb-2">
      {!hasAnyContent ? (
        <EmptySuggestions suggestions={suggestions} lang={lang} navigate={navigate} />
      ) : (
        <>
          {/* Organizations */}
          {(followed?.orgs?.length ?? 0) > 0 && (
            <SectionHeader
              icon={Building2}
              title={lang === "ar" ? "من المنظمات" : "From Organizations"}
              count={followed!.orgs.length}
              lang={lang}
            />
          )}
          {(followed?.orgs ?? []).map((o) => {
            const causesForOrg = orgCauses.filter((c) => c.owner_id === o.owner_id);
            return (
              <article
                key={`org-${o.id}`}
                className="bg-background rounded-xl border border-border overflow-hidden"
              >
                <button
                  onClick={() => navigate(`/organization/${href(o)}`)}
                  className="flex items-center gap-3 p-3 pb-2 w-full text-start"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                    {o.logo && /^https?:/.test(o.logo) ? (
                      <img src={o.logo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl">{o.logo || "🏛️"}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{nameOf(o)}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{o.org_type || ""}</p>
                  </div>
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                    {lang === "ar" ? "متابَع" : "Following"}
                  </span>
                </button>

                {causesForOrg.length === 0 ? (
                  <p className="px-3 pb-3 text-xs text-muted-foreground">
                    {lang === "ar" ? "لا منشورات بعد." : "No posts yet."}
                  </p>
                ) : (
                  causesForOrg.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => navigate(`/cause/${href(c)}`)}
                      className="w-full text-start border-t border-border"
                    >
                      <p className="px-3 pt-2 pb-2 text-sm font-semibold text-foreground line-clamp-2">
                        {lang === "ar" ? (c.title_ar || c.title_en) : c.title_en}
                      </p>
                      <p className="px-3 pb-2 text-xs text-muted-foreground line-clamp-2">
                        {lang === "ar" ? (c.summary_ar || c.summary_en) : c.summary_en}
                      </p>
                      {c.image && <img src={c.image} alt="" className="w-full h-44 object-cover" />}
                      <div className="flex items-center justify-between px-3 py-2.5">
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Heart className="w-3.5 h-3.5 text-primary" />
                          {c.supporters ?? 0} {lang === "ar" ? "داعم" : "supporters"}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-semibold text-primary">
                          {lang === "ar" ? "اعرف المزيد" : "Learn more"}
                          <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </article>
            );
          })}

          {/* People */}
          {followedPeople.length > 0 && (
            <SectionHeader
              icon={UsersIcon}
              title={lang === "ar" ? "من الأشخاص الذين تتابعهم" : "From People You Follow"}
              count={followedPeople.length}
              lang={lang}
            />
          )}
          {followedPeople.map(({ row, kind }) => {
            const posts = peoplePosts.filter((p) => p.author_id && p.author_id === row.user_id);
            const meta =
              kind === "culture_actor"
                ? (lang === "ar" ? (row.title_ar || row.title_en) : row.title_en) || ""
                : kind === "person"
                ? (lang === "ar" ? (row.role_ar || row.role_en) : row.role_en) || ""
                : (lang === "ar" ? (row.tagline_ar || row.tagline_en) : row.tagline_en) || row.role || "";
            return (
              <article
                key={`${kind}-${row.id}`}
                className="bg-background rounded-xl border border-border overflow-hidden"
              >
                <button
                  onClick={() => navigate(routeForPerson(kind, row))}
                  className="flex items-center gap-3 p-3 pb-2 w-full text-start"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                    {row.image || row.avatar ? (
                      <img src={row.image || row.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{nameOf(row)}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{meta}</p>
                  </div>
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                    {lang === "ar" ? "متابَع" : "Following"}
                  </span>
                </button>

                {posts.length === 0 ? (
                  <p className="px-3 pb-3 text-xs text-muted-foreground">
                    {lang === "ar" ? "لا منشورات بعد." : "No posts yet."}
                  </p>
                ) : (
                  posts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => navigate(`/post/${href(p)}`)}
                      className="w-full text-start border-t border-border"
                    >
                      <p className="px-3 pt-2 pb-2 text-sm font-semibold text-foreground line-clamp-2">
                        {lang === "ar" ? (p.title_ar || p.title_en) : p.title_en}
                      </p>
                      {p.image && <img src={p.image} alt="" className="w-full h-40 object-cover" />}
                      <div className="flex items-center justify-between px-3 py-2.5">
                        <span className="text-xs text-muted-foreground">
                          {new Date(p.created_at).toLocaleDateString(
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
                  ))
                )}
              </article>
            );
          })}
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
  suggestions?: { orgs: Row[]; actors: Row[]; people: Row[] };
  lang: "en" | "ar";
  navigate: (path: string) => void;
}) => {
  const name = (r: Row) => (lang === "ar" ? (r.name_ar || r.name_en) : r.name_en) || r.name_en || "";
  const href = (r: Row) => r.slug || r.id;
  return (
    <div className="space-y-5">
      <div className="text-center py-6">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-sm font-bold text-foreground mb-1">
          {lang === "ar" ? "موجزك فارغ حتى الآن" : "Your feed is empty"}
        </h3>
        <p className="text-xs text-muted-foreground">
          {lang === "ar"
            ? "تابع منظمات وأشخاصاً لرؤية منشوراتهم هنا."
            : "Follow organizations and people to see their posts here."}
        </p>
      </div>

      {(suggestions?.orgs?.length ?? 0) > 0 && (
        <div>
          <SectionHeader
            icon={Building2}
            title={lang === "ar" ? "منظمات" : "Organizations"}
            count={suggestions!.orgs.length}
            lang={lang}
          />
          <div className="space-y-2 mt-2">
            {suggestions!.orgs.map((o) => (
              <SuggestionRow
                key={o.id}
                image={o.logo && /^https?:/.test(o.logo) ? o.logo : o.image}
                emoji={o.logo && !/^https?:/.test(o.logo) ? o.logo : "🏛️"}
                name={name(o)}
                meta={o.org_type || ""}
                onOpen={() => navigate(`/organization/${href(o)}`)}
                followType="organization"
                followId={`organization-${o.id}`}
              />
            ))}
          </div>
        </div>
      )}

      {(suggestions?.actors?.length ?? 0) > 0 && (
        <div>
          <SectionHeader
            icon={Feather}
            title={lang === "ar" ? "فاعلون ثقافيون" : "Culture Actors"}
            count={suggestions!.actors.length}
            lang={lang}
          />
          <div className="space-y-2 mt-2">
            {suggestions!.actors.map((a) => (
              <SuggestionRow
                key={a.id}
                image={a.image}
                name={name(a)}
                meta={(lang === "ar" ? (a.title_ar || a.title_en) : a.title_en) || ""}
                onOpen={() => navigate(`/culture-actor/${href(a)}`)}
                followType="culture_actor"
                followId={a.id}
              />
            ))}
          </div>
        </div>
      )}

      {(suggestions?.people?.length ?? 0) > 0 && (
        <div>
          <SectionHeader
            icon={UsersIcon}
            title={lang === "ar" ? "خبراء محليون" : "Local Experts"}
            count={suggestions!.people.length}
            lang={lang}
          />
          <div className="space-y-2 mt-2">
            {suggestions!.people.map((p) => (
              <SuggestionRow
                key={p.id}
                image={p.image}
                name={name(p)}
                meta={(lang === "ar" ? (p.role_ar || p.role_en) : p.role_en) || ""}
                onOpen={() => navigate(`/person/${href(p)}`)}
                followType="person"
                followId={p.id}
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
