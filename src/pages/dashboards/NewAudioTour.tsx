import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { slugify, uploadImages, uploadAudio } from "@/lib/dashboardForms";
import PhotoPicker from "@/components/dashboard/PhotoPicker";
import AudioPicker from "@/components/dashboard/AudioPicker";
import CityPicker from "@/components/dashboard/CityPicker";
import LocationPicker from "@/components/dashboard/LocationPicker";
import BilingualField from "@/components/dashboard/BilingualField";
import AuthorLangToggle from "@/components/dashboard/AuthorLangToggle";
import type { Lang, TranslationMeta } from "@/lib/translation";
import ScriptMeter from "@/components/dashboard/ScriptMeter";
import { estimateSeconds, formatDurationShort } from "@/lib/scriptEstimate";
import { ArrowLeft, ArrowUp, ArrowDown, FileText, MapPin, Clock, Tag, Languages, DollarSign, Plus, Trash2, Mic, Image as ImageIcon, Navigation, Timer, Footprints, Layers } from "lucide-react";
import { toast } from "sonner";

const themes = [
  { en: "History", ar: "تاريخ" },
  { en: "Food", ar: "طعام" },
  { en: "Architecture", ar: "عمارة" },
  { en: "Crafts", ar: "حِرف" },
  { en: "Spiritual", ar: "روحاني" },
  { en: "Nature", ar: "طبيعة" },
];

/**
 * A SEGMENT lives INSIDE a stop: something the narrator talks about once the
 * listener has already arrived. Deliberately has NO coordinates and NO walking
 * directions — those belong to the stop.
 */
type SegmentDraft = {
  title_en: string;
  title_ar: string;
  desc_en: string;
  desc_ar: string;
  audioFile: File | null;
  audioUrl: string | null;
};

const emptySegment = (): SegmentDraft => ({
  title_en: "",
  title_ar: "",
  desc_en: "",
  desc_ar: "",
  audioFile: null,
  audioUrl: null,
});

type StopDraft = {
  /** Label in the authoring language. */
  name: string;
  /**
   * Label already stored in the OTHER language. Preserved verbatim on save —
   * previously the non-authored label was written as "" which silently
   * destroyed the Arabic (or English) stop names on every edit.
   */
  nameOther: string;
  desc_en: string;
  desc_ar: string;
  /** Walking instruction from the PREVIOUS stop to this one. */
  directions_en: string;
  directions_ar: string;
  lat: string;
  lng: string;
  /** Newly picked clip, uploaded on save. */
  audioFile: File | null;
  /** Already-uploaded clip URL (edit mode). */
  audioUrl: string | null;
  /** Optional nested segments heard at this stop. */
  segments: SegmentDraft[];
};

const emptyStop = (): StopDraft => ({
  name: "",
  nameOther: "",
  desc_en: "",
  desc_ar: "",
  directions_en: "",
  directions_ar: "",
  lat: "",
  lng: "",
  audioFile: null,
  audioUrl: null,
  segments: [],
});


const NewAudioTour = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const [submitting, setSubmitting] = useState(false);
  const [uploadStage, setUploadStage] = useState<string | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // Tour-level narration (the continuous track the player maps to stop progress)
  const [tourAudioFile, setTourAudioFile] = useState<File | null>(null);
  const [existingTourAudio, setExistingTourAudio] = useState<string | null>(null);

  const [authorLang, setAuthorLang] = useState<Lang>(lang === "ar" ? "ar" : "en");
  const [meta, setMeta] = useState<TranslationMeta>({});

  const [form, setForm] = useState({
    titleEn: "",
    titleAr: "",
    descriptionEn: "",
    descriptionAr: "",
    city: "",
    region: "",
    theme: "",
    duration: "",
    price: "",
    languages: [] as string[],
  });

  const [stops, setStops] = useState<StopDraft[]>([emptyStop()]);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      const { data, error } = await supabase.from("audio_tours").select("*").eq("id", id).maybeSingle();
      if (error || !data) {
        toast.error(lang === "ar" ? "تعذر تحميل الجولة" : "Could not load tour");
        return;
      }
      setMeta(((data as any).translation_meta as TranslationMeta) || {});
      setForm({
        titleEn: data.title_en || "",
        titleAr: data.title_ar || "",
        descriptionEn: data.description_en || "",
        descriptionAr: data.description_ar || "",
        city: data.city_id || "",
        region: data.region_id || "",
        theme: data.theme || "",
        duration: data.duration_minutes != null ? String(data.duration_minutes) : "",
        price: data.price != null ? String(data.price) : "",
        languages: Array.isArray(data.languages) ? (data.languages as string[]) : [],
      });
      const dbStops = Array.isArray(data.stops) ? (data.stops as any[]) : [];
      setStops(
        dbStops.length
          ? dbStops.map((s: any) => ({
              name: (authorLang === "ar" ? s.label_ar || s.label_en : s.label_en || s.label_ar) || "",
              nameOther: (authorLang === "ar" ? s.label_en : s.label_ar) || "",
              desc_en: s.desc_en || "",
              desc_ar: s.desc_ar || "",
              directions_en: s.directions_en || "",
              directions_ar: s.directions_ar || "",

              lat: s.lat != null ? String(s.lat) : "",
              lng: s.lng != null ? String(s.lng) : "",
              audioFile: null,
              audioUrl: s.audio_url || null,
              // Segments are additive: a stop saved before this feature simply
              // has no `segments` key and prefills as an empty list.
              segments: Array.isArray(s.segments)
                ? (s.segments as StoredSegment[]).map((g) => ({
                    title_en: g.title_en || "",
                    title_ar: g.title_ar || "",
                    desc_en: g.desc_en || "",
                    desc_ar: g.desc_ar || "",
                    audioFile: null,
                    audioUrl: g.audio_url || null,
                  }))
                : [],
            }))
          : [emptyStop()]
      );
      setExistingImages(data.image ? [data.image] : []);
      setExistingTourAudio((data as any).audio_url || null);
    })();
  // authorLang intentionally excluded: toggling language must not reload and
  // discard in-progress edits.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, id, lang]);

  const set = (key: string, value: string | string[]) => setForm((p) => ({ ...p, [key]: value }));

  const toggleLang = (l: string) => {
    setForm((p) => ({
      ...p,
      languages: p.languages.includes(l) ? p.languages.filter((x) => x !== l) : [...p.languages, l],
    }));
  };

  const addStop = () => setStops((s) => [...s, emptyStop()]);
  const removeStop = (i: number) => setStops((s) => s.filter((_, idx) => idx !== i));
  const updateStop = <K extends keyof StopDraft>(i: number, key: K, v: StopDraft[K]) =>
    setStops((s) => s.map((stop, idx) => (idx === i ? { ...stop, [key]: v } : stop)));

  const mutateSegments = (stopIdx: number, fn: (segs: SegmentDraft[]) => SegmentDraft[]) =>
    setStops((s) => s.map((stop, idx) => (idx === stopIdx ? { ...stop, segments: fn(stop.segments) } : stop)));

  const addSegment = (stopIdx: number) => mutateSegments(stopIdx, (segs) => [...segs, emptySegment()]);
  const removeSegment = (stopIdx: number, segIdx: number) =>
    mutateSegments(stopIdx, (segs) => segs.filter((_, i) => i !== segIdx));
  const moveSegment = (stopIdx: number, segIdx: number, delta: -1 | 1) =>
    mutateSegments(stopIdx, (segs) => {
      const to = segIdx + delta;
      if (to < 0 || to >= segs.length) return segs;
      const next = [...segs];
      [next[segIdx], next[to]] = [next[to], next[segIdx]];
      return next;
    });
  const updateSegment = <K extends keyof SegmentDraft>(stopIdx: number, segIdx: number, key: K, v: SegmentDraft[K]) =>
    mutateSegments(stopIdx, (segs) => segs.map((g, i) => (i === segIdx ? { ...g, [key]: v } : g)));

  /**
   * Total estimated narration time: for each stop and each of its segments take
   * the longer of the English and Arabic script estimates (a narrator records
   * one language per pass).
   */
  const longer = (en: string, ar: string) => Math.max(estimateSeconds(en, "en"), estimateSeconds(ar, "ar"));
  const totalEstimateSeconds = useMemo(
    () =>
      stops.reduce(
        (sum, s) =>
          sum +
          longer(s.desc_en, s.desc_ar) +
          s.segments.reduce((sub, g) => sub + longer(g.desc_en, g.desc_ar), 0),
        0
      ),
    [stops]
  );


  /** Parse a coordinate field; returns null when blank or out of range. */
  const parseCoord = (raw: string, max: number): number | null => {
    const n = parseFloat(raw);
    if (!raw.trim() || Number.isNaN(n) || Math.abs(n) > max) return null;
    return n;
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error(lang === "ar" ? "يرجى تسجيل الدخول" : "Please sign in first");
      return;
    }
    const titleSrc = authorLang === "ar" ? form.titleAr : form.titleEn;
    if (!titleSrc.trim() || !form.city.trim() || (!isEdit && !form.theme) || stops.length === 0 || !stops[0].name.trim()) {
      toast.error(lang === "ar" ? "يرجى ملء الحقول المطلوبة وإضافة محطة واحدة على الأقل" : "Please fill required fields and add at least one stop");
      return;
    }
    setSubmitting(true);
    try {
      setUploadStage("image");
      const uploaded = await uploadImages(photos, user.id);
      const images = [...existingImages, ...uploaded];

      // Tour narration
      setUploadStage("tour-audio");
      let tourAudioUrl = existingTourAudio;
      if (tourAudioFile) tourAudioUrl = await uploadAudio(tourAudioFile, user.id);

      // Per-stop clips
      const named = stops.filter((s) => s.name.trim());
      const cleanStops: any[] = [];
      for (let i = 0; i < named.length; i++) {
        const s = named[i];
        setUploadStage(`stop-audio-${i + 1}`);
        let stopAudio = s.audioUrl;
        if (s.audioFile) stopAudio = await uploadAudio(s.audioFile, user.id);

        // Nested segments: keep only those with a title in either language, and
        // upload any newly picked clip. Both languages are written verbatim —
        // English is never mirrored into Arabic.
        const keptSegments = s.segments.filter((g) => g.title_en.trim() || g.title_ar.trim());
        const cleanSegments: any[] = [];
        for (let j = 0; j < keptSegments.length; j++) {
          const g = keptSegments[j];
          setUploadStage(`segment-audio-${i + 1}-${j + 1}`);
          let segAudio = g.audioUrl;
          if (g.audioFile) segAudio = await uploadAudio(g.audioFile, user.id);
          cleanSegments.push({
            title_en: g.title_en.trim(),
            title_ar: g.title_ar.trim(),
            desc_en: g.desc_en.trim(),
            desc_ar: g.desc_ar.trim(),
            audio_url: segAudio || null,
          });
        }

        cleanStops.push({
          label_en: authorLang === "en" ? s.name.trim() : s.nameOther.trim(),
          label_ar: authorLang === "ar" ? s.name.trim() : s.nameOther.trim(),
          desc_en: s.desc_en.trim(),
          desc_ar: s.desc_ar.trim(),
          directions_en: s.directions_en.trim(),
          directions_ar: s.directions_ar.trim(),

          lat: parseCoord(s.lat, 90),
          lng: parseCoord(s.lng, 180),
          audio_url: stopAudio || null,
          // Omit the key entirely when empty so untouched tours keep their exact
          // previous shape.
          ...(cleanSegments.length ? { segments: cleanSegments } : {}),
        });
      }
      setUploadStage(null);

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("user_id", user.id)
        .maybeSingle();

      // Credit the narrator's culture-actor profile when the creator has one;
      // otherwise leave it null and fall back to the profile display name.
      const { data: actor } = await supabase
        .from("culture_actors")
        .select("id, name_en, name_ar, image")
        .eq("user_id", user.id)
        .maybeSingle();

      const payload = {
        creator_id: user.id,
        title_en: form.titleEn.trim(),
        title_ar: form.titleAr.trim() || null,
        description_en: form.descriptionEn.trim() || null,
        description_ar: form.descriptionAr.trim() || null,
        translation_meta: meta as any,
        city_id: form.city || null,
        region_id: form.region || null,
        theme: form.theme || null,
        duration_minutes: parseInt(form.duration) || 30,
        stops_count: cleanStops.length,
        stops: cleanStops,
        price: parseInt(form.price) || 0,
        languages: form.languages.length > 0 ? form.languages : ["ar"],
        audio_url: tourAudioUrl || null,
        narrator_culture_actor_id: actor?.id ?? null,
        narrator_name_en: actor?.name_en || profile?.display_name || null,
        narrator_name_ar: actor?.name_ar || profile?.display_name || null,
        narrator_image: actor?.image || profile?.avatar_url || null,
        image: images[0] || null,
        status: "published",
      };

      if (isEdit) {
        const { error } = await supabase.from("audio_tours").update(payload).eq("id", id);
        if (error) throw error;
        toast.success(lang === "ar" ? "تم تحديث الجولة!" : "Audio tour updated!");
      } else {
        const { error } = await supabase.from("audio_tours").insert({ ...payload, slug: slugify(form.titleEn || form.titleAr, user.id.slice(0, 6)) });
        if (error) throw error;
        toast.success(lang === "ar" ? "تم نشر الجولة الصوتية بنجاح!" : "Audio tour published successfully!");
      }
      navigate("/dashboard/narrator/my-tours");
    } catch (err: any) {
      toast.error(err.message || "Failed to save audio tour");
    } finally {
      setUploadStage(null);
      setSubmitting(false);
    }
  };

  const inputClass = "w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-role-narrator/40";
  const labelClass = "text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5";

  const submitLabel = submitting
    ? uploadStage === "tour-audio" || uploadStage?.startsWith("stop-audio") || uploadStage?.startsWith("segment-audio")
      ? lang === "ar" ? "جارٍ رفع الصوت..." : "Uploading audio..."
      : lang === "ar" ? "جاري الحفظ..." : "Saving..."
    : isEdit
    ? lang === "ar" ? "حفظ التغييرات" : "Save Changes"
    : lang === "ar" ? "نشر الجولة" : "Publish Tour";

  return (
    <div className="min-h-screen bg-surface pb-10">
      <header className="bg-role-narrator text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-bold">{isEdit ? (lang === "ar" ? "تعديل الجولة" : "Edit Audio Tour") : (lang === "ar" ? "جولة صوتية جديدة" : "New Audio Tour")}</h1>
      </header>

      <div className="px-4 py-5 space-y-5">
        <AuthorLangToggle value={authorLang} onChange={setAuthorLang} />

        <BilingualField
          fieldEn="title_en" fieldAr="title_ar"
          labelEn="Tour Title" labelAr="عنوان الجولة"
          required
          icon={<FileText className="w-3.5 h-3.5 text-role-narrator" />}
          valueEn={form.titleEn} valueAr={form.titleAr}
          onChange={({ en, ar }) => setForm((p) => ({ ...p, titleEn: en, titleAr: ar }))}
          meta={meta} onMetaChange={setMeta}
          authorLang={authorLang}
          context="short title for a self-guided audio walking tour in Egypt"
          placeholderEn="e.g. Khan Alleys & Their Secrets" placeholderAr="مثال: حواري الخان وأسرارها"
          inputClass={inputClass} labelClass={labelClass}
        />

        <BilingualField
          fieldEn="description_en" fieldAr="description_ar"
          labelEn="Tour Description" labelAr="وصف الجولة"
          multiline rows={4} maxLength={1000}
          icon={<FileText className="w-3.5 h-3.5 text-role-narrator" />}
          valueEn={form.descriptionEn} valueAr={form.descriptionAr}
          onChange={({ en, ar }) => setForm((p) => ({ ...p, descriptionEn: en, descriptionAr: ar }))}
          meta={meta} onMetaChange={setMeta}
          authorLang={authorLang}
          context="description of a self-guided audio walking tour in Egypt"
          placeholderEn="Describe what the listener will hear..." placeholderAr="صف ما سيسمعه المستمع..."
          inputClass={inputClass} labelClass={labelClass}
        />

        <CityPicker
          cityId={form.city}
          onChange={(cityId, regionId) => setForm((p) => ({ ...p, city: cityId, region: regionId }))}
          required
          iconClass="w-3.5 h-3.5 text-role-narrator"
          inputClass={inputClass}
          labelClass={labelClass}
        />

        <div>
          <label className={labelClass}><Clock className="w-3.5 h-3.5 text-role-narrator" />{lang === "ar" ? "المدة (د)" : "Duration (min)"}</label>
          <input type="number" className={inputClass} placeholder="45" value={form.duration} onChange={(e) => set("duration", e.target.value)} min="5" max="240" />
        </div>

        {/* Tour narration file */}
        <div>
          <AudioPicker
            label={lang === "ar" ? "التسجيل الكامل للجولة" : "Full Tour Narration"}
            file={tourAudioFile}
            onChange={setTourAudioFile}
            existingUrl={existingTourAudio}
            onRemoveExisting={() => setExistingTourAudio(null)}
            uploading={submitting && uploadStage === "tour-audio"}
          />
          <p className="text-[10px] text-muted-foreground mt-1">
            {lang === "ar"
              ? "هذا هو التسجيل الرئيسي. بدونه ستظهر الجولة كـ«الصوت قادم قريباً»."
              : "This is the main recording. Without it the tour shows as “Audio coming soon”."}
          </p>
        </div>

        <div>
          <label className={labelClass}><Tag className="w-3.5 h-3.5 text-role-narrator" />{lang === "ar" ? "الموضوع *" : "Theme *"}</label>
          <div className="flex flex-wrap gap-2">
            {themes.map((t, i) => (
              <button key={i} onClick={() => set("theme", t.en)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${form.theme === t.en ? "bg-role-narrator text-white border-role-narrator" : "bg-card text-foreground border-border"}`}>
                {lang === "ar" ? t.ar : t.en}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}><Languages className="w-3.5 h-3.5 text-role-narrator" />{lang === "ar" ? "لغات السرد" : "Narration Languages"}</label>
          <div className="flex flex-wrap gap-2">
            {[{ k: "ar", l: lang === "ar" ? "العربية" : "Arabic" }, { k: "en", l: lang === "ar" ? "الإنجليزية" : "English" }, { k: "fr", l: lang === "ar" ? "الفرنسية" : "French" }].map((o) => (
              <button key={o.k} onClick={() => toggleLang(o.k)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${form.languages.includes(o.k) ? "bg-role-narrator text-white border-role-narrator" : "bg-card text-foreground border-border"}`}>
                {o.l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}><DollarSign className="w-3.5 h-3.5 text-role-narrator" />{lang === "ar" ? "السعر الإرشادي (ج.م)" : "Indicative Price (EGP)"}</label>
          <input type="number" className={inputClass} placeholder="0" value={form.price} onChange={(e) => set("price", e.target.value)} min="0" />
          <p className="text-[10px] text-muted-foreground mt-1">
            {lang === "ar"
              ? "الدفع غير مُفعّل بعد — كل الجولات مجانية للاستماع حالياً، وهذا السعر إرشادي فقط."
              : "Payments aren't live yet — all tours are free to listen to for now, so this is indicative only."}
          </p>
        </div>

        <div>
          <label className={labelClass}><ImageIcon className="w-3.5 h-3.5 text-role-narrator" />{lang === "ar" ? "صورة الغلاف" : "Cover Image"}</label>
          <PhotoPicker files={photos} onChange={setPhotos} max={1} hint={lang === "ar" ? "اضغط لرفع صورة" : "Tap to upload image"} existing={existingImages} onRemoveExisting={(url) => setExistingImages((p) => p.filter((u) => u !== url))} />
        </div>

        {/* Stops */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={labelClass}><MapPin className="w-3.5 h-3.5 text-role-narrator" />{lang === "ar" ? "محطات الجولة *" : "Tour Stops *"}</label>
            <button onClick={addStop} className="text-[10px] font-semibold text-role-narrator flex items-center gap-1">
              <Plus className="w-3 h-3" /> {lang === "ar" ? "إضافة محطة" : "Add stop"}
            </button>
          </div>

          {/* Total spoken-time estimate across all stops (informational) */}
          <div className="mb-3 rounded-xl bg-role-narrator/10 border border-role-narrator/25 px-3 py-2">
            <p className="text-[11px] font-semibold text-role-narrator flex items-center gap-1.5">
              <Timer className="w-3 h-3" />
              {lang === "ar"
                ? `إجمالي وقت السرد التقديري: ${formatDurationShort(totalEstimateSeconds, lang)}`
                : `Estimated total narration: ${formatDurationShort(totalEstimateSeconds, lang)}`}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {lang === "ar"
                ? "تقدير إرشادي فقط (١٣٠ كلمة/دقيقة للإنجليزية، ١١٠ للعربية) — لا يمنع النشر."
                : "Guidance only (130 wpm English, 110 wpm Arabic) — never blocks publishing."}
            </p>
          </div>

          <div className="space-y-3">
            {stops.map((s, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-role-narrator">{lang === "ar" ? `المحطة ${i + 1}` : `Stop ${i + 1}`}</span>
                  {stops.length > 1 && (
                    <button onClick={() => removeStop(i)} className="text-destructive p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <input className={inputClass} placeholder={lang === "ar" ? "اسم المكان" : "Place name"} value={s.name} onChange={(e) => updateStop(i, "name", e.target.value)} />
                <textarea dir="ltr" className={`${inputClass} min-h-[56px] resize-none`} placeholder="Short description (English) — what the visitor sees/hears here" value={s.desc_en} onChange={(e) => updateStop(i, "desc_en", e.target.value)} maxLength={200} />
                <ScriptMeter text={s.desc_en} scriptLang="en" audioFile={s.audioFile} audioUrl={s.audioUrl} />
                <textarea dir="rtl" className={`${inputClass} min-h-[56px] resize-none text-right`} placeholder="وصف مختصر (عربي) — ما يراه الزائر ويسمعه هنا" value={s.desc_ar} onChange={(e) => updateStop(i, "desc_ar", e.target.value)} maxLength={200} />
                <ScriptMeter text={s.desc_ar} scriptLang="ar" audioFile={s.audioFile} audioUrl={s.audioUrl} />

                {/* Walking directions from the previous stop to this one */}
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                    <Footprints className="w-2.5 h-2.5" />
                    {lang === "ar" ? "تعليمات المشي إلى هذه المحطة" : "Walking directions to this stop"}
                  </label>
                  <textarea dir="ltr" className={`${inputClass} min-h-[48px] resize-none`} placeholder="Directions (English) — e.g. Walk south along Mohamed Ali St; the mosque is on your right" value={s.directions_en} onChange={(e) => updateStop(i, "directions_en", e.target.value)} maxLength={300} />
                  <textarea dir="rtl" className={`${inputClass} min-h-[48px] resize-none text-right mt-2`} placeholder="التعليمات (عربي) — مثال: امشِ جنوباً في شارع محمد علي، والمسجد على يمينك" value={s.directions_ar} onChange={(e) => updateStop(i, "directions_ar", e.target.value)} maxLength={300} />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {lang === "ar"
                      ? `${i === 0 ? "كيف يصل المستمع إلى نقطة البداية" : "كيف ينتقل المستمع من المحطة السابقة إلى هنا"} — وليس محتوى المحطة نفسها.`
                      : `${i === 0 ? "How the listener reaches the starting point" : "How the listener walks from the previous stop to here"} — not the stop's content.`}
                  </p>
                </div>


                {/* Location — used by the player's GPS proximity + route map */}
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                    <Navigation className="w-2.5 h-2.5" />
                    {lang === "ar" ? "موقع المحطة على الخريطة" : "Stop location on the map"}
                  </label>
                  <LocationPicker
                    lat={s.lat}
                    lng={s.lng}
                    onChange={(la, lo) =>
                      setStops((prev) =>
                        prev.map((stop, idx) => (idx === i ? { ...stop, lat: String(la), lng: String(lo) } : stop))
                      )
                    }
                  />
                </div>

                {/* Optional per-stop clip */}
                <AudioPicker
                  compact
                  label={lang === "ar" ? "مقطع صوتي للمحطة (اختياري)" : "Stop audio clip (optional)"}
                  file={s.audioFile}
                  onChange={(f) => updateStop(i, "audioFile", f)}
                  existingUrl={s.audioUrl}
                  onRemoveExisting={() => updateStop(i, "audioUrl", null)}
                  uploading={submitting && uploadStage === `stop-audio-${i + 1}`}
                />

                {/* Segments — what the listener hears once they ARRIVE here.
                    No coordinates and no directions: they're already standing here. */}
                <div className="rounded-xl border border-dashed border-role-narrator/40 bg-role-narrator/5 p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-role-narrator flex items-center gap-1.5">
                        <Layers className="w-3 h-3" />
                        {lang === "ar" ? "مقاطع داخل المحطة" : "Segments within this stop"}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                        {lang === "ar"
                          ? "التعليمات أعلاه توضّح كيف يصل المستمع إلى هنا. المقاطع هي ما يسمعه بعد الوصول — بلا موقع أو اتجاهات."
                          : "The directions above are how the listener GETS here. Segments are what they hear once they ARRIVE — no location, no directions."}
                      </p>
                    </div>
                    <button
                      onClick={() => addSegment(i)}
                      className="text-[10px] font-semibold text-role-narrator flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3 h-3" /> {lang === "ar" ? "إضافة مقطع" : "Add segment"}
                    </button>
                  </div>

                  {s.segments.map((g, j) => (
                    <div key={j} className="bg-card border border-border rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-role-narrator">
                          {lang === "ar" ? `المقطع ${j + 1}` : `Segment ${j + 1}`}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveSegment(i, j, -1)}
                            disabled={j === 0}
                            aria-label={lang === "ar" ? "لأعلى" : "Move up"}
                            className="p-1 text-muted-foreground disabled:opacity-30"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => moveSegment(i, j, 1)}
                            disabled={j === s.segments.length - 1}
                            aria-label={lang === "ar" ? "لأسفل" : "Move down"}
                            className="p-1 text-muted-foreground disabled:opacity-30"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => removeSegment(i, j)} className="text-destructive p-1">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <input
                        dir="ltr"
                        className={inputClass}
                        placeholder="Segment title (English)"
                        value={g.title_en}
                        onChange={(e) => updateSegment(i, j, "title_en", e.target.value)}
                        maxLength={120}
                      />
                      <input
                        dir="rtl"
                        className={`${inputClass} text-right`}
                        placeholder="عنوان المقطع (عربي)"
                        value={g.title_ar}
                        onChange={(e) => updateSegment(i, j, "title_ar", e.target.value)}
                        maxLength={120}
                      />
                      <textarea
                        dir="ltr"
                        className={`${inputClass} min-h-[56px] resize-none`}
                        placeholder="Script (English) — what the narrator says about this detail"
                        value={g.desc_en}
                        onChange={(e) => updateSegment(i, j, "desc_en", e.target.value)}
                        maxLength={1200}
                      />
                      <ScriptMeter text={g.desc_en} scriptLang="en" audioFile={g.audioFile} audioUrl={g.audioUrl} />
                      <textarea
                        dir="rtl"
                        className={`${inputClass} min-h-[56px] resize-none text-right`}
                        placeholder="النص (عربي) — ما يقوله الراوي عن هذا التفصيل"
                        value={g.desc_ar}
                        onChange={(e) => updateSegment(i, j, "desc_ar", e.target.value)}
                        maxLength={1200}
                      />
                      <ScriptMeter text={g.desc_ar} scriptLang="ar" audioFile={g.audioFile} audioUrl={g.audioUrl} />
                      <AudioPicker
                        compact
                        label={lang === "ar" ? "مقطع صوتي للمقطع (اختياري)" : "Segment audio clip (optional)"}
                        file={g.audioFile}
                        onChange={(f) => updateSegment(i, j, "audioFile", f)}
                        existingUrl={g.audioUrl}
                        onRemoveExisting={() => updateSegment(i, j, "audioUrl", null)}
                        uploading={submitting && uploadStage === `segment-audio-${i + 1}-${j + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleSubmit} disabled={submitting} className="w-full bg-role-narrator text-white rounded-xl py-4 font-bold text-sm mt-4 disabled:opacity-60 flex items-center justify-center gap-2">
          {submitting && <Mic className="w-4 h-4 animate-pulse" />}
          {submitLabel}
        </button>
      </div>
    </div>
  );
};

export default NewAudioTour;
