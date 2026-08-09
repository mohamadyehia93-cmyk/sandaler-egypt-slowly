import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Globe, Instagram, Facebook, Youtube, Mail, Phone, MessageCircle, MapPin, Sparkles, X, Plus, Eye, EyeOff, User } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useRegions, useCities } from "@/hooks/useListings";
import { uploadImages } from "@/lib/dashboardForms";
import PhotoPicker from "@/components/dashboard/PhotoPicker";
import { Button } from "@/components/ui/button";

/**
 * Single edit screen for both audiences:
 *  - a provider (has a `providers` row) edits their public provider profile
 *  - a plain visitor edits their basic `profiles` row (name / photo / bio)
 * Conditional sections keep one route (`/edit-profile`) for every user so
 * nobody is left without an edit path.
 */

type ProviderRow = {
  id: string;
  role: string | null;
  name_en: string | null;

  name_ar: string | null;
  tagline_en: string | null;
  tagline_ar: string | null;
  bio_en: string | null;
  bio_ar: string | null;
  city_en: string | null;
  city_ar: string | null;
  region_en: string | null;
  region_ar: string | null;
  avatar: string | null;
  cover_image: string | null;
  specialties: unknown;
  languages: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  whatsapp: string | null;
  website: string | null;
  social_links: unknown;
  status: string | null;
};

type Social = { instagram?: string; facebook?: string; youtube?: string; x?: string };

/** The three roles that own a richer, role-specific ("satellite") profile row. */
type SatelliteRole = "organization" | "whos-who" | "culture-actor";
const SATELLITE_TABLE: Record<SatelliteRole, "organizations" | "whos_who" | "culture_actors"> = {
  organization: "organizations",
  "whos-who": "whos_who",
  "culture-actor": "culture_actors",
};
const OWNER_COL: Record<SatelliteRole, "owner_id" | "user_id"> = {
  organization: "owner_id",
  "whos-who": "user_id",
  "culture-actor": "user_id",
};

const asStringArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

const asSocial = (v: unknown): Social =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Social) : {};

/**
 * The three satellite tables have different shapes, so the generated union type
 * can't narrow a dynamic table name. Query them through a loose shape instead.
 */
type LooseRow = Record<string, unknown>;
type LooseQuery = {
  select: (cols: string) => {
    eq: (col: string, val: string) => { maybeSingle: () => Promise<{ data: LooseRow | null }> };
  };
  update: (values: LooseRow) => { eq: (col: string, val: string) => Promise<{ error: { message: string } | null }> };
  insert: (values: LooseRow) => Promise<{ error: { message: string } | null }>;
};
const satQuery = (table: "organizations" | "whos_who" | "culture_actors"): LooseQuery =>
  supabase.from(table) as unknown as LooseQuery;



const EditProfile = () => {
  const navigate = useNavigate();
  const { lang, isRTL } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { data: regions } = useRegions();
  const { data: cities } = useCities();

  const ar = lang === "ar";
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [provider, setProvider] = useState<ProviderRow | null>(null);

  // provider form
  const [f, setF] = useState({
    nameEn: "",
    nameAr: "",
    taglineEn: "",
    taglineAr: "",
    bioEn: "",
    bioAr: "",
    cityId: "",
    cityEn: "",
    cityAr: "",
    regionEn: "",
    regionAr: "",
    languages: "",
    contactEmail: "",
    contactPhone: "",
    whatsapp: "",
    website: "",
  });
  const [social, setSocial] = useState<Social>({});
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [specialtyDraft, setSpecialtyDraft] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [avatarFiles, setAvatarFiles] = useState<File[]>([]);
  const [coverFiles, setCoverFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<string>("draft");

  // role-specific satellite row (organization / whos-who / culture-actor)
  const [satRole, setSatRole] = useState<SatelliteRole | null>(null);
  const [satExists, setSatExists] = useState(false);
  const [sat, setSat] = useState({
    missionEn: "",
    missionAr: "",
    orgWebsite: "",
    roleEn: "",
    roleAr: "",
    meetingTimesEn: "",
    meetingTimesAr: "",
    quoteEn: "",
    quoteAr: "",
  });
  const [satLogo, setSatLogo] = useState<string | null>(null);
  const [satLogoFiles, setSatLogoFiles] = useState<File[]>([]);
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [focusDraft, setFocusDraft] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [interestDraft, setInterestDraft] = useState("");
  const [expertise, setExpertise] = useState<string[]>([]);
  const [expertiseDraft, setExpertiseDraft] = useState("");
  const [satSocial, setSatSocial] = useState<Social>({});

  const setS = (k: keyof typeof sat, v: string) => setSat((p) => ({ ...p, [k]: v }));


  // visitor form
  const [vName, setVName] = useState("");
  const [vBio, setVBio] = useState("");
  const [vAvatar, setVAvatar] = useState<string | null>(null);
  const [vAvatarFiles, setVAvatarFiles] = useState<File[]>([]);

  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  /** Load the role's satellite row (if the role has one) alongside the provider. */
  const loadSatellite = async (role: string | null) => {
    const r = (role || "") as SatelliteRole;
    if (!user || !SATELLITE_TABLE[r]) {
      setSatRole(null);
      return;
    }
    setSatRole(r);
    const { data } = await satQuery(SATELLITE_TABLE[r])
      .select("*")
      .eq(OWNER_COL[r], user.id)
      .maybeSingle();

    const row = (data || null) as Record<string, unknown> | null;
    setSatExists(!!row);
    const str = (k: string) => (typeof row?.[k] === "string" ? (row[k] as string) : "");
    setSat({
      missionEn: str("mission_en"),
      missionAr: str("mission_ar"),
      orgWebsite: str("website"),
      roleEn: str("role_en"),
      roleAr: str("role_ar"),
      meetingTimesEn: str("meeting_times_en"),
      meetingTimesAr: str("meeting_times_ar"),
      quoteEn: str("quote_en"),
      quoteAr: str("quote_ar"),
    });
    setSatLogo((row?.logo as string) || (row?.image as string) || null);
    setFocusAreas(asStringArray(row?.focus_areas_en));
    setInterests(asStringArray(row?.interests_en));
    setExpertise(asStringArray(row?.expertise_en));
    setSatSocial(asSocial(row?.social_links));
  };

  const load = async () => {

    if (!user) return;
    setLoading(true);
    const [{ data: prov }, { data: prof }] = await Promise.all([
      supabase.from("providers").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("profiles").select("display_name, avatar_url, bio").eq("user_id", user.id).maybeSingle(),
    ]);

    if (prov) {
      const p = prov as unknown as ProviderRow;
      setProvider(p);
      setF({
        nameEn: p.name_en || "",
        nameAr: p.name_ar || "",
        taglineEn: p.tagline_en || "",
        taglineAr: p.tagline_ar || "",
        bioEn: p.bio_en || "",
        bioAr: p.bio_ar || "",
        cityId: "",
        cityEn: p.city_en || "",
        cityAr: p.city_ar || "",
        regionEn: p.region_en || "",
        regionAr: p.region_ar || "",
        languages: p.languages || "",
        contactEmail: p.contact_email || "",
        contactPhone: p.contact_phone || "",
        whatsapp: p.whatsapp || "",
        website: p.website || "",
      });
      setSocial(asSocial(p.social_links));
      setSpecialties(asStringArray(p.specialties));
      setAvatarUrl(p.avatar);
      setCoverUrl(p.cover_image);
      setStatus(p.status || "draft");
      await loadSatellite(p.role);
    } else {
      setProvider(null);
      setSatRole(null);
    }


    setVName(prof?.display_name || "");
    setVBio(prof?.bio || "");
    setVAvatar(prof?.avatar_url || null);
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const cityOptions = useMemo(
    () => (cities || []).map((c) => ({ id: c.id, name_en: c.name_en, name_ar: c.name_ar, region_id: c.region_id })),
    [cities]
  );

  const pickCity = (id: string) => {
    const city = cityOptions.find((c) => c.id === id);
    const region = (regions || []).find((r) => r.id === city?.region_id);
    setF((p) => ({
      ...p,
      cityId: id,
      cityEn: city?.name_en || "",
      cityAr: city?.name_ar || "",
      regionEn: region?.name_en || "",
      regionAr: region?.name_ar || "",
    }));
  };

  const addSpecialty = () => {
    const v = specialtyDraft.trim();
    if (!v || specialties.includes(v)) return setSpecialtyDraft("");
    setSpecialties((p) => [...p, v]);
    setSpecialtyDraft("");
  };

  // Completeness: light checklist, no gamification.
  const checklist = [
    { key: "photo", label: ar ? "صورة الملف" : "Profile photo", done: !!(avatarUrl || avatarFiles.length) },
    { key: "bio", label: ar ? "نبذة" : "Bio", done: !!(f.bioEn.trim() || f.bioAr.trim()) },
    { key: "city", label: ar ? "المدينة" : "City", done: !!f.cityEn },
    { key: "contact", label: ar ? "وسيلة تواصل" : "Contact", done: !!(f.contactEmail || f.contactPhone || f.whatsapp || f.website) },
    { key: "specialties", label: ar ? "التخصصات" : "Specialties", done: specialties.length > 0 },
  ];
  const pct = Math.round((checklist.filter((c) => c.done).length / checklist.length) * 100);

  const canPublish = !!(f.bioEn.trim() || f.bioAr.trim() || avatarUrl || avatarFiles.length);

  /** Upsert the satellite row for this role; returns an error message or null. */
  const saveSatellite = async (r: SatelliteRole, providerAvatar: string | null): Promise<string | null> => {
    if (!user) return null;
    let logo = satLogo;
    if (satLogoFiles.length) {
      const [url] = await uploadImages(satLogoFiles, user.id, "profile-photos");
      logo = url || logo;
    }
    const nameEn = f.nameEn.trim();
    const nameAr = f.nameAr.trim() || nameEn; // satellite tables require name_ar

    let values: LooseRow = {};
    if (r === "organization") {
      values = {
        name_en: nameEn,
        name_ar: nameAr,
        logo: logo || providerAvatar || null,
        mission_en: sat.missionEn.trim() || null,
        mission_ar: sat.missionAr.trim() || null,
        website: sat.orgWebsite.trim() || null,
        focus_areas_en: focusAreas,
        location_en: f.cityEn || null,
        location_ar: f.cityAr || null,
      };
    } else if (r === "whos-who") {
      values = {
        name_en: nameEn,
        name_ar: nameAr,
        image: logo || providerAvatar || null,
        role_en: sat.roleEn.trim() || null,
        role_ar: sat.roleAr.trim() || null,
        meeting_times_en: sat.meetingTimesEn.trim() || null,
        meeting_times_ar: sat.meetingTimesAr.trim() || null,
        interests_en: interests,
        bio_en: f.bioEn.trim() || null,
        bio_ar: f.bioAr.trim() || null,
      };
    } else {
      values = {
        name_en: nameEn,
        name_ar: nameAr,
        image: logo || providerAvatar || null,
        expertise_en: expertise,
        quote_en: sat.quoteEn.trim() || null,
        quote_ar: sat.quoteAr.trim() || null,
        social_links: satSocial,
        bio_en: f.bioEn.trim() || null,
        bio_ar: f.bioAr.trim() || null,
      };
    }

    const table = SATELLITE_TABLE[r];
    const owner = OWNER_COL[r];
    if (satExists) {
      const { error } = await satQuery(table).update(values).eq(owner, user.id);
      return error?.message ?? null;
    }
    const { error } = await satQuery(table).insert({
      ...values,
      [owner]: user.id,
      status: "published",
    });
    return error?.message ?? null;
  };

  const saveProvider = async (nextStatus?: string) => {

    if (!user || !provider) return;
    if (!f.nameEn.trim()) {
      toast.error(ar ? "الاسم مطلوب" : "Name is required");
      return;
    }
    if (nextStatus === "published" && !canPublish) {
      const missing = [
        !(f.bioEn.trim() || f.bioAr.trim()) ? (ar ? "نبذة" : "a bio") : null,
        !(avatarUrl || avatarFiles.length) ? (ar ? "صورة" : "a photo") : null,
      ].filter(Boolean);
      toast.error(
        ar
          ? `لا يمكن النشر: أضف ${missing.join(ar ? " أو " : " or ")} أولاً`
          : `Can't publish yet — add ${missing.join(" or ")} first`
      );
      return;
    }
    setSaving(true);
    try {
      let avatar = avatarUrl;
      let cover = coverUrl;
      if (avatarFiles.length) {
        const [url] = await uploadImages(avatarFiles, user.id, "profile-photos");
        avatar = url || avatar;
      }
      if (coverFiles.length) {
        const [url] = await uploadImages(coverFiles, user.id, "profile-photos");
        cover = url || cover;
      }

      const payload = {
        name_en: f.nameEn.trim(),
        name_ar: f.nameAr.trim() || null,
        tagline_en: f.taglineEn.trim() || null,
        tagline_ar: f.taglineAr.trim() || null,
        bio_en: f.bioEn.trim() || null,
        bio_ar: f.bioAr.trim() || null,
        city_en: f.cityEn || null,
        city_ar: f.cityAr || null,
        region_en: f.regionEn || null,
        region_ar: f.regionAr || null,
        avatar: avatar || null,
        cover_image: cover || null,
        specialties: specialties,
        languages: f.languages.trim() || null,
        contact_email: f.contactEmail.trim() || null,
        contact_phone: f.contactPhone.trim() || null,
        whatsapp: f.whatsapp.trim() || null,
        website: f.website.trim() || null,
        social_links: social,
        status: nextStatus || status,
      };

      const { error } = await supabase
        .from("providers")
        .update(payload as never)
        .eq("user_id", user.id);
      if (error) throw error;

      // Save the role-specific satellite row in the same action. A failure here
      // must not lose the provider edits, so it only warns.
      if (satRole) {
        const satErr = await saveSatellite(satRole, avatar);
        if (satErr) toast.warning(ar ? "تم حفظ الملف، لكن تعذّر حفظ بيانات الدور" : `Profile saved, but role details failed: ${satErr}`);
      }

      setAvatarFiles([]);
      setCoverFiles([]);
      setSatLogoFiles([]);
      toast.success(ar ? "تم حفظ الملف الشخصي" : "Profile saved");
      await load();

    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : ar ? "فشل الحفظ" : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const saveVisitor = async () => {
    if (!user) return;
    if (!vName.trim()) {
      toast.error(ar ? "الاسم مطلوب" : "Name is required");
      return;
    }
    setSaving(true);
    try {
      let avatar = vAvatar;
      if (vAvatarFiles.length) {
        const [url] = await uploadImages(vAvatarFiles, user.id, "profile-photos");
        avatar = url || avatar;
      }
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: vName.trim(), bio: vBio.trim() || null, avatar_url: avatar || null })
        .eq("user_id", user.id);
      if (error) throw error;
      setVAvatarFiles([]);
      toast.success(ar ? "تم حفظ الملف الشخصي" : "Profile saved");
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : ar ? "فشل الحفظ" : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";
  const labelClass = "text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5";
  const cardClass = "bg-card rounded-xl shadow-card p-4 space-y-4";

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4 px-6">
        <User className="w-10 h-10 text-primary" />
        <p className="text-sm text-muted-foreground text-center">
          {ar ? "سجّل الدخول لتعديل ملفك الشخصي" : "Sign in to edit your profile"}
        </p>
        <Button onClick={() => navigate("/login")}>{ar ? "تسجيل الدخول" : "Sign in"}</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-28" dir={isRTL ? "rtl" : "ltr"}>
      <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="p-1" aria-label={ar ? "رجوع" : "Back"}>
          <ArrowLeft className={`w-5 h-5 ${isRTL ? "rotate-180" : ""}`} />
        </button>
        <h1 className="text-lg font-bold">{ar ? "تعديل الملف الشخصي" : "Edit Profile"}</h1>
      </header>

      <div className="px-4 py-5 space-y-5">
        {provider ? (
          <>
            {/* Completeness */}
            <div className={cardClass}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">
                  {ar ? "اكتمال الملف" : "Profile completeness"}
                </p>
                <span className="text-sm font-bold text-primary">{pct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <ul className="space-y-1.5">
                {checklist.map((c) => (
                  <li key={c.key} className="flex items-center gap-2 text-xs">
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        c.done ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      {c.done && <Check className="w-2.5 h-2.5" />}
                    </span>
                    <span className={c.done ? "text-muted-foreground line-through" : "text-foreground"}>{c.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Visibility */}
            <div className={cardClass}>
              <div className="flex items-center gap-2">
                {status === "published" ? (
                  <Eye className="w-4 h-4 text-primary" />
                ) : (
                  <EyeOff className="w-4 h-4 text-warning" />
                )}
                <p className="text-sm font-semibold text-foreground">
                  {status === "published"
                    ? ar ? "منشور" : "Published"
                    : ar ? "مسودة" : "Draft"}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                {status === "published"
                  ? ar
                    ? "ملفك ظاهر للزوار في التطبيق."
                    : "Your profile is visible to visitors across the app."
                  : ar
                  ? "المسودة لا تظهر للزوار. أضف نبذة أو صورة ثم انشر."
                  : "A draft profile isn't shown publicly. Add a bio or a photo, then publish."}
              </p>
              {status === "published" ? (
                <Button variant="outline" size="sm" disabled={saving} onClick={() => saveProvider("draft")}>
                  {ar ? "إرجاع إلى مسودة" : "Revert to draft"}
                </Button>
              ) : (
                <Button size="sm" disabled={saving} onClick={() => saveProvider("published")}>
                  {ar ? "نشر الملف" : "Publish profile"}
                </Button>
              )}
            </div>

            {/* Photos */}
            <div className={cardClass}>
              <div>
                <label className={labelClass}>{ar ? "صورة الملف" : "Profile photo"}</label>
                <PhotoPicker
                  files={avatarFiles}
                  onChange={setAvatarFiles}
                  max={1}
                  hint={ar ? "صورة واحدة" : "One photo"}
                  existing={avatarUrl ? [avatarUrl] : []}
                  onRemoveExisting={() => setAvatarUrl(null)}
                />
              </div>
              <div>
                <label className={labelClass}>{ar ? "صورة الغلاف (اختياري)" : "Cover image (optional)"}</label>
                <PhotoPicker
                  files={coverFiles}
                  onChange={setCoverFiles}
                  max={1}
                  hint={ar ? "صورة واحدة" : "One photo"}
                  existing={coverUrl ? [coverUrl] : []}
                  onRemoveExisting={() => setCoverUrl(null)}
                />
              </div>
            </div>

            {/* Identity */}
            <div className={cardClass}>
              <div>
                <label className={labelClass}>{ar ? "الاسم (إنجليزي) *" : "Name (English) *"}</label>
                <input className={inputClass} value={f.nameEn} onChange={(e) => set("nameEn", e.target.value)} maxLength={80} />
              </div>
              <div>
                <label className={labelClass}>{ar ? "الاسم (عربي)" : "Name (Arabic)"}</label>
                <input className={inputClass} value={f.nameAr} onChange={(e) => set("nameAr", e.target.value)} maxLength={80} dir="rtl" />
              </div>
              <div>
                <label className={labelClass}>{ar ? "سطر تعريفي (إنجليزي)" : "Tagline (English)"}</label>
                <input className={inputClass} value={f.taglineEn} onChange={(e) => set("taglineEn", e.target.value)} maxLength={120} />
              </div>
              <div>
                <label className={labelClass}>{ar ? "سطر تعريفي (عربي)" : "Tagline (Arabic)"}</label>
                <input className={inputClass} value={f.taglineAr} onChange={(e) => set("taglineAr", e.target.value)} maxLength={120} dir="rtl" />
              </div>
              <div>
                <label className={labelClass}>{ar ? "نبذة (إنجليزي)" : "Bio (English)"}</label>
                <textarea
                  className={`${inputClass} min-h-[90px] resize-none`}
                  value={f.bioEn}
                  onChange={(e) => set("bioEn", e.target.value)}
                  maxLength={1000}
                />
              </div>
              <div>
                <label className={labelClass}>{ar ? "نبذة (عربي)" : "Bio (Arabic)"}</label>
                <textarea
                  className={`${inputClass} min-h-[90px] resize-none`}
                  value={f.bioAr}
                  onChange={(e) => set("bioAr", e.target.value)}
                  maxLength={1000}
                  dir="rtl"
                />
              </div>
            </div>

            {/* Location */}
            <div className={cardClass}>
              <div>
                <label className={labelClass}>
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  {ar ? "المدينة" : "City"}
                </label>
                <select className={inputClass} value={f.cityId} onChange={(e) => pickCity(e.target.value)}>
                  <option value="">
                    {f.cityEn ? (ar ? f.cityAr || f.cityEn : f.cityEn) : ar ? "اختر مدينة" : "Select a city"}
                  </option>
                  {cityOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {ar ? c.name_ar : c.name_en}
                    </option>
                  ))}
                </select>
                {f.regionEn && (
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    {ar ? "الإقليم: " : "Region: "}
                    {ar ? f.regionAr || f.regionEn : f.regionEn}
                  </p>
                )}
              </div>
              <div>
                <label className={labelClass}>{ar ? "اللغات" : "Languages"}</label>
                <input
                  className={inputClass}
                  placeholder={ar ? "مثال: العربية، الإنجليزية" : "e.g. Arabic, English"}
                  value={f.languages}
                  onChange={(e) => set("languages", e.target.value)}
                />
              </div>
            </div>

            {/* Specialties */}
            <div className={cardClass}>
              <label className={labelClass}>
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                {ar ? "التخصصات" : "Specialties"}
              </label>
              {specialties.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {specialties.map((s) => (
                    <span key={s} className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium rounded-full px-3 py-1.5">
                      {s}
                      <button
                        type="button"
                        onClick={() => setSpecialties((p) => p.filter((x) => x !== s))}
                        aria-label={ar ? "إزالة" : "Remove"}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  className={inputClass}
                  placeholder={ar ? "أضف تخصصاً" : "Add a specialty"}
                  value={specialtyDraft}
                  onChange={(e) => setSpecialtyDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSpecialty();
                    }
                  }}
                />
                <Button type="button" variant="outline" size="icon" onClick={addSpecialty} aria-label={ar ? "إضافة" : "Add"}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Contact */}
            <div className={cardClass}>
              <div>
                <label className={labelClass}><Mail className="w-3.5 h-3.5 text-primary" />{ar ? "البريد الإلكتروني" : "Contact email"}</label>
                <input className={inputClass} type="email" value={f.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}><Phone className="w-3.5 h-3.5 text-primary" />{ar ? "رقم الهاتف" : "Phone"}</label>
                <input className={inputClass} type="tel" value={f.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} dir="ltr" />
              </div>
              <div>
                <label className={labelClass}><MessageCircle className="w-3.5 h-3.5 text-primary" />{ar ? "واتساب" : "WhatsApp"}</label>
                <input className={inputClass} type="tel" value={f.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} dir="ltr" />
              </div>
              <div>
                <label className={labelClass}><Globe className="w-3.5 h-3.5 text-primary" />{ar ? "الموقع الإلكتروني" : "Website"}</label>
                <input className={inputClass} placeholder="https://" value={f.website} onChange={(e) => set("website", e.target.value)} dir="ltr" />
              </div>
            </div>

            {/* Social */}
            <div className={cardClass}>
              <p className="text-sm font-semibold text-foreground">{ar ? "روابط التواصل" : "Social links"}</p>
              {([
                ["instagram", "Instagram", Instagram],
                ["facebook", "Facebook", Facebook],
                ["youtube", "YouTube", Youtube],
                ["x", "X", Globe],
              ] as const).map(([key, label, Icon]) => (
                <div key={key}>
                  <label className={labelClass}><Icon className="w-3.5 h-3.5 text-primary" />{label}</label>
                  <input
                    className={inputClass}
                    placeholder="https://"
                    dir="ltr"
                    value={social[key] || ""}
                    onChange={(e) => setSocial((p) => ({ ...p, [key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Visitor variant — same route, lighter form on the profiles row */
          <div className={cardClass}>
            <p className="text-xs text-muted-foreground">
              {ar
                ? "هذه بيانات ملفك كزائر. لتصبح مزوّداً، ابدأ من شاشة الترحيب."
                : "These are your visitor profile details. To become a provider, start from the welcome screen."}
            </p>
            <div>
              <label className={labelClass}>{ar ? "صورة الملف" : "Profile photo"}</label>
              <PhotoPicker
                files={vAvatarFiles}
                onChange={setVAvatarFiles}
                max={1}
                hint={ar ? "صورة واحدة" : "One photo"}
                existing={vAvatar ? [vAvatar] : []}
                onRemoveExisting={() => setVAvatar(null)}
              />
            </div>
            <div>
              <label className={labelClass}>{ar ? "الاسم *" : "Display name *"}</label>
              <input className={inputClass} value={vName} onChange={(e) => setVName(e.target.value)} maxLength={80} />
            </div>
            <div>
              <label className={labelClass}>{ar ? "نبذة" : "Bio"}</label>
              <textarea
                className={`${inputClass} min-h-[90px] resize-none`}
                value={vBio}
                onChange={(e) => setVBio(e.target.value)}
                maxLength={500}
              />
            </div>
          </div>
        )}
      </div>

      {/* Sticky save */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 z-30">
        <Button
          className="w-full"
          disabled={saving}
          onClick={() => (provider ? saveProvider() : saveVisitor())}
        >
          {saving ? (ar ? "جارٍ الحفظ..." : "Saving...") : ar ? "حفظ التغييرات" : "Save changes"}
        </Button>
      </div>
    </div>
  );
};

export default EditProfile;
