import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Calendar, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { experiences, audioTours, accommodation, whosWho, products, transport } from "@/lib/sampleData";
import BottomNav from "@/components/BottomNav";
import TopTabs from "@/components/TopTabs";
import HeroCarousel from "@/components/HeroCarousel";
import RegionScroll from "@/components/RegionScroll";
import LatestPosts from "@/components/LatestPosts";
import AudioTourCards from "@/components/AudioTourCards";
import ExperienceCards from "@/components/ExperienceCards";
import TripCards from "@/components/TripCards";
import Testimonials from "@/components/Testimonials";
import Partners from "@/components/Partners";
import Certifications from "@/components/Certifications";

const Index = () => {
  const { t, lang, setLang } = useI18n();
  const [activeTab, setActiveTab] = useState("explore");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results: { id: string; title: string; type: string; route: string }[] = [];

    experiences.forEach((e) => {
      const title = e.title[lang];
      if (title.toLowerCase().includes(q)) results.push({ id: e.id, title, type: lang === "ar" ? "تجربة" : "Experience", route: `/experience/${e.id}` });
    });
    audioTours.forEach((a) => {
      const title = a.title[lang];
      if (title.toLowerCase().includes(q)) results.push({ id: a.id, title, type: lang === "ar" ? "جولة صوتية" : "Audio Tour", route: `/audio-tour/${a.id}` });
    });
    accommodation.forEach((ac) => {
      const title = ac.title[lang];
      if (title.toLowerCase().includes(q)) results.push({ id: ac.id, title, type: lang === "ar" ? "إقامة" : "Stay", route: `/stay/${ac.id}` });
    });
    whosWho.forEach((w) => {
      const name = w.name[lang];
      if (name.toLowerCase().includes(q)) results.push({ id: w.id, title: name, type: lang === "ar" ? "شخصية" : "Person", route: `/person/${w.id}` });
    });
    products.forEach((p) => {
      const title = p.title[lang];
      if (title.toLowerCase().includes(q)) results.push({ id: p.id, title, type: lang === "ar" ? "منتج" : "Product", route: `/product/${p.id}` });
    });
    transport.forEach((tr) => {
      const title = tr.title[lang];
      if (title.toLowerCase().includes(q)) results.push({ id: tr.id, title, type: lang === "ar" ? "مواصلات" : "Transport", route: `/transport/${tr.id}` });
    });

    return results.slice(0, 8);
  }, [searchQuery, lang]);

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-background">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌊</span>
          <span className="text-xl font-extrabold text-primary-dark tracking-tight">Sandal</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="text-xs font-semibold px-2 py-1 rounded-md bg-secondary text-secondary-foreground"
          >
            {lang === "en" ? "عربي" : "EN"}
          </button>
          <button className="relative p-1.5" onClick={() => { setSearchOpen(!searchOpen); setSearchQuery(""); }}>
            {searchOpen ? <X className="w-5 h-5 text-foreground" /> : <Search className="w-5 h-5 text-foreground" />}
          </button>
          <button className="relative p-1.5">
            <Bell className="w-5 h-5 text-foreground" />
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-destructive rounded-full" />
          </button>
        </div>
      </header>

      {/* Search Bar */}
      {searchOpen && (
        <div className="px-4 py-2 bg-background border-b border-border relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === "ar" ? "ابحث عن تجارب، إقامات، جولات..." : "Search experiences, stays, tours..."}
              className="pl-9 pr-3 h-9 text-sm bg-secondary border-none"
            />
          </div>
          {searchQuery.trim() && (
            <div className="absolute left-4 right-4 top-full z-50 bg-background border border-border rounded-lg shadow-lg mt-1 max-h-72 overflow-y-auto">
              {searchResults.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  {lang === "ar" ? "لا توجد نتائج" : "No results found"}
                </div>
              ) : (
                searchResults.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => { navigate(r.route); setSearchOpen(false); setSearchQuery(""); }}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors text-left border-b border-border last:border-0"
                  >
                    <span className="text-sm font-medium text-foreground truncate">{r.title}</span>
                    <span className="text-xs text-muted-foreground ml-2 shrink-0">{r.type}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Date Banner */}
      <div
        onClick={() => navigate("/calendar")}
        className="mx-4 mb-3 px-3 py-2 rounded-lg bg-secondary flex items-center gap-2 cursor-pointer hover:bg-secondary/80 transition-colors"
      >
        <Calendar className="w-4 h-4 text-primary" />
        <span className="text-xs font-medium text-secondary-foreground">{t("date.chooseDate")}</span>
      </div>

      <TopTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Feed */}
      <div className="pt-4">
        {activeTab === "explore" && (
          <>
            <HeroCarousel />
            <RegionScroll />
            <LatestPosts />
            <AudioTourCards />
            <Testimonials />
            <Partners />
            <Certifications />
          </>
        )}
        {activeTab === "experiences" && <ExperienceCards />}
        {activeTab === "trips" && <TripCards />}
      </div>

      {/* FAB */}
      <button className="fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-elevated flex items-center justify-center text-2xl">
        +
      </button>

      <BottomNav />
    </div>
  );
};

export default Index;
