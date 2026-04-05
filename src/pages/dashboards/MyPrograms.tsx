import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, Plus, Users, Calendar, MoreVertical, Search, Filter, Target } from "lucide-react";
import { useState } from "react";

const MyPrograms = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"active" | "upcoming" | "completed">("active");

  const tabs = [
    { key: "active" as const, label: lang === "ar" ? "نشط" : "Active", count: 3 },
    { key: "upcoming" as const, label: lang === "ar" ? "قادم" : "Upcoming", count: 2 },
    { key: "completed" as const, label: lang === "ar" ? "مكتمل" : "Completed", count: 8 },
  ];

  const programs = {
    active: [
      { id: "pg1", title: lang === "ar" ? "برنامج تمكين الحرفيين" : "Artisan Empowerment Program", participants: 45, target: 60, endDate: "Jun 2025" },
      { id: "pg2", title: lang === "ar" ? "منح التراث الثقافي" : "Cultural Heritage Grants", participants: 12, target: 20, endDate: "Aug 2025" },
      { id: "pg3", title: lang === "ar" ? "تدريب السياحة المستدامة" : "Sustainable Tourism Training", participants: 30, target: 30, endDate: "May 2025" },
    ],
    upcoming: [
      { id: "pg4", title: lang === "ar" ? "ورش النسيج للشباب" : "Youth Weaving Workshops", participants: 0, target: 25, endDate: "Sep 2025" },
    ],
    completed: [
      { id: "pg5", title: lang === "ar" ? "استعادة المرجان ٢٠٢٤" : "Coral Restoration 2024", participants: 50, target: 50, endDate: "Dec 2024" },
    ],
  };

  return (
    <div className="min-h-screen bg-surface pb-24">
      <header className="bg-role-organization text-white px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigate("/dashboard/organization")} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
          <button onClick={() => navigate("/dashboard/organization/new-program")} className="flex items-center gap-1 bg-white/20 rounded-lg px-3 py-1.5 text-xs font-semibold">
            <Plus className="w-3.5 h-3.5" /> {lang === "ar" ? "جديد" : "New"}
          </button>
        </div>
        <h1 className="text-lg font-bold">{lang === "ar" ? "البرامج" : "Programs"}</h1>
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
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${activeTab === tab.key ? "bg-role-organization text-white" : "bg-card text-muted-foreground border border-border"}`}>
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <div className="px-4 space-y-2">
        {programs[activeTab].map((program) => (
          <div key={program.id} className="bg-card rounded-xl shadow-card p-3 cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-semibold text-foreground line-clamp-1 flex-1">{program.title}</h3>
              <button onClick={(e) => e.stopPropagation()} className="p-0.5 text-muted-foreground"><MoreVertical className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-2">
              <span className="flex items-center gap-0.5"><Users className="w-3 h-3" /> {program.participants}/{program.target}</span>
              <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3" /> {program.endDate}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div className="bg-role-organization h-1.5 rounded-full transition-all" style={{ width: `${(program.participants / program.target) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyPrograms;