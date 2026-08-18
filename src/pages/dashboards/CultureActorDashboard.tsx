import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, FileText, Bookmark, Headphones, Users, Plus, Sparkles, ChevronRight, Bell, Briefcase, BookOpen, Mic, Calendar, CalendarPlus } from "lucide-react";
import { VisitorModeHeaderToggle } from "@/components/VisitorModeToggle";
import EditProfileHeaderButton from "@/components/dashboard/EditProfileHeaderButton";
import DailyStatusCard from "@/components/DailyStatusCard";
import ActorCommissionsList from "@/components/ActorCommissionsList";
import SessionRequestsList from "@/components/SessionRequestsList";

// Static editorial copy curated by the Sandal team — NOT personalised and not
// backed by any table. Do not present these as generated suggestions.
const STATIC_PROMPTS = [
  { en: "Write about your town's hidden food traditions", ar: "اكتب عن تقاليد الطعام المخفية في بلدتك" },
  { en: "Share a photo essay on local craftsmanship", ar: "شارك مقالاً مصوراً عن الحرف المحلية" },
];

const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const CultureActorDashboard = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Real identity: the signed-in user's own provider + culture_actors rows.
  const { data: identity } = useQuery({
    queryKey: ["culture-actor-identity", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [{ data: provider }, { data: actor }] = await Promise.all([
        supabase
          .from("providers")
          .select("name_en, name_ar, avatar")
          .eq("user_id", user!.id)
          .maybeSingle(),
        supabase
          .from("culture_actors")
          .select("id, name_en, name_ar, image")
          .eq("user_id", user!.id)
          .maybeSingle(),
      ]);
      const nameEn = actor?.name_en || provider?.name_en || "";
      const nameAr = actor?.name_ar || provider?.name_ar || "";
      return {
        actorId: actor?.id ?? null,
        nameEn,
        nameAr,
        image: actor?.image || provider?.avatar || null,
      };
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["culture-actor-stats", user?.id, identity?.actorId],
    enabled: !!user,
    queryFn: async () => {
      const [published, drafts, myPosts] = await Promise.all([
        supabase
          .from("posts")
          .select("id", { count: "exact", head: true })
          .eq("author_id", user!.id)
          .eq("status", "published"),
        supabase
          .from("posts")
          .select("id", { count: "exact", head: true })
          .eq("author_id", user!.id)
          .eq("status", "draft"),
        supabase.from("posts").select("id").eq("author_id", user!.id),
      ]);

      const postIds = (myPosts.data ?? []).map((p) => p.id);
      let saves = 0;
      if (postIds.length) {
        const { count } = await supabase
          .from("wishlists")
          .select("id", { count: "exact", head: true })
          .eq("item_type", "post")
          .in("item_id", postIds);
        saves = count ?? 0;
      }

      let tours = 0;
      let followers = 0;
      if (identity?.actorId) {
        const [tourRes, followRes] = await Promise.all([
          supabase
            .from("audio_tours")
            .select("id", { count: "exact", head: true })
            .eq("narrator_culture_actor_id", identity.actorId),
          supabase
            .from("follows")
            .select("id", { count: "exact", head: true })
            .eq("target_type", "culture_actor")
            .eq("target_id", identity.actorId),
        ]);
        tours = tourRes.count ?? 0;
        followers = followRes.count ?? 0;
      }

      // Tours this user authored (creator_id), distinct from tours they only
      // narrate for someone else (counted separately below).
      const [ownTours, myCollections] = await Promise.all([
        supabase
          .from("audio_tours")
          .select("id", { count: "exact", head: true })
          .eq("creator_id", user!.id),
        supabase
          .from("collections")
          .select("id", { count: "exact", head: true })
          .eq("expert_id", user!.id),
      ]);

      const { count: pendingCommissions } = await supabase
        .from("commissions")
        .select("id", { count: "exact", head: true })
        .eq("actor_user_id", user!.id)
        .eq("status", "pending");

      return {
        pendingCommissions: pendingCommissions ?? 0,
        ownTours: ownTours.count ?? 0,
        collections: myCollections.count ?? 0,
        published: published.count ?? 0,
        drafts: drafts.count ?? 0,
        saves,
        tours,
        followers,
      };
    },
  });

  const name = (lang === "ar" ? identity?.nameAr : identity?.nameEn) || identity?.nameEn || "";
  const displayName = name || (lang === "ar" ? "فاعل ثقافي" : "Culture Actor");

  const statCards = [
    {
      value: stats?.published ?? 0,
      label: lang === "ar" ? "منشور" : "Published",
      icon: FileText,
      path: "/dashboard/culture-actor/my-content",
    },
    {
      value: stats?.drafts ?? 0,
      label: lang === "ar" ? "مسودات" : "Drafts",
      icon: FileText,
      path: "/dashboard/culture-actor/my-content",
    },
    {
      value: stats?.saves ?? 0,
      label: lang === "ar" ? "حفظ" : "Saves",
      icon: Bookmark,
      path: "/dashboard/culture-actor/my-content",
    },
  ];

  const bottomNav = [
    { label: lang === "ar" ? "لوحة التحكم" : "Dashboard", icon: "📊", active: true, path: "/dashboard/culture-actor" },
    { label: lang === "ar" ? "محتواي" : "My Content", icon: "✍️", active: false, path: "/dashboard/culture-actor/my-content" },
    { label: lang === "ar" ? "الرسائل" : "Inbox", icon: "💬", active: false, path: "/inbox" },
    { label: lang === "ar" ? "الملف" : "Profile", icon: "👤", active: false, path: "/profile" },
  ];

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Header */}
      <header className="bg-role-culture-actor text-white px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigate("/profile")} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
          <div className="flex items-center gap-2">
            <EditProfileHeaderButton />
            <VisitorModeHeaderToggle />
            {/* No unread badge here: there is no unread count wired to this screen. */}
            <button onClick={() => navigate("/inbox")} className="p-1" aria-label={lang === "ar" ? "الرسائل" : "Inbox"}>
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 overflow-hidden flex items-center justify-center text-sm font-bold">
            {identity?.image ? (
              <img src={identity.image} alt={displayName} className="w-full h-full object-cover" />
            ) : name ? (
              initialsOf(name)
            ) : (
              "✍️"
            )}
          </div>
          <div>
            <p className="text-xs opacity-80">{lang === "ar" ? "فاعل ثقافي" : "Culture Actor"}</p>
            <h1 className="text-lg font-bold">{displayName}</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        <DailyStatusCard accentBg="bg-role-culture-actor" accentText="text-role-culture-actor" />

        {/* Stats */}
        <div className="flex gap-3">
          {statCards.map((s, i) => (
            <div key={i} onClick={() => navigate(s.path)} className="flex-1 bg-card rounded-xl shadow-card p-3 text-center cursor-pointer hover:shadow-md transition-shadow active:scale-[0.97]">
              <s.icon className="w-4 h-4 text-role-culture-actor mx-auto mb-1" />
              <span className="text-lg font-bold text-foreground block">{s.value}</span>
              <span className="text-[10px] text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Reach: audio tours narrated + followers (real counts) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-xl shadow-card p-4">
            <Headphones className="w-4 h-4 text-role-culture-actor mb-1" />
            <span className="text-lg font-bold text-foreground block">{stats?.tours ?? 0}</span>
            <span className="text-[10px] text-muted-foreground">{lang === "ar" ? "جولات صوتية بصوتك" : "Audio tours narrated"}</span>
          </div>
          <div className="bg-card rounded-xl shadow-card p-4">
            <Briefcase className="w-4 h-4 text-role-culture-actor mb-1" />
            <span className="text-lg font-bold text-foreground block">{stats?.pendingCommissions ?? 0}</span>
            <span className="text-[10px] text-muted-foreground">{lang === "ar" ? "تكليفات بانتظار الرد" : "Pending commissions"}</span>
          </div>
          <div onClick={() => navigate("/dashboard/culture-actor/my-tours")} className="bg-card rounded-xl shadow-card p-4 cursor-pointer active:scale-[0.97] transition-transform">
            <Mic className="w-4 h-4 text-role-culture-actor mb-1" />
            <span className="text-lg font-bold text-foreground block">{stats?.ownTours ?? 0}</span>
            <span className="text-[10px] text-muted-foreground">{lang === "ar" ? "جولاتي الصوتية" : "My audio tours"}</span>
          </div>
          <div onClick={() => navigate("/dashboard/culture-actor/my-collections")} className="bg-card rounded-xl shadow-card p-4 cursor-pointer active:scale-[0.97] transition-transform">
            <BookOpen className="w-4 h-4 text-role-culture-actor mb-1" />
            <span className="text-lg font-bold text-foreground block">{stats?.collections ?? 0}</span>
            <span className="text-[10px] text-muted-foreground">{lang === "ar" ? "مجموعات معرفية" : "Collections"}</span>
          </div>
          <div className="bg-card rounded-xl shadow-card p-4">
            <Users className="w-4 h-4 text-role-culture-actor mb-1" />
            <span className="text-lg font-bold text-foreground block">{stats?.followers ?? 0}</span>
            <span className="text-[10px] text-muted-foreground">{lang === "ar" ? "متابعون" : "Followers"}</span>
          </div>
        </div>

        <ActorCommissionsList />

        {/* Session requests: inherited from the retired subject-expert role */}
        <SessionRequestsList accentText="text-role-culture-actor" />

        {/* Static content prompts (editorial copy, not personalised) */}
        <div className="bg-card rounded-xl shadow-card p-4">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-role-culture-actor" />
            {lang === "ar" ? "أفكار محتوى من صندل" : "Content Prompts from Sandal"}
          </h3>
          {STATIC_PROMPTS.map((p, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
              <span className="text-xs text-foreground flex-1">{p[lang]}</span>
              <button onClick={() => navigate("/dashboard/culture-actor/new-article")} className="text-[10px] font-semibold text-primary-foreground bg-role-culture-actor px-3 py-1.5 rounded-md ml-2">
                {lang === "ar" ? "اكتب" : "Write"}
              </button>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <button onClick={() => navigate("/dashboard/culture-actor/new-article")} className="w-full bg-role-culture-actor text-white rounded-xl py-3.5 font-semibold text-sm flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> {lang === "ar" ? "مقال جديد" : "New Article"}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => navigate("/dashboard/culture-actor/new-tour")} className="border-2 border-role-culture-actor text-role-culture-actor rounded-xl py-3 font-semibold text-xs flex items-center justify-center gap-1.5">
              <Headphones className="w-4 h-4" /> {lang === "ar" ? "جولة صوتية" : "New Audio Tour"}
            </button>
            <button onClick={() => navigate("/dashboard/culture-actor/new-collection")} className="border-2 border-role-culture-actor text-role-culture-actor rounded-xl py-3 font-semibold text-xs flex items-center justify-center gap-1.5">
              <BookOpen className="w-4 h-4" /> {lang === "ar" ? "مجموعة جديدة" : "New Collection"}
            </button>
          </div>
          <button onClick={() => navigate("/dashboard/culture-actor/my-content")} className="w-full border-2 border-role-culture-actor text-role-culture-actor rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2">
            <FileText className="w-4 h-4" /> {lang === "ar" ? "إدارة محتواي" : "Manage My Content"}
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => navigate("/dashboard/new-event")} className="border-2 border-role-culture-actor text-role-culture-actor rounded-xl py-3 font-semibold text-xs flex items-center justify-center gap-1.5">
              <CalendarPlus className="w-4 h-4" /> {lang === "ar" ? "فعالية جديدة" : "New Event"}
            </button>
            <button onClick={() => navigate("/dashboard/events")} className="border-2 border-role-culture-actor text-role-culture-actor rounded-xl py-3 font-semibold text-xs flex items-center justify-center gap-1.5">
              <Calendar className="w-4 h-4" /> {lang === "ar" ? "فعالياتي" : "My Events"}
            </button>
          </div>

        </div>
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-role-culture-actor flex justify-around py-2 z-50">
        {bottomNav.map((item, i) => (
          <button key={i} onClick={() => navigate(item.path)} className={`flex flex-col items-center gap-0.5 px-3 py-1 ${item.active ? "opacity-100" : "opacity-60"}`}>
            <span className="text-lg">{item.icon}</span>
            <span className="text-[10px] text-white font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default CultureActorDashboard;
