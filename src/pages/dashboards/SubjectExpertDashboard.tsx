import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, Bell, Plus, BookOpen, GraduationCap, Library, TrendingUp, Download, ChevronRight } from "lucide-react";
import { VisitorModeHeaderToggle } from "@/components/VisitorModeToggle";

const SubjectExpertDashboard = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();

  const overview = [
    { value: "3", label: lang === "ar" ? "مجموعات منشورة" : "Published Collections", path: "/dashboard/subject-expert/my-collections" },
    { value: "7", label: lang === "ar" ? "مقالات" : "Essays", path: "/dashboard/subject-expert/my-collections" },
    { value: "2", label: lang === "ar" ? "حقائب تعليمية" : "Teacher Packs", path: "/dashboard/subject-expert/my-collections" },
    { value: "45", label: lang === "ar" ? "تحميلات" : "Downloads", path: "/profile/impact" },
  ];

  const bottomNav = [
    { label: lang === "ar" ? "لوحة التحكم" : "Dashboard", icon: "🏠", active: true, path: "/dashboard/subject-expert" },
    { label: lang === "ar" ? "مجموعاتي" : "My Collections", icon: "📚", active: false, path: "/dashboard/subject-expert/my-collections" },
    { label: lang === "ar" ? "الرسائل" : "Inbox", icon: "💬", active: false, path: "/inbox" },
    { label: lang === "ar" ? "الملف" : "Profile", icon: "👤", active: false, path: "/profile" },
  ];

  return (
    <div className="min-h-screen bg-surface pb-20">
      <header className="bg-role-subject-expert text-white px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigate("/profile")} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
          <div className="flex items-center gap-2">
            <VisitorModeHeaderToggle />
            <button onClick={() => navigate("/inbox")} className="relative p-1"><Bell className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl">🔬</div>
          <div>
            <p className="text-xs opacity-80">{lang === "ar" ? "خبير متخصص" : "Subject Expert"}</p>
            <h1 className="text-lg font-bold">{lang === "ar" ? "د. ليلى مصطفى" : "Dr. Laila Mostafa"}</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {overview.map((o, i) => (
            <div key={i} onClick={() => navigate(o.path)} className="bg-card rounded-xl shadow-card p-3 text-center cursor-pointer hover:shadow-md transition-shadow active:scale-[0.97]">
              <span className="text-xl font-bold text-foreground block">{o.value}</span>
              <span className="text-[10px] text-muted-foreground">{o.label}</span>
            </div>
          ))}
        </div>

        {/* Analytics */}
        <div onClick={() => navigate("/profile/impact")} className="bg-card rounded-xl shadow-card p-4 cursor-pointer hover:shadow-md transition-shadow">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-role-subject-expert" />
            {lang === "ar" ? "تحليلات" : "Analytics"}
            <ChevronRight className="w-4 h-4 text-muted-foreground ms-auto" />
          </h3>
          <div className="flex justify-between text-center">
            <div><span className="text-lg font-bold text-foreground">1.2K</span><p className="text-[10px] text-muted-foreground">{lang === "ar" ? "قراءات" : "Reads"}</p></div>
            <div><span className="text-lg font-bold text-foreground">89</span><p className="text-[10px] text-muted-foreground">{lang === "ar" ? "حفظ" : "Saves"}</p></div>
            <div><span className="text-lg font-bold text-foreground">45</span><p className="text-[10px] text-muted-foreground">{lang === "ar" ? "تحميلات" : "Downloads"}</p></div>
          </div>
        </div>

        {/* Licensing */}
        <div className="bg-success/10 border border-success/30 rounded-xl p-3 flex items-center gap-2">
          <Library className="w-4 h-4 text-success" />
          <span className="text-xs font-medium text-foreground">{lang === "ar" ? "اتفاقية الترخيص نشطة" : "Licensing Agreement Active"}</span>
        </div>

        {/* Collaboration Inbox */}
        <div onClick={() => navigate("/inbox")} className="bg-card rounded-xl shadow-card p-4 cursor-pointer hover:shadow-md transition-shadow">
          <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
            {lang === "ar" ? "طلبات تعاون" : "Collaboration Requests"}
            <ChevronRight className="w-4 h-4 text-muted-foreground ms-auto" />
          </h3>
          <div className="border border-border rounded-lg p-3">
            <p className="text-xs font-semibold text-foreground">{lang === "ar" ? "أحمد حسن يريد التعاون في مجموعة عن رشيد" : "Ahmed Hassan wants to co-author a Rosetta collection"}</p>
            <div className="flex gap-2 mt-2">
              <button onClick={(e) => e.stopPropagation()} className="text-[10px] font-semibold bg-role-subject-expert text-white px-3 py-1.5 rounded-md">{lang === "ar" ? "قبول" : "Accept"}</button>
              <button onClick={(e) => e.stopPropagation()} className="text-[10px] font-semibold border border-border text-foreground px-3 py-1.5 rounded-md">{lang === "ar" ? "رفض" : "Decline"}</button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <button onClick={() => navigate("/dashboard/subject-expert/new-collection")} className="w-full bg-role-subject-expert text-white rounded-xl py-3.5 font-semibold text-sm flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> {lang === "ar" ? "مجموعة جديدة" : "New Collection"}
          </button>
          <button onClick={() => navigate("/dashboard/subject-expert/new-collection")} className="w-full border-2 border-role-subject-expert text-role-subject-expert rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2">
            <BookOpen className="w-4 h-4" /> {lang === "ar" ? "كتابة مقال" : "Write Essay"}
          </button>
          <button onClick={() => navigate("/dashboard/subject-expert/new-collection")} className="w-full border-2 border-role-subject-expert text-role-subject-expert rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2">
            <GraduationCap className="w-4 h-4" /> {lang === "ar" ? "حقيبة تعليمية" : "Create Teacher Pack"}
          </button>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-role-subject-expert flex justify-around py-2 z-50">
        {bottomNav.map((item, i) => (
          <button key={i} onClick={() => navigate(item.path)} className={`flex flex-col items-center gap-0.5 px-3 py-1 ${item.active ? "opacity-100" : "opacity-60"}`}>
            <span className="text-lg">{item.icon}</span>
            <span className="text-[10px] text-white font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default SubjectExpertDashboard;