import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, Plus, Eye, Star, Clock, MoreVertical, Search, Filter, MapPin } from "lucide-react";
import { useState } from "react";

const MyListings = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"active" | "drafts" | "paused">("active");

  const tabs = [
    { key: "active" as const, label: lang === "ar" ? "نشط" : "Active", count: 8 },
    { key: "drafts" as const, label: lang === "ar" ? "مسودات" : "Drafts", count: 2 },
    { key: "paused" as const, label: lang === "ar" ? "متوقف" : "Paused", count: 1 },
  ];

  const listings = {
    active: [
      { id: "e1", title: lang === "ar" ? "جولة النيل عند الغروب" : "Sunset Nile Boat Tour", location: lang === "ar" ? "رشيد" : "Rosetta", rating: 4.8, bookings: 24, price: "450 EGP", image: "https://images.unsplash.com/photo-1590077428593-a55bb07c4665?w=100&q=80" },
      { id: "e2", title: lang === "ar" ? "ورشة فخار تقليدي" : "Traditional Pottery Workshop", location: lang === "ar" ? "قنا" : "Qena", rating: 4.9, bookings: 18, price: "300 EGP", image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=100&q=80" },
      { id: "e3", title: lang === "ar" ? "طهي مع السكان المحليين" : "Cook with Locals", location: lang === "ar" ? "دمياط" : "Damietta", rating: 5.0, bookings: 31, price: "350 EGP", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100&q=80" },
    ],
    drafts: [
      { id: "d1", title: lang === "ar" ? "جولة الواحة الليلية" : "Night Oasis Tour", location: lang === "ar" ? "سيوة" : "Siwa", rating: 0, bookings: 0, price: "600 EGP", image: "https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=100&q=80" },
    ],
    paused: [
      { id: "p1", title: lang === "ar" ? "صيد السمك التقليدي" : "Traditional Fishing Trip", location: lang === "ar" ? "المنزلة" : "Manzala", rating: 4.6, bookings: 12, price: "200 EGP", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=100&q=80" },
    ],
  };

  const currentListings = listings[activeTab];

  return (
    <div className="min-h-screen bg-surface pb-24">
      <header className="bg-role-service-provider text-white px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigate("/dashboard/service-provider")} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
          <button onClick={() => navigate("/dashboard/service-provider/new-experience")} className="flex items-center gap-1 bg-white/20 rounded-lg px-3 py-1.5 text-xs font-semibold">
            <Plus className="w-3.5 h-3.5" /> {lang === "ar" ? "جديد" : "New"}
          </button>
        </div>
        <h1 className="text-lg font-bold">{lang === "ar" ? "قوائمي" : "My Listings"}</h1>
      </header>

      <div className="px-4 pt-3 pb-2">
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-card rounded-lg px-3 py-2 border border-border">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder={lang === "ar" ? "ابحث..." : "Search..."} className="bg-transparent text-sm flex-1 outline-none text-foreground placeholder:text-muted-foreground" />
          </div>
          <button className="p-2 bg-card rounded-lg border border-border">
            <Filter className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="flex gap-1 px-4 pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${activeTab === tab.key ? "bg-role-service-provider text-white" : "bg-card text-muted-foreground border border-border"}`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <div className="px-4 space-y-2">
        {currentListings.map((listing) => (
          <div key={listing.id} className="bg-card rounded-xl shadow-card overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex gap-3 p-3">
              <img src={listing.image} alt={listing.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-semibold text-foreground line-clamp-1">{listing.title}</h3>
                  <button onClick={(e) => e.stopPropagation()} className="p-0.5 text-muted-foreground">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                  <MapPin className="w-3 h-3" /> {listing.location}
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                  {listing.rating > 0 && <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {listing.rating}</span>}
                  {listing.bookings > 0 && <span>{listing.bookings} {lang === "ar" ? "حجز" : "bookings"}</span>}
                  <span className="font-semibold text-foreground">{listing.price}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyListings;