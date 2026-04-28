import { forwardRef } from "react";
import { ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import SectionHeader from "./SectionHeader";

const certifications = [
  { id: "c1", name: { en: "Verified Local Experience", ar: "تجربة محلية موثقة" }, description: { en: "All experiences are vetted and led by verified local hosts", ar: "جميع التجارب مُراجعة ويقودها مضيفون محليون موثقون" }, icon: "✅" },
  { id: "c2", name: { en: "Eco-Tourism Certified", ar: "شهادة السياحة البيئية" }, description: { en: "Meeting international standards for sustainable tourism", ar: "تلبية المعايير الدولية للسياحة المستدامة" }, icon: "🌱" },
  { id: "c3", name: { en: "Community Impact Verified", ar: "أثر مجتمعي موثق" }, description: { en: "Revenue directly supports local communities and artisans", ar: "العائدات تدعم المجتمعات المحلية والحرفيين مباشرة" }, icon: "💚" },
  { id: "c4", name: { en: "Safety & Insurance", ar: "الأمان والتأمين" }, description: { en: "All trips include liability coverage and safety protocols", ar: "جميع الرحلات تشمل تغطية تأمينية وبروتوكولات أمان" }, icon: "🛡️" },
];

const Certifications = forwardRef((_props: {}, ref: React.Ref<HTMLDivElement>) => {
  const { lang } = useI18n();

  return (
    <div ref={ref}>
      <SectionHeader titleKey="section.certifications" onSeeAll={() => {}}>
        <div className="space-y-3 px-4">
          {certifications.map((c) => (
            <div key={c.id} className="flex items-start gap-3 bg-card rounded-xl p-4 shadow-card border border-border">
              <span className="text-2xl shrink-0">{c.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <h3 className="text-sm font-semibold text-foreground">{c.name[lang]}</h3>
                  <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{c.description[lang]}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionHeader>
    </div>
  );
});
Certifications.displayName = "Certifications";

export default Certifications;
