import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCities, useRegions } from "@/hooks/useListings";
import { ArrowLeft, Upload, FileText, Tag, MapPin, Calendar, Clock, DollarSign, Ticket, Users } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = ["festival", "exhibition", "concert", "workshop", "performance", "market"];

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) ||
  "event";

const NewEvent = () => {
  const { lang, t } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [params] = useSearchParams();
  const editId = params.get("id");
  const { data: cities = [] } = useCities();
  const { data: regions = [] } = useRegions();

  const [submitting, setSubmitting] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [form, setForm] = useState({
    title_en: "",
    title_ar: "",
    description_en: "",
    description_ar: "",
    category: "festival",
    region_id: "",
    city_id: "",
    start_date: "",
    end_date: "",
    event_time: "",
    venue_en: "",
    venue_ar: "",
    capacity: "",
    is_free: true,
    price: "",
    ticket_url: "",
    image: "" as string | null,
  });

  const set = (key: string, value: any) => setForm((p) => ({ ...p, [key]: value }));

  useEffect(() => {
    if (!editId) return;
    (async () => {
      const { data } = await supabase.from("events").select("*").eq("id", editId).maybeSingle();
      if (data) {
        setForm({
          title_en: data.title_en || "",
          title_ar: data.title_ar || "",
          description_en: data.description_en || "",
          description_ar: data.description_ar || "",
          category: data.category || "festival",
          region_id: data.region_id || "",
          city_id: data.city_id || "",
          start_date: data.start_date || "",
          end_date: data.end_date || "",
          event_time: data.event_time || "",
          venue_en: data.venue_en || "",
          venue_ar: data.venue_ar || "",
          capacity: data.capacity != null ? String(data.capacity) : "",
          is_free: data.is_free ?? true,
          price: data.price != null ? String(data.price) : "",
          ticket_url: data.ticket_url || "",
          image: data.image || "",
        });
      }
    })();
  }, [editId]);

  const regionCities = useMemo(
    () => (cities as any[]).filter((c) => !form.region_id || c.region_id === form.region_id),
    [cities, form.region_id]
  );

  const handleSubmit = async () => {
    if (!user) {
      toast.error(lang === "ar" ? "يرجى تسجيل الدخول" : "Please sign in first");
      return;
    }
    if (!form.title_en.trim() || !form.title_ar.trim() || !form.start_date) {
      toast.error(lang === "ar" ? "يرجى ملء الحقول المطلوبة" : "Please fill in required fields");
      return;
    }
    setSubmitting(true);
    try {
      let imageUrl = form.image;
      if (photo) {
        const ext = photo.name.split(".").pop();
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage.from("listing-images").upload(path, photo);
        if (upErr) throw upErr;
        imageUrl = supabase.storage.from("listing-images").getPublicUrl(path).data.publicUrl;
      }

      const payload = {
        organizer_id: user.id,
        title_en: form.title_en.trim(),
        title_ar: form.title_ar.trim(),
        description_en: form.description_en.trim() || null,
        description_ar: form.description_ar.trim() || null,
        category: form.category,
        region_id: form.region_id || null,
        city_id: form.city_id || null,
        start_date: form.start_date,
        end_date: form.end_date || null,
        event_time: form.event_time || null,
        venue_en: form.venue_en.trim() || null,
        venue_ar: form.venue_ar.trim() || null,
        capacity: form.capacity ? parseInt(form.capacity, 10) || null : null,
        is_free: form.is_free,
        price: form.is_free ? null : parseFloat(form.price) || null,
        ticket_url: form.ticket_url.trim() || null,
        image: imageUrl || null,
        status: "published",
      };

      if (editId) {
        const { error } = await supabase.from("events").update(payload).eq("id", editId);
        if (error) throw error;
        toast.success(lang === "ar" ? "تم تحديث الفعالية!" : "Event updated!");
      } else {
        const { error } = await supabase
          .from("events")
          .insert({ ...payload, slug: `${slugify(form.title_en)}-${Math.random().toString(36).slice(2, 7)}` });
        if (error) throw error;
        toast.success(lang === "ar" ? "تم نشر الفعالية!" : "Event published!");
      }
      queryClient.invalidateQueries({ queryKey: ["events"] });
      navigate("/dashboard/trip-organizer/events");
    } catch (err: any) {
      toast.error(err.message || "Failed to save event");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";
  const labelClass = "text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5";

  return (
    <div className="min-h-screen bg-surface pb-10">
      <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-bold">
          {editId
            ? lang === "ar" ? "تعديل الفعالية" : "Edit Event"
            : lang === "ar" ? "فعالية جديدة" : "New Event"}
        </h1>
      </header>

      <div className="px-4 py-5 space-y-5">
        <div>
          <label className={labelClass}><Upload className="w-3.5 h-3.5 text-primary" />{lang === "ar" ? "صورة الفعالية" : "Event Photo"}</label>
          <label className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center gap-2 bg-card cursor-pointer">
            {photo ? (
              <span className="text-xs text-foreground">{photo.name}</span>
            ) : form.image ? (
              <img src={form.image} alt="" className="h-24 rounded-lg object-cover" />
            ) : (
              <>
                <Upload className="w-7 h-7 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{lang === "ar" ? "اختر صورة" : "Choose a photo"}</span>
              </>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className={labelClass}><FileText className="w-3.5 h-3.5 text-primary" />{lang === "ar" ? "العنوان (إنجليزي) *" : "Title (English) *"}</label>
            <input className={inputClass} value={form.title_en} onChange={(e) => set("title_en", e.target.value)} maxLength={120} />
          </div>
          <div>
            <label className={labelClass}><FileText className="w-3.5 h-3.5 text-primary" />{lang === "ar" ? "العنوان (عربي) *" : "Title (Arabic) *"}</label>
            <input className={inputClass} dir="rtl" value={form.title_ar} onChange={(e) => set("title_ar", e.target.value)} maxLength={120} />
          </div>
        </div>

        <div>
          <label className={labelClass}><FileText className="w-3.5 h-3.5 text-primary" />{lang === "ar" ? "الوصف (إنجليزي)" : "Description (English)"}</label>
          <textarea className={`${inputClass} min-h-[80px] resize-none`} value={form.description_en} onChange={(e) => set("description_en", e.target.value)} maxLength={2000} />
        </div>
        <div>
          <label className={labelClass}><FileText className="w-3.5 h-3.5 text-primary" />{lang === "ar" ? "الوصف (عربي)" : "Description (Arabic)"}</label>
          <textarea className={`${inputClass} min-h-[80px] resize-none`} dir="rtl" value={form.description_ar} onChange={(e) => set("description_ar", e.target.value)} maxLength={2000} />
        </div>

        <div>
          <label className={labelClass}><Tag className="w-3.5 h-3.5 text-primary" />{lang === "ar" ? "النوع" : "Category"}</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => set("category", c)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${form.category === c ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"}`}>
                {t(`event.category.${c}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}><MapPin className="w-3.5 h-3.5 text-primary" />{lang === "ar" ? "المنطقة" : "Region"}</label>
            <select className={inputClass} value={form.region_id} onChange={(e) => { set("region_id", e.target.value); set("city_id", ""); }}>
              <option value="">{lang === "ar" ? "اختر" : "Select"}</option>
              {(regions as any[]).map((r) => (
                <option key={r.id} value={r.id}>{lang === "ar" ? r.name_ar : r.name_en}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}><MapPin className="w-3.5 h-3.5 text-primary" />{lang === "ar" ? "المدينة" : "City"}</label>
            <select className={inputClass} value={form.city_id} onChange={(e) => set("city_id", e.target.value)}>
              <option value="">{lang === "ar" ? "اختر" : "Select"}</option>
              {regionCities.map((c) => (
                <option key={c.id} value={c.id}>{lang === "ar" ? c.name_ar : c.name_en}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}><Calendar className="w-3.5 h-3.5 text-primary" />{lang === "ar" ? "تاريخ البدء *" : "Start Date *"}</label>
            <input type="date" className={inputClass} value={form.start_date} onChange={(e) => set("start_date", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}><Calendar className="w-3.5 h-3.5 text-primary" />{lang === "ar" ? "تاريخ الانتهاء" : "End Date"}</label>
            <input type="date" className={inputClass} value={form.end_date} min={form.start_date || undefined} onChange={(e) => set("end_date", e.target.value)} />
          </div>
        </div>

        <div>
          <label className={labelClass}><Clock className="w-3.5 h-3.5 text-primary" />{lang === "ar" ? "الوقت" : "Time"}</label>
          <input className={inputClass} placeholder={lang === "ar" ? "مثال: ٧ مساءً" : "e.g. 7:00 PM"} value={form.event_time} onChange={(e) => set("event_time", e.target.value)} maxLength={40} />
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className={labelClass}><MapPin className="w-3.5 h-3.5 text-primary" />{lang === "ar" ? "المكان (إنجليزي)" : "Venue (English)"}</label>
            <input className={inputClass} value={form.venue_en} onChange={(e) => set("venue_en", e.target.value)} maxLength={120} />
          </div>
          <div>
            <label className={labelClass}><MapPin className="w-3.5 h-3.5 text-primary" />{lang === "ar" ? "المكان (عربي)" : "Venue (Arabic)"}</label>
            <input className={inputClass} dir="rtl" value={form.venue_ar} onChange={(e) => set("venue_ar", e.target.value)} maxLength={120} />
          </div>
        </div>

        <div>
          <label className={labelClass}><Users className="w-3.5 h-3.5 text-primary" />{lang === "ar" ? "السعة (عدد الحضور)" : "Capacity (attendees)"}</label>
          <input type="number" className={inputClass} placeholder={lang === "ar" ? "مثال: ١٠٠" : "e.g. 100"} value={form.capacity} onChange={(e) => set("capacity", e.target.value)} min="0" />
        </div>

        <div className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
          <span className="text-sm font-medium text-foreground">{lang === "ar" ? "فعالية مجانية" : "Free event"}</span>
          <button
            onClick={() => set("is_free", !form.is_free)}
            className={`w-11 h-6 rounded-full transition-colors relative ${form.is_free ? "bg-primary" : "bg-muted"}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${form.is_free ? "start-0.5 ms-0" : "start-[22px]"}`} />
          </button>
        </div>

        {!form.is_free && (
          <div>
            <label className={labelClass}><DollarSign className="w-3.5 h-3.5 text-primary" />{lang === "ar" ? "السعر" : "Price (EGP)"}</label>
            <input type="number" className={inputClass} value={form.price} onChange={(e) => set("price", e.target.value)} min="0" />
          </div>
        )}

        <div>
          <label className={labelClass}><Ticket className="w-3.5 h-3.5 text-primary" />{lang === "ar" ? "رابط التذاكر" : "Ticket Link"}</label>
          <input className={inputClass} placeholder="https://" value={form.ticket_url} onChange={(e) => set("ticket_url", e.target.value)} />
        </div>

        <button onClick={handleSubmit} disabled={submitting} className="w-full bg-primary text-primary-foreground rounded-xl py-4 font-bold text-sm mt-2 disabled:opacity-60">
          {submitting
            ? lang === "ar" ? "جاري الحفظ..." : "Saving..."
            : editId
            ? lang === "ar" ? "حفظ التغييرات" : "Save Changes"
            : lang === "ar" ? "نشر الفعالية" : "Publish Event"}
        </button>
      </div>
    </div>
  );
};

export default NewEvent;
