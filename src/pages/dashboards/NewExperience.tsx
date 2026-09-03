import { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { fetchMyProviderId } from "@/lib/providerRecord";
import { generateSlotDrafts } from "@/lib/experienceSlots";
import { themeForCategory, themeOrOther, readableDbError } from "@/lib/listingTaxonomy";

import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import WizardProgress, { steps } from "@/components/experience-wizard/WizardProgress";
import { ExperienceFormData, defaultFormData } from "@/components/experience-wizard/types";
import StepTitle from "@/components/experience-wizard/StepTitle";
import StepDescription from "@/components/experience-wizard/StepDescription";
import StepCategory from "@/components/experience-wizard/StepCategory";
import StepPhotos from "@/components/experience-wizard/StepPhotos";
import StepPricing from "@/components/experience-wizard/StepPricing";
import StepDuration from "@/components/experience-wizard/StepDuration";
import StepAvailability from "@/components/experience-wizard/StepAvailability";
import StepPolicies from "@/components/experience-wizard/StepPolicies";
import StepLocation from "@/components/experience-wizard/StepLocation";
import StepReview from "@/components/experience-wizard/StepReview";

const NewExperience = () => {
  const { lang } = useI18n();
  const ar = lang === "ar";
  const navigate = useNavigate();
  const { id: editId } = useParams();
  const isEdit = !!editId;
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ExperienceFormData>(defaultFormData);
  const [submitting, setSubmitting] = useState(false);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "ok" | "signed-out" | "denied" | "missing">(
    isEdit ? "loading" : "ok"
  );
  /** The itinerary stored in the language the host is NOT authoring in — kept untouched on save. */
  const [otherItinerary, setOtherItinerary] = useState<{ en: unknown; ar: unknown }>({ en: [], ar: [] });

  // ── Edit mode: load the existing listing and prefill every persisted field ──
  useEffect(() => {
    if (!isEdit || authLoading) return;
    let cancelled = false;
    (async () => {
      if (!user) {
        setLoadState("signed-out");
        return;
      }
      try {
        // Ownership uses providers.id (see src/lib/providerRecord.ts), never auth.uid()
        const providerId = await fetchMyProviderId(user.id);
        const { data, error } = await supabase
          .from("experiences")
          .select("*")
          .eq("id", editId)
          .maybeSingle();
        if (cancelled) return;
        if (error || !data) {
          setLoadState("missing");
          return;
        }
        if (!providerId || data.provider_id !== providerId) {
          setLoadState("denied");
          return;
        }
        const mins = data.duration_minutes ?? 0;
        const asArr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
        const rawEn = asArr(data.itinerary_en);
        const rawAr = asArr(data.itinerary_ar);
        setOtherItinerary({ en: rawEn, ar: rawAr });
        // Show the authoring language's stored steps, falling back to the other
        // language so the host never sees an empty list while data exists.
        const rawItin = ar ? (rawAr.length ? rawAr : rawEn) : rawEn.length ? rawEn : rawAr;
        const loadedItinerary = rawItin.map((i) => {
          const it = (i || {}) as { step?: string; description?: string };
          return { step: String(it.step ?? ""), description: String(it.description ?? "") };
        });
        setForm({
          ...defaultFormData,
          title_en: data.title_en ?? "",
          title_ar: data.title_ar ?? "",
          description_en: data.description_en ?? "",
          description_ar: data.description_ar ?? "",
          category: (data.theme === "other" ? data.theme_other : data.theme) ?? "",
          price: data.price != null ? String(data.price) : "",
          duration: mins ? String(mins / 60) : "",
          durationUnit: "hours",
          groupSizeMin: data.capacity_min != null ? String(data.capacity_min) : "1",
          groupSizeMax: data.capacity_max != null ? String(data.capacity_max) : "10",
          photoPreviewUrls: (data.images as string[] | null) ?? (data.image ? [data.image] : []),
          cityId: data.city_id ?? "",
          regionId: data.region_id ?? "",
          remarks_en: (data as any).remarks_en ?? "",
          remarks_ar: (data as any).remarks_ar ?? "",
          meetingPointName: data.meeting_point_name ?? "",
          meetingPointLat: data.meeting_point_lat != null ? String(data.meeting_point_lat) : "",
          meetingPointLng: data.meeting_point_lng != null ? String(data.meeting_point_lng) : "",
          itinerary: loadedItinerary.length ? loadedItinerary : [{ step: "", description: "" }],
        });
        setLoadState("ok");
      } catch {
        if (!cancelled) setLoadState("missing");
      }
    })();
    return () => {
      cancelled = true;
    };
  // ar intentionally excluded: re-running on a language toggle would overwrite edits.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, editId, user, authLoading]);

  const set = useCallback((key: string, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
  }, []);

  const updateForm = useCallback((updates: Partial<ExperienceFormData>) => {
    setForm((p) => ({ ...p, ...updates }));
  }, []);

  // ONE LANGUAGE IS MANDATORY: whichever language the app is set to.
  const titleRequired = (ar ? form.title_ar : form.title_en).trim();
  const descriptionRequired = (ar ? form.description_ar : form.description_en).trim();
  const includesFilled = form.includes.some((i) => i.trim());
  const excludesFilled = form.excludes.some((i) => i.trim());

  const canProceed = (): boolean => {
    switch (step) {
      case 0: return titleRequired.length > 0;
      case 1: return descriptionRequired.length > 0;
      // Validate at the category step, not at publish time: only a category that
      // maps to a stored theme the database accepts may advance.
      case 2: return !!themeOrOther(form.category);
      case 4:
        return (
          form.price.trim().length > 0 && Number(form.price) >= 0 && includesFilled && excludesFilled
        );
      default: return true;
    }
  };

  const next = () => { if (step < steps.length - 1 && canProceed()) setStep(step + 1); };
  const prev = () => { if (step > 0) setStep(step - 1); };

  const handleSubmit = async () => {
    if (!user) {
      toast.error(lang === "ar" ? "يرجى تسجيل الدخول" : "Please sign in first");
      return;
    }
    const theme = themeOrOther(form.category);
    if (!titleRequired || !descriptionRequired || !theme || !form.price.trim() || !includesFilled || !excludesFilled) {
      toast.error(
        lang === "ar" ? "يرجى ملء الحقول المطلوبة" : "Please fill in required fields"
      );
      return;
    }

    setSubmitting(true);
    try {
      // experiences.provider_id holds providers.id (see src/lib/providerRecord.ts)
      const providerId = await fetchMyProviderId(user.id);
      if (!providerId) {
        toast.error(
          lang === "ar"
            ? "لا يوجد ملف مزود خدمة لحسابك. أكمل إعداد حساب المزود أولاً."
            : "No provider profile found for your account. Finish provider setup first."
        );
        return;
      }

      let imageUrl: string | null = null;
      const imageUrls: string[] = [];

      // Upload photos
      for (const photo of form.photos) {
        const ext = photo.name.split(".").pop();
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("listing-images").upload(path, photo);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("listing-images").getPublicUrl(path);
        imageUrls.push(urlData.publicUrl);
      }
      if (imageUrls.length > 0) imageUrl = imageUrls[0];

      const durationMinutes = form.durationUnit === "hours"
        ? Math.round(parseFloat(form.duration || "0") * 60)
        : Math.round(parseFloat(form.duration || "0") * 24 * 60);

      // Steps with nothing typed at all are dropped; only the authoring
      // language is written, the other keeps whatever the row already stored.
      const itinerary = form.itinerary
        .map((i) => ({ step: i.step.trim(), description: (i.description ?? "").trim() }))
        .filter((i) => i.step || i.description);

      // title_en is NOT NULL: when the host only wrote Arabic, store that text
      // rather than an empty string so the listing is never nameless.
      const payload = {
        title_en: form.title_en.trim() || form.title_ar.trim(),
        title_ar: form.title_ar.trim() || null,
        description_en: form.description_en.trim() || form.description_ar.trim(),
        description_ar: form.description_ar.trim() || null,
        itinerary_en: (ar ? otherItinerary.en : itinerary) as Json,
        itinerary_ar: (ar ? itinerary : otherItinerary.ar) as Json,
        theme,
        theme_other: theme === "other" ? form.category.trim() : null,
        price: parseInt(form.price) || 0,
        duration_minutes: durationMinutes || null,
        capacity_min: parseInt(form.groupSizeMin) || 1,
        capacity_max: parseInt(form.groupSizeMax) || 20,
        image: imageUrl,
        images: imageUrls,
        meeting_point_name: form.meetingPointName || null,
        meeting_point_lat: form.meetingPointLat ? parseFloat(form.meetingPointLat) : null,
        meeting_point_lng: form.meetingPointLng ? parseFloat(form.meetingPointLng) : null,
        city_id: form.cityId || null,
        region_id: form.regionId || null,
        remarks_en: form.remarks_en.trim() || null,
        remarks_ar: form.remarks_ar.trim() || null,
      };


      if (isEdit) {
        // keep the existing photos when the host didn't upload new ones
        const { image: _img, images: _imgs, ...rest } = payload;
        const update = imageUrls.length > 0 ? { ...rest, image: imageUrl, images: imageUrls } : rest;
        const { error } = await supabase.from("experiences").update(update).eq("id", editId);
        if (error) throw error;
        toast.success(ar ? "تم تحديث التجربة" : "Listing updated");
        navigate("/dashboard/service-provider/my-listings");
        return;
      }

      const { data: created, error } = await supabase
        .from("experiences")
        .insert({ ...payload, provider_id: providerId, status: "published" })
        .select("id")
        .single();

      if (error) throw error;

      // The availability step used to be decorative — publish real slots from it.
      const drafts = generateSlotDrafts({
        days: form.availableDays,
        startTime: form.startTime,
        endTime: form.endTime,
        from: form.seasonStart,
        to: form.seasonEnd,
        price: parseInt(form.price) || 0,
        spots: parseInt(form.groupSizeMax) || 10,
      });
      if (created?.id && drafts.length > 0) {
        const { error: slotError } = await supabase
          .from("experience_slots")
          .insert(drafts.map((d) => ({ ...d, experience_id: created.id })));
        if (slotError) {
          toast.error(
            ar
              ? "تم نشر التجربة، لكن تعذّر إنشاء المواعيد. أضفها من إدارة المواعيد."
              : "Listing published, but slots could not be created. Add them from Manage availability."
          );
        }
      }

      toast.success(ar ? "تم نشر التجربة بنجاح!" : "Experience published successfully!");
      navigate("/dashboard/service-provider/my-listings");
    } catch (err: any) {
      toast.error(
        readableDbError(err?.message || "", ar) ||
          (ar ? "تعذّر حفظ التجربة" : "Failed to save the listing")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0: return <StepTitle form={form} set={set} />;
      case 1: return <StepDescription form={form} set={set} />;
      case 2: return <StepCategory form={form} set={set} />;
      case 3: return <StepPhotos form={form} updateForm={updateForm} />;
      case 4: return <StepPricing form={form} set={set} updateForm={updateForm} />;
      case 5: return <StepDuration form={form} set={set} />;
      case 6: return <StepAvailability form={form} set={set} updateForm={updateForm} />;
      case 7: return <StepPolicies form={form} set={set} updateForm={updateForm} />;
      case 8: return <StepLocation form={form} set={set} updateForm={updateForm} />;
      case 9: return <StepReview form={form} />;
      default: return null;
    }
  };

  const isLastStep = step === steps.length - 1;

  if (isEdit && loadState !== "ok") {
    const message =
      loadState === "signed-out"
        ? ar
          ? "يرجى تسجيل الدخول لتعديل هذه التجربة."
          : "Please sign in to edit this listing."
        : loadState === "denied"
        ? ar
          ? "هذه التجربة ليست ملكك، لذلك لا يمكنك تعديلها."
          : "This listing is not yours, so you cannot edit it."
        : loadState === "missing"
        ? ar
          ? "لم يتم العثور على هذه التجربة."
          : "This listing could not be found."
        : ar
        ? "جاري التحميل..."
        : "Loading...";
    return (
      <div className="min-h-screen bg-surface">
        <header className="bg-role-service-provider text-white px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1" aria-label={ar ? "رجوع" : "Back"}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">{ar ? "تعديل التجربة" : "Edit Listing"}</h1>
        </header>
        <p className="text-center text-sm text-muted-foreground px-6 py-16">{message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-28">
      {/* Header */}
      <header className="bg-role-service-provider text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => (step > 0 ? prev() : navigate(-1))} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold">
          {isEdit ? (ar ? "تعديل التجربة" : "Edit Listing") : ar ? "تجربة جديدة" : "New Experience"}
        </h1>
      </header>

      <WizardProgress currentStep={step} />

      <div className="px-4 py-4">
        {renderStep()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 inset-x-0 bg-card border-t border-border px-4 py-3 flex gap-3 z-30">
        {step > 0 && (
          <button onClick={prev} className="flex-1 flex items-center justify-center gap-1 py-3 rounded-xl border border-border text-sm font-medium text-foreground">
            <ChevronLeft className="w-4 h-4" />
            {lang === "ar" ? "السابق" : "Back"}
          </button>
        )}
        <button
          onClick={isLastStep ? handleSubmit : next}
          disabled={!canProceed() || submitting}
          className={`flex-1 flex items-center justify-center gap-1 py-3 rounded-xl text-sm font-bold text-white transition-colors ${
            canProceed() && !submitting ? "bg-role-service-provider" : "bg-muted text-muted-foreground"
          }`}
        >
          {submitting
            ? (ar ? "جاري الحفظ..." : "Saving...")
            : isLastStep
            ? isEdit
              ? (ar ? "حفظ التعديلات" : "Save Changes")
              : (ar ? "نشر التجربة" : "Publish Experience")
            : (lang === "ar" ? "التالي" : "Next")}
          {!isLastStep && <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

export default NewExperience;
