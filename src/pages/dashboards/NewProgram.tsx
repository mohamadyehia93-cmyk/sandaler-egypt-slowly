import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { slugify, uploadImages, uploadVideo } from "@/lib/dashboardForms";
import PhotoPicker from "@/components/dashboard/PhotoPicker";
import VideoPicker from "@/components/dashboard/VideoPicker";
import CityPicker from "@/components/dashboard/CityPicker";
import LocationPicker from "@/components/dashboard/LocationPicker";
import { getCityCoords } from "@/lib/cityCoords";
import BilingualField from "@/components/dashboard/BilingualField";
import AuthorLangToggle from "@/components/dashboard/AuthorLangToggle";
import type { Lang, TranslationMeta } from "@/lib/translation";
import { ArrowLeft, Plus, Trash2, FileText, Image, Tag, MapPin, Calendar, Users, Heart, Video } from "lucide-react";
import { toast } from "sonner";

const programTypes = [
  { en: "Volunteering", ar: "تطوع" },
  { en: "Education", ar: "تعليم" },
  { en: "Environmental", ar: "بيئي" },
  { en: "Cultural Preservation", ar: "حفظ ثقافي" },
  { en: "Community Development", ar: "تنمية مجتمعية" },
];

const NewProgram = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const [submitting, setSubmitting] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [existingVideo, setExistingVideo] = useState<string | null>(null);
  const [locTab, setLocTab] = useState<"city" | "map">("city");

  const [authorLang, setAuthorLang] = useState<Lang>(lang === "ar" ? "ar" : "en");
  const [meta, setMeta] = useState<TranslationMeta>({});

  const [form, setForm] = useState({
    titleEn: "",
    titleAr: "",
    descriptionEn: "",
    descriptionAr: "",
    type: "",
    cityId: "",
    regionId: "",
    latitude: "",
    longitude: "",
    locationEn: "",
    locationAr: "",
    startDate: "",
    endDate: "",
    volunteersNeeded: "",
    goals: [""],
    donationTarget: "",
  });

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      const { data, error } = await supabase.from("programs").select("*").eq("id", id).maybeSingle();
      if (error || !data) {
        toast.error(lang === "ar" ? "تعذر تحميل البرنامج" : "Could not load program");
        return;
      }
      const goals = Array.isArray(data.goals) ? (data.goals as any[]) : [];
      setForm({
        titleEn: data.title_en || "",
        titleAr: data.title_ar || "",
        descriptionEn: data.description_en || "",
        descriptionAr: data.description_ar || "",
        type: data.program_type || "",
        cityId: (data as any).city_id || "",
        regionId: (data as any).region_id || "",
        latitude: (data as any).latitude != null ? String((data as any).latitude) : "",
        longitude: (data as any).longitude != null ? String((data as any).longitude) : "",
        locationEn: data.location_en || "",
        locationAr: data.location_ar || "",
        startDate: data.start_date || "",
        endDate: data.end_date || "",
        volunteersNeeded: data.volunteers_needed != null ? String(data.volunteers_needed) : "",
        goals: goals.length ? goals.map((g: any) => String(g)) : [""],
        donationTarget: data.donation_target != null ? String(data.donation_target) : "",
      });
      setMeta(((data as any).translation_meta as TranslationMeta) || {});
      setExistingImages(data.image ? [data.image] : []);
      setExistingVideo((data as any).video_url || null);
    })();
  }, [isEdit, id, lang]);

  const set = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));


  const updateGoal = (idx: number, value: string) => {
    setForm((p) => { const arr = [...p.goals]; arr[idx] = value; return { ...p, goals: arr }; });
  };
  const addGoal = () => setForm((p) => ({ ...p, goals: [...p.goals, ""] }));
  const removeGoal = (idx: number) => setForm((p) => ({ ...p, goals: p.goals.filter((_, i) => i !== idx) }));

  const handleSubmit = async () => {
    if (!user) {
      toast.error(lang === "ar" ? "يرجى تسجيل الدخول" : "Please sign in first");
      return;
    }
    const titleSrc = authorLang === "ar" ? form.titleAr : form.titleEn;
    const descSrc = authorLang === "ar" ? form.descriptionAr : form.descriptionEn;
    if (!titleSrc.trim() || !descSrc.trim() || !form.type) {
      toast.error(lang === "ar" ? "يرجى ملء الحقول المطلوبة" : "Please fill in required fields");
      return;
    }
    setSubmitting(true);
    try {
      const uploaded = await uploadImages(photos, user.id);
      const images = [...existingImages, ...uploaded];
      const videoUrl = video ? await uploadVideo(video, user.id) : existingVideo;
      const goals = form.goals.map((g) => g.trim()).filter(Boolean);

      const payload = {
        owner_id: user.id,
        title_en: form.titleEn.trim(),
        title_ar: form.titleAr.trim() || null,
        description_en: form.descriptionEn.trim(),
        description_ar: form.descriptionAr.trim() || null,
        program_type: form.type,
        city_id: form.cityId || null,
        region_id: form.regionId || null,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
        location_en: form.locationEn.trim() || null,
        location_ar: form.locationAr.trim() || null,
        translation_meta: meta as any,
        start_date: form.startDate || null,
        end_date: form.endDate || null,
        volunteers_needed: parseInt(form.volunteersNeeded) || null,
        donation_target: parseInt(form.donationTarget) || null,
        goals,
        image: images[0] || null,
        video_url: videoUrl || null,
        status: "published",
      };

      if (isEdit) {
        const { error } = await supabase.from("programs").update(payload).eq("id", id);
        if (error) throw error;
        toast.success(lang === "ar" ? "تم تحديث البرنامج!" : "Program updated!");
      } else {
        const { error } = await supabase.from("programs").insert({ ...payload, slug: slugify(form.titleEn || form.titleAr, user.id.slice(0, 6)) });
        if (error) throw error;
        toast.success(lang === "ar" ? "تم نشر البرنامج بنجاح!" : "Program published successfully!");
      }
      navigate("/dashboard/organization/my-programs");
    } catch (err: any) {
      toast.error(err.message || "Failed to save program");
    } finally {
      setSubmitting(false);
    }
  };


  const inputClass = "w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-role-organization/40";
  const labelClass = "text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5";

  return (
    <div className="min-h-screen bg-surface pb-10">
      <header className="bg-role-organization text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-bold">{isEdit ? (lang === "ar" ? "تعديل البرنامج" : "Edit Program") : (lang === "ar" ? "إضافة برنامج" : "Add Program")}</h1>
      </header>

      <div className="px-4 py-5 space-y-5">
        <AuthorLangToggle value={authorLang} onChange={setAuthorLang} />

        <div>
          <label className={labelClass}><Image className="w-3.5 h-3.5 text-role-organization" />{lang === "ar" ? "صور البرنامج" : "Program Photos"}</label>
          <PhotoPicker files={photos} onChange={setPhotos} max={3} hint={lang === "ar" ? "حتى ٣ صور" : "Up to 3 photos"} existing={existingImages} onRemoveExisting={(url) => setExistingImages((p) => p.filter((u) => u !== url))} />
        </div>

        <BilingualField
          fieldEn="title_en" fieldAr="title_ar"
          labelEn="Program Name" labelAr="اسم البرنامج"
          required
          icon={<FileText className="w-3.5 h-3.5 text-role-organization" />}
          valueEn={form.titleEn} valueAr={form.titleAr}
          onChange={({ en, ar }) => setForm((p) => ({ ...p, titleEn: en, titleAr: ar }))}
          meta={meta} onMetaChange={setMeta}
          authorLang={authorLang}
          context="short name of a community or environmental program in Egypt"
          placeholderEn="e.g. Lake Burullus Cleanup Campaign" placeholderAr="مثال: حملة تنظيف بحيرة البرلس"
          inputClass={inputClass} labelClass={labelClass}
        />

        <BilingualField
          fieldEn="description_en" fieldAr="description_ar"
          labelEn="Description" labelAr="الوصف"
          required multiline rows={5}
          icon={<FileText className="w-3.5 h-3.5 text-role-organization" />}
          valueEn={form.descriptionEn} valueAr={form.descriptionAr}
          onChange={({ en, ar }) => setForm((p) => ({ ...p, descriptionEn: en, descriptionAr: ar }))}
          meta={meta} onMetaChange={setMeta}
          authorLang={authorLang}
          context="description of a community or environmental program in Egypt"
          placeholderEn="Describe the program..." placeholderAr="اوصف البرنامج..."
          inputClass={inputClass} labelClass={labelClass}
        />

        <div>
          <label className={labelClass}><Tag className="w-3.5 h-3.5 text-role-organization" />{lang === "ar" ? "النوع *" : "Type *"}</label>
          <div className="flex flex-wrap gap-2">
            {programTypes.map((t, i) => (
              <button key={i} onClick={() => set("type", t.en)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${form.type === t.en ? "bg-role-organization text-white border-role-organization" : "bg-card text-foreground border-border"}`}>
                {lang === "ar" ? t.ar : t.en}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}>
            <MapPin className="w-3.5 h-3.5 text-role-organization" />
            {lang === "ar" ? "الموقع" : "Location"}
          </label>
          <div className="flex gap-2 mb-3">
            {([
              { key: "city", en: "City", ar: "المدينة" },
              { key: "map", en: "Exact address", ar: "العنوان الدقيق" },
            ] as const).map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setLocTab(t.key)}
                className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                  locTab === t.key
                    ? "bg-role-organization text-white border-role-organization"
                    : "bg-card text-foreground border-border"
                }`}
              >
                {lang === "ar" ? t.ar : t.en}
              </button>
            ))}
          </div>

          {locTab === "city" ? (
            <CityPicker
              cityId={form.cityId}
              onChange={(cityId, regionId) => setForm((p) => ({ ...p, cityId, regionId }))}
              iconClass="w-3.5 h-3.5 text-role-organization"
              inputClass={inputClass}
              labelClass={labelClass}
              hintEn="Choosing a city makes your program appear on that city's and region's pages."
              hintAr="اختيار المدينة يجعل برنامجك يظهر في صفحات المدينة والمنطقة."
            />
          ) : (
            <div className="space-y-3">
              <LocationPicker
                lat={form.latitude}
                lng={form.longitude}
                fallbackCenter={getCityCoords(form.cityId)}
                onChange={(lat, lng) =>
                  setForm((p) => ({ ...p, latitude: String(lat), longitude: String(lng) }))
                }
              />
              <BilingualField
                fieldEn="location_en" fieldAr="location_ar"
                labelEn="Address / landmark" labelAr="العنوان / علامة مميزة"
                icon={<MapPin className="w-3.5 h-3.5 text-role-organization" />}
                valueEn={form.locationEn} valueAr={form.locationAr}
                onChange={({ en, ar }) => setForm((p) => ({ ...p, locationEn: en, locationAr: ar }))}
                meta={meta} onMetaChange={setMeta}
                authorLang={authorLang}
                context="street address or landmark in Egypt"
                placeholderEn="e.g. Youth Centre, El Geish St." placeholderAr="مثال: مركز الشباب، شارع الجيش"
                inputClass={inputClass} labelClass={labelClass}
              />
            </div>
          )}
        </div>

        <div>
          <label className={labelClass}>
            <Video className="w-3.5 h-3.5 text-role-organization" />
            {lang === "ar" ? "فيديو ترويجي (اختياري)" : "Promo Video (optional)"}
          </label>
          <VideoPicker
            file={video}
            onChange={setVideo}
            existingUrl={existingVideo}
            onRemoveExisting={() => setExistingVideo(null)}
            uploading={submitting}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}><Calendar className="w-3.5 h-3.5 text-role-organization" />{lang === "ar" ? "تاريخ البدء" : "Start Date"}</label>
            <input type="date" className={inputClass} value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}><Calendar className="w-3.5 h-3.5 text-role-organization" />{lang === "ar" ? "تاريخ الانتهاء" : "End Date"}</label>
            <input type="date" className={inputClass} value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}><Users className="w-3.5 h-3.5 text-role-organization" />{lang === "ar" ? "متطوعون مطلوبون" : "Volunteers Needed"}</label>
            <input type="number" className={inputClass} placeholder="20" value={form.volunteersNeeded} onChange={(e) => set("volunteersNeeded", e.target.value)} min="0" />
          </div>
          <div>
            <label className={labelClass}><Heart className="w-3.5 h-3.5 text-role-organization" />{lang === "ar" ? "هدف التبرعات (ج.م)" : "Donation Goal (EGP)"}</label>
            <input type="number" className={inputClass} placeholder="5000" value={form.donationTarget} onChange={(e) => set("donationTarget", e.target.value)} min="0" />
          </div>
        </div>

        <div>
          <label className={labelClass}>{lang === "ar" ? "أهداف البرنامج" : "Program Goals"}</label>
          <div className="space-y-2">
            {form.goals.map((g, i) => (
              <div key={i} className="flex gap-2">
                <input className={`${inputClass} flex-1`} placeholder={lang === "ar" ? "هدف..." : "Goal..."} value={g} onChange={(e) => updateGoal(i, e.target.value)} maxLength={100} />
                {form.goals.length > 1 && <button onClick={() => removeGoal(i)} className="p-2 text-destructive"><Trash2 className="w-4 h-4" /></button>}
              </div>
            ))}
            <button onClick={addGoal} className="flex items-center gap-1 text-xs font-medium text-role-organization"><Plus className="w-3.5 h-3.5" /> {lang === "ar" ? "إضافة هدف" : "Add goal"}</button>
          </div>
        </div>

        <button onClick={handleSubmit} disabled={submitting} className="w-full bg-role-organization text-white rounded-xl py-4 font-bold text-sm mt-4 disabled:opacity-60">
          {submitting ? (lang === "ar" ? "جاري الحفظ..." : "Saving...") : isEdit ? (lang === "ar" ? "حفظ التغييرات" : "Save Changes") : (lang === "ar" ? "نشر البرنامج" : "Publish Program")}
        </button>
      </div>
    </div>
  );
};

export default NewProgram;
