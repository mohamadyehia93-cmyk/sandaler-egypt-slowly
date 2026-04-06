import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { Sparkles, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const Signup = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error(lang === "ar" ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل" : "Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(
        lang === "ar"
          ? "تم إنشاء الحساب! تحقق من بريدك الإلكتروني للتأكيد."
          : "Account created! Check your email to confirm."
      );
      navigate("/login");
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
            {lang === "ar" ? "إنشاء حساب" : "Create Account"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {lang === "ar" ? "انضم إلى صندل واكتشف مصر" : "Join Sandal and discover Egypt"}
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={lang === "ar" ? "الاسم" : "Display Name"}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="pl-10"
              required
            />
          </div>
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
              minLength={6}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3">
              {showPassword ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
            </button>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? (lang === "ar" ? "جاري الإنشاء..." : "Creating...")
              : (lang === "ar" ? "إنشاء حساب" : "Sign Up")}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {lang === "ar" ? "لديك حساب بالفعل؟" : "Already have an account?"}{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            {lang === "ar" ? "تسجيل الدخول" : "Sign In"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
