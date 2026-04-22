import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles, Image as ImageIcon, Link as LinkIcon, X, Pencil, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface DailyStatus {
  id: string;
  user_id: string;
  status_date: string;
  text: string;
  image_url: string | null;
  link_url: string | null;
  created_at: string;
  updated_at: string;
}

const statusSchema = z.object({
  text: z.string().trim().min(1, "Status cannot be empty").max(280, "Max 280 characters"),
  link_url: z
    .string()
    .trim()
    .max(500, "Link too long")
    .url("Invalid URL")
    .optional()
    .or(z.literal("")),
});

const todayUTC = () => new Date().toISOString().slice(0, 10);

interface Props {
  /** Tailwind class for accent color, e.g. "bg-role-culture-actor". */
  accentBg: string;
  /** Tailwind class for accent text color, e.g. "text-role-culture-actor". */
  accentText: string;
}

const DailyStatusCard = ({ accentBg, accentText }: Props) => {
  const { lang } = useI18n();
  const { user } = useAuth();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [text, setText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: status, isLoading } = useQuery({
    queryKey: ["provider_status", user?.id, todayUTC()],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("provider_statuses")
        .select("*")
        .eq("user_id", user!.id)
        .eq("status_date", todayUTC())
        .maybeSingle();
      if (error) throw error;
      return data as DailyStatus | null;
    },
  });

  useEffect(() => {
    if (status && !editing) {
      setText(status.text);
      setLinkUrl(status.link_url ?? "");
      setImageUrl(status.image_url);
    }
  }, [status, editing]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const parsed = statusSchema.safeParse({ text, link_url: linkUrl });
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0].message);
      }
      const payload = {
        user_id: user.id,
        status_date: todayUTC(),
        text: parsed.data.text,
        link_url: parsed.data.link_url ? parsed.data.link_url : null,
        image_url: imageUrl,
      };
      const { error } = await supabase
        .from("provider_statuses")
        .upsert(payload, { onConflict: "user_id,status_date" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["provider_status", user?.id, todayUTC()] });
      setEditing(false);
      toast.success(lang === "ar" ? "تم تحديث الحالة" : "Status updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!user || !status) return;
      const { error } = await supabase
        .from("provider_statuses")
        .delete()
        .eq("id", status.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["provider_status", user?.id, todayUTC()] });
      setText("");
      setLinkUrl("");
      setImageUrl(null);
      setEditing(false);
      toast.success(lang === "ar" ? "تم حذف الحالة" : "Status deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleUpload = async (file: File) => {
    if (!user) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error(lang === "ar" ? "الحد الأقصى ٥ ميجا" : "Max 5MB");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("provider-status-images")
        .upload(path, file, { upsert: false });
      if (upErr) throw upErr;
      const { data } = supabase.storage
        .from("provider-status-images")
        .getPublicUrl(path);
      setImageUrl(data.publicUrl);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  const showEditor = editing || !status;

  const isAr = lang === "ar";

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="bg-card rounded-xl shadow-card p-4 text-start">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Sparkles className={`w-4 h-4 ${accentText}`} />
          {isAr ? "حالة اليوم" : "Today's Status"}
        </h3>
        {status && !editing && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setEditing(true)}
              aria-label={isAr ? "تعديل" : "Edit"}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              aria-label={isAr ? "حذف" : "Delete"}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      ) : showEditor ? (
        <div className="space-y-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            dir="auto"
            placeholder={
              isAr ? "ماذا يحدث اليوم؟" : "What's happening today?"
            }
            maxLength={280}
            rows={3}
            className="w-full text-sm bg-surface border border-border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 text-start"
          />
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            dir="ltr"
            placeholder={isAr ? "رابط (اختياري)" : "Link (optional)"}
            maxLength={500}
            className="w-full text-xs bg-surface border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          {imageUrl && (
            <div className="relative">
              <img
                src={imageUrl}
                alt={isAr ? "معاينة الصورة" : "Image preview"}
                className="w-full max-h-40 object-cover rounded-lg"
              />
              <button
                onClick={() => setImageUrl(null)}
                aria-label={isAr ? "إزالة الصورة" : "Remove image"}
                className="absolute top-1.5 end-1.5 bg-black/60 text-white rounded-full p-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-muted-foreground">
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                aria-label={isAr ? "إضافة صورة" : "Add image"}
                className="p-1.5 rounded-md hover:bg-muted disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ImageIcon className="w-4 h-4" />
                )}
              </button>
              <LinkIcon className="w-4 h-4 opacity-50" />
              <span className="text-[10px] ms-1" dir="ltr">{text.length}/280</span>
            </div>
            <div className="flex items-center gap-2">
              {status && (
                <button
                  onClick={() => {
                    setEditing(false);
                    setText(status.text);
                    setLinkUrl(status.link_url ?? "");
                    setImageUrl(status.image_url);
                  }}
                  className="text-xs font-medium text-muted-foreground px-3 py-1.5"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
              )}
              <button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending || !text.trim()}
                className={`text-xs font-semibold text-white ${accentBg} px-4 py-1.5 rounded-md disabled:opacity-50`}
              >
                {saveMutation.isPending
                  ? isAr
                    ? "جارٍ الحفظ..."
                    : "Saving..."
                  : isAr
                  ? "نشر"
                  : "Post"}
              </button>
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f);
              e.target.value = "";
            }}
          />
        </div>
      ) : (
        <div className="space-y-2">
          <p dir="auto" className="text-sm text-foreground whitespace-pre-wrap text-start">
            {status!.text}
          </p>
          {status!.image_url && (
            <img
              src={status!.image_url}
              alt={isAr ? "صورة الحالة" : "Status image"}
              className="w-full max-h-48 object-cover rounded-lg"
            />
          )}
          {status!.link_url && (
            <a
              href={status!.link_url}
              target="_blank"
              rel="noopener noreferrer"
              dir="ltr"
              className={`inline-flex items-center gap-1 text-xs font-medium ${accentText} break-all`}
            >
              <LinkIcon className="w-3 h-3 flex-shrink-0" />
              <span className="break-all">{status!.link_url}</span>
            </a>
          )}
          <p className="text-[10px] text-muted-foreground text-start">
            {isAr ? "اليوم" : "Today"} ·{" "}
            {new Date(status!.updated_at).toLocaleTimeString(
              isAr ? "ar-EG" : "en-US",
              { hour: "2-digit", minute: "2-digit" }
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default DailyStatusCard;
