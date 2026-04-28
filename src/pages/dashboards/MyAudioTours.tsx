import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, Plus, Play, Clock, MapPin, MoreVertical, Search, Filter } from "lucide-react";
import { useState } from "react";

const MyAudioTours = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"published" | "drafts" | "review">("published");

  const tabs = [
    { key: "published" as const, label: lang === "ar" ? "منشور" : "Published", count: 8 },
    { key: "drafts" as const, label: lang === "ar" ? "مسودات" : "Drafts", count: 2 },
    { key: "review" as const, label: lang === "ar" ? "قيد المراجعة" : "Under Review", count: 1 },
  ];

  const tours = {
    published: [
      { id: "at1", title: lang === "ar" ? "حواري الخان وأسرارها" : "Khan Alleys & Their Secrets", city: lang === "ar" ? "القاهرة" : "Cairo", stops: 7, duration: 45, plays: 412 },
      { id: "at2", title: lang === "ar" ? "صوت البحر في الإسكندرية" : "Voices of the Alexandria Sea", city: lang === "ar" ? "الإسكندرية" : "Alexandria", stops: 5, duration: 30, plays: 268 },
      { id: "at3", title: lang === "ar" ? "أساطير معبد الكرنك" : "Legends of Karnak Temple", city: lang === "ar" ? "الأقصر" : "Luxor", stops: 9, duration: 60, plays: 587 },
    ],
    drafts: [
      { id: "d1", title: lang === "ar" ? "حِرف أسوان النوبية" : "Nubian Crafts of Aswan", city: lang === "ar" ? "أسوان" : "Aswan", stops: 4, duration: 25, plays: 0 },
      { id: "d2", title: lang === "ar" ? "صباح الفيوم" : "A Morning in Fayoum", city: lang === "ar" ? "الفيوم" : "Fayoum", stops: 6, duration: 40, plays: 0 },
    ],
    review: [
      { id: "r1", title: lang === "ar" ? "أصوات السوق في طنطا" : "Market Voices in Tanta", city: lang === "ar" ? "طنطا" : "Tanta", stops: 5, duration: 35, plays: 0 },
    ],
  };

  const current = tours[activeTab];

  return (
    <div className="min-h-screen bg-surface pb-24">
      <header className="bg-role-narrator text-white px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigate("/dashboard/narrator")} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
          <button onClick={() => navigate("/dashboard/narrator/new-tour")} className="flex items-center gap-1 bg-white/20 rounded-lg px-3 py-1.5 text-xs font-semibold">
            <Plus className="w-3.5 h-3.5" /> {lang === "ar" ? "جديد" : "New"}
          </button>
        </div>
        <h1 className="text-lg font-bold">{lang === "ar" ? "جولاتي الصوتية" : "My Audio Tours"}</h1>
      </header>

      <div className="px-4 pt-3 pb-2">
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-card rounded-lg px-3 py-2 border border-border">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder={lang === "ar" ? "ابحث في الجولات..." : "Search tours..."} className="bg-transparent text-sm flex-1 outline-none text-foreground placeholder:text-muted-foreground" />
          </div>
          <button className="p-2 bg-card rounded-lg border border-border">
            <Filter className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="flex gap-1 px-4 pb-3">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${activeTab === tab.key ? "bg-role-narrator text-white" : "bg-card text-muted-foreground border border-border"}`}>
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <div className="px-4 space-y-2">
        {current.map((t) => (
          <div key={t.id} onClick={() => navigate(`/audio-tour/${t.id}`)}
            className="bg-card rounded-xl shadow-card p-3 cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-medium bg-role-narrator/10 text-role-narrator px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <MapPin className="w-2.5 h-2.5" /> {t.city}
                  </span>
                  {activeTab === "review" && (
                    <span className="text-[10px] font-medium bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                      {lang === "ar" ? "قيد المراجعة" : "Pending"}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-foreground line-clamp-1">{t.title}</h3>
              </div>
              <button onClick={(e) => e.stopPropagation()} className="p-1 text-muted-foreground">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {t.stops} {lang === "ar" ? "محطة" : "stops"}</span>
              <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {t.duration} {lang === "ar" ? "د" : "min"}</span>
              {activeTab === "published" && (
                <span className="flex items-center gap-0.5"><Play className="w-3 h-3" /> {t.plays}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAudioTours;
