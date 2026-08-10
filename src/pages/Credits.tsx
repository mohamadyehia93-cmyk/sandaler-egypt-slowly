import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { SEO } from "@/components/SEO";
import BottomNav from "@/components/BottomNav";

type Credit = {
  id: string;
  image_url: string;
  file_title: string | null;
  artist: string | null;
  license: string | null;
  license_url: string | null;
  source_url: string | null;
  used_for: string | null;
};

const PUBLIC_DOMAIN = ["CC0", "Public domain", "PD"];

const isPublicDomain = (license: string | null) =>
  !!license && PUBLIC_DOMAIN.some((p) => license.toLowerCase().startsWith(p.toLowerCase()));

const Credits = () => {
  const { lang } = useI18n();
  const isAr = lang === "ar";
  const navigate = useNavigate();
  const [credits, setCredits] = useState<Credit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("image_credits")
        .select("id,image_url,file_title,artist,license,license_url,source_url,used_for")
        .order("license", { ascending: true })
        .order("used_for", { ascending: true });
      setCredits((data as Credit[]) || []);
      setLoading(false);
    })();
  }, []);

  // Group by licence so the attribution obligation is explicit per licence.
  const groups = credits.reduce<Record<string, Credit[]>>((acc, c) => {
    const key = c.license || (isAr ? "غير محدد" : "Unspecified");
    (acc[key] ||= []).push(c);
    return acc;
  }, {});
  const groupKeys = Object.keys(groups).sort((a, b) => groups[b].length - groups[a].length);

  const Back = isAr ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-surface pb-24" dir={isAr ? "rtl" : "ltr"}>
      <SEO
        url="/credits"
        title={isAr ? "حقوق الصور" : "Image credits"}
        description={
          isAr
            ? "قائمة بمصوري الصور المستخدمة في سندل وتراخيص المشاع الإبداعي الخاصة بها."
            : "Photographer attribution and Creative Commons licence details for the images used across Sandal."
        }
      />

      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto flex items-center gap-2 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -m-2 text-foreground"
            aria-label={isAr ? "رجوع" : "Back"}
          >
            <Back className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-foreground">
            {isAr ? "حقوق الصور" : "Image credits"}
          </h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-5">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {isAr
            ? "بعض الصور على سندل مأخوذة من ويكيميديا كومنز وتُستخدم بموجب تراخيص المشاع الإبداعي أو كملكية عامة. نشكر المصورين المذكورين أدناه. كل صورة مرفقة باسم المصور والترخيص ورابط الملف الأصلي."
            : "Some of the photography on Sandal comes from Wikimedia Commons and is used under Creative Commons or public-domain terms. We credit the photographers below — each entry lists the photographer, the licence, and a link to the original file."}
        </p>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          </div>
        ) : credits.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            {isAr ? "لا توجد بيانات حقوق بعد." : "No credits recorded yet."}
          </p>
        ) : (
          <div className="mt-6 space-y-8">
            {groupKeys.map((license) => (
              <section key={license}>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-sm font-semibold text-primary-dark">{license}</h2>
                  {isPublicDomain(license) && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary-dark">
                      {isAr ? "ملكية عامة" : "Public domain"}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">({groups[license].length})</span>
                </div>

                <ul className="space-y-3">
                  {groups[license].map((c) => (
                    <li
                      key={c.id}
                      className="flex gap-3 p-3 rounded-xl bg-background border border-border"
                    >
                      <img
                        src={c.image_url}
                        alt={c.file_title || ""}
                        loading="lazy"
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-muted"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {c.used_for || c.file_title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {isAr ? "المصور: " : "Photo: "}
                          {c.artist || (isAr ? "مصور غير معروف" : "Unknown photographer")}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                          {c.license_url ? (
                            <a
                              href={c.license_url}
                              target="_blank"
                              rel="noopener noreferrer license"
                              className="text-xs font-medium text-primary inline-flex items-center gap-1"
                            >
                              {c.license}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-xs font-medium text-muted-foreground">
                              {c.license}
                            </span>
                          )}
                          {c.source_url && (
                            <a
                              href={c.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-medium text-primary inline-flex items-center gap-1"
                            >
                              {isAr ? "ملف كومنز" : "Commons file"}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        <p className="mt-10 text-xs text-muted-foreground leading-relaxed">
          {isAr
            ? "إذا كنت صاحب صورة وترى أن الإسناد غير صحيح، تواصل معنا وسنصححه أو نحذف الصورة."
            : "If you are the rights holder of an image and believe an attribution is incorrect, contact us and we will correct it or remove the image."}
        </p>
      </div>

      <BottomNav />
    </div>
  );
};

export default Credits;
