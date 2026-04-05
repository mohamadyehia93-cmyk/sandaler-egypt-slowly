import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, Plus, Users, Calendar, MoreVertical, Search, Filter, MapPin } from "lucide-react";
import { useState } from "react";

const MyTrips = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"upcoming" | "active" | "past">("upcoming");

  const tabs = [
    { key: "upcoming" as const, label: lang === "ar" ? "قادمة" : "Upcoming", count: 4 },
    { key: "active" as const, label: lang === "ar" ? "جارية" : "Active", count: 1 },
    { key: "past" as const, label: lang === "ar" ? "سابقة" : "Past", count: 12 },
  ];

  const trips = {
    upcoming: [
      { id: "t1", title: lang === "ar" ? "دلتا النيل ٥ أيام" : "Nile Delta 5-Day Tour", date: "Apr 15–19", travelers: 8, maxTravelers: 12, price: "4,500 EGP", image: "https://images.unsplash.com/photo-1590077428593-a55bb07c4665?w=100&q=80" },
      { id: "t2", title: lang === "ar" ? "واحة سيوة عطلة نهاية الأسبوع" : "Siwa Weekend Escape", date: "Apr 25–27", travelers: 14, maxTravelers: 15, price: "3,200 EGP", image: "https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=100&q=80" },
    ],
    active: [
      { id: "t3", title: lang === "ar" ? "جولة صعيد مصر" : "Upper Egypt Tour", date: "Apr 3–10", travelers: 10, maxTravelers: 10, price: "6,000 EGP", image: "https://images.unsplash.com/photo-1568322445389-f64c5bb0df1d?w=100&q=80" },
    ],
    past: [
      { id: "t4", title: lang === "ar" ? "استكشاف البحر الأحمر" : "Red Sea Explorer", date: "Mar 15–20", travelers: 12, maxTravelers: 12, price: "5,500 EGP", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=100&q=80" },
    ],
  };

  return (
    <div className="min-h-screen bg-surface pb-24">
      <header className="bg-role-trip-organizer text-white px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigate("/dashboard/trip-organizer")} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
          <button onClick={() => navigate("/dashboard/trip-organizer/new-trip")} className="flex items-center gap-1 bg-white/20 rounded-lg px-3 py-1.5 text-xs font-semibold">
            <Plus className="w-3.5 h-3.5" /> {lang === "ar" ? "جديد" : "New"}
          </button>
        </div>
        <h1 className="text-lg font-bold">{lang === "ar" ? "رحلاتي" : "My Trips"}</h1>
      </header>

      <div className="px-4 pt-3 pb-2">
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-card rounded-lg px-3 py-2 border border-border">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder={lang === "ar" ? "ابحث..." : "Search..."} className="bg-transparent text-sm flex-1 outline-none text-foreground placeholder:text-muted-foreground" />
          </div>
          <button className="p-2 bg-card rounded-lg border border-border"><Filter className="w-4 h-4 text-muted-foreground" /></button>
        </div>
      </div>

      <div className="flex gap-1 px-4 pb-3">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${activeTab === tab.key ? "bg-role-trip-organizer text-white" : "bg-card text-muted-foreground border border-border"}`}>
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <div className="px-4 space-y-2">
        {trips[activeTab].map((trip) => (
          <div key={trip.id} className="bg-card rounded-xl shadow-card overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex gap-3 p-3">
              <img src={trip.image} alt={trip.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-semibold text-foreground line-clamp-1">{trip.title}</h3>
                  <button onClick={(e) => e.stopPropagation()} className="p-0.5 text-muted-foreground"><MoreVertical className="w-4 h-4" /></button>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                  <Calendar className="w-3 h-3" /> {trip.date}
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-0.5"><Users className="w-3 h-3" /> {trip.travelers}/{trip.maxTravelers}</span>
                  <span className="font-semibold text-foreground">{trip.price}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyTrips;