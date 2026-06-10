import { useState, useEffect } from "react";
import { User, MapPin, ChevronRight, LogOut, LogIn, Bookmark, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";
import { useUserRole, roleLabels } from "@/hooks/useUserRole";
import { VisitorModeProfileToggle } from "@/components/VisitorModeToggle";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type SavedItinerary = {
  id: string;
  title: string;
  destination: string | null;
  duration_days: number | null;
  created_at: string;
};

const Profile = () => {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const { role } = useUserRole();
  const { user, loading, signOut } = useAuth();
  const [profile, setProfile] = useState<{ display_name: string | null; avatar_url: string | null } | null>(null);
  const [itineraries, setItineraries] = useState<SavedItinerary[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => setProfile(data));

    supabase
      .from("saved_itineraries")
      .select("id, title, destination, duration_days, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setItineraries(data || []));
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    toast.success(t("profile.logged_out_toast"));
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-surface pb-20 flex flex-col items-center justify-center px-6 gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {t("profile.sign_in_title")}
        </h2>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          {t("profile.sign_in_subtitle")}
        </p>
        <div className="flex gap-3">
          <Button onClick={() => navigate("/login")} className="gap-2">
            <LogIn className="w-4 h-4" />
            {t("profile.sign_in_button")}
          </Button>
          <Button variant="outline" onClick={() => navigate("/signup")}>
            {t("profile.sign_up_button")}
          </Button>
        </div>
        <div className="mt-2">
          <LanguageToggle />
        </div>
        <BottomNav />
      </div>
    );
  }

  const googleAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const googleName = user.user_metadata?.full_name || user.user_metadata?.name;
  const displayName = profile?.display_name || googleName || user.email || t("profile.traveler");
  const avatarUrl = profile?.avatar_url || googleAvatar;

  const stats = [
    { value: String(itineraries.length), label: t("profile.plans") },
    { value: "0", label: t("profile.reviews") },
  ];

  const menuItems = [
    { label: t("profile.impact_dashboard"), path: "/profile/impact" },
    { label: t("profile.badges_quests"), path: "/profile/badges" },
    { label: t("profile.settings"), path: "/profile/settings" },
    { label: t("profile.help_support"), path: "/profile/help" },
  ];

  return (
    <div className="min-h-screen bg-surface pb-20">
      <header className="px-4 py-4 bg-background flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary-dark">{t("nav.profile")}</h1>
        <div className="flex items-center gap-2">
          <LanguageToggle className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border text-xs font-medium hover:bg-accent transition-colors" iconClassName="w-3.5 h-3.5" />
          <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-destructive transition-colors">
            <LogOut className="w-4 h-4" />
            {t("profile.logout_short")}
          </button>
        </div>
      </header>

      <div className="px-4 py-6">
        {/* Profile Card */}
        <div className="bg-card rounded-xl shadow-card p-5 flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-primary" />
            )}
          </div>
          <h2 className="text-lg font-bold text-foreground">{displayName}</h2>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <MapPin className="w-3 h-3" />
            <span>{user.email}</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-xs font-medium text-primary">{roleLabels[role]?.[lang] || t("profile.explorer")}</span>
          </div>
        </div>

        <VisitorModeProfileToggle />

        {/* Become a provider (visitors only) */}
        {role === "visitor" && (
          <button
            onClick={() => navigate("/welcome")}
            className="w-full bg-card rounded-xl shadow-card p-4 flex items-center justify-between mb-6 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {lang === "ar" ? "كن مزوّداً" : "Become a provider"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {lang === "ar" ? "قدّم تجاربك ومحتواك للزوار" : "Offer your experiences and content to visitors"}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        )}



        {/* Saved Itineraries */}
        {itineraries.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-primary" />
              {t("profile.saved_itineraries")}
            </h3>
            <div className="space-y-2">
              {itineraries.map((it) => (
                <button
                  key={it.id}
                  onClick={() => navigate(`/planner?id=${it.id}`)}
                  className="w-full bg-card rounded-xl shadow-card p-3 flex items-center justify-between text-left"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{it.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {it.destination && `${it.destination} · `}
                      {it.duration_days && `${it.duration_days} ${t("profile.days_unit")} · `}
                      {new Date(it.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex bg-card rounded-xl shadow-card mb-6">
          {stats.map((s, i) => (
            <div key={i} className={`flex-1 py-4 text-center ${i < stats.length - 1 ? "border-r border-border" : ""}`}>
              <span className="text-xl font-bold text-primary-dark block">{s.value}</span>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Menu */}
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          {menuItems.map((item, i) => (
            <button key={i} onClick={() => navigate(item.path)} className={`w-full flex items-center justify-between px-4 py-3.5 text-sm text-foreground ${i < menuItems.length - 1 ? "border-b border-border" : ""}`}>
              {item.label}
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
