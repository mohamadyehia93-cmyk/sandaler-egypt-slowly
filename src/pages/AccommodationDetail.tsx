import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, MapPin, Users, Clock, DoorOpen, Heart, Check, ShoppingCart, CalendarCheck, CalendarIcon } from "lucide-react";
import { useState, useMemo } from "react";
import WishlistButton from "@/components/WishlistButton";
import { useI18n } from "@/lib/i18n";
import { accommodation, hosts } from "@/lib/sampleData";
import { accommodationToProvider } from "@/lib/providerMappings";
import ProviderBioCard from "@/components/ProviderBioCard";
import DetailTestimonials from "@/components/DetailTestimonials";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const cityCoordinates: Record<string, [number, number]> = {
  damietta: [31.4175, 31.8144], rosetta: [31.404, 30.4164], ismailia: [30.5965, 32.2715],
  "port-said": [31.2565, 32.2841], aswan: [24.0889, 32.8998], siwa: [29.2032, 25.5195],
  dahab: [28.5091, 34.5131], manzala: [31.1617, 32.0417], mansoura: [31.0409, 31.3785],
  tanta: [30.7865, 31.0004], "el-mahalla": [30.9697, 31.1667], fuwwah: [31.2039, 30.5514],
  desouk: [31.1312, 30.6463], bilbeis: [30.4214, 31.5614], suez: [29.9668, 32.5498],
  luxor: [25.6872, 32.6396], edfu: [24.978, 32.8734], esna: [25.2917, 32.5556],
  sohag: [26.5591, 31.6948], qena: [26.155, 32.7269], assiut: [27.1783, 31.1859],
  minya: [28.0871, 30.7618], fayoum: [29.3084, 30.8428], "marsa-alam": [25.0667, 34.9],
  hurghada: [27.2579, 33.8116], quseir: [26.1, 34.2833], "marsa-matrouh": [31.3543, 27.2373],
  "el-arish": [31.1313, 33.7981],
};

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const AccommodationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useI18n();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const place = accommodation.find((a) => a.id === id);

  // Generate deterministic availability statuses for 60 days based on listing id
  const availabilityMap = useMemo(() => {
    if (!place) return new Map<string, "available" | "limited" | "booked">();
    const seed = place.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const statuses: ("available" | "limited" | "booked")[] = ["available", "limited", "booked"];
    const map = new Map<string, "available" | "limited" | "booked">();
    const today = new Date();
    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const key = format(d, "yyyy-MM-dd");
      map.set(key, statuses[(seed + i * 7) % 3]);
    }
    return map;
  }, [place?.id]);

  if (!place) return <div className="p-8 text-center text-muted-foreground">Not found</div>;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero */}
      <div className="relative h-64">
        <img src={place.image} alt={place.title[lang]} className="w-full h-full object-cover" />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 rounded-full bg-background/80 backdrop-blur-sm">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <WishlistButton />
        <div className="absolute bottom-3 left-4">
          <span className="bg-primary/90 text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full">
            {place.type[lang]}
          </span>
        </div>
      </div>

      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-foreground mb-1">{place.title[lang]}</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {place.location[lang]}</span>
          <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {place.rating} ({place.reviews})</span>
        </div>

        {/* Quick Info */}
        <div className="flex gap-2 mb-5 flex-wrap">
          <span className="flex items-center gap-1 text-xs font-medium bg-secondary text-secondary-foreground px-2.5 py-1.5 rounded-full">
            <Users className="w-3.5 h-3.5" /> {lang === "ar" ? `حتى ${place.maxGuests} ضيوف` : `Up to ${place.maxGuests} guests`}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium bg-secondary text-secondary-foreground px-2.5 py-1.5 rounded-full">
            <DoorOpen className="w-3.5 h-3.5" /> {lang === "ar" ? "تسجيل الدخول" : "Check-in"} {place.checkIn}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium bg-secondary text-secondary-foreground px-2.5 py-1.5 rounded-full">
            <Clock className="w-3.5 h-3.5" /> {lang === "ar" ? "المغادرة" : "Check-out"} {place.checkOut}
          </span>
        </div>

        {/* Host Bio */}
        <ProviderBioCard providerId={accommodationToProvider[place.id]} roleLabel={{ en: "Your Host", ar: "مضيفك" }} />

        {/* Description */}
        <h2 className="text-base font-bold text-primary-dark mb-2 mt-6">{lang === "ar" ? "عن المكان" : "About This Place"}</h2>
        <p className="text-sm text-foreground leading-relaxed mb-5">{place.description[lang]}</p>

        {/* Availability */}
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
        {/* Selected date status */}
        {selectedDate && (() => {
          const key = format(selectedDate, "yyyy-MM-dd");
          const status = availabilityMap.get(key);
          const statusLabel = status === "available"
            ? (lang === "ar" ? "✅ متاح" : "✅ Available")
            : status === "limited"
            ? (lang === "ar" ? "⚠️ محدود" : "⚠️ Limited")
            : (lang === "ar" ? "❌ محجوز" : "❌ Booked");
          const statusClass = status === "available" ? "text-green-600 bg-green-50" : status === "limited" ? "text-amber-600 bg-amber-50" : "text-red-500 bg-red-50";
          return (
            <div className={`p-3 rounded-lg text-sm font-medium mb-5 ${statusClass}`}>
              {format(selectedDate, "EEEE, MMM d")} — {statusLabel}
            </div>
          );
        })()}
        {!selectedDate && (
          <div className="flex gap-3 text-[10px] text-muted-foreground mb-5">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-200 inline-block" /> {lang === "ar" ? "متاح" : "Available"}</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-200 inline-block" /> {lang === "ar" ? "محدود" : "Limited"}</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-200 inline-block" /> {lang === "ar" ? "محجوز" : "Booked"}</span>
          </div>
        )}

        {/* Amenities */}
        <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "المرافق والخدمات" : "What's Included"}</h2>
        <div className="grid grid-cols-2 gap-2 mb-5">
          {place.amenities[lang].map((a, i) => (
            <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-surface">
              <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="text-xs text-foreground">{a}</span>
            </div>
          ))}
        </div>

        {/* House Rules */}
        <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "قواعد المكان" : "House Rules"}</h2>
        <div className="space-y-2 mb-6">
          {[
            { icon: "🕐", text: lang === "ar" ? `تسجيل الدخول: ${place.checkIn}` : `Check-in: ${place.checkIn}` },
            { icon: "🕛", text: lang === "ar" ? `المغادرة: ${place.checkOut}` : `Check-out: ${place.checkOut}` },
            { icon: "🚭", text: lang === "ar" ? "ممنوع التدخين داخلياً" : "No smoking indoors" },
            { icon: "❌", text: lang === "ar" ? "إلغاء مجاني قبل ٤٨ ساعة" : "Free cancellation 48h before" },
          ].map((r, i) => (
            <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-surface">
              <span className="text-base">{r.icon}</span>
              <span className="text-xs text-foreground">{r.text}</span>
            </div>
          ))}
        </div>

        {/* Location Map */}
        {(place as any).cityId && cityCoordinates[(place as any).cityId] && (
          <>
            <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "الموقع" : "Location"}</h2>
            <div className="rounded-xl overflow-hidden border border-border shadow-card mb-6" style={{ height: 200 }}>
              <MapContainer
                center={cityCoordinates[(place as any).cityId]}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
                attributionControl={false}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={cityCoordinates[(place as any).cityId]} icon={markerIcon}>
                  <Popup>{place.title[lang]}<br /><span className="text-xs text-muted-foreground">{place.location[lang]}</span></Popup>
                </Marker>
              </MapContainer>
            </div>
          </>
        )}

        {/* Testimonials */}
        <DetailTestimonials />
      </div>

      {/* Sticky Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 flex items-center justify-between z-50">
        <div>
          <span className="text-lg font-bold text-primary-dark">{place.price} {t("common.egp")}</span>
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
