import MessageOwnerButton from "@/components/MessageOwnerButton";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarClock, Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useMeetups } from "@/hooks/useListings";
import BottomNav from "@/components/BottomNav";
import SessionRequestForm from "@/components/SessionRequestForm";
import { Skeleton } from "@/components/ui/skeleton";
import { SEO } from "@/components/SEO";

const Sessions = () => {
  const { lang } = useI18n();
  const ar = lang === "ar";
  const navigate = useNavigate();
  const { data: meetups = [], isLoading } = useMeetups();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-surface pb-24">
      <SEO
        title={ar ? "جلسات الخبراء | صندل" : "Expert Sessions | Sandal"}
        description={
          ar
            ? "احجز جلسة استشارية مع خبراء محليين في مصر."
            : "Request a consultation session with local experts across Egypt."
        }
      />
      <header className="sticky top-0 z-40 flex items-center gap-3 bg-background px-4 py-3">
        <button onClick={() => navigate(-1)} className="rounded-full p-1.5 hover:bg-secondary">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-foreground">{ar ? "جلسات الخبراء" : "Expert Sessions"}</h1>
      </header>

      <div className="space-y-3 px-4 py-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
        ) : meetups.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{ar ? "لا توجد جلسات متاحة" : "No sessions available yet"}</p>
          </div>
        ) : (
          meetups.map((m: any) => (
            <div key={m.id} className="rounded-xl border border-border bg-card p-3 shadow-card">
              <div className="flex gap-3">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary">
                  {m.image ? (
                    <img src={m.image} alt={ar ? m.title_ar : m.title_en} className="h-full w-full object-cover" />
                  ) : (
                    <Users className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="line-clamp-2 text-sm font-semibold text-foreground">
                    {ar ? m.title_ar : m.title_en}
                  </h2>
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <CalendarClock className="h-3 w-3" />
                    {m.meetup_date || (ar ? "مرن" : "Flexible")}
                    {m.meetup_time ? ` · ${m.meetup_time}` : ""}
                  </p>
                  {(ar ? m.location_ar : m.location_en) && (
                    <p className="text-[11px] text-muted-foreground">{ar ? m.location_ar : m.location_en}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setOpenId(openId === m.id ? null : m.id)}
                className="mt-3 w-full rounded-xl border-2 border-primary py-2.5 text-sm font-semibold text-primary"
              >
                {openId === m.id ? (ar ? "إغلاق" : "Close") : ar ? "طلب جلسة" : "Request session"}
              </button>
              {m.organizer_id && (
                <div className="mt-2 flex">
                  <MessageOwnerButton ownerId={m.organizer_id} kind="auto" label={ar ? "مراسلة المضيف" : "Message host"} />
                </div>
              )}
              {openId === m.id && (
                <div className="mt-3 border-t border-border pt-3">
                  <SessionRequestForm
                    meetupId={m.id}
                    meetupTitle={ar ? m.title_ar : m.title_en}
                    onDone={() => setOpenId(null)}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Sessions;
