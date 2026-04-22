import { useQuery } from "@tanstack/react-query";
import { Sparkles, Link as LinkIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

interface DailyStatus {
  id: string;
  user_id: string;
  status_date: string;
  text: string;
  image_url: string | null;
  link_url: string | null;
  updated_at: string;
}

const todayUTC = () => new Date().toISOString().slice(0, 10);

interface Props {
  userId: string;
  accentText: string;
}

const ProviderStatusView = ({ userId, accentText }: Props) => {
  const { lang } = useI18n();

  const { data: status } = useQuery({
    queryKey: ["provider_status_view", userId, todayUTC()],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("provider_statuses")
        .select("*")
        .eq("user_id", userId)
        .eq("status_date", todayUTC())
        .maybeSingle();
      if (error) throw error;
      return data as DailyStatus | null;
    },
  });

  if (!status) return null;

  return (
    <div className="bg-card rounded-xl shadow-card p-4">
      <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
        <Sparkles className={`w-4 h-4 ${accentText}`} />
        {lang === "ar" ? "حالة اليوم" : "Today's Status"}
      </h3>
      <p className="text-sm text-foreground whitespace-pre-wrap">{status.text}</p>
      {status.image_url && (
        <img
          src={status.image_url}
          alt=""
          className="w-full max-h-48 object-cover rounded-lg mt-2"
        />
      )}
      {status.link_url && (
        <a
          href={status.link_url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1 text-xs font-medium ${accentText} break-all mt-2`}
        >
          <LinkIcon className="w-3 h-3 flex-shrink-0" />
          {status.link_url}
        </a>
      )}
      <p className="text-[10px] text-muted-foreground mt-2">
        {lang === "ar" ? "اليوم" : "Today"} ·{" "}
        {new Date(status.updated_at).toLocaleTimeString(
          lang === "ar" ? "ar-EG" : "en-US",
          { hour: "2-digit", minute: "2-digit" }
        )}
      </p>
    </div>
  );
};

export default ProviderStatusView;
