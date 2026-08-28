import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";

/**
 * A provider row stays `status = 'draft'` until it carries a bio or an avatar,
 * which means the person is invisible to every visitor. That rule used to be
 * stated nowhere. This banner says it plainly, once, and links straight to the
 * field that unblocks it. It renders nothing for published providers and
 * nothing for plain visitors — no nagging.
 */
const ProviderDraftBanner = ({ className = "" }: { className?: string }) => {
  const { lang } = useI18n();
  const ar = lang === "ar";
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data } = useQuery({
    queryKey: ["provider-draft-status", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("providers")
        .select("status")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (!data || data.status !== "draft") return null;

  return (
    <div
      className={`rounded-xl border border-warning/40 bg-warning/10 p-3 flex items-start gap-3 ${className}`}
    >
      <EyeOff className="w-4 h-4 text-warning shrink-0 mt-0.5" />
      <div className="flex-1 space-y-2">
        <p className="text-sm font-semibold text-foreground">
          {ar ? "ملفك غير منشور" : "Your profile isn't published yet"}
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {ar
            ? "أضف نبذة قصيرة أو صورة ليظهر ملفك للزوار في التطبيق."
            : "Add a short bio or a photo to go live and be visible to visitors."}
        </p>
        <button
          onClick={() => navigate("/edit-profile")}
          className="min-h-[44px] px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold"
        >
          {ar ? "أكمل ملفي" : "Complete my profile"}
        </button>
      </div>
    </div>
  );
};

export default ProviderDraftBanner;
