import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { Sparkles, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      navigate("/profile");
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {lang === "ar" ? "تسجيل الدخول" : "Welcome Back"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {lang === "ar" ? "سجّل دخولك للمتابعة" : "Sign in to continue"}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder={lang === "ar" ? "كلمة المرور" : "Password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10"
              required
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3">
              {showPassword ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
            </button>
          </div>

          <div className="text-right">
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              {lang === "ar" ? "نسيت كلمة المرور؟" : "Forgot password?"}
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? (lang === "ar" ? "جاري التسجيل..." : "Signing in...")
              : (lang === "ar" ? "تسجيل الدخول" : "Sign In")}
          </Button>
        </form>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">{lang === "ar" ? "أو" : "or"}</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <Button
          variant="outline"
          className="w-full gap-2"
          disabled={oauthLoading}
          onClick={async () => {
            setOauthLoading(true);
            const result = await lovable.auth.signInWithOAuth("google", {
              redirect_uri: window.location.origin,
            });
            setOauthLoading(false);
            if (result.error) {
              toast.error(result.error instanceof Error ? result.error.message : "Google sign-in failed");
            } else if (!result.redirected) {
              navigate("/profile");
            }
          }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          {oauthLoading
            ? (lang === "ar" ? "جاري التسجيل..." : "Signing in...")
            : (lang === "ar" ? "تسجيل بحساب Google" : "Continue with Google")}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {lang === "ar" ? "ليس لديك حساب؟" : "Don't have an account?"}{" "}
          <Link to="/signup" className="text-primary font-medium hover:underline">
            {lang === "ar" ? "سجّل الآن" : "Sign Up"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
