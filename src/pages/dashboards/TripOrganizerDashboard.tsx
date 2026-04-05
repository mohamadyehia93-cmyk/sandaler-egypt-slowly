import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, Bell, Plus, Map, Users, Calendar, TrendingUp, Send, ChevronRight } from "lucide-react";

const TripOrganizerDashboard = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();

  const overview = [
    { value: "6", label: lang === "ar" ? "رحلات نشطة" : "Active Trips", path: "/dashboard/trip-organizer/my-trips" },
    { value: "14", label: lang === "ar" ? "حجوزات هذا الشهر" : "Bookings This Month", path: "/inbox" },
    { value: "12,800", label: lang === "ar" ? "إيرادات" : "Revenue", suffix: lang === "ar" ? "ج.م" : "EGP", path: "/profile/impact" },
    { value: "3", label: lang === "ar" ? "رحلات قادمة" : "Upcoming Departures", path: "/dashboard/trip-organizer/my-trips" },
  ];

  const departures = [
    { name: lang === "ar" ? "رحلة يوم كامل للإسماعيلية" : "Full Day Trip to Ismailia", date: "Jan 3", confirmed: 8 },
    { name: lang === "ar" ? "فنون الطعام على البحيرات" : "Gastronomy on the Lakes", date: "Jan 10", confirmed: 4 },
  ];

  const bottomNav = [
    { label: lang === "ar" ? "لوحة التحكم" : "Dashboard", icon: "🏠", active: true, path: "/dashboard/trip-organizer" },
    { label: lang === "ar" ? "رحلاتي" : "My Trips", icon: "🗺️", active: false, path: "/dashboard/trip-organizer/my-trips" },
    { label: lang === "ar" ? "العملاء" : "Leads", icon: "📥", active: false, path: "/inbox" },
    { label: lang === "ar" ? "الملف" : "Profile", icon: "👤", active: false, path: "/profile" },
  ];

  return (
    <div className="min-h-screen bg-surface pb-20">
      <header className="bg-role-trip-organizer text-white px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigate("/profile")} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
          <button onClick={() => navigate("/inbox")} className="relative p-1"><Bell className="w-5 h-5" /></button>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl">🗺️</div>
          <div>
            <p className="text-xs opacity-80">{lang === "ar" ? "منظم رحلات" : "Trip Organizer"}</p>
            <h1 className="text-lg font-bold">{lang === "ar" ? "سمسمية تريبس" : "Semsemia Trips"}</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {overview.map((o, i) => (
            <div key={i} onClick={() => navigate(o.path)} className="bg-card rounded-xl shadow-card p-3 text-center cursor-pointer hover:shadow-md transition-shadow active:scale-[0.97]">
              <span className="text-xl font-bold text-foreground block">{o.value}{o.suffix && <span className="text-xs ml-1">{o.suffix}</span>}</span>
              <span className="text-[10px] text-muted-foreground">{o.label}</span>
            </div>
          ))}
        </div>

        {/* New Lead Alert */}
        <div onClick={() => navigate("/inbox")} className="bg-primary/10 border border-primary/30 rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow">
          <h3 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            {lang === "ar" ? "استفسار جديد" : "New Lead"}
            <ChevronRight className="w-4 h-4 text-muted-foreground ms-auto" />
          </h3>
          <p className="text-xs text-muted-foreground">{lang === "ar" ? "مجموعة من ٦ أشخاص تسأل عن رحلة خاصة لدمياط" : "Group of 6 asking about a private trip to Damietta"}</p>
        </div>

        {/* Upcoming Departures */}
        <div onClick={() => navigate("/dashboard/trip-organizer/my-trips")} className="bg-card rounded-xl shadow-card p-4 cursor-pointer hover:shadow-md transition-shadow">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-role-trip-organizer" />
            {lang === "ar" ? "الرحلات القادمة" : "Upcoming Departures"}
            <ChevronRight className="w-4 h-4 text-muted-foreground ms-auto" />
          </h3>
          {departures.map((d, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
              <div>
                <p className="text-xs font-semibold text-foreground">{d.name}</p>
                <p className="text-[10px] text-muted-foreground">{d.date} · {d.confirmed} {lang === "ar" ? "مؤكد" : "confirmed"}</p>
              </div>
              <button onClick={(e) => e.stopPropagation()} className="p-1.5 rounded-md bg-role-trip-organizer/10">
                <Send className="w-3.5 h-3.5 text-role-trip-organizer" />
              </button>
            </div>
          ))}
        </div>

        <button onClick={() => navigate("/dashboard/trip-organizer/new-trip")} className="w-full bg-role-trip-organizer text-white rounded-xl py-3.5 font-semibold text-sm flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> {lang === "ar" ? "إنشاء رحلة" : "Create Trip"}
        </button>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-role-trip-organizer flex justify-around py-2 z-50">
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

export default TripOrganizerDashboard;