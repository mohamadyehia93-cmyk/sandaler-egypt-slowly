import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, Bell, Plus, Calendar, MessageSquare, TrendingUp, CheckCircle, XCircle, Clock, ChevronRight } from "lucide-react";
import { VisitorModeHeaderToggle } from "@/components/VisitorModeToggle";

const ServiceProviderDashboard = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();

  const overview = [
    { value: "5", label: lang === "ar" ? "قوائم نشطة" : "Active Listings", path: "/dashboard/service-provider/my-listings" },
    { value: "8", label: lang === "ar" ? "حجوزات هذا الأسبوع" : "Bookings This Week", path: "/inbox" },
    { value: "4,200", label: lang === "ar" ? "إيرادات الشهر" : "Revenue This Month", suffix: lang === "ar" ? "ج.م" : "EGP", path: "/profile/impact" },
    { value: "3", label: lang === "ar" ? "رسائل" : "Messages", path: "/inbox" },
  ];

  const bookings = [
    { visitor: "Mohamed Yehia", date: "28 Dec", experience: lang === "ar" ? "مراقبة الطيور في بحيرة المنزلة" : "Bird Watching in Manzala Lake", group: 4, status: "pending" },
    { visitor: "Carlie Jerde", date: "30 Dec", experience: lang === "ar" ? "طبخ دلتا تقليدي" : "Traditional Delta Cooking", group: 2, status: "confirmed" },
  ];

  const bottomNav = [
    { label: lang === "ar" ? "لوحة التحكم" : "Dashboard", icon: "🏠", active: true, path: "/dashboard/service-provider" },
    { label: lang === "ar" ? "قوائمي" : "My Listings", icon: "📋", active: false, path: "/dashboard/service-provider/my-listings" },
    { label: lang === "ar" ? "الرسائل" : "Inbox", icon: "💬", active: false, path: "/inbox" },
    { label: lang === "ar" ? "الملف" : "Profile", icon: "👤", active: false, path: "/profile" },
  ];

  return (
    <div className="min-h-screen bg-surface pb-20">
      <header className="bg-role-service-provider text-white px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigate("/profile")} className="p-1"><ArrowLeft className="w-5 h-5" /></button>
          <div className="flex items-center gap-2">
            <VisitorModeHeaderToggle />
            <button onClick={() => navigate("/inbox")} className="relative p-1"><Bell className="w-5 h-5" /><span className="absolute top-0 right-0 w-2 h-2 bg-destructive rounded-full" /></button>
          </div>
        </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl">⚓</div>
          <div>
            <p className="text-xs opacity-80">{lang === "ar" ? "مزود خدمة" : "Service Provider"}</p>
            <h1 className="text-lg font-bold">{lang === "ar" ? "حسن محمود" : "Hassan Mahmoud"}</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 gap-3">
          {overview.map((o, i) => (
            <div key={i} onClick={() => navigate(o.path)} className="bg-card rounded-xl shadow-card p-3 text-center cursor-pointer hover:shadow-md transition-shadow active:scale-[0.97]">
              <span className="text-xl font-bold text-foreground block">{o.value}{o.suffix && <span className="text-xs ml-1">{o.suffix}</span>}</span>
              <span className="text-[10px] text-muted-foreground">{o.label}</span>
            </div>
          ))}
        </div>

        {/* Pending Booking Alert */}
        <div onClick={() => navigate("/inbox")} className="bg-warning/10 border border-warning/30 rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-warning" />
            <h3 className="text-sm font-bold text-foreground">{lang === "ar" ? "طلب حجز جديد" : "New Booking Request"}</h3>
            <ChevronRight className="w-4 h-4 text-muted-foreground ms-auto" />
          </div>
          <p className="text-xs text-muted-foreground mb-3">{bookings[0].visitor} — {bookings[0].experience}</p>
          <div className="flex gap-2">
            <button onClick={(e) => e.stopPropagation()} className="flex-1 bg-primary text-primary-foreground rounded-lg py-2 text-xs font-semibold flex items-center justify-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> {lang === "ar" ? "تأكيد" : "Confirm"}
            </button>
            <button onClick={(e) => e.stopPropagation()} className="flex-1 border border-border text-foreground rounded-lg py-2 text-xs font-semibold flex items-center justify-center gap-1">
              <XCircle className="w-3.5 h-3.5" /> {lang === "ar" ? "رفض" : "Decline"}
            </button>
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div onClick={() => navigate("/inbox")} className="bg-card rounded-xl shadow-card p-4 cursor-pointer hover:shadow-md transition-shadow">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-role-service-provider" />
            {lang === "ar" ? "الحجوزات القادمة" : "Upcoming Bookings"}
            <ChevronRight className="w-4 h-4 text-muted-foreground ms-auto" />
          </h3>
          {bookings.map((b, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
              <div>
                <p className="text-xs font-semibold text-foreground">{b.experience}</p>
                <p className="text-[10px] text-muted-foreground">{b.visitor} · {b.group} {lang === "ar" ? "أشخاص" : "guests"} · {b.date}</p>
              </div>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${b.status === "confirmed" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                {b.status === "confirmed" ? (lang === "ar" ? "مؤكد" : "Confirmed") : (lang === "ar" ? "معلق" : "Pending")}
              </span>
            </div>
          ))}
        </div>

        {/* Quick Action */}
        <button onClick={() => navigate("/dashboard/service-provider/new-experience")} className="w-full bg-role-service-provider text-white rounded-xl py-3.5 font-semibold text-sm flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> {lang === "ar" ? "تجربة جديدة" : "New Experience"}
        </button>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-role-service-provider flex justify-around py-2 z-50">
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

export default ServiceProviderDashboard;