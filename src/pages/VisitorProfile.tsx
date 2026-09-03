import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, MessageCircle, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import FollowButton from "@/components/FollowButton";
import { useFollowerCount } from "@/hooks/useFollows";
import NotFound from "@/components/NotFound";

/**
 * Public traveller profile — backed entirely by `public.profiles`.
 * There is no trips/reviews/badges data model for visitors yet, so this page
 * shows only what the account actually stored. No sample persona.
 */
const VisitorProfile = () => {
  const { id } = useParams();
  const { lang } = useI18n();
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["visitor-profile", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, bio, created_at")
        .eq("user_id", id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: followers = 0 } = useFollowerCount("visitor", id || "");

  if (isLoading) return <div className="min-h-screen bg-surface" />;
  if (!profile) return <NotFound context="person" />;

  const name = profile.display_name || (lang === "ar" ? "مسافر" : "Traveler");
  const joined = profile.created_at ? new Date(profile.created_at).getFullYear() : null;

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Header */}
      <div className="bg-primary h-32 relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
          aria-label={lang === "ar" ? "رجوع" : "Back"}
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
      </div>

      <div className="relative px-4 -mt-12">
        <div className="flex items-end gap-3">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={name}
              className="w-24 h-24 rounded-full border-4 border-background object-cover shadow-md"
            />
          ) : (
            <div className="w-24 h-24 rounded-full border-4 border-background bg-secondary flex items-center justify-center shadow-md">
              <UserIcon className="w-10 h-10 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 pb-1">
            <h1 className="text-xl font-bold text-foreground">{name}</h1>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <FollowButton
            targetType="visitor"
            targetId={profile.user_id}
            variant="primary"
            className="flex-1 !py-0 !h-9 !rounded-md"
          />
          {profile.user_id !== authUser?.id && (
            <Button
              variant="outline"
              className="h-9 text-sm font-semibold gap-1.5"
              onClick={() => navigate(`/inbox?personId=${profile.user_id}&kind=user`)}
            >
              <MessageCircle className="w-4 h-4" />
              {lang === "ar" ? "رسالة" : "Message"}
            </Button>
          )}
        </div>
      </div>

      {/* Followers */}
      <div className="flex bg-card rounded-xl shadow-card mx-4 mt-4">
        <div className="flex-1 py-3 text-center">
          <span className="text-lg font-bold text-primary-dark block">{followers}</span>
          <span className="text-[10px] text-muted-foreground">{lang === "ar" ? "متابعون" : "Followers"}</span>
        </div>
        {joined && (
          <div className="flex-1 py-3 text-center border-l border-border">
            <span className="text-lg font-bold text-primary-dark block">{joined}</span>
            <span className="text-[10px] text-muted-foreground">{lang === "ar" ? "انضم" : "Joined"}</span>
          </div>
        )}
      </div>

      {/* Bio */}
      {profile.bio && (
        <section className="mx-4 mt-4 p-4 bg-card rounded-xl shadow-card">
          <h2 className="text-sm font-bold text-foreground mb-2">{lang === "ar" ? "نبذة" : "About"}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>
          {joined && (
            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              {lang === "ar" ? `انضم في ${joined}` : `Joined ${joined}`}
            </div>
          )}
        </section>
      )}

      {!profile.bio && (
        <p className="mx-4 mt-4 p-4 bg-card rounded-xl shadow-card text-sm text-muted-foreground">
          {lang === "ar" ? "لم يضف هذا المسافر تفاصيل بعد." : "This traveler hasn’t added any details yet."}
        </p>
      )}

      <div className="h-4" />
      <BottomNav />
    </div>
  );
};

export default VisitorProfile;
