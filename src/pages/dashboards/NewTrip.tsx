import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { slugify, uploadImages } from "@/lib/dashboardForms";
import PhotoPicker from "@/components/dashboard/PhotoPicker";
import { ArrowLeft, Plus, Trash2, FileText, Image, Tag, MapPin, Clock, Users, DollarSign, Calendar, ListChecks } from "lucide-react";
import { toast } from "sonner";

const tripTypes = [
  { en: "One Day", ar: "يوم واحد" },
  { en: "Multi Day", ar: "متعدد الأيام" },
  { en: "Weekend", ar: "عطلة نهاية الأسبوع" },
];

const NewTrip = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const [submitting, setSubmitting] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    tripType: "",
    days: "",
    maxGroup: "",
    price: "",
    startLocation: "",
    destinations: [""],
    itinerary: [{ day: "1", description: "" }],
    includes: [""],
    departureDate: "",
  });

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      const { data, error } = await supabase.from("trips").select("*").eq("id", id).maybeSingle();
      if (error || !data) {
        toast.error(lang === "ar" ? "تعذر تحميل الرحلة" : "Could not load trip");
        return;
      }
      const routeParts = (data.route_en || "").split(" → ").map((s: string) => s.trim()).filter(Boolean);
      const itin = Array.isArray(data.itinerary_en) ? (data.itinerary_en as any[]) : [];
      const inc = Array.isArray(data.inclusions_en) ? (data.inclusions_en as any[]) : [];
      setForm({
        title: data.title_en || "",
        description: data.description_en || "",
        tripType: data.trip_type || "",
        days: data.duration_days != null ? String(data.duration_days) : "",
        maxGroup: data.capacity_max != null ? String(data.capacity_max) : "",
        price: data.price != null ? String(data.price) : "",
        startLocation: routeParts[0] || "",
        destinations: routeParts.length > 1 ? routeParts.slice(1) : [""],
        itinerary: itin.length ? itin.map((i: any, idx: number) => ({ day: String(idx + 1), description: i.description || "" })) : [{ day: "1", description: "" }],
        includes: inc.length ? inc.map((i: any) => String(i)) : [""],
        departureDate: data.date || "",
      });
      setExistingImages(Array.isArray(data.images) ? (data.images as string[]) : data.image ? [data.image] : []);
    })();
  }, [isEdit, id, lang]);

  const set = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));


  const updateDest = (idx: number, value: string) => {
    setForm((p) => { const arr = [...p.destinations]; arr[idx] = value; return { ...p, destinations: arr }; });
  };
  const addDest = () => setForm((p) => ({ ...p, destinations: [...p.destinations, ""] }));
  const removeDest = (idx: number) => setForm((p) => ({ ...p, destinations: p.destinations.filter((_, i) => i !== idx) }));

  const updateItinerary = (idx: number, value: string) => {
    setForm((p) => { const arr = [...p.itinerary]; arr[idx] = { ...arr[idx], description: value }; return { ...p, itinerary: arr }; });
  };
  const addItinerary = () => setForm((p) => ({ ...p, itinerary: [...p.itinerary, { day: String(p.itinerary.length + 1), description: "" }] }));
  const removeItinerary = (idx: number) => setForm((p) => ({ ...p, itinerary: p.itinerary.filter((_, i) => i !== idx) }));

  const updateIncludes = (idx: number, value: string) => {
    setForm((p) => { const arr = [...p.includes]; arr[idx] = value; return { ...p, includes: arr }; });
  };
  const addIncludes = () => setForm((p) => ({ ...p, includes: [...p.includes, ""] }));
  const removeIncludes = (idx: number) => setForm((p) => ({ ...p, includes: p.includes.filter((_, i) => i !== idx) }));

  const handleSubmit = async () => {
    if (!user) {
      toast.error(lang === "ar" ? "يرجى تسجيل الدخول" : "Please sign in first");
      return;
    }
    if (!form.title.trim() || !form.description.trim() || !form.tripType || !form.price.trim()) {
      toast.error(lang === "ar" ? "يرجى ملء الحقول المطلوبة" : "Please fill in required fields");
      return;
    }
    setSubmitting(true);
    try {
      const images = await uploadImages(photos, user.id);
      const destinations = form.destinations.map((d) => d.trim()).filter(Boolean);
      const route = [form.startLocation.trim(), ...destinations].filter(Boolean).join(" → ");
      const itinerary = form.itinerary
        .filter((i) => i.description.trim())
        .map((i, idx) => ({ day: idx + 1, description: i.description.trim() }));
      const inclusions = form.includes.map((i) => i.trim()).filter(Boolean);

      const { error } = await supabase.from("trips").insert({
        organizer_id: user.id,
        title_en: form.title.trim(),
        title_ar: form.title.trim(),
        description_en: form.description.trim(),
        description_ar: form.description.trim(),
        trip_type: form.tripType,
        price: parseInt(form.price) || 0,
        duration_days: parseInt(form.days) || 1,
        capacity_max: parseInt(form.maxGroup) || null,
        date: form.departureDate || null,
        route_en: route || null,
        route_ar: route || null,
        itinerary_en: itinerary,
        itinerary_ar: itinerary,
        inclusions_en: inclusions,
        inclusions_ar: inclusions,
        image: images[0] || null,
        images,
        slug: slugify(form.title, user.id.slice(0, 6)),
        status: "published",
      });
      if (error) throw error;
      toast.success(lang === "ar" ? "تم نشر الرحلة بنجاح!" : "Trip published successfully!");
      navigate("/dashboard/trip-organizer/my-trips");
    } catch (err: any) {
      toast.error(err.message || "Failed to create trip");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-role-trip-organizer/40";
  const labelClass = "text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5";

  return (
    <div className="min-h-screen bg-surface pb-10">
      <header className="bg-role-trip-organizer text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-bold">{lang === "ar" ? "إنشاء رحلة" : "Create Trip"}</h1>
      </header>

      <div className="px-4 py-5 space-y-5">
        <div>
          <label className={labelClass}><Image className="w-3.5 h-3.5 text-role-trip-organizer" />{lang === "ar" ? "صور الرحلة" : "Trip Photos"}</label>
          <PhotoPicker files={photos} onChange={setPhotos} max={5} hint={lang === "ar" ? "حتى ٥ صور" : "Up to 5 photos"} />
        </div>

        <div>
          <label className={labelClass}><FileText className="w-3.5 h-3.5 text-role-trip-organizer" />{lang === "ar" ? "اسم الرحلة *" : "Trip Name *"}</label>
          <input className={inputClass} placeholder={lang === "ar" ? "مثال: رحلة يوم كامل للإسماعيلية" : "e.g. Full Day Trip to Ismailia"} value={form.title} onChange={(e) => set("title", e.target.value)} maxLength={100} />
        </div>

        <div>
          <label className={labelClass}><FileText className="w-3.5 h-3.5 text-role-trip-organizer" />{lang === "ar" ? "الوصف *" : "Description *"}</label>
          <textarea className={`${inputClass} min-h-[100px] resize-none`} placeholder={lang === "ar" ? "اوصف الرحلة..." : "Describe the trip..."} value={form.description} onChange={(e) => set("description", e.target.value)} maxLength={2000} />
          <span className="text-[10px] text-muted-foreground mt-1 block text-right">{form.description.length}/2000</span>
        </div>

        <div>
          <label className={labelClass}><Tag className="w-3.5 h-3.5 text-role-trip-organizer" />{lang === "ar" ? "نوع الرحلة *" : "Trip Type *"}</label>
          <div className="flex gap-2">
            {tripTypes.map((t, i) => (
              <button key={i} onClick={() => set("tripType", t.en)} className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-colors ${form.tripType === t.en ? "bg-role-trip-organizer text-white border-role-trip-organizer" : "bg-card text-foreground border-border"}`}>
                {lang === "ar" ? t.ar : t.en}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelClass}><Clock className="w-3.5 h-3.5 text-role-trip-organizer" />{lang === "ar" ? "الأيام" : "Days"}</label>
            <input type="number" className={inputClass} placeholder="1" value={form.days} onChange={(e) => set("days", e.target.value)} min="1" max="30" />
          </div>
          <div>
            <label className={labelClass}><Users className="w-3.5 h-3.5 text-role-trip-organizer" />{lang === "ar" ? "الحد" : "Max"}</label>
            <input type="number" className={inputClass} placeholder="12" value={form.maxGroup} onChange={(e) => set("maxGroup", e.target.value)} min="1" />
          </div>
          <div>
            <label className={labelClass}><DollarSign className="w-3.5 h-3.5 text-role-trip-organizer" />{lang === "ar" ? "السعر *" : "Price *"}</label>
            <input type="number" className={inputClass} placeholder="800" value={form.price} onChange={(e) => set("price", e.target.value)} min="0" />
          </div>
        </div>

        <div>
          <label className={labelClass}><Calendar className="w-3.5 h-3.5 text-role-trip-organizer" />{lang === "ar" ? "تاريخ الانطلاق" : "Departure Date"}</label>
          <input type="date" className={inputClass} value={form.departureDate} onChange={(e) => set("departureDate", e.target.value)} />
        </div>

        <div>
          <label className={labelClass}><MapPin className="w-3.5 h-3.5 text-role-trip-organizer" />{lang === "ar" ? "نقطة الانطلاق" : "Start Location"}</label>
          <input className={inputClass} placeholder={lang === "ar" ? "مثال: القاهرة" : "e.g. Cairo"} value={form.startLocation} onChange={(e) => set("startLocation", e.target.value)} maxLength={100} />
        </div>

        <div>
          <label className={labelClass}><MapPin className="w-3.5 h-3.5 text-role-trip-organizer" />{lang === "ar" ? "الوجهات" : "Destinations"}</label>
          <div className="space-y-2">
            {form.destinations.map((d, i) => (
              <div key={i} className="flex gap-2">
                <input className={`${inputClass} flex-1`} placeholder={lang === "ar" ? "مدينة أو معلم..." : "City or landmark..."} value={d} onChange={(e) => updateDest(i, e.target.value)} maxLength={80} />
                {form.destinations.length > 1 && <button onClick={() => removeDest(i)} className="p-2 text-destructive"><Trash2 className="w-4 h-4" /></button>}
              </div>
            ))}
            <button onClick={addDest} className="flex items-center gap-1 text-xs font-medium text-role-trip-organizer"><Plus className="w-3.5 h-3.5" /> {lang === "ar" ? "إضافة وجهة" : "Add destination"}</button>
          </div>
        </div>

        <div>
          <label className={labelClass}><ListChecks className="w-3.5 h-3.5 text-role-trip-organizer" />{lang === "ar" ? "برنامج الرحلة" : "Itinerary"}</label>
          <div className="space-y-2">
            {form.itinerary.map((item, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="w-6 h-6 rounded-full bg-role-trip-organizer text-white flex items-center justify-center text-[10px] font-bold mt-2.5 shrink-0">{i + 1}</span>
                <input className={`${inputClass} flex-1`} placeholder={lang === "ar" ? "وصف اليوم..." : "Day description..."} value={item.description} onChange={(e) => updateItinerary(i, e.target.value)} maxLength={200} />
                {form.itinerary.length > 1 && <button onClick={() => removeItinerary(i)} className="p-2 text-destructive mt-1"><Trash2 className="w-4 h-4" /></button>}
              </div>
            ))}
            <button onClick={addItinerary} className="flex items-center gap-1 text-xs font-medium text-role-trip-organizer ml-8"><Plus className="w-3.5 h-3.5" /> {lang === "ar" ? "إضافة يوم" : "Add day"}</button>
          </div>
        </div>

        <div>
          <label className={labelClass}><ListChecks className="w-3.5 h-3.5 text-role-trip-organizer" />{lang === "ar" ? "يشمل" : "Includes"}</label>
          <div className="space-y-2">
            {form.includes.map((item, i) => (
              <div key={i} className="flex gap-2">
                <input className={`${inputClass} flex-1`} placeholder={lang === "ar" ? "مثال: وجبة غداء" : "e.g. Lunch meal"} value={item} onChange={(e) => updateIncludes(i, e.target.value)} maxLength={80} />
                {form.includes.length > 1 && <button onClick={() => removeIncludes(i)} className="p-2 text-destructive"><Trash2 className="w-4 h-4" /></button>}
              </div>
            ))}
            <button onClick={addIncludes} className="flex items-center gap-1 text-xs font-medium text-role-trip-organizer"><Plus className="w-3.5 h-3.5" /> {lang === "ar" ? "إضافة عنصر" : "Add item"}</button>
          </div>
        </div>

        <button onClick={handleSubmit} disabled={submitting} className="w-full bg-role-trip-organizer text-white rounded-xl py-4 font-bold text-sm mt-4 disabled:opacity-60">
          {submitting ? (lang === "ar" ? "جاري النشر..." : "Publishing...") : (lang === "ar" ? "نشر الرحلة" : "Publish Trip")}
        </button>
      </div>
    </div>
  );
};

export default NewTrip;
