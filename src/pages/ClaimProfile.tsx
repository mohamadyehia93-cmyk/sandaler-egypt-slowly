import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, ShieldCheck, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { roleDashboardPaths, type LocalRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";

/**
 * Claiming an admin-created provider profile.
 *
 * The token in the URL is exchanged through `claim_provider_profile`
 * (SECURITY DEFINER, signed-in callers only). The function is the single
 * authority: it refuses an unknown, expired, revoked or already-used token, a
 * profile that already has an owner, and an account that already owns a
 * provider profile. This page only renders the outcome.
 */

const messages: Record<string, { en: string; ar: string }> = {
  "invalid-token": {
    en: "This claim link is not valid. Ask for a new one.",
    ar: "رابط الاستحواذ غير صالح. اطلب رابطًا جديدًا.",
  },
  "token-used": {
    en: "This link has already been used. If it wasn't you, ask for a new one.",
    ar: "الرابط تم استخدامه بالفعل. لو مش إنت، اطلب رابطًا جديدًا.",
  },
  "token-revoked": {
    en: "This link was cancelled. Ask for a new one.",
    ar: "تم إلغاء هذا الرابط. اطلب رابطًا جديدًا.",
  },
  "token-expired": {
    en: "This link has expired. Ask for a new one.",
    ar: "انتهت صلاحية الرابط. اطلب رابطًا جديدًا.",
  },
  "already-claimed": {
    en: "This profile already belongs to an account.",
    ar: "هذا الملف مرتبط بحساب بالفعل.",
  },
  "account-has-provider": {
    en: "Your account already has a provider profile.",
    ar: "حسابك عنده ملف مزوّد بالفعل.",
  },
  "provider-not-found": {
    en: "That profile no longer exists.",
    ar: "هذا الملف لم يعد موجودًا.",
  },
  "not-authenticated": {
    en: "Sign in first, then open the link again.",
    ar: "سجّل الدخول أولًا ثم افتح الرابط مرة أخرى.",
  },
};

const ClaimProfile = () => {
  const { token } = useParams();
  const { lang } = useI18n();
  const ar = lang === "ar";
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [state, setState] = useState<"idle" | "working" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const claim = async () => {
    if (!token) return;
    setState("working");
    const { data, error: rpcError } = await supabase.rpc("claim_provider_profile", { _token: token });
    if (rpcError) {
      const key = Object.keys(messages).find((k) => rpcError.message.includes(k));
      setError(key ? (ar ? messages[key].ar : messages[key].en) : rpcError.message);
      setState("error");
      return;
    }
    setState("done");
    toast.success(ar ? "تم ربط الملف بحسابك" : "The profile is now yours");
    const role = (data as { role?: string } | null)?.role as LocalRole | undefined;
    navigate((role && roleDashboardPaths[role]) || "/profile");
  };

  // Signed in with a token in the URL: claim straight away.
  useEffect(() => {
    if (!loading && user && token && state === "idle") claim();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4 px-6 text-center"
      dir={ar ? "rtl" : "ltr"}
    >
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
        {state === "error" ? (
          <XCircle className="w-8 h-8 text-destructive" />
        ) : (
          <ShieldCheck className="w-8 h-8 text-primary" />
        )}
      </div>

      <h1 className="text-xl font-bold text-foreground">
        {ar ? "استحواذ على ملفك" : "Claim your profile"}
      </h1>

      {!token && (
        <p className="text-sm text-muted-foreground">
          {ar ? "الرابط ناقص." : "This link is incomplete."}
        </p>
      )}

      {state === "error" && <p className="text-sm text-destructive max-w-xs">{error}</p>}

      {state === "working" && <Loader2 className="w-5 h-5 animate-spin text-primary" />}

      {!user && token && (
        <>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            {ar
              ? "سجّل الدخول أو أنشئ حسابًا بنفس الرابط، وهنربط الملف بحسابك تلقائيًا."
              : "Sign in or create an account, and we will bind this profile to it automatically."}
          </p>
          <Button
            className="w-full max-w-xs"
            onClick={() => navigate(`/signup?next=${encodeURIComponent(`/claim/${token}`)}`)}
          >
            {ar ? "إنشاء حساب" : "Create an account"}
          </Button>
          <Button
            variant="outline"
            className="w-full max-w-xs"
            onClick={() => navigate(`/login?next=${encodeURIComponent(`/claim/${token}`)}`)}
          >
            {ar ? "تسجيل الدخول" : "Sign in"}
          </Button>
        </>
      )}

      {user && state === "error" && (
        <Button variant="outline" onClick={() => navigate("/profile")}>
          {ar ? "الذهاب إلى ملفي" : "Go to my profile"}
        </Button>
      )}
    </div>
  );
};

export default ClaimProfile;
