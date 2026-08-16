import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft, Users, BedDouble, Bath, Clock, Check, CalendarIcon, ScrollText, Moon, BookOpen,
} from "lucide-react";
import { format } from "date-fns";

import { useI18n } from "@/lib/i18n";
import { fetchByIdOrSlug } from "@/lib/fetchByIdOrSlug";
import { supabase } from "@/integrations/supabase/client";
import { accommodationTypeLabel } from "@/lib/listingTaxonomy";
import { cn } from "@/lib/utils";
import { str, num } from "@/lib/rowValues";

import WishlistButton from "@/components/WishlistButton";
import ShareButton from "@/components/ShareButton";
import LocationChips from "@/components/LocationChips";
import ProviderBioCard from "@/components/ProviderBioCard";
import MessageOwnerButton from "@/components/MessageOwnerButton";
import MachineTranslatedNote from "@/components/MachineTranslatedNote";
import NotFoundView from "@/components/NotFound";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * HONESTY RULE: this page renders only what the row contains. Every section
 * hides itself when its data is absent — no invented amenities, ratings,
 * policies or availability, and no badge the row has not earned.
 */
const AccommodationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useI18n();
  const ar = lang === "ar";
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [photoIdx, setPhotoIdx] = useState(0);

  const { data: place, isLoading } = useQuery({
    queryKey: ["accommodation", id],
    queryFn: () => fetchByIdOrSlug("accommodations", id!),
    enabled: !!id,
  });

  const { data: similar } = useQuery({
    queryKey: ["accommodation-similar", place?.id, place?.city_id],
    enabled: !!place,
    queryFn: async () => {
      const { data } = await supabase
        .from("accommodations")
        .select("id, slug, name_en, name_ar, image, price_per_night, currency")
        .eq("status", "published")
        .neq("id", place!.id)
        .eq("city_id", place!.city_id)
        .limit(6);
      return data ?? [];
    },
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

  const name = ar ? place.name_ar || place.name_en : place.name_en;
  const description = ar ? place.description_ar || place.description_en : place.description_en;
  const unitType = ar ? place.unit_type_ar || place.unit_type_en : place.unit_type_en;
  const houseRules = ar ? place.house_rules_ar || place.house_rules_en : place.house_rules_en;
  const cancellation = ar ? place.cancellation_ar || place.cancellation_en : place.cancellation_en;
  const hostName = ar ? place.host_name_ar || place.host_name_en : place.host_name_en;
  const amenities: string[] = (place.amenities || []).filter(Boolean);
  const typeLabel = accommodationTypeLabel(place.accommodation_type, lang);
  // EDITORIAL = Sandal's own reference entry (no owner, nothing to book).
  // HOSTED = a real person's home, managed by them.
  const isEditorial = place.listing_kind !== "hosted" || !place.host_id;

  const photos: string[] = (Array.isArray(place.images) ? place.images.filter(Boolean) : []).length
    ? place.images.filter(Boolean)
    : place.image
      ? [place.image]
      : [];
  const hero = photos[Math.min(photoIdx, Math.max(photos.length - 1, 0))];

  const currency = (place.currency || "EGP").trim();
  const money = (n: number) => `${Number(n || 0).toLocaleString(ar ? "ar-EG" : "en-US")} ${ar && currency === "EGP" ? t("common.egp") : currency}`;

  const facts = [
    place.sleeps ? { icon: Users, label: ar ? "يتسع لـ" : "Sleeps", value: String(place.sleeps) } : null,
    place.bedrooms != null ? { icon: BedDouble, label: ar ? "غرف نوم" : "Bedrooms", value: String(place.bedrooms) } : null,
    place.bathrooms != null ? { icon: Bath, label: ar ? "حمامات" : "Bathrooms", value: String(place.bathrooms) } : null,
    place.min_nights ? { icon: Moon, label: ar ? "أقل عدد ليالٍ" : "Min. nights", value: String(place.min_nights) } : null,
    place.check_in_time ? { icon: Clock, label: ar ? "الوصول" : "Check-in", value: place.check_in_time } : null,
    place.check_out_time ? { icon: Clock, label: ar ? "المغادرة" : "Check-out", value: place.check_out_time } : null,
  ].filter(Boolean) as { icon: typeof Users; label: string; value: string }[];

  return (
    <div className={`min-h-screen bg-background ${isEditorial ? "pb-10" : "pb-24"}`}>
      <div className="h-11 flex items-center justify-between px-4 bg-card sticky top-0 z-40">
        <button onClick={() => navigate(-1)} className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <span className="text-xs text-muted-foreground truncate max-w-[55%]">{typeLabel || (ar ? "مكان إقامة" : "Place to stay")}</span>
        <div className="flex gap-2">
          <ShareButton title={name} className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center" iconClassName="w-3.5 h-3.5 text-foreground" />
          <WishlistButton
            itemType="accommodation"
            itemId={place.id}
            className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center transition-transform [&>svg]:w-3.5 [&>svg]:h-3.5"
          />
        </div>
      </div>

      {/* GALLERY — only the images this row actually has */}
      {photos.length > 0 && (
        <div>
          <div className="h-[260px] bg-secondary">
            <img src={hero} alt={name} className="w-full h-full object-cover" />
          </div>
          {photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto hide-scrollbar px-4 py-2">
              {photos.map((p, i) => (
                <button
                  key={`${p}-${i}`}
                  onClick={() => setPhotoIdx(i)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 ${i === photoIdx ? "border-primary" : "border-transparent"}`}
                >
                  <img src={p} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-foreground leading-snug">{name}</h1>
        <p className="text-lg font-bold text-primary-dark mt-1">
          {money(place.price_per_night)} <span className="text-xs font-medium text-muted-foreground">{t("common.perNight")}</span>
        </p>
        <div className="flex items-center gap-2 flex-wrap mt-2">
          {isEditorial && (
            <span className="text-[11px] font-semibold bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full inline-flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {ar ? "معلومات سندال" : "Sandal guide info"}
            </span>
          )}
          {typeLabel && <span className="text-[11px] font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">{typeLabel}</span>}
          {unitType && <span className="text-[11px] font-medium bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full">{unitType}</span>}
        </div>
        <LocationChips cityId={place.city_id} regionId={place.region_id} className="mt-2" />

        {/* DESCRIPTION — near the top, the host's own words */}
        {description && (
          <>
            <h2 className="text-base font-bold text-primary-dark mb-2 mt-6">{ar ? "عن المكان" : "About this place"}</h2>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{description}</p>
            <MachineTranslatedNote meta={place.translation_meta} field={ar ? "description_ar" : "description_en"} />
          </>
        )}

        {/* FACTS */}
        {facts.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mt-6">
            {facts.map((f, i) => (
              <div key={i} className="p-3 rounded-lg bg-surface flex items-center gap-2">
                <f.icon className="w-4 h-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground">{f.label}</p>
                  <p className="text-sm font-semibold text-foreground truncate">{f.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AMENITIES */}
        {amenities.length > 0 && (
          <>
            <h2 className="text-base font-bold text-primary-dark mb-3 mt-6">{ar ? "المرافق والخدمات" : "What's included"}</h2>
            <div className="grid grid-cols-2 gap-2">
              {amenities.map((a, i) => (
                <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-surface">
                  <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span className="text-xs text-foreground">{a}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* HOUSE RULES / CANCELLATION — the host's own terms only */}
        {houseRules && (
          <>
            <h2 className="text-base font-bold text-primary-dark mb-2 mt-6 flex items-center gap-2">
              <ScrollText className="w-4 h-4 text-primary" />{ar ? "قواعد المنزل" : "House rules"}
            </h2>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{houseRules}</p>
          </>
        )}
        {cancellation && (
          <>
            <h2 className="text-base font-bold text-primary-dark mb-2 mt-6 flex items-center gap-2">
              <ScrollText className="w-4 h-4 text-primary" />{ar ? "شروط الإلغاء" : "Cancellation terms"}
            </h2>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{cancellation}</p>
          </>
        )}

        {/* PREFERRED DATE — hosted stays only; editorial entries take no requests */}
        {!isEditorial && (<>
        <h2 className="text-base font-bold text-primary-dark mb-3 mt-6">{ar ? "التاريخ المفضل" : "Preferred date"}</h2>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-full justify-start text-left font-normal mb-2", !selectedDate && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : ar ? "اختر تاريخاً" : "Pick a date"}
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
        <p className="text-[11px] text-muted-foreground">
          {ar ? "يؤكد المضيف التوافر بعد إرسال طلبك." : "The host confirms availability after you send your request."}
        </p>
        </>)}

        {/* EDITORIAL LABEL — honest about what this page is */}
        {isEditorial && (
          <div className="mt-6 rounded-xl border border-border bg-surface p-3 flex gap-2">
            <BookOpen className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              {ar
                ? "معلومة دليلية من سندال. هذا المكان غير مُدار على التطبيق، لذا لا يمكن الحجز أو المراسلة من هنا."
                : "Practical information from Sandal. This place isn't managed on the app, so it can't be booked or messaged here."}
            </p>
          </div>
        )}
      </div>

      {/* HOST — only a hosted stay has one */}
      {!isEditorial ? (
        <>
          <ProviderBioCard providerId={place.host_id} roleLabel={{ en: "Your host", ar: "مضيفك" }} />
          <div className="mx-4 mt-3 flex">
            <MessageOwnerButton ownerId={place.host_id} kind="provider" label={ar ? "مراسلة المضيف" : "Message host"} />
          </div>
        </>
      ) : null}

      {/* SIMILAR — always last */}
      {similar && similar.length > 0 && (
        <section className="px-4 mt-6">
          <h2 className="text-base font-bold text-primary-dark mb-3">{ar ? "أماكن إقامة قريبة" : "Nearby stays"}</h2>
          <div className="grid grid-cols-3 gap-3">
            {similar.map((s: Record<string, unknown> & { id: string }) => (
              <div key={s.id} onClick={() => navigate(`/stay/${str(s.slug) || s.id}`)} className="rounded-lg shadow-card bg-card overflow-hidden cursor-pointer">
                <div className="h-16 bg-secondary">
                  {str(s.image) && <img src={str(s.image)} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="p-2">
                  <h3 className="text-[11px] font-semibold text-foreground line-clamp-2">{ar ? str(s.name_ar) || str(s.name_en) : str(s.name_en)}</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {num(s.price_per_night).toLocaleString(ar ? "ar-EG" : "en-US")}{" "}
                    {ar && (str(s.currency) || "EGP") === "EGP" ? t("common.egp") : str(s.currency) || "EGP"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* REQUEST BAR — hosted stays only; no payment is taken anywhere in the app */}
      {!isEditorial && (
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 flex items-center justify-between z-50">
        <div>
          <span className="text-lg font-bold text-primary-dark">{money(place.price_per_night)}</span>
          <span className="text-xs text-muted-foreground block">{t("common.perNight")}</span>
        </div>
        <button
          onClick={() => navigate(`/booking?type=stay&id=${place.id}`)}
          className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-elevated"
        >
          {ar ? "إرسال طلب" : "Send request"}
        </button>
      </div>
      )}
    </div>
  );
};

export default AccommodationDetail;
