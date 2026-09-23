import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronRight, UserPlus } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useMyFollows } from "@/hooks/useFollows";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

/** Route for a followed target, by the target_type stored on the follow row. */
const routeFor = (type: string, id: string) => {
  switch (type) {
    case "visitor":
      return `/visitor/${id}`;
    case "provider":
      return `/provider/${id}`;
    case "culture_actor":
      return `/culture-actor/${id}`;
    case "organization":
      return `/organization/${id}`;
    case "person":
    case "whos_who":
      return `/person/${id}`;
    default:
      return `/provider/${id}`;
  }
};

const typeLabel = (type: string, ar: boolean) => {
  const map: Record<string, { en: string; ar: string }> = {
    visitor: { en: "Traveler", ar: "مسافر" },
    provider: { en: "Host", ar: "مضيف" },
    culture_actor: { en: "Culture", ar: "ثقافة" },
    organization: { en: "Organization", ar: "منظمة" },
    person: { en: "Local", ar: "من أهل البلد" },
    whos_who: { en: "Local", ar: "من أهل البلد" },
  };
  const hit = map[type];
  return hit ? (ar ? hit.ar : hit.en) : type;
};

/**
 * Who the signed-in visitor follows. Names are resolved per target type from the
 * real tables; a target whose name can't be resolved still links to its page.
 */
const Following = () => {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const ar = lang === "ar";
  const { user } = useAuth();
  const { data: follows = [], isLoading } = useMyFollows();

  const { data: names } = useQuery({
    queryKey: ["following-names", follows.map((f) => `${f.target_type}:${f.target_id}`).join(",")],
    enabled: follows.length > 0,
    queryFn: async () => {
      const out: Record<string, string> = {};
      const ids = (type: string) => follows.filter((f) => f.target_type === type).map((f) => f.target_id);

      const visitorIds = ids("visitor");
      if (visitorIds.length) {
        const { data } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", visitorIds);
        (data ?? []).forEach((r) => {
          if (r.display_name) out[`visitor:${r.user_id}`] = r.display_name;
        });
      }

      const providerIds = ids("provider");
      if (providerIds.length) {
        const { data } = await supabase
          .from("providers")
          .select("id, name_en, name_ar")
          .in("id", providerIds);
        (data ?? []).forEach((r) => {
          out[`provider:${r.id}`] = (ar ? r.name_ar || r.name_en : r.name_en) || "";
        });
      }

      const actorIds = ids("culture_actor");
      if (actorIds.length) {
        const { data } = await supabase
          .from("culture_actors")
          .select("id, name_en, name_ar")
          .in("id", actorIds);
        (data ?? []).forEach((r) => {
          out[`culture_actor:${r.id}`] = (ar ? r.name_ar || r.name_en : r.name_en) || "";
        });
      }

      return out;
    },
  });

  return (
    <div className="min-h-screen bg-surface pb-20">
      <header className="flex items-center gap-3 px-4 py-3 bg-background sticky top-0 z-40 border-b border-border">
        <button onClick={() => navigate(-1)} aria-label={lang === "ar" ? "رجوع" : "Back"} className="tap-target rounded-full hover:bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground rtl:rotate-180" />
        </button>
        <h1 className="text-lg font-bold text-foreground">{ar ? "أتابع" : "Following"}</h1>
      </header>

      <div className="px-4 pt-5">
        {!user ? (
          <p className="text-sm text-muted-foreground text-center py-16">
            {ar ? "سجّل الدخول لعرض من تتابعه." : "Sign in to see who you follow."}
          </p>
        ) : isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        ) : follows.length === 0 ? (
          <div className="text-center py-16">
            <UserPlus className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {ar ? "لا تتابع أحداً بعد." : "You're not following anyone yet."}
            </p>
          </div>
        ) : (
          <div className="bg-card rounded-xl shadow-card overflow-hidden">
            {follows.map((f, i) => {
              const key = `${f.target_type}:${f.target_id}`;
              const name = names?.[key];
              return (
                <button
                  key={f.id}
                  onClick={() => navigate(routeFor(f.target_type, f.target_id))}
                  className={`w-full flex items-center justify-between px-4 py-3.5 text-left ${
                    i < follows.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <span>
                    <span className="block text-sm font-medium text-foreground">
                      {name || (ar ? "ملف" : "Profile")}
                    </span>
                    <span className="block text-[11px] text-muted-foreground">
                      {typeLabel(f.target_type, ar)}
                    </span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground rtl:rotate-180" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Following;
