import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { SEO } from "@/components/SEO";
import BottomNav from "@/components/BottomNav";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ABOUT_SECTIONS, HOME_PURPOSE_LINE } from "@/content/siteCopy";

/**
 * /about — bilingual "من نحن" page.
 * The body copy is intentionally an owner-editable placeholder (see
 * src/content/siteCopy.ts). No mission statement is invented here.
 */
const About = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const Back = lang === "ar" ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-surface pb-24">
      <SEO url="/about" />

      <header className="flex items-center gap-2 px-4 py-3 bg-primary-dark">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-background/20 flex items-center justify-center"
          aria-label={lang === "ar" ? "رجوع" : "Back"}
        >
          <Back className="w-4 h-4 text-primary-foreground" />
        </button>
        <h1 className="text-lg font-bold text-primary-foreground flex-1">
          {lang === "ar" ? "من نحن" : "About Sandal"}
        </h1>
        <LanguageToggle
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-primary-foreground hover:bg-background/20"
          iconClassName="w-3.5 h-3.5"
        />
      </header>

      <div className="px-4 pt-5 space-y-4 max-w-lg mx-auto">
        {/* Purpose line — same editable default as the home page */}
        <p className="text-base font-semibold leading-relaxed text-foreground">
          {lang === "ar" ? HOME_PURPOSE_LINE.ar : HOME_PURPOSE_LINE.en}
        </p>

        {ABOUT_SECTIONS.map((s) => (
          <section key={s.heading.en} className="bg-card rounded-xl shadow-card p-4">
            <h2 className="text-sm font-bold text-primary-dark mb-2">
              {lang === "ar" ? s.heading.ar : s.heading.en}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
              {lang === "ar" ? s.body.ar : s.body.en}
            </p>
          </section>
        ))}

        <button
          onClick={() => navigate("/credits")}
          className="text-xs font-medium text-muted-foreground underline underline-offset-4"
        >
          {lang === "ar" ? "حقوق الصور" : "Image credits"}
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default About;
