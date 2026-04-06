import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ExperienceFormData>(defaultFormData);
  const [submitting, setSubmitting] = useState(false);

  const set = useCallback((key: string, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
  }, []);

  const updateForm = useCallback((updates: Partial<ExperienceFormData>) => {
    setForm((p) => ({ ...p, ...updates }));
  }, []);

  const canProceed = (): boolean => {
    switch (step) {
      case 0: return form.title_en.trim().length > 0 && form.title_ar.trim().length > 0;
      case 1: return form.description_en.trim().length > 0;
      case 2: return form.category.length > 0;
      case 4: return form.price.trim().length > 0;
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
    if (!form.title_en.trim() || !form.title_ar.trim() || !form.category || !form.price.trim()) {
      toast.error(lang === "ar" ? "يرجى ملء الحقول المطلوبة" : "Please fill in required fields");
      return;
    }

    setSubmitting(true);
    try {
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

      const { error } = await supabase.from("experiences").insert({
        provider_id: user.id,
        title_en: form.title_en.trim(),
        title_ar: form.title_ar.trim(),
        description_en: form.description_en.trim(),
        description_ar: form.description_ar.trim(),
        theme: form.category,
        price: parseInt(form.price) || 0,
        duration_minutes: durationMinutes || null,
        capacity_min: parseInt(form.groupSizeMin) || 1,
        capacity_max: parseInt(form.groupSizeMax) || 20,
        image: imageUrl,
        images: imageUrls,
        meeting_point_name: form.meetingPointName || null,
        meeting_point_lat: form.meetingPointLat ? parseFloat(form.meetingPointLat) : null,
        meeting_point_lng: form.meetingPointLng ? parseFloat(form.meetingPointLng) : null,
        status: "published",
      });

      if (error) throw error;
      toast.success(lang === "ar" ? "تم نشر التجربة بنجاح!" : "Experience published successfully!");
      navigate("/dashboard/service-provider");
    } catch (err: any) {
      toast.error(err.message || "Failed to create experience");
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

  return (
    <div className="min-h-screen bg-surface pb-28">
      {/* Header */}
      <header className="bg-role-service-provider text-white px-4 py-4 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => (step > 0 ? prev() : navigate(-1))} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold">{lang === "ar" ? "تجربة جديدة" : "New Experience"}</h1>
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
            ? (lang === "ar" ? "جاري النشر..." : "Publishing...")
            : isLastStep
            ? (lang === "ar" ? "نشر التجربة" : "Publish Experience")
            : (lang === "ar" ? "التالي" : "Next")}
          {!isLastStep && <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

export default NewExperience;
