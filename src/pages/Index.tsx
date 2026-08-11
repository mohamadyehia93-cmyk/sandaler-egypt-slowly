import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Bell, Calendar, Search, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SEO } from "@/components/SEO";
import { useEvents } from "@/hooks/useListings";
import BottomNav from "@/components/BottomNav";
import TopTabs from "@/components/TopTabs";
import { LanguageToggle } from "@/components/LanguageToggle";
import HeroCarousel from "@/components/HeroCarousel";
import RegionScroll from "@/components/RegionScroll";
import LatestPosts from "@/components/LatestPosts";
import AudioTourCards from "@/components/AudioTourCards";
import ExperienceCards from "@/components/ExperienceCards";
import TripCards from "@/components/TripCards";
import AccommodationCards from "@/components/AccommodationCards";
import TransportCards from "@/components/TransportCards";
import HomeCausesSection from "@/components/HomeCausesSection";
import EventsSection from "@/components/EventsSection";
import ProductGrid from "@/components/ProductGrid";
import MeetUpSection from "@/components/MeetUpSection";
import CollectionsSection from "@/components/CollectionsSection";
import Partners from "@/components/Partners";

const Index = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "explore");
  const [scrolled, setScrolled] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const navigate = useNavigate();
  const { data: dbEvents = [] } = useEvents();

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const headerTextClass = scrolled ? "text-foreground" : "text-primary-foreground";

  return (
    <div className="min-h-screen bg-surface pb-20">
      <SEO url="/" />
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
            <LanguageToggle
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${headerTextClass} hover:bg-background/20`}
              iconClassName="w-3.5 h-3.5"
            />
            <button
              className={`p-2 transition-colors ${headerTextClass}`}
              onClick={() => navigate("/search")}
              aria-label={t("common.search")}
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              className={`p-2 transition-colors ${headerTextClass}`}
              onClick={() => navigate("/calendar")}
              aria-label={t("explore.choose_date_banner")}
            >
              <Calendar className="w-5 h-5" />
            </button>
            <button
              className={`relative p-2 transition-colors ${headerTextClass}`}
              onClick={() => navigate("/inbox")}
              aria-label={t("common.notifications")}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
            </button>
          </div>
        </div>

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
              <CollectionsSection />
              <EventsSection events={dbEvents as any[]} />
              <HomeCausesSection />

              {/* Why Sandal? — collapsed footer */}
              <section className="mt-12 mb-8 border-t border-border pt-6">
                <button
                  onClick={() => setWhyOpen((o) => !o)}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("explore.why_sandal")}
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${whyOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {whyOpen && (
                  <div className="mt-4 animate-fade-in">
                    <Partners />
                  </div>
                )}
                {/* Footer links — image credits must stay reachable from the home page
                    because CC BY-SA hero images appear here. */}
                <div className="mt-4 flex items-center justify-center">
                  <button
                    onClick={() => navigate("/credits")}
                    className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
                  >
                    {t("common.image_credits")}
                  </button>
                </div>
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
