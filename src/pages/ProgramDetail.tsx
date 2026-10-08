import { useQuery } from "@tanstack/react-query";
import { Building2, CalendarDays, ChevronRight, MapPin, Target, Users } from "lucide-react";
import ListingHero from "@/components/listing/ListingHero";
import KeyFacts, { type KeyFact } from "@/components/listing/KeyFacts";
import Section from "@/components/listing/Section";
import ActionBar from "@/components/listing/ActionBar";
import ReadBeforeYouGo from "@/components/listing/ReadBeforeYouGo";
import StaticMap from "@/components/listing/StaticMap";
import PosterDate, { countdownLabel } from "@/components/listing/PosterDate";
import Avatar from "@/components/AvatarFallback";
import { fmtNumber, formatSlotDay, splitStandfirst } from "@/components/listing/format";
import { useNavigate, useParams } from "react-router-dom";
import LocationChips from "@/components/LocationChips";
import MessageOwnerButton from "@/components/MessageOwnerButton";
import { Skeleton } from "@/components/ui/skeleton";
import NotFoundView from "@/components/NotFound";
import { supabase } from "@/integrations/supabase/client";
import { fetchByIdOrSlug } from "@/lib/fetchByIdOrSlug";
import { programActions as actionOptions } from "@/lib/programActions";

import { useI18n } from "@/lib/i18n";


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


  if (isLoading) return (
    <div className="min-h-screen bg-background">
      <Skeleton className="h-[56vh] max-h-[460px] w-full rounded-none" />
      <div className="max-w-[680px] mx-auto px-4 py-4 space-y-3"><Skeleton className="h-6 w-3/4" /><Skeleton className="h-24 w-full" /></div>
    </div>
  );
  if (!data) return <NotFoundView context="program" />;

  const program = data as any;
  const ar = lang === "ar";
  const title = (ar ? (program.title_ar || program.title_en) : program.title_en) || "";
  const description = (ar ? (program.description_ar || program.description_en) : program.description_en) || "";
  const location = ar ? (program.location_ar || program.location_en) : program.location_en;
  const goals = Array.isArray(program.goals) ? program.goals.filter(Boolean) : [];
  const ownerName = owner ? (ar ? owner.name_ar || owner.name_en : owner.name_en) : null;
  const ownerAbout = owner ? (ar ? owner.about_ar || owner.about_en : owner.about_en) : null;
  const { first, rest } = splitStandfirst(description);
  const start = program.start_date ? new Date(`${program.start_date}T00:00:00`) : null;
  const end = program.end_date ? new Date(`${program.end_date}T00:00:00`) : null;
  const todayIso = new Date().toISOString().slice(0, 10);
  const past = !!(program.end_date || program.start_date) && (program.end_date || program.start_date) < todayIso;
  const canTakePart = !!program.owner_id;
  // All four actions are supported by the backend whenever someone can receive them.
  const actions = canTakePart ? actionOptions : [];
  const primary = actions.find((a) => a.key === (program.volunteers_needed > 0 ? "volunteer" : program.donation_target > 0 ? "donate" : "volunteer"));
  const lat = program.latitude != null ? Number(program.latitude) : null;
  const lng = program.longitude != null ? Number(program.longitude) : null;
  const go = (key: string) => navigate(`/program/${id}/${key}`);

  const facts: KeyFact[] = [];
  if (start) facts.push({ icon: CalendarDays, label: formatSlotDay(program.start_date, ar, { day: "numeric", month: "short", year: "numeric" }) + (end && program.end_date !== program.start_date ? ` – ${formatSlotDay(program.end_date, ar, { day: "numeric", month: "short", year: "numeric" })}` : "") });
  if (program.volunteers_needed > 0) facts.push({ icon: Users, label: ar ? `${fmtNumber(program.volunteers_needed, ar)} متطوعين مطلوبين` : `${program.volunteers_needed} volunteers needed` });
  if (location) facts.push({ icon: MapPin, label: location });

  return (
    <main className="min-h-screen bg-background pb-44 lg:pb-16">
      <ListingHero
        images={[program.image].filter(Boolean)}
        title={title}
        eyebrow={[ar ? "برنامج" : "Programme", ownerName].filter(Boolean).join(" · ")}
        ar={ar}
        onBack={() => navigate(-1)}
        overlap={!!start}
        placeholder={<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/40 to-accent/40"><Target className="w-16 h-16 text-primary-dark/60" /></div>}
      />

      <div className="max-w-[680px] lg:max-w-[1040px] mx-auto px-4 lg:flex lg:gap-10 lg:items-start">
        <div className="flex-1 min-w-0 max-w-[680px]">
          {start && (
            <PosterDate start={start} end={end} ar={ar} where={location || null} past={past}
              countdown={countdownLabel(start, past, ar)} className="-mt-6 relative z-10" />
          )}
        </div>
      </div>
      <div className="mt-5"><KeyFacts facts={facts} /></div>

      <div className="max-w-[680px] lg:max-w-[1040px] mx-auto px-4 lg:flex lg:gap-10 lg:items-start">
        <div className="flex-1 min-w-0 max-w-[680px]">
          {first && <p className={`article-standfirst ${ar ? "lang-ar" : "lang-en"} text-foreground pt-6`}>{first}</p>}
          <LocationChips cityId={program.city_id} regionId={program.region_id} className="mt-3" />

          {rest && (
            <Section title={ar ? "عن البرنامج" : "About the programme"} ar={ar} className="mt-6">
              <p className="whitespace-pre-line">{rest}</p>
            </Section>
          )}

          {goals.length > 0 && (
            <Section title={ar ? "الأهداف" : "Goals"} ar={ar}>
              <ul className="space-y-2">{goals.map((g: string, i: number) => <li key={i} className="flex gap-2"><Target className="w-4 h-4 text-primary-dark mt-1.5 flex-shrink-0" />{g}</li>)}</ul>
            </Section>
          )}

          <Section id="take-part" title={ar ? "كيف تشارك" : "How you can take part"} ar={ar}>
            {actions.length > 0 ? (
              <ul className="divide-y divide-border">
                {actions.map((opt) => (
                  <li key={opt.key}>
                    <button type="button" onClick={() => go(opt.key)} className="w-full flex items-center gap-3 py-3 min-h-[56px] text-start">
                      <span className="w-10 h-10 rounded-full bg-primary/10 text-primary-dark flex items-center justify-center flex-shrink-0"><opt.icon className="w-5 h-5" /></span>
                      <span className="flex-1 min-w-0">
                        <span className="block font-semibold text-foreground">{opt.label[lang]}</span>
                        <span className="block text-[13px] text-muted-foreground">{opt.desc[lang]}</span>
                      </span>
                      <ChevronRight className={`w-5 h-5 text-muted-foreground ${ar ? "rotate-180" : ""}`} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">{ar ? "لا توجد جهة يمكنها استقبال طلبات المشاركة في هذا البرنامج حاليًا، وهو معروض للتعريف فقط." : "No organisation can currently receive requests for this programme, so it is listed for information only."}</p>
            )}
            {canTakePart && <p className="mt-3 text-[13px] text-muted-foreground">{ar ? "لا يتم الدفع داخل التطبيق. تتواصل معك المنظمة لترتيب التفاصيل." : "No payment is taken in the app. The organisation contacts you to arrange the details."}</p>}
          </Section>

          {program.video_url && (
            <Section title={ar ? "فيديو البرنامج" : "Programme video"} ar={ar}>
              <video src={program.video_url} controls preload="metadata" className="w-full rounded-xl bg-foreground" />
            </Section>
          )}

          {(lat != null && lng != null) ? (
            <Section title={ar ? "المكان" : "Where"} ar={ar}>
              <StaticMap lat={lat} lng={lng} ar={ar} label={location} title={ar ? "خريطة البرنامج" : "Programme map"} />
            </Section>
          ) : null}

          {owner && (
            <Section title={ar ? "المنظِّم" : "Organiser"} ar={ar}>
              <div className="flex gap-4 items-center">
                <Avatar src={owner.logo && owner.logo.startsWith("http") ? owner.logo : null} name={ownerName || ""} className="w-16 h-16 rounded-full flex-shrink-0" />
                <p className={`listing-h2 ${ar ? "lang-ar" : "lang-en"} !text-lg text-foreground`}>{ownerName}</p>
              </div>
              {ownerAbout && <p className="mt-3 line-clamp-4">{ownerAbout}</p>}
              <div className="flex flex-wrap gap-2 mt-4">
                <button type="button" onClick={() => navigate(owner.href)} className="min-h-[44px] px-4 rounded-full border border-border text-sm font-semibold"><Building2 className="w-4 h-4 inline me-1.5" />{ar ? "عرض الملف" : "View profile"}</button>
                {program.owner_id && <MessageOwnerButton ownerId={program.owner_id} kind="auto" label={ar ? "راسل المنظمة" : "Message organisation"} />}
              </div>
            </Section>
          )}

          <ReadBeforeYouGo cityId={program.city_id} regionId={program.region_id} ar={ar} />
        </div>

        {primary && (
          <aside className="hidden lg:block w-[320px] flex-shrink-0 sticky top-6 mt-6">
            <div className="rounded-2xl border border-border bg-card shadow-card p-4">
              <p className={`listing-h2 ${ar ? "lang-ar" : "lang-en"} text-foreground`}>{ar ? "شارك" : "Take part"}</p>
              <button type="button" onClick={() => go(primary.key)} className="mt-3 w-full h-12 rounded-xl bg-primary text-primary-foreground text-[15px] font-bold">{primary.label[lang]}</button>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {actions.filter((a) => a.key !== primary.key).map((a) => (
                  <button key={a.key} type="button" onClick={() => go(a.key)} className="min-h-[44px] rounded-xl border border-border text-[13px] font-semibold">{a.label[lang]}</button>
                ))}
              </div>
              <p className="mt-3 text-[13px] text-muted-foreground">{ar ? "لا يتم الدفع داخل التطبيق." : "No payment is taken in the app."}</p>
            </div>
          </aside>
        )}
      </div>

      {primary && (
        <ActionBar ar={ar} price={primary.label[lang]} note={ar ? "طلب مجاني · بلا دفع في التطبيق" : "Free request · no payment in the app"}
          buttonLabel={primary.label[lang]} onPrimary={() => go(primary.key)}
          onMessage={program.owner_id ? () => navigate(`/inbox?personId=${program.owner_id}&kind=user`) : undefined} />
      )}
    </main>
  );
};

export default ProgramDetail;
