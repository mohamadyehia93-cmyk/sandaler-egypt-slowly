import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, Mail, Phone, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useState } from "react";

const HelpSupport = () => {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: { en: "How do I book an experience?", ar: "كيف أحجز تجربة؟" },
      a: { en: "Browse experiences on the Explore tab, select one, choose a date, and tap Book. You'll receive a confirmation via email.", ar: "تصفح التجارب في تبويب استكشف، اختر واحدة، حدد التاريخ، واضغط احجز. ستصلك رسالة تأكيد بالبريد." },
    },
    {
      q: { en: "Can I cancel a booking?", ar: "هل يمكنني إلغاء الحجز؟" },
      a: { en: "Yes, you can cancel up to 48 hours before the experience for a full refund. Check the cancellation policy on each listing.", ar: "نعم، يمكنك الإلغاء قبل 48 ساعة من التجربة لاسترداد كامل المبلغ. تحقق من سياسة الإلغاء في كل إعلان." },
    },
    {
      q: { en: "How does the Impact Dashboard work?", ar: "كيف تعمل لوحة التأثير؟" },
      a: { en: "Your Impact Dashboard tracks the positive effects of your slow travel — CO₂ saved, communities supported, and causes funded through your trips.", ar: "تتابع لوحة التأثير التأثيرات الإيجابية لسفرك البطيء — CO₂ الموفر، المجتمعات المدعومة، والقضايا الممولة من رحلاتك." },
    },
    {
      q: { en: "Are audio tours available offline?", ar: "هل الجولات الصوتية متاحة بدون إنترنت؟" },
      a: { en: "Yes! Tap the download icon on any audio tour to save it for offline use.", ar: "نعم! اضغط على أيقونة التحميل في أي جولة صوتية لحفظها للاستخدام بدون إنترنت." },
    },
  ];

  const contactOptions = [
    { icon: MessageCircle, label: { en: "Live Chat", ar: "محادثة مباشرة" }, desc: { en: "Available 9am–9pm", ar: "متاح 9ص–9م" } },
    { icon: Mail, label: { en: "Email Us", ar: "راسلنا" }, desc: { en: "help@sandal.travel", ar: "help@sandal.travel" } },
    { icon: Phone, label: { en: "Call Us", ar: "اتصل بنا" }, desc: { en: "+20 100 000 0000", ar: "+20 100 000 0000" } },
  ];

  return (
    <div className="min-h-screen bg-surface pb-20">
      <header className="flex items-center gap-3 px-4 py-3 bg-background sticky top-0 z-40 border-b border-border">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-secondary">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">
          {lang === "ar" ? "المساعدة والدعم" : "Help & Support"}
        </h1>
      </header>

      <div className="px-4 pt-5">
        {/* Quick Help Banner */}
        <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 mb-6 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-primary flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              {lang === "ar" ? "كيف يمكننا مساعدتك؟" : "How can we help?"}
            </p>
            <p className="text-xs text-muted-foreground">
              {lang === "ar" ? "تصفح الأسئلة الشائعة أو تواصل مع فريقنا" : "Browse FAQs or reach out to our team"}
            </p>
          </div>
        </div>

        {/* FAQ */}
        <h2 className="text-base font-bold text-foreground mb-3">
          {lang === "ar" ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
        </h2>
        <div className="space-y-2 mb-6">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl bg-card shadow-card border border-border overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3.5 text-start"
              >
                <span className="text-sm font-medium text-foreground pe-3">{faq.q[lang]}</span>
                {openFaq === i ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
              </button>
              {openFaq === i && (
                <div className="px-4 pb-3.5 pt-0">
                  <p className="text-xs text-muted-foreground leading-relaxed">{faq.a[lang]}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Options */}
        <h2 className="text-base font-bold text-foreground mb-3">
          {lang === "ar" ? "تواصل معنا" : "Contact Us"}
        </h2>
        <div className="space-y-2 mb-6">
          {contactOptions.map((opt, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-card shadow-card border border-border cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <opt.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{opt.label[lang]}</p>
                <p className="text-xs text-muted-foreground">{opt.desc[lang]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;
