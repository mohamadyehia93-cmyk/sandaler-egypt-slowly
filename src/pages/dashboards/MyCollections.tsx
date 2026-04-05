import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, Plus, BookOpen, Eye, MoreVertical, Search, Filter } from "lucide-react";
import { useState } from "react";

const MyCollections = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"published" | "drafts">("published");

  const tabs = [
    { key: "published" as const, label: lang === "ar" ? "منشور" : "Published", count: 6 },
    { key: "drafts" as const, label: lang === "ar" ? "مسودات" : "Drafts", count: 2 },
  ];

  const collections = {
    published: [
      { id: "c1", title: lang === "ar" ? "الفن القبطي في صعيد مصر" : "Coptic Art in Upper Egypt", items: 24, views: 3400 },
      { id: "c2", title: lang === "ar" ? "تقنيات النسيج عبر العصور" : "Weaving Techniques Through the Ages", items: 18, views: 2100 },
      { id: "c3", title: lang === "ar" ? "الهندسة المعمارية العثمانية في الدلتا" : "Ottoman Architecture in the Delta", items: 32, views: 4800 },
    ],
    drafts: [
      { id: "d1", title: lang === "ar" ? "الموسيقى النوبية: دليل شامل" : "Nubian Music: A Comprehensive Guide", items: 8, views: 0 },
    ],
  };

  return (
    <div className="min-h-screen bg-surface pb-24">
      <header className="bg-role-subject-expert text-white px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigate("/dashboard/subject-expert")} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
          <button onClick={() => navigate("/dashboard/subject-expert/new-collection")} className="flex items-center gap-1 bg-white/20 rounded-lg px-3 py-1.5 text-xs font-semibold">
            <Plus className="w-3.5 h-3.5" /> {lang === "ar" ? "جديد" : "New"}
          </button>
        </div>
        <h1 className="text-lg font-bold">{lang === "ar" ? "مجموعاتي" : "My Collections"}</h1>
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
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${activeTab === tab.key ? "bg-role-subject-expert text-white" : "bg-card text-muted-foreground border border-border"}`}>
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <div className="px-4 space-y-2">
        {collections[activeTab].map((collection) => (
          <div key={collection.id} className="bg-card rounded-xl shadow-card p-3 cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-semibold text-foreground line-clamp-1 flex-1">{collection.title}</h3>
              <button onClick={(e) => e.stopPropagation()} className="p-0.5 text-muted-foreground"><MoreVertical className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-0.5"><BookOpen className="w-3 h-3" /> {collection.items} {lang === "ar" ? "عنصر" : "items"}</span>
              {collection.views > 0 && <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> {collection.views.toLocaleString()}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyCollections;