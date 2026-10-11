import { useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { checkedLabel } from "@/lib/gettingAround";
import { STAY_BADGES, useCityStays, type StayBadge } from "@/lib/whereToStay";
import StayChip from "@/components/whereToStay/StayChip";
import SectionEmptyState from "@/components/SectionEmptyState";
import NotFoundView from "@/components/NotFound";
import DetailSkeleton from "@/components/DetailSkeleton";
import { SEO } from "@/components/SEO";
import { fmtNumber } from "@/components/listing/format";

/**
 * INTEGRITY RULE: every card is a real, admin-curated stay row; local hosts are real
 * provider-owned published accommodations in this city. Nothing is invented.
 */
const WhereToStay = () => {
  const { citySlug } = useParams();
  const navigate = useNavigate();
  const { hash } = useLocation();
  const { lang } = useI18n();
  const ar = lang === "ar";
  const Back = ar ? ArrowRight : ArrowLeft;

  const { data: city, isLoading: lc } = useQuery({
    queryKey: ["city", citySlug, "wts"],
    enabled: !!citySlug,
    queryFn: async () => (await supabase.from("cities").select("id,name_en,name_ar").eq("id", citySlug!).maybeSingle()).data,
  });
  const { data, isLoading } = useCityStays(citySlug);
  const { data: hosts = [] } = useQuery({
    queryKey: ["wts-hosts", citySlug],
    enabled: !!citySlug,
    queryFn: async () =>
      ((await (supabase as any).from("accommodations").select("id,slug,name_en,name_ar,host_name_en,host_name_ar,image,price_per_night,host_id,listing_kind")
        .eq("city_id", citySlug!).eq("status", "published").not("host_id", "is", null)).data || []) as any[],
  });
  const { data: article } = useQuery({
    queryKey: ["wts-article", data?.page?.editorial_article_slug],
    enabled: !!data?.page?.editorial_article_slug,
    queryFn: async () => (await supabase.from("posts").select("slug,title_en,title_ar,read_time_minutes").eq("slug", data!.page.editorial_article_slug).eq("status", "published").maybeSingle()).data,
  });

  useEffect(() => {
    if (!hash || !data) return;
    const el = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (el) setTimeout(() => el.scrollIntoView({ block: "start" }), 50);
  }, [hash, data]);

  if (lc || isLoading) return <DetailSkeleton variant="city" />;
  if (!city) return <NotFoundView context="city" />;

  const cityName = ar ? city.name_ar || city.name_en : city.name_en;
  const page = data?.page;
  const stays = data?.stays || [];
  const hosted = hosts.filter((h) => h.listing_kind !== "editorial");
  const L = (r: any, k: string) => (ar ? r[`${k}_ar`] || r[`${k}_en`] : r[`${k}_en`] || r[`${k}_ar`]);
  const preamble = page ? L(page, "preamble") : null;
  const notes: string[] = (page && (ar ? (page.notes_ar?.length ? page.notes_ar : page.notes_en) : page.notes_en)) || [];
  const pageChecked = page?.verified_at
    ? new Date(page.verified_at + "T00:00:00").toLocaleDateString(ar ? "ar-EG" : "en-GB", { month: "short", year: "numeric" })
    : null;

  const facts = (s: any) => [
    [ar ? "السعر" : "Price", s.price_range],
    [ar ? "الغرف" : "Rooms", s.rooms_text],
    [ar ? "المرافق" : "Amenities", L(s, "amenities")],
    [ar ? "المنطقة" : "Area", L(s, "area")],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <div className="min-h-screen bg-background pb-24">
      <SEO title={ar ? `أين تقيم في ${cityName}` : `Where to stay in ${cityName}`} description={preamble?.slice(0, 155) || undefined} url={`/where-to-stay/${city.id}`} />
      <div className="max-w-[680px] mx-auto px-4">
        <button type="button" onClick={() => navigate(`/city/${city.id}`)} className="inline-flex items-center gap-1.5 min-h-[44px] mt-2 text-sm font-semibold text-primary-dark">
          <Back className="w-4 h-4" /> {cityName}
        </button>

        <header className="pt-2 pb-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-primary-dark">{ar ? "الإقامة" : "Where to stay"}</p>
          <h1 className={`listing-title ${ar ? "lang-ar" : "lang-en"} text-foreground text-3xl mt-1`}>
            {ar ? `أين تقيم في ${cityName}` : `Where to stay in ${cityName}`}
          </h1>
          {preamble && <p className={`article-standfirst ${ar ? "lang-ar" : "lang-en"} text-foreground mt-3`}>{preamble}</p>}
          {pageChecked && <p className="text-[12px] text-muted-foreground mt-2">{ar ? `آخر تحقق ${pageChecked}` : `Last verified ${pageChecked}`}</p>}
        </header>

        {stays.length === 0 && hosted.length === 0 && (
          <section className="py-6 border-t border-border">
            <SectionEmptyState kind="stays" placeEn={city.name_en} placeAr={city.name_ar} className="!px-0" />
          </section>
        )}

        {stays.length > 0 && (
          <>
            <nav aria-label={ar ? "مقارنة سريعة" : "Quick comparison"} className="flex gap-2.5 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-4">
              {stays.map((s) => <StayChip key={s.slug} s={s} ar={ar} />)}
            </nav>
            <div className="space-y-4">
              {stays.map((s) => {
                const b = s.badge ? STAY_BADGES[s.badge as StayBadge] : null;
                const border = s.recommended ? "border-s-primary" : s.caution ? "border-s-ochre" : "border-s-border";
                const actions = [1, 2, 3]
                  .map((i) => ({ label: (ar && s[`action_${i}_label_ar`]) || s[`action_${i}_label_en`], url: s[`action_${i}_url`] }))
                  .filter((a) => a.label && a.url);
                const checked = checkedLabel(s.verified_at || page?.verified_at, ar);
                return (
                  <article key={s.slug} id={s.slug} className={`scroll-mt-4 rounded-xl border border-border border-s-4 ${border} bg-card p-4`}>
                    {L(s, "stay_type") && <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{L(s, "stay_type")}</p>}
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      <h2 className="listing-h2 lang-en text-foreground !text-xl" dir="auto">{s.name}</h2>
                      {b && <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${b.caution ? "bg-ochre-soft text-ochre" : "bg-primary/10 text-primary-dark"}`}>{ar ? b.ar : b.en}</span>}
                    </div>
                    {L(s, "editorial_note") && <p className="text-[15px] leading-7 text-foreground/90 mt-2">{L(s, "editorial_note")}</p>}
                    {facts(s).length > 0 && (
                      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 mt-3 text-[13px]">
                        {facts(s).map(([k, v]) => (
                          <div key={k} className="contents">
                            <dt className="text-muted-foreground">{k}</dt>
                            <dd className="text-foreground">{v}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                    {actions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {actions.map((a, i) => (
                          <a key={a.url + i} href={a.url} target={a.url.startsWith("tel:") ? undefined : "_blank"} rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-lg text-sm font-semibold focus-ring ${i === 0 ? "bg-primary text-primary-foreground hover:bg-primary-dark" : "border border-border text-foreground hover:bg-muted"}`}>
                            <span dir="auto">{a.label}</span> <ExternalLink className="w-3.5 h-3.5 opacity-70" aria-hidden />
                          </a>
                        ))}
                      </div>
                    )}
                    {checked && <p className="text-[11px] text-muted-foreground text-end mt-3">{checked}</p>}
                  </article>
                );
              })}
            </div>
          </>
        )}

        {hosted.length > 0 && (
          <section className="mt-8">
            <h2 className={`listing-h2 ${ar ? "lang-ar" : "lang-en"} text-foreground mb-3`}>{ar ? "مضيفون محليون" : "Local hosts"}</h2>
            <div className="space-y-3">
              {hosted.map((t) => (
                <Link key={t.id} to={`/accommodation/${t.slug || t.id}`} className="flex gap-3 items-center rounded-xl bg-success/5 border border-success/25 p-3">
                  {t.image ? <img src={t.image} alt="" className="w-20 h-16 rounded-lg object-cover flex-shrink-0" /> : <div className="w-20 h-16 rounded-lg bg-success/10 flex-shrink-0" />}
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground line-clamp-1">{L(t, "name")}</p>
                    {L(t, "host_name") && <p className="text-[13px] text-muted-foreground line-clamp-1">{L(t, "host_name")}</p>}
                    {t.price_per_night ? <p className="text-[13px] font-semibold text-success">{fmtNumber(t.price_per_night, ar)} {ar ? "ج.م / ليلة" : "EGP / night"}</p> : null}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {article && (
          <Link to={`/post/${article.slug}`} className="block mt-8 rounded-xl border-2 border-dashed border-border p-4 hover:border-primary/40">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary-dark">{ar ? "قراءة أطول" : "The longer piece"}</p>
            <p className={`listing-h2 ${ar ? "lang-ar" : "lang-en"} text-foreground !text-lg mt-1`}>{L(article, "title")}</p>
            {article.read_time_minutes && <p className="text-[13px] text-muted-foreground mt-1">{ar ? `${fmtNumber(article.read_time_minutes, ar)} دقائق قراءة` : `${article.read_time_minutes} min read`}</p>}
          </Link>
        )}

        {notes.length > 0 && (
          <section className="mt-8 pt-6 border-t border-border">
            <h2 className={`listing-h2 ${ar ? "lang-ar" : "lang-en"} text-foreground mb-3`}>{ar ? "يستحق المعرفة" : "Worth knowing"}</h2>
            <ul className="list-disc ps-5 space-y-2 text-[15px] leading-7 text-foreground/90">
              {notes.map((n, i) => <li key={i}>{n}</li>)}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
};

export default WhereToStay;
