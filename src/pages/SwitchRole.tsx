import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Loader2, Eye } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole, roleLabels, roleDashboardPaths, type LocalRole } from "@/hooks/useUserRole";
import { becomeProvider, providerErrorMessage } from "@/lib/becomeProvider";
import {
  PROVIDER_INTENTS,
  rememberProviderIntent,
  type ProviderIntent,
} from "@/lib/providerIntents";

/**
 * ONE-TAP ROLE SWITCH.
 *
 * Switching a role used to mean walking the whole /welcome onboarding again —
 * intent, region, city, name, Arabic name, bio, photo, quiz — and only at the
 * very end being told "you already have a role". Everything that flow asked for
 * is already stored on the provider row, so this screen changes ONLY the role:
 * pick a statement, confirm once, land on the new dashboard.
 *
 * `becomeProvider(role, undefined, { force: true })` deliberately passes no
 * details, so the stored name, city, photo and WhatsApp are kept as-is; the
 * helper unpublishes the old satellite profile and creates the new one.
 */
const SwitchRole = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const { role, isProvider, refreshRole, enterVisitorMode } = useUserRole();

  const preselect = params.get("to");
  const [pending, setPending] = useState<ProviderIntent | null>(
    () => PROVIDER_INTENTS.find((i) => i.role === preselect) ?? null
  );
  const [submitting, setSubmitting] = useState(false);

  const currentLabel = roleLabels[role];

  const go = (intent: ProviderIntent) => {
    // Same role, different way of working: no database change is needed, we just
    // remember the intent so the dashboard opens on the right section.
    if (intent.role === role) {
      rememberProviderIntent(intent.key);
      navigate(intent.landing);
      return;
    }
    setPending(intent);
  };

  const confirm = async () => {
    if (!pending) return;
    if (!user) {
      navigate(`/login?next=${encodeURIComponent("/switch-role")}`);
      return;
    }
    setSubmitting(true);
    const result = await becomeProvider(pending.role, undefined, { force: true });
    if (result.status !== "ok") {
      setSubmitting(false);
      toast.error(
        result.status === "error"
          ? providerErrorMessage(result.error, lang)
          : lang === "ar"
            ? "تعذّر تغيير الدور"
            : "Could not change your role"
      );
      return;
    }
    if (result.satelliteError) {
      toast.error(
        lang === "ar"
          ? "تم تغيير الدور لكن تعذّر إنشاء ملفك العام. حدّثه من تعديل الملف الشخصي."
          : "Your role changed but the public profile failed. Update it from Edit Profile."
      );
    }
    rememberProviderIntent(pending.key);
    await refreshRole();
    setSubmitting(false);
    toast.success(
      lang === "ar"
        ? `دورك الآن: ${roleLabels[pending.role].ar}`
        : `You are now a ${roleLabels[pending.role].en}`
    );
    navigate(pending.landing || roleDashboardPaths[pending.role] || "/");
  };

  const becomeVisitor = () => {
    enterVisitorMode();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-surface pb-24">
      <header className="flex items-center gap-3 px-4 py-3 bg-background sticky top-0 z-40 border-b border-border">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-full hover:bg-secondary"
          aria-label={lang === "ar" ? "رجوع" : "Back"}
        >
          <ArrowLeft className="w-5 h-5 text-foreground rtl:rotate-180" />
        </button>
        <div>
          <h1 className="text-base font-bold text-foreground">
            {lang === "ar" ? "تغيير الدور" : "Switch role"}
          </h1>
          <p className="text-xs text-muted-foreground">
            {lang === "ar"
              ? `دورك الحالي: ${currentLabel.ar}`
              : `You are currently: ${currentLabel.en}`}
          </p>
        </div>
      </header>

      <div className="px-4 py-4">
        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
          {lang === "ar"
            ? "اختار الجملة اللي تشبه شغلك. بياناتك (اسمك، مدينتك، صورتك) هتفضل زي ما هي — مش هتكتبها تاني."
            : "Pick the line that matches your work. Your name, city and photo stay as they are — nothing to re-type."}
        </p>

        <div className="grid grid-cols-1 gap-2.5">
          {PROVIDER_INTENTS.map((intent) => {
            const Icon = intent.icon;
            const isCurrent = intent.role === role;
            return (
              <button
                key={intent.key}
                onClick={() => go(intent)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 text-start min-h-[64px] transition-all ${
                  isCurrent
                    ? "border-primary/40 bg-primary/5"
                    : "border-border bg-card hover:border-primary/30"
                }`}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-secondary text-secondary-foreground">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{intent.statement[lang]}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{intent.sub[lang]}</p>
                </div>
                {isCurrent ? (
                  <Check className="w-4 h-4 text-primary shrink-0 ms-auto" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 ms-auto rtl:rotate-180" />
                )}
              </button>
            );
          })}
        </div>

        {isProvider && (
          <button
            onClick={becomeVisitor}
            className="mt-4 w-full flex items-center gap-3 p-4 rounded-xl border border-border bg-card text-start min-h-[56px]"
          >
            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
              <Eye className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                {lang === "ar" ? "أتفرّج كزائر" : "Just browsing as a visitor"}
              </p>
              <p className="text-xs text-muted-foreground">
                {lang === "ar"
                  ? "ملفك يفضل موجود، ترجع للوحتك في أي وقت"
                  : "Your profile stays; return to your dashboard anytime"}
              </p>
            </div>
          </button>
        )}
      </div>

      {/* Single confirmation — stated plainly, no extra steps. */}
      {pending && (
        <div className="fixed inset-0 z-50 flex items-end bg-foreground/40" role="dialog">
          <div className="w-full bg-background rounded-t-2xl p-5">
            <h2 className="text-base font-bold text-foreground mb-2">
              {lang === "ar" ? "تأكيد تغيير الدور" : "Confirm the switch"}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {lang === "ar"
                ? `هتتحول من "${currentLabel.ar}" إلى "${roleLabels[pending.role].ar}". ملفك العام القديم هيتخفي، وكل ما نشرته هيفضل محفوظ في حسابك.`
                : `You will move from ${currentLabel.en} to ${roleLabels[pending.role].en}. Your old public profile is hidden; everything you published stays in your account.`}
            </p>
            <div className="space-y-2">
              <button
                onClick={confirm}
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {lang === "ar" ? "أكّد التغيير" : "Yes, switch"}
              </button>
              <button
                onClick={() => setPending(null)}
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm"
              >
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwitchRole;
