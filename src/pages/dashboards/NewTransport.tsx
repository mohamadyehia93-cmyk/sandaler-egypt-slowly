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
import { TRANSPORT_TYPES, HIRE_TYPES, PRICE_BASES, readableDbError } from "@/lib/listingTaxonomy";
import { cityCoords } from "@/lib/cityCoords";
import type { Lang, TranslationMeta } from "@/lib/translation";
import type { Json } from "@/integrations/supabase/types";
import {
  ArrowLeft, Image, FileText, Route, Navigation, Users, Clock,
  DollarSign, MapPin, ScrollText, CalendarClock,
} from "lucide-react";
import { toast } from "sonner";

/**
 * Create / edit a transport listing. Ownership convention:
 * transport.provider_id holds providers.id (see src/lib/providerRecord.ts).
 *
 * EDIT MODE contract: every column written below is read back in the prefill —
 * nothing is dropped on save, and prose keeps both languages in state so
 * editing one language never blanks the other.
 */
/**
 * `editorial` mode is the admin's own reference entry (e.g. a public ferry):
 * no owner, no request or message actions on the public page.
 */
const NewTransport = ({ editorial = false }: { editorial?: boolean }) => {
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

  const [form, setForm] = useState({
    nameEn: "",
    nameAr: "",
    descriptionEn: "",
    descriptionAr: "",
    fromEn: "",
    fromAr: "",
    toEn: "",
    toAr: "",
    departureEn: "",
    departureAr: "",
    scheduleEn: "",
    scheduleAr: "",
    notesEn: "",
    notesAr: "",
    transportType: "",
    hireType: "",
    priceBasis: "",
    cityId: "",
    regionId: "",
    price: "",
    currency: "EGP",
    capacity: "",
    duration: "",
    frequency: "",
    lat: "",
    lng: "",
    status: "published",
  });

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      const { data, error } = await supabase.from("transport").select("*").eq("id", id).maybeSingle();
      if (error || !data) {
        toast.error(ar ? "تعذر تحميل خدمة النقل" : "Could not load this ride");
        return;
      }
      const row = data as Record<string, unknown>;
      setForm({
        nameEn: str(row.name_en) || "",
        nameAr: str(row.name_ar) || "",
        descriptionEn: str(row.description_en) || "",
        descriptionAr: str(row.description_ar) || "",
        fromEn: str(row.from_en) || "",
        fromAr: str(row.from_ar) || "",
        toEn: str(row.to_en) || "",
        toAr: str(row.to_ar) || "",
        departureEn: str(row.departure_point_en) || "",
        departureAr: str(row.departure_point_ar) || "",
        scheduleEn: str(row.schedule_en) || "",
        scheduleAr: str(row.schedule_ar) || "",
        notesEn: str(row.notes_en) || "",
        notesAr: str(row.notes_ar) || "",
        transportType: str(row.transport_type) || "",
        hireType: str(row.hire_type) || "",
        priceBasis: str(row.price_basis) || "",
        cityId: str(row.city_id) || "",
        regionId: str(row.region_id) || "",
        price: row.price != null ? String(row.price) : "",
        currency: str(row.currency) || "EGP",
        capacity: row.capacity != null ? String(row.capacity) : "",
        duration: str(row.duration) || "",
        frequency: str(row.frequency) || "",
        lat: row.latitude != null ? String(row.latitude) : "",
        lng: row.longitude != null ? String(row.longitude) : "",
        status: str(row.status) || "published",
      });
      setMeta((row.translation_meta as TranslationMeta) || {});
      setExistingImages(
        strArray(row.images).length > 0
          ? strArray(row.images)
          : str(row.image)
            ? [str(row.image)]
            : []
      );
    })();
  }, [isEdit, id, ar]);

  const set = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));
  const cityCenter = form.cityId ? cityCoords[form.cityId] : undefined;

  const handleSubmit = async () => {
    if (!user) {
      toast.error(ar ? "يرجى تسجيل الدخول" : "Please sign in first");
      return;
    }
    const nameSrc = authorLang === "ar" ? form.nameAr : form.nameEn;
    const descSrc = authorLang === "ar" ? form.descriptionAr : form.descriptionEn;
    if (!nameSrc.trim() || !descSrc.trim() || !form.transportType || !form.cityId || !form.price.trim()) {
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
        provider_id: providerId,
        listing_kind: editorial ? "editorial" : "hosted",
        name_en: form.nameEn.trim() || null,
        name_ar: form.nameAr.trim() || null,
        description_en: form.descriptionEn.trim() || null,
        description_ar: form.descriptionAr.trim() || null,
        from_en: form.fromEn.trim() || null,
        from_ar: form.fromAr.trim() || null,
        to_en: form.toEn.trim() || null,
        to_ar: form.toAr.trim() || null,
        departure_point_en: form.departureEn.trim() || null,
        departure_point_ar: form.departureAr.trim() || null,
        schedule_en: form.scheduleEn.trim() || null,
        schedule_ar: form.scheduleAr.trim() || null,
        notes_en: form.notesEn.trim() || null,
        notes_ar: form.notesAr.trim() || null,
        transport_type: form.transportType,
        hire_type: form.hireType || null,
        price_basis: form.priceBasis || null,
        city_id: form.cityId || null,
        region_id: form.regionId || null,
        price: parseInt(form.price) || 0,
        currency: form.currency.trim() || "EGP",
        capacity: form.capacity.trim() ? parseInt(form.capacity) : null,
        duration: form.duration.trim() || null,
        frequency: form.frequency.trim() || null,
        latitude: form.lat.trim() ? Number(form.lat) : null,
        longitude: form.lng.trim() ? Number(form.lng) : null,
        image: images[0] || null,
        images,
        status: form.status,
        translation_meta: meta as unknown as Json,
      };

      if (isEdit) {
        const { error } = await supabase.from("transport").update(payload as never).eq("id", id);
        if (error) throw error;
        toast.success(ar ? "تم تحديث خدمة النقل" : "Ride updated");
      } else {
        const { error } = await supabase
          .from("transport")
          .insert({ ...payload, slug: slugify(form.nameEn || form.nameAr, user.id.slice(0, 6)) } as never);
        if (error) throw error;
        toast.success(ar ? "تم نشر خدمة النقل" : "Ride published");
      }
      navigate(editorial ? "/admin" : "/dashboard/service-provider/my-rides");
    } catch (err) {
      toast.error(readableDbError(err instanceof Error ? err.message : "Failed to save", ar));
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-role-service-provider/40";
  const labelClass = "text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5";
  const iconCls = "w-3.5 h-3.5 text-role-service-provider";
  const isFixedRoute = form.hireType !== "on-demand";

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
          {isEdit ? (ar ? "تعديل خدمة النقل" : "Edit Ride") : (ar ? "إضافة خدمة نقل" : "Add Transport")}
        </h1>
      </header>

      <div className="px-4 py-5 space-y-5">
        <AuthorLangToggle value={authorLang} onChange={setAuthorLang} />

        <div>
          <label className={labelClass}><Image className={iconCls} />{ar ? "الصور" : "Photos"}</label>
          <PhotoPicker
            files={photos}
            onChange={setPhotos}
            max={5}
            hint={ar ? "حتى ٥ صور" : "Up to 5 photos"}
            existing={existingImages}
            onRemoveExisting={(url) => setExistingImages((p) => p.filter((u) => u !== url))}
          />
        </div>

        <BilingualField
          fieldEn="name_en" fieldAr="name_ar"
          labelEn="Name of the service" labelAr="اسم الخدمة"
          required
          icon={<FileText className={iconCls} />}
          valueEn={form.nameEn} valueAr={form.nameAr}
          onChange={({ en, ar: a }) => setForm((p) => ({ ...p, nameEn: en, nameAr: a }))}
          meta={meta} onMetaChange={setMeta}
          authorLang={authorLang}
          context="short name of an Egyptian local transport service such as a felucca ride or microbus route"
          placeholderEn="e.g. Felucca crossing to Elephantine" placeholderAr="مثال: عبور بالفلوكة إلى جزيرة إلفنتين"
          inputClass={inputClass} labelClass={labelClass}
        />

        <BilingualField
          fieldEn="description_en" fieldAr="description_ar"
          labelEn="About this ride" labelAr="عن الرحلة"
          required multiline rows={4}
          icon={<FileText className={iconCls} />}
          valueEn={form.descriptionEn} valueAr={form.descriptionAr}
          onChange={({ en, ar: a }) => setForm((p) => ({ ...p, descriptionEn: en, descriptionAr: a }))}
          meta={meta} onMetaChange={setMeta}
          authorLang={authorLang}
          context="description of a local Egyptian transport service for travellers"
          placeholderEn="Describe the vehicle, the ride and what travellers should expect..."
          placeholderAr="اوصف المركبة والرحلة وما يتوقعه المسافرون..."
          inputClass={inputClass} labelClass={labelClass}
        />

        <div>
          <label className={labelClass}><Route className={iconCls} />{ar ? "نوع المركبة *" : "Vehicle type *"}</label>
          <div className="flex flex-wrap gap-2">
            {TRANSPORT_TYPES.map((t) => (
              <button
                key={t.key}
                onClick={() => set("transportType", t.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  form.transportType === t.key
                    ? "bg-role-service-provider text-white border-role-service-provider"
                    : "bg-card text-foreground border-border"
                }`}
              >
                {t.emoji} {t.label[lang]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}><Navigation className={iconCls} />{ar ? "خط ثابت أم تأجير؟" : "Fixed route or hire?"}</label>
          <div className="flex gap-2">
            {HIRE_TYPES.map((h) => (
              <button
                key={h.key}
                onClick={() => set("hireType", form.hireType === h.key ? "" : h.key)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border ${
                  form.hireType === h.key
                    ? "bg-role-service-provider text-white border-role-service-provider"
                    : "bg-card text-foreground border-border"
                }`}
              >
                {h.label[lang]}
              </button>
            ))}
          </div>
        </div>

        {isFixedRoute && (
          <>
            <BilingualField
              fieldEn="from_en" fieldAr="from_ar"
              labelEn="From" labelAr="من"
              icon={<MapPin className={iconCls} />}
              valueEn={form.fromEn} valueAr={form.fromAr}
              onChange={({ en, ar: a }) => setForm((p) => ({ ...p, fromEn: en, fromAr: a }))}
              meta={meta} onMetaChange={setMeta}
              authorLang={authorLang}
              context="the starting place of a local Egyptian transport route"
              placeholderEn="e.g. Aswan Corniche" placeholderAr="مثال: كورنيش أسوان"
              inputClass={inputClass} labelClass={labelClass}
            />
            <BilingualField
              fieldEn="to_en" fieldAr="to_ar"
              labelEn="To" labelAr="إلى"
              icon={<Navigation className={iconCls} />}
              valueEn={form.toEn} valueAr={form.toAr}
              onChange={({ en, ar: a }) => setForm((p) => ({ ...p, toEn: en, toAr: a }))}
              meta={meta} onMetaChange={setMeta}
              authorLang={authorLang}
              context="the destination of a local Egyptian transport route"
              placeholderEn="e.g. Elephantine Island" placeholderAr="مثال: جزيرة إلفنتين"
              inputClass={inputClass} labelClass={labelClass}
            />
          </>
        )}

        <BilingualField
          fieldEn="departure_point_en" fieldAr="departure_point_ar"
          labelEn="Pickup / departure point" labelAr="نقطة الانطلاق أو الاستلام"
          icon={<MapPin className={iconCls} />}
          valueEn={form.departureEn} valueAr={form.departureAr}
          onChange={({ en, ar: a }) => setForm((p) => ({ ...p, departureEn: en, departureAr: a }))}
          meta={meta} onMetaChange={setMeta}
          authorLang={authorLang}
          context="the exact meeting or pickup spot for an Egyptian transport service"
          placeholderEn="e.g. Next to the ferry steps, opposite the souk"
          placeholderAr="مثال: بجانب سلم المعدية، مقابل السوق"
          inputClass={inputClass} labelClass={labelClass}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}><DollarSign className={iconCls} />{ar ? "السعر *" : "Price *"}</label>
            <input type="number" min="0" className={inputClass} placeholder="150" value={form.price} onChange={(e) => set("price", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>{ar ? "العملة" : "Currency"}</label>
            <input className={inputClass} maxLength={8} value={form.currency} onChange={(e) => set("currency", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}><Users className={iconCls} />{ar ? "السعة" : "Capacity"}</label>
            <input type="number" min="1" className={inputClass} placeholder="6" value={form.capacity} onChange={(e) => set("capacity", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}><Clock className={iconCls} />{ar ? "المدة" : "Duration"}</label>
            <input className={inputClass} maxLength={40} placeholder={ar ? "٤٥ دقيقة" : "45 minutes"} value={form.duration} onChange={(e) => set("duration", e.target.value)} />
          </div>
        </div>

        <div>
          <label className={labelClass}><DollarSign className={iconCls} />{ar ? "أساس السعر" : "Price basis"}</label>
          <div className="flex gap-2">
            {PRICE_BASES.map((p) => (
              <button
                key={p.key}
                onClick={() => set("priceBasis", form.priceBasis === p.key ? "" : p.key)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border ${
                  form.priceBasis === p.key
                    ? "bg-role-service-provider text-white border-role-service-provider"
                    : "bg-card text-foreground border-border"
                }`}
              >
                {p.label[lang]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}><CalendarClock className={iconCls} />{ar ? "التكرار" : "Frequency"}</label>
          <input className={inputClass} maxLength={60} placeholder={ar ? "مثال: كل ساعة من ٨ ص حتى ٦ م" : "e.g. Hourly, 8 AM – 6 PM"} value={form.frequency} onChange={(e) => set("frequency", e.target.value)} />
        </div>

        <BilingualField
          fieldEn="schedule_en" fieldAr="schedule_ar"
          labelEn="Schedule details" labelAr="تفاصيل المواعيد"
          multiline rows={3} manualOnly
          icon={<CalendarClock className={iconCls} />}
          valueEn={form.scheduleEn} valueAr={form.scheduleAr}
          onChange={({ en, ar: a }) => setForm((p) => ({ ...p, scheduleEn: en, scheduleAr: a }))}
          meta={meta} onMetaChange={setMeta}
          authorLang={authorLang}
          context="the real running times of a local Egyptian transport service"
          placeholderEn="Write your real running days and times — travellers rely on this."
          placeholderAr="اكتب أيام ومواعيد التشغيل الحقيقية — المسافرون يعتمدون عليها."
          inputClass={inputClass} labelClass={labelClass}
        />

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
          <label className={labelClass}><MapPin className={iconCls} />{ar ? "موقع الانطلاق على الخريطة" : "Pin the departure point"}</label>
          <LocationPicker
            lat={form.lat}
            lng={form.lng}
            fallbackCenter={cityCenter ?? null}
            onChange={(la, ln) => setForm((p) => ({ ...p, lat: String(la), lng: String(ln) }))}
          />
        </div>

        <BilingualField
          fieldEn="notes_en" fieldAr="notes_ar"
          labelEn="Good to know" labelAr="معلومات مهمة"
          multiline rows={3} manualOnly
          icon={<ScrollText className={iconCls} />}
          valueEn={form.notesEn} valueAr={form.notesAr}
          onChange={({ en, ar: a }) => setForm((p) => ({ ...p, notesEn: en, notesAr: a }))}
          meta={meta} onMetaChange={setMeta}
          authorLang={authorLang}
          context="practical notes a local Egyptian transport operator gives travellers"
          placeholderEn="What's included, luggage limits, anything travellers should bring..."
          placeholderAr="ما هو مشمول، حدود الأمتعة، وما يجب على المسافر إحضاره..."
          inputClass={inputClass} labelClass={labelClass}
        />

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
            : isEdit ? (ar ? "حفظ التغييرات" : "Save Changes") : (ar ? "نشر خدمة النقل" : "Publish Transport")}
        </button>
      </div>
    </div>
  );
};

export default NewTransport;
