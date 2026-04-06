import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";

const ForgotPassword = () => {
  const { lang } = useI18n();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        <Link to="/login" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          {lang === "ar" ? "العودة" : "Back to login"}
        </Link>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            {lang === "ar" ? "نسيت كلمة المرور" : "Reset Password"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {lang === "ar" ? "أدخل بريدك وسنرسل رابط إعادة التعيين" : "Enter your email and we'll send a reset link"}
          </p>
        </div>

        {sent ? (
          <div className="bg-primary/10 rounded-xl p-4 text-center text-sm text-foreground">
            {lang === "ar"
              ? "تم إرسال رابط إعادة التعيين! تحقق من بريدك الإلكتروني."
              : "Reset link sent! Check your email."}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder={lang === "ar" ? "البريد الإلكتروني" : "Email"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "..." : (lang === "ar" ? "إرسال الرابط" : "Send Reset Link")}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
