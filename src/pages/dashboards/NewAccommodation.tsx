import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { supabase } from "@/integrations/supabase/client";
import { slugify, uploadImages } from "@/lib/dashboardForms";
import { fetchMyProviderId } from "@/lib/providerRecord";
import { str, strArray } from "@/lib/rowValues";
import PhotoPicker from "@/components/dashboard/PhotoPicker";
import CityPicker from "@/components/dashboard/CityPicker";
import LocationPicker from "@/components/dashboard/LocationPicker";
import BilingualField from "@/components/dashboard/BilingualField";
import AuthorLangToggle from "@/components/dashboard/AuthorLangToggle";
import { ACCOMMODATION_TYPES, readableDbError } from "@/lib/listingTaxonomy";
import { cityCoords } from "@/lib/cityCoords";
import { markMachine, translateText, type Lang, type TranslationMeta } from "@/lib/translation";
import type { Json } from "@/integrations/supabase/types";
import {
  ArrowLeft, Image, FileText, Home, Users, BedDouble, Bath, Clock,
  DollarSign, Check, Plus, Trash2, ScrollText, MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { useFormDraft } from "@/hooks/useFormDraft";
import DraftResumePrompt from "@/components/dashboard/DraftResumePrompt";

/**
 * Create / edit a stay. Ownership convention: accommodations.host_id holds
 * providers.id (see src/lib/providerRecord.ts).
 *
 * EDIT MODE contract: every column this form writes is also read back in the
 * prefill below — no field may be silently dropped on save. Prose fields keep
 * BOTH languages in state so saving after editing one language never blanks
 * the other.
 */
const AMENITY_PRESETS: { en: string; ar: string }[] = [
  { en: "Wi-Fi", ar: "واي فاي" },
  { en: "Air conditioning", ar: "تكييف" },
  { en: "Breakfast included", ar: "إفطار مشمول" },
  { en: "Private bathroom", ar: "حمام خاص" },
  { en: "Hot water", ar: "مياه ساخنة" },
  { en: "Kitchen access", ar: "استخدام المطبخ" },
  { en: "Rooftop / terrace", ar: "سطح أو تراس" },
  { en: "Family friendly", ar: "مناسب للعائلات" },
  { en: "Parking", ar: "موقف سيارات" },
];

/**
 * `editorial` mode is the admin's own reference entry: no owner, no request or
 * message actions on the public page. Regular use creates a HOSTED listing
 * owned by the signed-in provider record.
 */
const NewAccommodation = ({ editorial = false }: { editorial?: boolean }) => {
  const { lang } = useI18n();
  const ar = lang === "ar";
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [submitting, setSubmitting] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [authorLang, setAuthorLang] = useState<Lang>(lang === "ar" ? "ar" : "en");
  const [meta, setMeta] = useState<TranslationMeta>({});
  // Amenities are stored as two parallel arrays (amenities_en / amenities_ar).
  // In the form they are kept as pairs so both languages stay aligned.
  const [amenities, setAmenities] = useState<{ en: string; ar: string }[]>([]);
  const [amenityDraft, setAmenityDraft] = useState("");
  const [amenityBusy, setAmenityBusy] = useState(false);
  const [listingKind, setListingKind] = useState<string>(editorial ? "editorial" : "hosted");
  const [kindMismatch, setKindMismatch] = useState(false);

  const [form, setForm] = useState({
    nameEn: "",
    nameAr: "",
    descriptionEn: "",
    descriptionAr: "",
    unitTypeEn: "",
    unitTypeAr: "",
    houseRulesEn: "",
    houseRulesAr: "",
    cancellationEn: "",
    cancellationAr: "",
    accommodationType: "",
    cityId: "",
    regionId: "",
    pricePerNight: "",
    currency: "EGP",
    sleeps: "",
    bedrooms: "",
    bathrooms: "",
    minNights: "",
    checkIn: "",
    checkOut: "",
    lat: "",
    lng: "",
    status: "published",
  });

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      const { data, error } = await supabase.from("accommodations").select("*").eq("id", id).maybeSingle();
      if (error || !data) {
        toast.error(ar ? "تعذر تحميل مكان الإقامة" : "Could not load this stay");
        return;
      }
      const row = data as Record<string, unknown>;
      setForm({
        nameEn: str(row.name_en) || "",
        nameAr: str(row.name_ar) || "",
        descriptionEn: str(row.description_en) || "",
        descriptionAr: str(row.description_ar) || "",
        unitTypeEn: str(row.unit_type_en) || "",
        unitTypeAr: str(row.unit_type_ar) || "",
        houseRulesEn: str(row.house_rules_en) || "",
        houseRulesAr: str(row.house_rules_ar) || "",
        cancellationEn: str(row.cancellation_en) || "",
        cancellationAr: str(row.cancellation_ar) || "",
        accommodationType: str(row.accommodation_type) || "",
        cityId: str(row.city_id) || "",
        regionId: str(row.region_id) || "",
        pricePerNight: row.price_per_night != null ? String(row.price_per_night) : "",
        currency: str(row.currency) || "EGP",
        sleeps: row.sleeps != null ? String(row.sleeps) : "",
        bedrooms: row.bedrooms != null ? String(row.bedrooms) : "",
        bathrooms: row.bathrooms != null ? String(row.bathrooms) : "",
        minNights: row.min_nights != null ? String(row.min_nights) : "",
        checkIn: str(row.check_in_time) || "",
        checkOut: str(row.check_out_time) || "",
        lat: row.latitude != null ? String(row.latitude) : "",
        lng: row.longitude != null ? String(row.longitude) : "",
        status: str(row.status) || "published",
      });
      // listing_kind belongs to the ROW, never to the route that opened the form.
      const rowKind = str(row.listing_kind) || "editorial";
      setListingKind(rowKind);
      setKindMismatch(rowKind !== (editorial ? "editorial" : "hosted"));
      const en = strArray(row.amenities_en);
      const arr = strArray(row.amenities_ar);
      const legacy = strArray(row.amenities);
      const enList = en.length ? en : legacy;
      const len = Math.max(enList.length, arr.length);
      setAmenities(
        Array.from({ length: len }, (_, i) => ({ en: enList[i] || "", ar: arr[i] || "" }))
      );
      setMeta((row.translation_meta as TranslationMeta) || {});
      setExistingImages(
        strArray(row.images).length > 0
          ? strArray(row.images)
          : str(row.image)
            ? [str(row.image)]
            : []
      );
    })();
  }, [isEdit, id, ar, editorial]);

  const set = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const togglePreset = (preset: { en: string; ar: string }) =>
    setAmenities((p) =>
      p.some((a) => a.en === preset.en || a.ar === preset.ar)
        ? p.filter((a) => a.en !== preset.en && a.ar !== preset.ar)
        : [...p, { ...preset }]
    );
  const removeAmenity = (idx: number) => setAmenities((p) => p.filter((_, i) => i !== idx));
  const setAmenitySide = (idx: number, side: Lang, value: string) =>
    setAmenities((p) => p.map((a, i) => (i === idx ? { ...a, [side]: value } : a)));

  /** Adds the typed amenity in the author's language and machine-fills the other side. */
  const addAmenity = async () => {
    const v = amenityDraft.trim();
    if (!v) return;
    const pair = authorLang === "ar" ? { en: "", ar: v } : { en: v, ar: "" };
    setAmenities((p) => [...p, pair]);
    setAmenityDraft("");
    const idx = amenities.length;
    setAmenityBusy(true);
    const res = await translateText({
      text: v,
      from: authorLang,
      to: authorLang === "ar" ? "en" : "ar",
      context: "a single amenity offered by an Egyptian guesthouse (short label)",
    });
    setAmenityBusy(false);
    if (res.ok) {
      setAmenities((p) =>
        p.map((a, i) => (i === idx ? (authorLang === "ar" ? { ...a, en: res.translation } : { ...a, ar: res.translation }) : a))
      );
      setMeta((m) => markMachine(m, authorLang === "ar" ? "amenities_en" : "amenities_ar", authorLang));
    }
  };

  const cityCenter = form.cityId ? cityCoords[form.cityId] : undefined;

  /**
   * Resumable draft. Text fields are auto-saved per user so an interruption
   * (call, reload, lost connection) no longer empties the form. Photos still
   * upload at save time here, so newly picked files are not part of the draft.
   */
  const [pristineForm] = useState(() => JSON.stringify(form));
  const draftDirty = JSON.stringify(form) !== pristineForm;
  const { pendingDraft, resume, startOver, flush, clear: clearDraft } = useFormDraft<typeof form>({
    formKey: "new-accommodation",
    userId: user?.id ?? null,
    data: form,
    enabled: !(isEdit),
    isDirty: draftDirty,
  });
  const handleResumeDraft = () => {
    const restored = resume();
    if (restored) setForm((p) => ({ ...p, ...restored.data }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error(ar ? "يرجى تسجيل الدخول" : "Please sign in first");
      return;
    }
    const nameSrc = authorLang === "ar" ? form.nameAr : form.nameEn;
    const descSrc = authorLang === "ar" ? form.descriptionAr : form.descriptionEn;
    if (!nameSrc.trim() || !descSrc.trim() || !form.accommodationType || !form.cityId || !form.pricePerNight.trim()) {
      toast.error(ar ? "يرجى ملء الحقول المطلوبة" : "Please fill in the required fields");
      return;
    }
    setSubmitting(true);
    try {
      let providerId: string | null = null;
      if (!editorial) {
        providerId = await fetchMyProviderId(user.id);
        if (!providerId) {
          toast.error(ar ? "أكمل ملف المزود أولاً" : "Complete your provider profile first");
          setSubmitting(false);
          return;
        }
      }
      const uploaded = await uploadImages(photos, user.id);
      const images = [...existingImages, ...uploaded];

      const payload = {
        host_id: providerId,
        // CREATE derives the kind from the surface; EDIT preserves the row's own kind.
        listing_kind: isEdit ? listingKind : editorial ? "editorial" : "hosted",
        name_en: form.nameEn.trim() || null,
        name_ar: form.nameAr.trim() || null,
        description_en: form.descriptionEn.trim() || null,
        description_ar: form.descriptionAr.trim() || null,
        unit_type_en: form.unitTypeEn.trim() || null,
        unit_type_ar: form.unitTypeAr.trim() || null,
        house_rules_en: form.houseRulesEn.trim() || null,
        house_rules_ar: form.houseRulesAr.trim() || null,
        cancellation_en: form.cancellationEn.trim() || null,
        cancellation_ar: form.cancellationAr.trim() || null,
        accommodation_type: form.accommodationType,
        city_id: form.cityId || null,
        region_id: form.regionId || null,
        price_per_night: parseInt(form.pricePerNight) || 0,
        currency: form.currency.trim() || "EGP",
        sleeps: form.sleeps.trim() ? parseInt(form.sleeps) : null,
        bedrooms: form.bedrooms.trim() ? parseInt(form.bedrooms) : null,
        bathrooms: form.bathrooms.trim() ? parseInt(form.bathrooms) : null,
        min_nights: form.minNights.trim() ? parseInt(form.minNights) : null,
        check_in_time: form.checkIn.trim() || null,
        check_out_time: form.checkOut.trim() || null,
        latitude: form.lat.trim() ? Number(form.lat) : null,
        longitude: form.lng.trim() ? Number(form.lng) : null,
        amenities_en: amenities.map((a) => a.en.trim()).filter(Boolean),
        amenities_ar: amenities.map((a) => a.ar.trim()).filter(Boolean),
        image: images[0] || null,
        images,
        status: form.status,
        translation_meta: meta as unknown as Json,
      };

      if (isEdit) {
        const { error } = await supabase.from("accommodations").update(payload as never).eq("id", id);
        if (error) throw error;
        toast.success(ar ? "تم تحديث مكان الإقامة" : "Stay updated");
      } else {
        const { error } = await supabase
          .from("accommodations")
          .insert({ ...payload, slug: slugify(form.nameEn || form.nameAr, user.id.slice(0, 6)) } as never);
        if (error) throw error;
        toast.success(ar ? "تم نشر مكان الإقامة" : "Stay published");
      }
      navigate(editorial ? "/admin" : "/dashboard/service-provider/my-stays");
    } catch (err) {
      toast.error(readableDbError(err instanceof Error ? err.message : "Failed to save", ar));
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-role-service-provider/40";
  const labelClass = "text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5";
  const iconCls = "w-3.5 h-3.5 text-role-service-provider";

  if (isEdit && kindMismatch) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-6 text-center">
        <p className="text-sm text-muted-foreground">
          {ar
            ? "لا يمكن تعديل هذا السجل من هنا: نوع الإدراج لا يطابق هذه الشاشة."
            : "This record can't be edited here — its listing kind doesn't match this screen."}
        </p>
      </div>
    );
  }

  if (editorial && !adminLoading && !isAdmin) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-6 text-center">
        <p className="text-sm text-muted-foreground">
          {ar ? "هذه الصفحة مخصّصة للمشرفين فقط." : "This page is only available to administrators."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-10">
      <header className="bg-role-service-provider text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-bold">
          {isEdit ? (ar ? "تعديل مكان الإقامة" : "Edit Stay") : (ar ? "إضافة مكان إقامة" : "Add a Stay")}
        </h1>
      </header>

      {pendingDraft && (
        <DraftResumePrompt onResume={handleResumeDraft} onStartOver={startOver} accentClass="bg-role-service-provider" />
      )}

      <div className="px-4 py-5 space-y-5">
        <AuthorLangToggle value={authorLang} onChange={setAuthorLang} />

        <div>
          <label className={labelClass}><Image className={iconCls} />{ar ? "صور المكان" : "Photos"}</label>
          <PhotoPicker
            files={photos}
            onChange={setPhotos}
            max={6}
            hint={ar ? "حتى ٦ صور" : "Up to 6 photos"}
            existing={existingImages}
            onRemoveExisting={(url) => setExistingImages((p) => p.filter((u) => u !== url))}
          />
        </div>

        <BilingualField
          fieldEn="name_en" fieldAr="name_ar"
          labelEn="Name of the stay" labelAr="اسم مكان الإقامة"
          required
          icon={<FileText className={iconCls} />}
          valueEn={form.nameEn} valueAr={form.nameAr}
          onChange={({ en, ar: a }) => setForm((p) => ({ ...p, nameEn: en, nameAr: a }))}
          meta={meta} onMetaChange={setMeta}
          authorLang={authorLang}
          context="short name of an Egyptian guesthouse, homestay or eco-lodge"
          placeholderEn="e.g. Nubian House by the Nile" placeholderAr="مثال: بيت نوبي على النيل"
          inputClass={inputClass} labelClass={labelClass}
        />

        <BilingualField
          fieldEn="description_en" fieldAr="description_ar"
          labelEn="About this place" labelAr="عن المكان"
          required multiline rows={4}
          icon={<FileText className={iconCls} />}
          valueEn={form.descriptionEn} valueAr={form.descriptionAr}
          onChange={({ en, ar: a }) => setForm((p) => ({ ...p, descriptionEn: en, descriptionAr: a }))}
          meta={meta} onMetaChange={setMeta}
          authorLang={authorLang}
          context="description of an Egyptian guesthouse or homestay for travellers"
          placeholderEn="Describe the place, the neighbourhood and what a night here feels like..."
          placeholderAr="اوصف المكان والحي وكيف تكون ليلة هنا..."
          inputClass={inputClass} labelClass={labelClass}
        />

        <div>
          <label className={labelClass}><Home className={iconCls} />{ar ? "نوع الإقامة *" : "Type of stay *"}</label>
          <div className="flex flex-wrap gap-2">
            {ACCOMMODATION_TYPES.map((t) => (
              <button
                key={t.key}
                onClick={() => set("accommodationType", t.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  form.accommodationType === t.key
                    ? "bg-role-service-provider text-white border-role-service-provider"
                    : "bg-card text-foreground border-border"
                }`}
              >
                {t.emoji} {t.label[lang]}
              </button>
            ))}
          </div>
        </div>

        <BilingualField
          fieldEn="unit_type_en" fieldAr="unit_type_ar"
          labelEn="Room / unit offered" labelAr="الغرفة أو الوحدة المعروضة"
          icon={<BedDouble className={iconCls} />}
          valueEn={form.unitTypeEn} valueAr={form.unitTypeAr}
          onChange={({ en, ar: a }) => setForm((p) => ({ ...p, unitTypeEn: en, unitTypeAr: a }))}
          meta={meta} onMetaChange={setMeta}
          authorLang={authorLang}
          context="the specific room or unit a guest books in an Egyptian guesthouse"
          placeholderEn="e.g. Private room with Nile view" placeholderAr="مثال: غرفة خاصة بإطلالة على النيل"
          inputClass={inputClass} labelClass={labelClass}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}><DollarSign className={iconCls} />{ar ? "السعر لليلة *" : "Price per night *"}</label>
            <input type="number" min="0" className={inputClass} placeholder="450" value={form.pricePerNight} onChange={(e) => set("pricePerNight", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>{ar ? "العملة" : "Currency"}</label>
            <input className={inputClass} maxLength={8} value={form.currency} onChange={(e) => set("currency", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}><Users className={iconCls} />{ar ? "يتسع لعدد" : "Sleeps"}</label>
            <input type="number" min="1" className={inputClass} placeholder="2" value={form.sleeps} onChange={(e) => set("sleeps", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}><Clock className={iconCls} />{ar ? "أقل عدد ليالٍ" : "Minimum nights"}</label>
            <input type="number" min="1" className={inputClass} placeholder="1" value={form.minNights} onChange={(e) => set("minNights", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}><BedDouble className={iconCls} />{ar ? "غرف النوم" : "Bedrooms"}</label>
            <input type="number" min="0" className={inputClass} placeholder="1" value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}><Bath className={iconCls} />{ar ? "الحمامات" : "Bathrooms"}</label>
            <input type="number" min="0" className={inputClass} placeholder="1" value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>{ar ? "موعد الوصول" : "Check-in"}</label>
            <input className={inputClass} maxLength={40} placeholder={ar ? "من ٢ ظهراً" : "From 2 PM"} value={form.checkIn} onChange={(e) => set("checkIn", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>{ar ? "موعد المغادرة" : "Check-out"}</label>
            <input className={inputClass} maxLength={40} placeholder={ar ? "حتى ١١ صباحاً" : "By 11 AM"} value={form.checkOut} onChange={(e) => set("checkOut", e.target.value)} />
          </div>
        </div>

        <CityPicker
          cityId={form.cityId}
          onChange={(cityId, regionId) => setForm((p) => ({ ...p, cityId, regionId }))}
          required
          labelEn="Main city (listed under)"
          labelAr="المدينة الرئيسية (يُدرج تحتها)"
          iconClass={iconCls}
          inputClass={inputClass}
          labelClass={labelClass}
        />

        <div>
          <label className={labelClass}><MapPin className={iconCls} />{ar ? "الموقع على الخريطة" : "Pin on the map"}</label>
          <LocationPicker
            lat={form.lat}
            lng={form.lng}
            fallbackCenter={cityCenter ?? null}
            onChange={(la, ln) => setForm((p) => ({ ...p, lat: String(la), lng: String(ln) }))}
          />
        </div>

        <div>
          <label className={labelClass}><Check className={iconCls} />{ar ? "المرافق والخدمات" : "What's included"}</label>
          <div className="flex flex-wrap gap-2">
            {AMENITY_PRESETS.map((preset) => {
              const active = amenities.some((a) => a.en === preset.en || a.ar === preset.ar);
              return (
                <button
                  key={preset.en}
                  onClick={() => togglePreset(preset)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    active ? "bg-role-service-provider text-white border-role-service-provider" : "bg-card text-foreground border-border"
                  }`}
                >
                  {preset[lang]}
                </button>
              );
            })}
          </div>

          {amenities.length > 0 && (
            <div className="space-y-2 mt-3">
              {amenities.map((a, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    className={inputClass}
                    dir="ltr"
                    placeholder="English"
                    value={a.en}
                    maxLength={40}
                    onChange={(e) => setAmenitySide(i, "en", e.target.value)}
                  />
                  <input
                    className={inputClass}
                    dir="rtl"
                    placeholder="العربية"
                    value={a.ar}
                    maxLength={40}
                    onChange={(e) => setAmenitySide(i, "ar", e.target.value)}
                  />
                  <button onClick={() => removeAmenity(i)} aria-label="remove" className="p-2">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 mt-2">
            <input
              className={inputClass}
              dir={authorLang === "ar" ? "rtl" : "ltr"}
              placeholder={ar ? "أضف مرفقاً آخر" : "Add another amenity"}
              value={amenityDraft}
              maxLength={40}
              onChange={(e) => setAmenityDraft(e.target.value)}
            />
            <button
              onClick={addAmenity}
              disabled={amenityBusy}
              className="px-3 rounded-xl bg-role-service-provider text-white disabled:opacity-60"
              aria-label={ar ? "إضافة" : "Add"}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {ar
              ? "اكتب المرفق بلغتك وستُترجم اللغة الأخرى آليًا — يمكنك تعديلها."
              : "Type an amenity in your language; the other side is machine-filled and editable."}
          </p>
        </div>

        {/* Editorial reference entries have no host, so no house rules and no
            cancellation terms — nobody is party to them. */}
        {!editorial && (
          <>
            <BilingualField
              fieldEn="house_rules_en" fieldAr="house_rules_ar"
              labelEn="House rules" labelAr="قواعد المنزل"
              multiline rows={3} manualOnly
              icon={<ScrollText className={iconCls} />}
              valueEn={form.houseRulesEn} valueAr={form.houseRulesAr}
              onChange={({ en, ar: a }) => setForm((p) => ({ ...p, houseRulesEn: en, houseRulesAr: a }))}
              meta={meta} onMetaChange={setMeta}
              authorLang={authorLang}
              context="house rules for guests staying in an Egyptian family guesthouse"
              placeholderEn="e.g. No smoking indoors, quiet after 11 PM"
              placeholderAr="مثال: ممنوع التدخين بالداخل، الهدوء بعد ١١ مساءً"
              inputClass={inputClass} labelClass={labelClass}
            />

            <BilingualField
              fieldEn="cancellation_en" fieldAr="cancellation_ar"
              labelEn="Cancellation terms" labelAr="شروط الإلغاء"
              multiline rows={3} manualOnly
              icon={<ScrollText className={iconCls} />}
              valueEn={form.cancellationEn} valueAr={form.cancellationAr}
              onChange={({ en, ar: a }) => setForm((p) => ({ ...p, cancellationEn: en, cancellationAr: a }))}
              meta={meta} onMetaChange={setMeta}
              authorLang={authorLang}
              context="cancellation terms a small Egyptian guesthouse sets for its guests"
              placeholderEn="Write the terms you actually apply — guests see this as yours."
              placeholderAr="اكتب الشروط التي تطبّقها فعلاً — الضيوف يرونها باسمك."
              inputClass={inputClass} labelClass={labelClass}
            />
          </>
        )}


        <div>
          <label className={labelClass}>{ar ? "حالة النشر" : "Publishing"}</label>
          <div className="flex gap-2">
            {[
              { key: "published", en: "Published", arLabel: "منشور" },
              { key: "draft", en: "Draft", arLabel: "مسودة" },
            ].map((s) => (
              <button
                key={s.key}
                onClick={() => set("status", s.key)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border ${
                  form.status === s.key
                    ? "bg-role-service-provider text-white border-role-service-provider"
                    : "bg-card text-foreground border-border"
                }`}
              >
                {ar ? s.arLabel : s.en}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleSubmit} disabled={submitting} className="w-full bg-role-service-provider text-white rounded-xl py-4 font-bold text-sm mt-4 disabled:opacity-60">
          {submitting
            ? ar ? "جاري الحفظ..." : "Saving..."
            : isEdit ? (ar ? "حفظ التغييرات" : "Save Changes") : (ar ? "نشر مكان الإقامة" : "Publish Stay")}
        </button>
      </div>
    </div>
  );
};

export default NewAccommodation;
