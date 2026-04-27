import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Calendar, Search, X, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { experiences, audioTours, accommodation, whosWho, products } from "@/lib/sampleData";
import { useTransport } from "@/hooks/useListings";
import BottomNav from "@/components/BottomNav";
import TopTabs from "@/components/TopTabs";
import HeroCarousel from "@/components/HeroCarousel";
import RegionScroll from "@/components/RegionScroll";
import LatestPosts from "@/components/LatestPosts";
import AudioTourCards from "@/components/AudioTourCards";
import ExperienceCards from "@/components/ExperienceCards";
import TripCards from "@/components/TripCards";
import AccommodationCards from "@/components/AccommodationCards";
import TransportCards from "@/components/TransportCards";
import HomeCausesSection from "@/components/HomeCausesSection";
import ProductGrid from "@/components/ProductGrid";
import MeetUpSection from "@/components/MeetUpSection";
import Testimonials from "@/components/Testimonials";
import Partners from "@/components/Partners";
import Certifications from "@/components/Certifications";

const Index = () => {
  const { t, lang } = useI18n();
  const [activeTab, setActiveTab] = useState("explore");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const navigate = useNavigate();
  const { data: dbTransport = [] } = useTransport();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    dbTransport.forEach((tr) => {
      const title = lang === "ar" ? tr.name_ar : tr.name_en;
      if (title?.toLowerCase().includes(q)) results.push({ id: tr.id, title, type: lang === "ar" ? "مواصلات" : "Transport", route: `/transport/${tr.slug || tr.id}` });
    });

    return results.slice(0, 8);
  }, [searchQuery, lang, dbTransport]);

  const headerTextClass = scrolled ? "text-foreground" : "text-primary-foreground";

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Floating header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-background/95 backdrop-blur-md shadow-card" : "bg-transparent"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌊</span>
            <span className={`text-xl font-extrabold tracking-tight transition-colors ${scrolled ? "text-primary-dark" : "text-primary-foreground drop-shadow"}`}>
              Sandal
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              className={`p-2 transition-colors ${headerTextClass}`}
              onClick={() => { setSearchOpen(!searchOpen); setSearchQuery(""); }}
              aria-label="Search"
            >
              {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>
            <button
              className={`p-2 transition-colors ${headerTextClass}`}
              onClick={() => navigate("/calendar")}
              aria-label={t("date.chooseDate")}
            >
              <Calendar className="w-5 h-5" />
            </button>
            <button
              className={`relative p-2 transition-colors ${headerTextClass}`}
              onClick={() => navigate("/inbox")}
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
            </button>
          </div>
        </div>

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
      </header>

      {/* Feed */}
      <div>
        {activeTab === "explore" && <HeroCarousel />}
        {activeTab !== "explore" && <div className="h-16" />}

        <TopTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="pt-2">
          {activeTab === "explore" && (
            <>
              <RegionScroll />
              <LatestPosts />
              <AudioTourCards />
              <HomeCausesSection />

              {/* Why Sandal? — collapsed footer */}
              <section className="mt-12 mb-8 border-t border-border pt-6">
                <button
                  onClick={() => setWhyOpen((o) => !o)}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
                >
                  {lang === "ar" ? "لماذا صندل؟" : "Why Sandal?"}
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${whyOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {whyOpen && (
                  <div className="mt-4 animate-fade-in">
                    <Testimonials />
                    <Partners />
                    <Certifications />
                  </div>
                )}
              </section>
            </>
          )}
          {activeTab === "experiences" && <ExperienceCards />}
          {activeTab === "trips" && <TripCards />}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate("/community")}
        className="fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-elevated flex items-center justify-center text-2xl"
      >
        +
      </button>

      <BottomNav />
    </div>
  );
};

export default Index;
