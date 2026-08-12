import MessageOwnerButton from "@/components/MessageOwnerButton";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, MapPin, Users, Clock, DoorOpen, Check, CalendarIcon } from "lucide-react";
import { useState, useMemo } from "react";
import WishlistButton from "@/components/WishlistButton";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { fetchByIdOrSlug } from "@/lib/fetchByIdOrSlug";
import ProviderBioCard from "@/components/ProviderBioCard";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import NotFoundView from "@/components/NotFound";

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 space-y-4">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (!place) return <NotFoundView context="stay" />;

  const name = lang === "ar" ? (place.name_ar || place.name_en) : place.name_en;
  const description = lang === "ar" ? (place.description_ar || place.description_en) : place.description_en;
  const hostName = lang === "ar" ? (place.host_name_ar || place.host_name_en) : place.host_name_en;
  const amenities = place.amenities || [];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="relative h-64">
        <img src={place.image || "/placeholder.svg"} alt={name} className="w-full h-full object-cover" />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 rounded-full bg-background/80 backdrop-blur-sm">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <WishlistButton itemType="accommodation" itemId={place?.id} />
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
        {place.host_id && (
          <div className="mt-3 flex">
            <MessageOwnerButton ownerId={place.host_id} kind="provider" label={lang === "ar" ? "مراسلة المضيف" : "Message host"} />
          </div>
        )}


        {/* Description */}
        {description && (
          <>
            <h2 className="text-base font-bold text-primary-dark mb-2 mt-6">{lang === "ar" ? "عن المكان" : "About This Place"}</h2>
            <p className="text-sm text-foreground leading-relaxed mb-5">{description}</p>
          </>
        )}

        {/* Preferred date — the host confirms availability. The app has no live
            availability data for stays, so no status colours are shown. */}
        <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "التاريخ المفضل" : "Preferred Date"}</h2>
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
            />
          </PopoverContent>
        </Popover>
        <p className="text-[11px] text-muted-foreground mb-5">
          {lang === "ar"
            ? "يؤكد المضيف التوافر بعد إرسال طلبك."
            : "The host confirms availability after you send your request."}
        </p>

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

      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 flex items-center justify-between z-50">
        <div>
          <span className="text-lg font-bold text-primary-dark">{place.price_per_night} {t("common.egp")}</span>
          <span className="text-xs text-muted-foreground block">{t("common.perNight")}</span>
        </div>
        <button onClick={() => navigate(`/booking?type=stay&id=${place.id}`)} className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated">
          {lang === "ar" ? "إرسال طلب" : "Send request"}
        </button>
      </div>
    </div>
  );
};

export default AccommodationDetail;
