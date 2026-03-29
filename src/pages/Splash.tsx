import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const SplashPage = () => {
  const { t, setLang } = useI18n();
  const navigate = useNavigate();
  const [step, setStep] = useState<"splash" | "language">("splash");

  if (step === "language") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex flex-col items-center justify-center bg-background px-6"
      >
        <div className="text-4xl mb-2">🌊</div>
        <h1 className="text-2xl font-bold text-primary-dark mb-8">{t("splash.chooseLanguage")}</h1>
        <div className="flex gap-4 w-full max-w-xs">
          <button
            onClick={() => { setLang("en"); navigate("/"); }}
            className="flex-1 py-6 rounded-xl shadow-card bg-card border-2 border-primary/20 hover:border-primary transition-colors text-center"
          >
            <span className="text-2xl block mb-1">🇬🇧</span>
            <span className="text-lg font-semibold text-foreground">English</span>
          </button>
          <button
            onClick={() => { setLang("ar"); navigate("/"); }}
            className="flex-1 py-6 rounded-xl shadow-card bg-card border-2 border-primary/20 hover:border-primary transition-colors text-center"
          >
            <span className="text-2xl block mb-1">🇪🇬</span>
            <span className="text-lg font-semibold text-foreground font-cairo">العربية</span>
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen relative flex flex-col"
    >
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1539768942893-daf53e736b68?w=800&q=80"
          alt="Rural Egypt"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
      </div>
      <div className="relative z-10 flex flex-col items-center justify-end flex-1 pb-12 px-6">
        <div className="text-5xl mb-3">🌊</div>
        <h1 className="text-4xl font-extrabold text-primary-foreground mb-1 tracking-tight">Sandal</h1>
        <p className="text-lg text-primary-foreground/80 mb-1 font-medium">Discover Egypt. Slowly.</p>
        <p className="text-base text-primary-foreground/60 mb-8 font-cairo">اكتشف مصر. ببطء.</p>
        <button
          onClick={() => setStep("language")}
          className="w-full max-w-xs py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-base shadow-elevated mb-3"
        >
          {t("splash.getStarted")}
        </button>
        <button
          onClick={() => setStep("language")}
          className="w-full max-w-xs py-3 rounded-xl bg-primary-foreground/10 backdrop-blur text-primary-foreground font-medium text-base border border-primary-foreground/20"
        >
          {t("splash.login")}
        </button>
      </div>
    </motion.div>
  );
};

export default SplashPage;
