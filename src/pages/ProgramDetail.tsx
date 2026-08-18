import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Building2, CalendarDays, MapPin, Target, Users, Video } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import LocationChips from "@/components/LocationChips";
import MessageOwnerButton from "@/components/MessageOwnerButton";
import ShareButton from "@/components/ShareButton";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import NotFoundView from "@/components/NotFound";
import { supabase } from "@/integrations/supabase/client";
import { fetchByIdOrSlug } from "@/lib/fetchByIdOrSlug";

import { useI18n } from "@/lib/i18n";

const formatDate = (value: string | null, lang: "en" | "ar") =>
  value ? new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-EG", { dateStyle: "medium" }).format(new Date(`${value}T12:00:00`)) : null;

const ProgramDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useI18n();
  const { data, isLoading } = useQuery({
    queryKey: ["program", id],
    queryFn: () => fetchByIdOrSlug("programs", id as string),
    enabled: !!id,
  });

  const ownerId = (data as any)?.owner_id ?? null;
  const { data: owner } = useQuery({
    queryKey: ["program-owner-profile", ownerId],
    enabled: !!ownerId,
    queryFn: async () => {
      const { data: orgs } = await supabase
        .from("organizations")
        .select("id, slug, name_en, name_ar, logo, description_en, description_ar, mission_en, mission_ar")
        .eq("owner_id", ownerId)
        .eq("status", "published")
        .limit(1);
      const orgRow = orgs?.[0] as any;
      if (orgRow) {
        return {
          href: `/organization/${orgRow.slug || orgRow.id}`,
          logo: orgRow.logo as string | null,
          name_en: orgRow.name_en as string,
          name_ar: orgRow.name_ar as string | null,
          about_en: (orgRow.description_en || orgRow.mission_en) as string | null,
          about_ar: (orgRow.description_ar || orgRow.mission_ar) as string | null,
        };
      }
      // Some programs are published by a provider profile rather than an
      // organisations row — fall back to that so the section is never empty.
      const { data: provs } = await supabase
        .from("providers")
        .select("id, slug, name_en, name_ar, avatar, bio_en, bio_ar, tagline_en, tagline_ar")
        .eq("user_id", ownerId)
        .eq("status", "published")
        .limit(1);
      const prov = provs?.[0] as any;
      if (!prov) return null;
      return {
        href: `/provider/${prov.slug || prov.id}`,
        logo: prov.avatar as string | null,
        name_en: prov.name_en as string,
        name_ar: prov.name_ar as string | null,
        about_en: (prov.bio_en || prov.tagline_en) as string | null,
        about_ar: (prov.bio_ar || prov.tagline_ar) as string | null,
      };
    },
  });


  if (isLoading) return <div className="min-h-screen bg-background p-4 space-y-4"><Skeleton className="h-64 w-full" /><Skeleton className="h-28 w-full" /></div>;
  if (!data) return <NotFoundView context="program" />;

  const program = data as any;

  const title = lang === "ar" ? (program.title_ar || program.title_en) : program.title_en;
  const description = lang === "ar" ? (program.description_ar || program.description_en) : program.description_en;
  const location = lang === "ar" ? (program.location_ar || program.location_en) : program.location_en;
  const goals = Array.isArray(program.goals) ? program.goals.filter(Boolean) : [];
  const start = formatDate(program.start_date, lang);
  const end = formatDate(program.end_date, lang);

  return (
    <main className="min-h-screen bg-background pb-24">
      <div className="relative h-64 bg-secondary">
        {program.image ? <img src={program.image} alt={title} className="h-full w-full object-cover" /> : <Target className="absolute inset-0 m-auto h-12 w-12 text-muted-foreground" />}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
        <Button variant="secondary" size="icon" onClick={() => navigate(-1)} className="absolute top-4 start-4 rounded-full" aria-label={lang === "ar" ? "رجوع" : "Back"}>
          <ArrowLeft className="rtl:rotate-180" />
        </Button>
        <div className="absolute top-4 end-4"><ShareButton title={title} /></div>
        <div className="absolute bottom-4 start-4 end-4 text-background">
          {program.program_type && <span className="mb-2 inline-block rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">{program.program_type}</span>}
          <h1 className="text-xl font-bold leading-tight">{title}</h1>
        </div>
      </div>

      <div className="px-4 py-5 space-y-6">
        <LocationChips cityId={program.city_id} regionId={program.region_id} />

        {(start || end || program.volunteers_needed != null) && (
          <div className="grid grid-cols-2 gap-3">
            {(start || end) && <div className="rounded-lg border border-border bg-card p-3"><CalendarDays className="mb-2 h-4 w-4 text-primary" /><p className="text-xs font-semibold text-foreground">{start}{end ? ` — ${end}` : ""}</p></div>}
            {program.volunteers_needed != null && <div className="rounded-lg border border-border bg-card p-3"><Users className="mb-2 h-4 w-4 text-primary" /><p className="text-xs font-semibold text-foreground">{program.volunteers_needed} {lang === "ar" ? "متطوع مطلوب" : "volunteers needed"}</p></div>}
          </div>
        )}

        <section>
          <h2 className="mb-2 text-base font-bold text-primary-dark">{lang === "ar" ? "عن البرنامج" : "About the program"}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description || (lang === "ar" ? "لم تُضف المنظمة وصفاً لهذا البرنامج بعد." : "The organisation has not added a description for this program yet.")}
          </p>
        </section>

        {goals.length > 0 && <section><h2 className="mb-3 flex items-center gap-2 text-base font-bold text-foreground"><Target className="h-4 w-4 text-primary" />{lang === "ar" ? "الأهداف" : "Goals"}</h2><ul className="space-y-2">{goals.map((goal: string, index: number) => <li key={`${goal}-${index}`} className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground">{goal}</li>)}</ul></section>}

        {program.video_url && <section><h2 className="mb-3 flex items-center gap-2 text-base font-bold text-foreground"><Video className="h-4 w-4 text-primary" />{lang === "ar" ? "فيديو البرنامج" : "Program video"}</h2><video src={program.video_url} controls preload="metadata" className="w-full rounded-lg bg-foreground" /></section>}

        {location && <div className="flex items-start gap-2 rounded-lg border border-border bg-card p-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span className="text-sm text-foreground">{location}</span></div>}

        {/* The organisation behind the program — only rendered when a real published row exists. */}
        {owner && (
          <section>
            <h2 className="mb-3 text-base font-bold text-primary-dark">{lang === "ar" ? "المنظمة" : "The Organization"}</h2>
            <button
              onClick={() => navigate(owner.href)}
              className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-start transition-colors hover:border-primary"
            >
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-2xl">
                {owner.logo && owner.logo.startsWith("http")
                  ? <img src={owner.logo} alt="" className="h-full w-full object-cover" />
                  : (owner.logo || <Building2 className="h-5 w-5 text-primary" />)}
              </div>
              <span className="flex-1 text-sm font-semibold text-foreground">{lang === "ar" ? (owner.name_ar || owner.name_en) : owner.name_en}</span>
              <span className="text-[10px] font-semibold text-primary">{lang === "ar" ? "عرض الملف" : "View profile"} →</span>
            </button>

            {(lang === "ar" ? (owner.about_ar || owner.about_en) : owner.about_en) && (
              <>
                <h3 className="mb-2 mt-5 text-sm font-bold text-foreground">{lang === "ar" ? "عن المنظمة" : "About the organization"}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {lang === "ar" ? (owner.about_ar || owner.about_en) : owner.about_en}
                </p>
              </>
            )}
          </section>
        )}

        {/* Take action — four routes; each page states plainly what it can and cannot do. */}
        <section>
          <h2 className="mb-3 text-base font-bold text-primary-dark">{lang === "ar" ? "كيف تشارك" : "How to Take Part"}</h2>
          <div className="grid grid-cols-2 gap-3">
            {actionOptions.map((opt) => (
              <button
                key={opt.key}
                disabled={!program.owner_id}
                onClick={() => navigate(`/program/${id}/${opt.key}`)}
                className={`flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 shadow-card transition-colors ${
                  program.owner_id ? "hover:border-primary" : "cursor-not-allowed opacity-50"
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${opt.color}`}>
                  <opt.icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold text-foreground">{opt.label[lang]}</span>
                <span className="text-center text-[10px] leading-tight text-muted-foreground">{opt.desc[lang]}</span>
              </button>
            ))}
          </div>
          {!program.owner_id && (
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              {lang === "ar"
                ? "لا توجد جهة يمكنها استقبال طلبات المشاركة في هذا البرنامج حالياً، وهو معروض للتعريف فقط."
                : "No organisation can currently receive requests for this program, so it is listed for information only."}
            </p>
          )}
        </section>

        {program.owner_id && (
          <MessageOwnerButton ownerId={program.owner_id} kind="auto" label={lang === "ar" ? "مراسلة المنظمة" : "Message organization"} />
        )}
      </div>


    </main>
  );
};

export default ProgramDetail;