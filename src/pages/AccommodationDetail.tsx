import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, MapPin, Users, Clock, DoorOpen, Check, CalendarIcon } from "lucide-react";
import { useState, useMemo } from "react";
import WishlistButton from "@/components/WishlistButton";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { fetchByIdOrSlug } from "@/lib/fetchByIdOrSlug";
import ProviderBioCard from "@/components/ProviderBioCard";
import DetailTestimonials from "@/components/DetailTestimonials";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const AccommodationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useI18n();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const { data: place, isLoading } = useQuery({
    queryKey: ["accommodation", id],
    queryFn: () => fetchByIdOrSlug("accommodations", id!),
    enabled: !!id,
  });

  const availabilityMap = useMemo(() => {
    if (!place) return new Map<string, "available" | "limited" | "booked">();
    const seed = place.id.split("").reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
    const statuses: ("available" | "limited" | "booked")[] = ["available", "limited", "booked"];
    const map = new Map<string, "available" | "limited" | "booked">();
    const today = new Date();
    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      map.set(format(d, "yyyy-MM-dd"), statuses[(seed + i * 7) % 3]);
    }
    return map;
  }, [place?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 space-y-4">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (!place) return <div className="p-8 text-center text-muted-foreground">Not found</div>;

  const name = lang === "ar" ? place.name_ar : place.name_en;
  const description = lang === "ar" ? place.description_ar : place.description_en;
  const hostName = lang === "ar" ? place.host_name_ar : place.host_name_en;
  const amenities = place.amenities || [];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="relative h-64">
        <img src={place.image || "/placeholder.svg"} alt={name} className="w-full h-full object-cover" />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 rounded-full bg-background/80 backdrop-blur-sm">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <WishlistButton />
        {place.accommodation_type && (
          <div className="absolute bottom-3 left-4">
            <span className="bg-primary/90 text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full">
              {place.accommodation_type}
            </span>
          </div>
        )}
      </div>

      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-foreground mb-1">{name}</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
          {hostName && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {lang === "ar" ? "مضيفك:" : "Host:"} {hostName}</span>}
          {place.rating > 0 && <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {place.rating} ({place.reviews_count})</span>}
        </div>

        {/* Host Bio */}
        {place.host_id && <ProviderBioCard providerId={place.host_id} roleLabel={{ en: "Your Host", ar: "مضيفك" }} />}

        {/* Description */}
        {description && (
          <>
            <h2 className="text-base font-bold text-primary-dark mb-2 mt-6">{lang === "ar" ? "عن المكان" : "About This Place"}</h2>
            <p className="text-sm text-foreground leading-relaxed mb-5">{description}</p>
          </>
        )}

        {/* Availability Calendar */}
        <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "التوافر" : "Availability"}</h2>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-full justify-start text-left font-normal mb-2", !selectedDate && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : (lang === "ar" ? "اختر تاريخاً" : "Pick a date")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              modifiers={{
                available: Array.from(availabilityMap.entries()).filter(([, s]) => s === "available").map(([k]) => new Date(k)),
                limited: Array.from(availabilityMap.entries()).filter(([, s]) => s === "limited").map(([k]) => new Date(k)),
                booked: Array.from(availabilityMap.entries()).filter(([, s]) => s === "booked").map(([k]) => new Date(k)),
              }}
              modifiersStyles={{
                available: { backgroundColor: "hsl(142 71% 93%)", color: "hsl(142 71% 29%)" },
                limited: { backgroundColor: "hsl(38 92% 90%)", color: "hsl(38 92% 35%)" },
                booked: { backgroundColor: "hsl(0 84% 92%)", color: "hsl(0 84% 40%)" },
              }}
            />
          </PopoverContent>
        </Popover>
        {selectedDate && (() => {
          const key = format(selectedDate, "yyyy-MM-dd");
          const status = availabilityMap.get(key);
          const statusLabel = status === "available" ? (lang === "ar" ? "✅ متاح" : "✅ Available") : status === "limited" ? (lang === "ar" ? "⚠️ محدود" : "⚠️ Limited") : (lang === "ar" ? "❌ محجوز" : "❌ Booked");
          const statusClass = status === "available" ? "text-green-600 bg-green-50" : status === "limited" ? "text-amber-600 bg-amber-50" : "text-red-500 bg-red-50";
          return <div className={`p-3 rounded-lg text-sm font-medium mb-5 ${statusClass}`}>{format(selectedDate, "EEEE, MMM d")} — {statusLabel}</div>;
        })()}
        {!selectedDate && (
          <div className="flex gap-3 text-[10px] text-muted-foreground mb-5">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-200 inline-block" /> {lang === "ar" ? "متاح" : "Available"}</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-200 inline-block" /> {lang === "ar" ? "محدود" : "Limited"}</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-200 inline-block" /> {lang === "ar" ? "محجوز" : "Booked"}</span>
          </div>
        )}

        {/* Amenities */}
        {amenities.length > 0 && (
          <>
            <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "المرافق والخدمات" : "What's Included"}</h2>
            <div className="grid grid-cols-2 gap-2 mb-5">
              {amenities.map((a: string, i: number) => (
                <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-surface">
                  <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span className="text-xs text-foreground">{a}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* House Rules */}
        <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "قواعد المكان" : "House Rules"}</h2>
        <div className="space-y-2 mb-6">
          {[
            { icon: "🚭", text: lang === "ar" ? "ممنوع التدخين داخلياً" : "No smoking indoors" },
            { icon: "❌", text: lang === "ar" ? "إلغاء مجاني قبل ٤٨ ساعة" : "Free cancellation 48h before" },
          ].map((r, i) => (
            <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-surface">
              <span className="text-base">{r.icon}</span>
              <span className="text-xs text-foreground">{r.text}</span>
            </div>
          ))}
        </div>

        <DetailTestimonials />
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 flex items-center justify-between z-50">
        <div>
          <span className="text-lg font-bold text-primary-dark">{place.price_per_night} {t("common.egp")}</span>
          <span className="text-xs text-muted-foreground block">{t("common.perNight")}</span>
        </div>
        <button onClick={() => navigate(`/booking?type=stay&id=${place.id}`)} className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated">
          {t("common.book")}
        </button>
      </div>
    </div>
  );
};

export default AccommodationDetail;
