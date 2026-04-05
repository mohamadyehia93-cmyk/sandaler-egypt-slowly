import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, CheckCircle2, Circle, Clock, AlertTriangle, MapPin } from "lucide-react";
import { useState } from "react";

const MyTasks = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"pending" | "done">("pending");

  const tabs = [
    { key: "pending" as const, label: lang === "ar" ? "قيد التنفيذ" : "Pending", count: 5 },
    { key: "done" as const, label: lang === "ar" ? "مكتمل" : "Completed", count: 18 },
  ];

  const tasks = {
    pending: [
      { id: "t1", title: lang === "ar" ? "فحص مسار المشي الجديد في رشيد" : "Inspect new walking trail in Rosetta", priority: "high", location: lang === "ar" ? "رشيد" : "Rosetta", dueDate: "Apr 8" },
      { id: "t2", title: lang === "ar" ? "تقرير حالة لافتات المعالم" : "Report on landmark signage condition", priority: "medium", location: lang === "ar" ? "دمياط" : "Damietta", dueDate: "Apr 10" },
      { id: "t3", title: lang === "ar" ? "تحديث معلومات المواصلات" : "Update transport info", priority: "low", location: lang === "ar" ? "المنزلة" : "Manzala", dueDate: "Apr 12" },
      { id: "t4", title: lang === "ar" ? "مراجعة تجربة مطعم جديد" : "Review new restaurant experience", priority: "medium", location: lang === "ar" ? "طنطا" : "Tanta", dueDate: "Apr 15" },
      { id: "t5", title: lang === "ar" ? "الإبلاغ عن مشكلة صيانة" : "Flag maintenance issue at heritage site", priority: "high", location: lang === "ar" ? "فوة" : "Fuwwah", dueDate: "Apr 7" },
    ],
    done: [
      { id: "t6", title: lang === "ar" ? "تحديث صور المعالم" : "Update landmark photos", priority: "low", location: lang === "ar" ? "رشيد" : "Rosetta", dueDate: "Mar 28" },
      { id: "t7", title: lang === "ar" ? "تأكيد ساعات العمل" : "Confirm operating hours", priority: "medium", location: lang === "ar" ? "المنصورة" : "Mansoura", dueDate: "Mar 25" },
    ],
  };

  const priorityColors = { high: "text-destructive", medium: "text-amber-500", low: "text-muted-foreground" };
  const priorityIcons = { high: AlertTriangle, medium: Clock, low: Circle };

  return (
    <div className="min-h-screen bg-surface pb-24">
      <header className="bg-role-ambassador text-white px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigate("/dashboard/ambassador")} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
        </div>
        <h1 className="text-lg font-bold">{lang === "ar" ? "مهامي" : "My Tasks"}</h1>
      </header>

      <div className="flex gap-1 px-4 py-3">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${activeTab === tab.key ? "bg-role-ambassador text-white" : "bg-card text-muted-foreground border border-border"}`}>
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <div className="px-4 space-y-2">
        {tasks[activeTab].map((task) => {
          const PriorityIcon = priorityIcons[task.priority as keyof typeof priorityIcons];
          return (
            <div key={task.id} className="bg-card rounded-xl shadow-card p-3 cursor-pointer hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                {activeTab === "done" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <PriorityIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${priorityColors[task.priority as keyof typeof priorityColors]}`} />
                )}
                <div className="flex-1">
                  <h3 className={`text-sm font-semibold ${activeTab === "done" ? "text-muted-foreground line-through" : "text-foreground"}`}>{task.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {task.location}</span>
                    <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {task.dueDate}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyTasks;