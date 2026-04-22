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
  /** Real auth user id (for live providers). */
  userId?: string;
  /** Sample/demo id (e.g., culture actor "ca3") for seeded examples. */
  sampleId?: string;
  accentText: string;
}

const ProviderStatusView = ({ userId, sampleId, accentText }: Props) => {
  const { lang } = useI18n();
  const isAr = lang === "ar";

  const { data: status } = useQuery({
    queryKey: ["provider_status_view", userId ?? null, sampleId ?? null, todayUTC()],
    enabled: !!(userId || sampleId),
    queryFn: async () => {
      let query = supabase
        .from("provider_statuses")
        .select("*")
        .eq("status_date", todayUTC());
      query = sampleId ? query.eq("sample_id", sampleId) : query.eq("user_id", userId!);
      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      return data as DailyStatus | null;
    },
  });

  if (!status) return null;

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="bg-card rounded-xl shadow-card p-4 text-start"
    >
      <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
        <Sparkles className={`w-4 h-4 ${accentText}`} />
        {isAr ? "حالة اليوم" : "Today's Status"}
      </h3>
      <p
        dir="auto"
        className="text-sm text-foreground whitespace-pre-wrap text-start"
      >
        {status.text}
      </p>
      {status.image_url && (
        <img
          src={status.image_url}
          alt={isAr ? "صورة الحالة" : "Status image"}
          className="w-full max-h-48 object-cover rounded-lg mt-2"
        />
      )}
      {status.link_url && (
        <a
          href={status.link_url}
          target="_blank"
          rel="noopener noreferrer"
          dir="ltr"
          className={`inline-flex items-center gap-1 text-xs font-medium ${accentText} break-all mt-2`}
        >
          <LinkIcon className="w-3 h-3 flex-shrink-0" />
          <span className="break-all">{status.link_url}</span>
        </a>
      )}
      <p className="text-[10px] text-muted-foreground mt-2 text-start">
        {isAr ? "اليوم" : "Today"} ·{" "}
        {new Date(status.updated_at).toLocaleTimeString(
          isAr ? "ar-EG" : "en-US",
          { hour: "2-digit", minute: "2-digit" }
        )}
      </p>
    </div>
  );
};

export default ProviderStatusView;
