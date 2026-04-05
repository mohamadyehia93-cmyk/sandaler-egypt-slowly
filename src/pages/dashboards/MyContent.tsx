import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, Plus, FileText, Eye, Clock, MoreVertical, Search, Filter } from "lucide-react";
import { useState } from "react";

const MyContent = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"published" | "drafts" | "review">("published");

  const tabs = [
    { key: "published" as const, label: lang === "ar" ? "منشور" : "Published", count: 12 },
    { key: "drafts" as const, label: lang === "ar" ? "مسودات" : "Drafts", count: 3 },
    { key: "review" as const, label: lang === "ar" ? "قيد المراجعة" : "Under Review", count: 2 },
  ];

  const articles = {
    published: [
      { id: "lp1", title: lang === "ar" ? "القلاع المنسية في الدلتا" : "The Forgotten Forts of the Delta", type: lang === "ar" ? "مقال" : "Article", date: "2024-12-10", views: 1248, saves: 34 },
      { id: "lp8", title: lang === "ar" ? "مملكة الأثاث في دمياط" : "Damietta's Furniture Kingdom", type: lang === "ar" ? "مقال" : "Article", date: "2025-01-25", views: 892, saves: 21 },
      { id: "lp-pod1", title: lang === "ar" ? "أصوات النيل: صيادو الدلتا" : "Voices of the Nile: Delta Fishermen", type: lang === "ar" ? "بودكاست" : "Podcast", date: "2025-03-05", views: 456, saves: 18 },
      { id: "lp-doc1", title: lang === "ar" ? "آخر نول في فوة" : "The Last Loom of Fuwwah", type: lang === "ar" ? "وثائقي" : "Documentary", date: "2025-03-10", views: 2103, saves: 67 },
      { id: "lp-photo1", title: lang === "ar" ? "ألوان النوبة: رحلة بصرية" : "Colors of Nubia: A Visual Journey", type: lang === "ar" ? "سلسلة صور" : "Photo Series", date: "2025-03-20", views: 1567, saves: 45 },
    ],
    drafts: [
      { id: "d1", title: lang === "ar" ? "حرفيو النحاس في القاهرة القديمة" : "Coppersmiths of Old Cairo", type: lang === "ar" ? "مقال" : "Article", date: "2025-03-28", views: 0, saves: 0 },
      { id: "d2", title: lang === "ar" ? "أسرار المطبخ الصعيدي" : "Secrets of Upper Egyptian Cuisine", type: lang === "ar" ? "فيديو وصفة" : "Recipe Video", date: "2025-04-01", views: 0, saves: 0 },
      { id: "d3", title: lang === "ar" ? "الموسيقى النوبية اليوم" : "Nubian Music Today", type: lang === "ar" ? "بودكاست" : "Podcast", date: "2025-04-03", views: 0, saves: 0 },
    ],
    review: [
      { id: "r1", title: lang === "ar" ? "رحلة عبر واحة الفيوم" : "Journey Through Fayoum Oasis", type: lang === "ar" ? "وثائقي" : "Documentary", date: "2025-04-02", views: 0, saves: 0 },
      { id: "r2", title: lang === "ar" ? "تقاليد الزفاف في الصعيد" : "Wedding Traditions of Upper Egypt", type: lang === "ar" ? "سلسلة صور" : "Photo Series", date: "2025-04-04", views: 0, saves: 0 },
    ],
  };

  const currentArticles = articles[activeTab];

  return (
    <div className="min-h-screen bg-surface pb-24">
      <header className="bg-role-culture-actor text-white px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigate("/dashboard/culture-actor")} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
          <button onClick={() => navigate("/dashboard/culture-actor/new-article")} className="flex items-center gap-1 bg-white/20 rounded-lg px-3 py-1.5 text-xs font-semibold">
            <Plus className="w-3.5 h-3.5" /> {lang === "ar" ? "جديد" : "New"}
          </button>
        </div>
        <h1 className="text-lg font-bold">{lang === "ar" ? "محتواي" : "My Content"}</h1>
      </header>

      {/* Search */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-card rounded-lg px-3 py-2 border border-border">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder={lang === "ar" ? "ابحث في المحتوى..." : "Search content..."} className="bg-transparent text-sm flex-1 outline-none text-foreground placeholder:text-muted-foreground" />
          </div>
          <button className="p-2 bg-card rounded-lg border border-border">
            <Filter className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${activeTab === tab.key ? "bg-role-culture-actor text-white" : "bg-card text-muted-foreground border border-border"}`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Content List */}
      <div className="px-4 space-y-2">
        {currentArticles.map((article) => (
          <div
            key={article.id}
            onClick={() => navigate(`/post/${article.id}`)}
            className="bg-card rounded-xl shadow-card p-3 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-medium bg-role-culture-actor/10 text-role-culture-actor px-1.5 py-0.5 rounded">
                    {article.type}
                  </span>
                  {activeTab === "review" && (
                    <span className="text-[10px] font-medium bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" /> {lang === "ar" ? "قيد المراجعة" : "Pending"}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-foreground line-clamp-1">{article.title}</h3>
              </div>
              <button onClick={(e) => e.stopPropagation()} className="p-1 text-muted-foreground">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
              <span>{new Date(article.date).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", { month: "short", day: "numeric" })}</span>
              {activeTab === "published" && (
                <>
                  <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> {article.views}</span>
                  <span className="flex items-center gap-0.5"><FileText className="w-3 h-3" /> {article.saves} {lang === "ar" ? "حفظ" : "saves"}</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyContent;