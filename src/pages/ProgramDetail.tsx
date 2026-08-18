import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Building2, CalendarDays, MapPin, Target, Users, Video } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import LocationChips from "@/components/LocationChips";
import MessageOwnerButton from "@/components/MessageOwnerButton";
import ShareButton from "@/components/ShareButton";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import NotFoundView from "@/components/NotFound";
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
        {org && (
          <section>
            <h2 className="mb-3 text-base font-bold text-primary-dark">{lang === "ar" ? "المنظمة" : "The Organization"}</h2>
            <button
              onClick={() => navigate(`/organization/${org.slug || org.id}`)}
              className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-start transition-colors hover:border-primary"
            >
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-2xl">
                {org.logo && org.logo.startsWith("http") ? <img src={org.logo} alt="" className="h-full w-full object-cover" /> : (org.logo || <Building2 className="h-5 w-5 text-primary" />)}
              </div>
              <span className="flex-1 text-sm font-semibold text-foreground">{lang === "ar" ? (org.name_ar || org.name_en) : org.name_en}</span>
              <span className="text-[10px] font-semibold text-primary">{lang === "ar" ? "عرض الملف" : "View profile"} →</span>
            </button>
          </section>
        )}

        {/* How to take part — only actions this program can actually honour. */}
        <section>
          <h2 className="mb-3 text-base font-bold text-primary-dark">{lang === "ar" ? "كيف تشارك" : "How to Take Part"}</h2>
          {program.owner_id ? (
            <>
              <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
                {lang === "ar"
                  ? "التطوع والمشاركة في هذا البرنامج يتم تنسيقهما مباشرة مع المنظمة عبر الرسائل داخل التطبيق."
                  : "Volunteering and taking part in this program are arranged directly with the organisation through in-app messages."}
              </p>
              <MessageOwnerButton ownerId={program.owner_id} kind="auto" label={lang === "ar" ? "مراسلة المنظمة" : "Message organization"} />
            </>
          ) : (
            <p className="text-xs leading-relaxed text-muted-foreground">
              {lang === "ar"
                ? "لا توجد جهة يمكنها استقبال طلبات المشاركة في هذا البرنامج حالياً، وهو معروض للتعريف فقط."
                : "No organisation can currently receive requests for this program, so it is listed for information only."}
            </p>
          )}
        </section>
      </div>

    </main>
  );
};

export default ProgramDetail;