import { useMemo, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { usePosts, useRegions, useCities } from "@/hooks/useListings";
import { postCategoryLabel } from "@/lib/postCategories";
import { Skeleton } from "@/components/ui/skeleton";

/** Page-scoped editorial palette (intentionally not part of the global theme). */
const INK = "#14505A";
const TEAL = "#2BBFB3";
const OCHRE = "#B6701C";
const PAPER = "#FFFCF5";
const CREAM = "#F8F5EE";
const LINE = "#e8e2d3";
const SERIF: CSSProperties = { fontFamily: '"Iowan Old Style", "Palatino Linotype", Georgia, serif' };

const OPEN_CALL_SLUG = "open-call-write-the-delta";

const REGIONS: { id: string; en: string; ar: string }[] = [
  { id: "suez-canal", en: "Suez Canal Zone", ar: "قناة السويس" },
  { id: "nile-delta", en: "Nile Delta", ar: "الدلتا" },
  { id: "upper-egypt", en: "Upper Egypt", ar: "الصعيد" },
  { id: "frontiers", en: "Frontier Coasts & Oases", ar: "الحدود" },
];

const FORMATS = [
  { type: "podcast", icon: "🎙", en: "Podcasts", ar: "بودكاست", noteEn: "Winter 2026", noteAr: "شتاء ٢٠٢٦" },
  { type: "documentary", icon: "🎥", en: "Documentaries", ar: "وثائقيات", noteEn: "Rolling", noteAr: "تباعًا" },
  { type: "photo-series", icon: "📷", en: "Photo series", ar: "سلاسل مصوّرة", noteEn: "November", noteAr: "نوفمبر" },
  { type: "interview", icon: "🗣", en: "Interviews", ar: "مقابلات", noteEn: "Next release", noteAr: "الإصدار القادم" },
  { type: "field-report", icon: "📋", en: "Field reports", ar: "تقارير ميدانية", noteEn: "After site visits", noteAr: "بعد الزيارات الميدانية" },
  { type: "recipe-video", icon: "🍳", en: "Recipe videos", ar: "فيديوهات وصفات", noteEn: "Rolling", noteAr: "تباعًا" },
  { type: "walking-guide", icon: "👣", en: "Walking guides", ar: "أدلة مشي", noteEn: "On-the-ground tested", noteAr: "مُجرَّبة على الأرض" },
];

type Chip = "all" | "getting" | "history" | "culture" | "short" | "long";

const isGetting = (p: any) => /^getting (to|from) /i.test(p.title_en || "");
const isHistory = (p: any) => /history/i.test(p.category || "");
const kindOf = (p: any): "getting" | "history" | "culture" => (isGetting(p) ? "getting" : isHistory(p) ? "history" : "culture");
const chipMatch = (p: any, c: Chip) => {
  const rt = p.read_time_minutes ?? 0;
  switch (c) {
    case "getting": return isGetting(p);
    case "history": return !isGetting(p) && isHistory(p);
    case "culture": return kindOf(p) === "culture";
    case "short": return rt > 0 && rt <= 3;
    case "long": return rt >= 4;
    default: return true;
  }
};

const monogram = (name: string) =>
  name.split(/\s+/).filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

const firstSentence = (s?: string | null) => {
  if (!s) return null;
  const m = s.trim().split(/(?<=[.!?؟])\s/)[0];
  return m.length <= 55 ? m : null;
};

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const parseDeadline = (body?: string | null) => {
  const m = body?.match(/deadline[^0-9]{0,40}(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?(?:,?\s+(\d{4}))?/i);
  if (!m) return "12 OCT 2025";
  const mon = MONTHS[MONTHS.indexOf(m[2].toLowerCase())].toUpperCase();
  return [m[1], mon, m[3]].filter(Boolean).join(" ");
};

const relTime = (iso: string, ar: boolean) => {
  const days = (Date.now() - new Date(iso).getTime()) / 864e5;
  if (days < 7) return ar ? "حُدِّث هذا الأسبوع" : "updated this week";
  if (days < 31) return ar ? "حُدِّث هذا الشهر" : "updated this month";
  return (ar ? "حُدِّث " : "updated ") + new Date(iso).toLocaleDateString(ar ? "ar-EG" : "en-GB", { month: "short", year: "numeric" });
};

const AllPosts = () => {
  const { lang } = useI18n();
  const ar = lang === "ar";
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [chip, setChip] = useState<Chip>("all");
  const { data: posts = [], isLoading } = usePosts();
  const { data: regions = [] } = useRegions();
  const { data: cities = [] } = useCities();

  const { data: draftCounts = {} } = useQuery({
    queryKey: ["posts-draft-format-counts"],
    queryFn: async () => {
      const { data } = await supabase.from("posts").select("content_type").eq("status", "draft").in("content_type", FORMATS.map((f) => f.type));
      const c: Record<string, number> = {};
      (data || []).forEach((r: any) => { c[r.content_type] = (c[r.content_type] || 0) + 1; });
      return c;
    },
  });

  const all = posts as any[];
  const openCall = all.find((p) => p.slug === OPEN_CALL_SLUG);
  const essays = useMemo(() => all.filter((p) => p.slug !== OPEN_CALL_SLUG), [all]);
  const hero = useMemo(
    () => essays.find((p) => p.is_editor_choice) || [...essays].sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at))[0],
    [essays],
  );
  const cityById = useMemo(() => Object.fromEntries((cities as any[]).map((c) => [c.id, c])), [cities]);
  const regionName = (id?: string | null) => {
    const r = (regions as any[]).find((x) => x.id === id);
    return r ? (ar ? r.name_ar || r.name_en : r.name_en) : "";
  };

  const counts = useMemo(() => {
    const c: Record<Chip, number> = { all: 0, getting: 0, history: 0, culture: 0, short: 0, long: 0 };
    essays.forEach((p) => (Object.keys(c) as Chip[]).forEach((k) => chipMatch(p, k) && c[k]++));
    return c;
  }, [essays]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return essays.filter((p) => chipMatch(p, chip) && (!q || (p.title_en || "").toLowerCase().includes(q) || (p.title_ar || "").includes(search.trim())));
  }, [essays, chip, search]);

  const grouped = useMemo(
    () =>
      REGIONS.map((r) => {
        const rc = (cities as any[]).filter((c) => c.region_id === r.id).sort((a, b) => a.name_en.localeCompare(b.name_en));
        const totalEssays = essays.filter((p) => rc.some((c) => c.id === p.city_id)).length;
        const rows = rc.map((c) => ({ city: c, items: filtered.filter((p) => p.city_id === c.id) })).filter((x) => x.items.length);
        return { ...r, cityCount: rc.length, totalEssays, rows };
      }).filter((r) => r.rows.length),
    [cities, essays, filtered],
  );

  const Back = ar ? ArrowRight : ArrowLeft;
  const L = (p: any, k: string) => (ar ? p[`${k}_ar`] || p[`${k}_en`] : p[`${k}_en`] || p[`${k}_ar`]);
  const fmtN = (n: number) => n.toLocaleString(ar ? "ar-EG" : "en-GB");

  const chips: { id: Chip; en: string; ar: string; count?: number }[] = [
    { id: "all", en: "All", ar: "الكل", count: counts.all },
    { id: "getting", en: "Getting to …", ar: "دليل الوصول", count: counts.getting },
    { id: "history", en: "History", ar: "تاريخ", count: counts.history },
    { id: "culture", en: "Culture", ar: "ثقافة", count: counts.culture },
    { id: "short", en: "Short reads · 2–3 min", ar: "قراءات قصيرة · ٢–٣ د" },
    { id: "long", en: "Long reads · 4+ min", ar: "قراءات طويلة · ٤+ د" },
  ];

  const heroCity = hero ? cityById[hero.city_id] : null;

  return (
    <div dir={ar ? "rtl" : "ltr"} className="min-h-screen pb-8" style={{ background: CREAM }}>
      {/* 1. Top bar */}
      <header className="sticky top-0 z-40 border-b" style={{ background: CREAM, borderColor: LINE }}>
        <div className="flex items-center gap-3 px-4 py-3 max-w-[960px] mx-auto">
          <button onClick={() => navigate(-1)} aria-label={ar ? "رجوع" : "Back"} className="tap-target rounded-full">
            <Back className="w-5 h-5" style={{ color: INK }} />
          </button>
          <h1 className="text-lg font-bold" style={{ color: INK }}>{ar ? "المنشورات" : "Posts"}</h1>
          <span className="text-xs text-muted-foreground ms-auto">
            {ar ? `${fmtN(all.length)} منشور` : `${all.length} published`}
          </span>
        </div>
      </header>

      <div className="max-w-[960px] mx-auto">
        {/* 2. Masthead */}
        <section className="px-5 pt-7 pb-5" style={{ borderBottom: "1px solid #1a1a1a" }}>
          <p className="text-[11px] font-bold" style={{ color: INK, letterSpacing: ar ? 0 : "0.18em" }}>
            {ar ? "سندل · مقالات وكتابات ميدانية" : "SANDAL · ESSAYS & FIELD WRITING"}
          </p>
          <p className="mt-3 text-foreground" style={{ ...SERIF, fontSize: 19, lineHeight: 1.45 }}>
            {ar ? (
              <>ثلاث مقالات لكل مدينة، تُكتب على مهل. مقال <em style={{ color: INK }}>دليل الوصول</em>، ومقال في التاريخ، ومقال في الثقافة — في الدلتا وقناة السويس والصعيد وسواحل الحدود. تتبعها تقارير ميدانية ومقابلات وسلاسل مصوّرة.</>
            ) : (
              <>Three essays a city, written slowly. One <em style={{ color: INK }}>Getting to…</em>, one history, one culture — across the Delta, the Canal Zone, Upper Egypt and the frontier coasts. Field reports, interviews and photo series follow.</>
            )}
          </p>
        </section>

        {isLoading ? (
          <div className="p-5 space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-32 w-full" />)}</div>
        ) : (
          <>
            {/* 3. Open call */}
            {openCall && (
              <button
                onClick={() => navigate(`/post/${openCall.slug}`)}
                className="relative block text-start overflow-hidden m-5 p-5"
                style={{ background: INK, borderRadius: 4, width: "calc(100% - 40px)", color: "#fff" }}
              >
                <span aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at top ${ar ? "left" : "right"}, ${TEAL} 0%, transparent 60%)`, opacity: 0.35 }} />
                <span className="relative block text-[10px] font-bold" style={{ color: TEAL, letterSpacing: ar ? 0 : "0.2em" }}>
                  {ar ? `نداء مفتوح · آخر موعد ${parseDeadline(openCall.body_en)}` : `OPEN CALL · DEADLINE ${parseDeadline(openCall.body_en)}`}
                </span>
                <span className="relative block mt-2" style={{ ...SERIF, fontSize: 20, lineHeight: 1.3 }}>{L(openCall, "title")}</span>
                {L(openCall, "excerpt") && <span className="relative block mt-2 text-[13px]" style={{ color: "#e8f4f3" }}>{L(openCall, "excerpt")}</span>}
                <span className="relative block mt-3 text-sm font-semibold" style={{ color: TEAL }}>{ar ? "اقرأ النداء ←" : "Read the brief →"}</span>
              </button>
            )}

            {/* 4. Editor's choice */}
            {hero && (
              <section className="px-5 pb-6 pt-2">
                <p className="flex items-center gap-2 text-[11px] font-bold mb-3" style={{ color: INK, letterSpacing: ar ? 0 : "0.18em" }}>
                  <span className="inline-block h-px w-4" style={{ background: INK }} />
                  {ar ? "اختيار المحرر" : "EDITOR'S CHOICE"}
                </p>
                <button onClick={() => navigate(`/post/${hero.slug || hero.id}`)} className="block w-full text-start">
                  <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16 / 10", background: PAPER, borderRadius: 2 }}>
                    {hero.image && <img src={hero.image} alt="" className="w-full h-full object-cover" />}
                    {heroCity && (
                      <span className="absolute bottom-3 start-3 px-2 py-1 text-[11px] font-bold uppercase" style={{ background: "rgba(255,255,255,0.95)", color: INK }}>
                        {(ar ? heroCity.name_ar || heroCity.name_en : heroCity.name_en)} · {regionName(heroCity.region_id)}
                      </span>
                    )}
                  </div>
                  <h2 className="mt-3 text-foreground" style={{ ...SERIF, fontSize: 26, fontWeight: 600, letterSpacing: "-0.01em", lineHeight: 1.2 }}>{L(hero, "title")}</h2>
                  {L(hero, "excerpt") && <p className="mt-2 text-sm text-foreground/80">{L(hero, "excerpt")}</p>}
                  <p className="mt-2 text-xs text-muted-foreground">
                    {hero.category && <span style={{ color: INK }} className="font-semibold">{postCategoryLabel(hero.category)[lang]}</span>}
                    {hero.read_time_minutes ? ` · ${ar ? `${fmtN(hero.read_time_minutes)} دقائق قراءة` : `${hero.read_time_minutes} min read`}` : ""}
                    {` · ${relTime(hero.updated_at, ar)}`}
                  </p>
                </button>
              </section>
            )}

            {/* 5. Filters */}
            <section className="px-5 pb-[18px] border-b" style={{ borderColor: LINE }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label={ar ? "ابحث في المقالات" : "Search essays"}
                placeholder={ar ? "ابحث في المقالات — جرّب 'مولد'، 'قطن'، 'دير'…" : `Search ${essays.length} essays — try 'moulid', 'cotton', 'monastery'…`}
                className="w-full px-3 py-2.5 text-sm outline-none text-foreground placeholder:text-muted-foreground"
                style={{ background: PAPER, border: `1px solid ${LINE}`, borderRadius: 3 }}
              />
              <div className="flex gap-2 overflow-x-auto hide-scrollbar mt-3 -mx-5 px-5">
                {chips.map((c) => {
                  const active = chip === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setChip(c.id)}
                      className="shrink-0 px-3 min-h-[36px] text-xs font-semibold whitespace-nowrap"
                      style={{ borderRadius: 999, background: active ? INK : PAPER, color: active ? "#fff" : INK, border: `1px solid ${active ? INK : LINE}` }}
                    >
                      {ar ? c.ar : c.en}{c.count !== undefined ? ` (${fmtN(c.count)})` : ""}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 6. Regions */}
            {grouped.length === 0 && <p className="px-5 py-10 text-center text-sm text-muted-foreground">{ar ? "لا توجد نتائج" : "No essays match"}</p>}
            {grouped.map((r, i) => (
              <section key={r.id} className="pt-8">
                <div className="flex items-end gap-3 px-5 pb-4">
                  <span style={{ ...SERIF, fontSize: 34, fontWeight: 400, color: INK, lineHeight: 1 }}>{ar ? fmtN(i + 1).padStart(2, "٠") : String(i + 1).padStart(2, "0")}</span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-foreground" style={{ ...SERIF, fontSize: 22, letterSpacing: "-0.01em" }}>{ar ? r.ar : r.en}</h2>
                    <p className="text-[11px] uppercase text-muted-foreground">
                      {ar ? `${fmtN(r.cityCount)} مدن · ${fmtN(r.totalEssays)} مقالة` : `${r.cityCount} cities · ${r.totalEssays} essays · ${r.ar}`}
                    </p>
                  </div>
                  <button onClick={() => navigate(`/regions/${r.id}`)} className="text-xs font-semibold min-h-[44px]" style={{ color: INK }}>
                    {ar ? "المنطقة ←" : "Region →"}
                  </button>
                </div>
                {r.rows.map(({ city, items }) => (
                  <div key={city.id} className="px-5 py-4" style={{ borderTop: "1px solid #efe9d8" }}>
                    <button onClick={() => navigate(`/getting-around/${city.id}`)} className="flex items-center gap-2 w-full text-start mb-3 min-h-[32px]">
                      <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: INK }} />
                      <span className="text-[13px] font-bold text-foreground">{ar ? city.name_ar || city.name_en : city.name_en}</span>
                      {!ar && city.name_ar && <span className="text-xs font-medium text-muted-foreground">{city.name_ar}</span>}
                      <span className="ms-auto text-[10px] uppercase text-muted-foreground">{ar ? `${fmtN(items.length)} مقالات` : `${items.length} essays`}</span>
                    </button>
                    <div className="grid grid-cols-1 min-[600px]:grid-cols-3 gap-3">
                      {items.map((p) => {
                        const k = kindOf(p);
                        const kc = k === "getting" ? TEAL : k === "history" ? OCHRE : INK;
                        const kl = k === "getting" ? (ar ? "دليل الوصول" : "GETTING TO …") : k === "history" ? (ar ? "تاريخ" : "HISTORY") : (ar ? "ثقافة" : "CULTURE");
                        const sub = ar ? null : firstSentence(p.excerpt_en);
                        return (
                          <button
                            key={p.id}
                            onClick={() => navigate(`/post/${p.slug || p.id}`)}
                            className="group flex min-[600px]:flex-col gap-3 min-[600px]:gap-0 text-start p-2 min-[600px]:p-0 overflow-hidden transition-colors hover:!border-[#14505A]"
                            style={{ background: "#fff", border: `1px solid ${LINE}`, borderRadius: 2 }}
                          >
                            <div className="relative shrink-0 w-[84px] h-[84px] min-[600px]:w-full min-[600px]:h-0 min-[600px]:pb-[65%] overflow-hidden" style={{ background: `linear-gradient(135deg, ${PAPER}, #efe7d3)` }}>
                              {p.image ? (
                                <img src={p.image} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                              ) : (
                                <span className="absolute inset-0 flex items-center justify-center" style={{ ...SERIF, fontSize: 22, color: INK }}>{monogram(city.name_en)}</span>
                              )}
                            </div>
                            <div className="min-w-0 min-[600px]:p-3">
                              <p className="text-[9px] font-bold" style={{ color: kc, letterSpacing: ar ? 0 : "0.14em" }}>
                                {kl}{p.read_time_minutes ? ` · ${ar ? `${fmtN(p.read_time_minutes)} د` : `${p.read_time_minutes} MIN`}` : ""}
                              </p>
                              <h3 className="mt-1 text-foreground line-clamp-3 text-[14px] min-[600px]:text-[15px]" style={{ ...SERIF, fontWeight: 600, lineHeight: 1.3 }}>{L(p, "title")}</h3>
                              {sub && <p className="mt-1 text-[10px] text-muted-foreground line-clamp-1">{sub}</p>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </section>
            ))}

            {/* 7. In production */}
            <section className="mt-8 px-5 pt-7 pb-8" style={{ background: "#f3eee1", borderTop: "1px solid #1a1a1a" }}>
              <p className="text-[11px] font-bold" style={{ color: INK, letterSpacing: ar ? 0 : "0.18em" }}>{ar ? "قيد الإنتاج" : "IN PRODUCTION"}</p>
              <h2 className="mt-2 text-foreground" style={{ ...SERIF, fontSize: 22, letterSpacing: "-0.01em" }}>{ar ? "ما بعد المقال" : "Beyond the essay"}</h2>
              <p className="mt-2 text-[13px] text-foreground/80">
                {ar
                  ? "صيغ نعمل عليها في الأشهر القادمة — تقارير ميدانية من الطرق التي سلكناها، ومقابلات مع أناس حافظوا على حرفة، وتسجيلات من بلدات ما زالت تجتمع حول وليّ."
                  : "Formats we're putting together over the next few months — field reports from the roads we've been on, interviews with people who kept a craft alive, and recordings from towns that still gather around a saint."}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-5">
                {FORMATS.map((f) => {
                  const n = (draftCounts as Record<string, number>)[f.type] || 0;
                  return (
                    <div key={f.type} className="px-3.5 py-3" style={{ background: PAPER, border: "1px solid #d4ccb8" }}>
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-md text-sm" style={{ background: INK }} aria-hidden>{f.icon}</span>
                      <p className="mt-2 text-xs font-bold text-foreground">{ar ? f.ar : f.en}</p>
                      {n > 0 && <p className="text-[11px] text-muted-foreground">{ar ? `${fmtN(n)} قيد الإعداد` : `${n} in progress`}</p>}
                      <p className="mt-1 text-[10px] font-bold uppercase" style={{ color: OCHRE, letterSpacing: ar ? 0 : "0.08em" }}>{ar ? f.noteAr : f.noteEn}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 8. Cadence */}
            <footer className="p-5 text-center text-[11px] text-muted-foreground" style={{ borderTop: `1px solid ${LINE}` }}>
              <span className="font-semibold" style={{ color: INK }}>
                {ar ? "تنشر سندل من مقالَين إلى ثلاث مقالات أسبوعياً." : "Sandal publishes 2–3 essays a week."}
              </span>{" "}
              {ar
                ? "كل قطعة تُراجَع مرتين، بواسطة شخص يسكن المدينة التي تغطيها أو يسكن قريباً منها."
                : "Every piece checked twice, by someone who lives in or near the town it covers."}
            </footer>
          </>
        )}
      </div>
    </div>
  );
};

export default AllPosts;
