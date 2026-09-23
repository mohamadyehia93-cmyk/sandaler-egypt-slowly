import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Bell, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SEO } from "@/components/SEO";
import { useEvents } from "@/hooks/useListings";
import DiscoverFilters, { type DiscoverFilterId } from "@/components/DiscoverFilters";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
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
import CollectionsSection from "@/components/CollectionsSection";
import Partners from "@/components/Partners";
import { ChevronDown } from "lucide-react";
import { HOME_PURPOSE_LINE } from "@/content/siteCopy";
import { useI18n } from "@/lib/i18n";

/** Legacy ?tab= links now preselect the matching filter chip. */
const TAB_TO_FILTER: Record<string, DiscoverFilterId> = {
  experiences: "experiences",
  trips: "trips",
  explore: "events",
};

const Index = () => {
  const { t } = useTranslation();
  const { lang } = useI18n();

  const [searchParams] = useSearchParams();
  const [scrolled, setScrolled] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const [filter, setFilter] = useState<DiscoverFilterId>("all");
  const navigate = useNavigate();
  const { data: dbEvents = [] } = useEvents();
  const { data: unread = 0 } = useUnreadMessages();

  useEffect(() => {
    const tab = searchParams.get("tab");
    const preset = tab ? TAB_TO_FILTER[tab] : undefined;
    if (preset) setFilter(preset);
  }, [searchParams]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const headerTextClass = scrolled ? "text-foreground" : "text-primary-foreground";
  const show = (id: DiscoverFilterId) => filter === "all" || filter === id;
  const showExtras = filter === "all";

  return (
    <div className="min-h-screen bg-surface">
      <SEO url="/" />
      {/* Slim floating header: brand, language, search, bell (carries messages) */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-background/95 backdrop-blur-md shadow-card" : "bg-transparent"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 max-w-5xl mx-auto">
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
              className={`tap-target focus-ring rounded-full transition-colors ${headerTextClass}`}
              onClick={() => navigate("/search")}
              aria-label={t("common.search")}
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              className={`tap-target focus-ring relative rounded-full transition-colors ${headerTextClass}`}
              onClick={() => navigate("/inbox")}
              aria-label={t("common.notifications")}
            >
              <Bell className="w-5 h-5" />
              {unread > 0 && (
                <span className="absolute top-2 end-2 min-w-[16px] rounded-full bg-destructive px-1 text-[9px] font-bold leading-4 text-destructive-foreground">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Calm first screen: hero + one line, content begins on scroll */}
      <HeroCarousel />

      {/* Purpose line — EDITABLE, see src/content/siteCopy.ts */}
      <p className="px-4 -mt-3 mb-4 text-[13px] font-semibold leading-relaxed text-foreground max-w-5xl mx-auto">
        {lang === "ar" ? HOME_PURPOSE_LINE.ar : HOME_PURPOSE_LINE.en}{" "}
        <button
          onClick={() => navigate("/about")}
          className="text-primary underline underline-offset-4 font-bold"
        >
          {lang === "ar" ? "من نحن" : "About Sandal"}
        </button>
      </p>

      <DiscoverFilters active={filter} onChange={setFilter} />

      <div className="max-w-5xl mx-auto pt-8">
        {/* Stories and inspiration lead the feed */}
        {show("stories") && <LatestPosts />}
        {show("events") && <EventsSection events={dbEvents} />}
        {show("audio-tours") && <AudioTourCards />}
        {show("experiences") && <ExperienceCards />}
        {show("trips") && <TripCards />}
        {show("stays") && <AccommodationCards />}
        {show("rides") && <TransportCards />}
        {show("products") && <ProductGrid />}

        {showExtras && (
          <>
            {/* SECONDARY: discovery extras, clearly demoted */}
            <div className="mt-4 mb-8 px-4 flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {lang === "ar" ? "المزيد للاستكشاف" : "More to explore"}
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <RegionScroll />
            <CollectionsSection />
            <HomeCausesSection />
          </>
        )}

        {/* Why Sandal? — collapsed footer */}
        <section className="mt-12 mb-8 border-t border-border pt-6">
          <button
            onClick={() => setWhyOpen((o) => !o)}
            className="focus-ring w-full flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
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
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigate("/about")}
              className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
            >
              {lang === "ar" ? "من نحن" : "About Sandal"}
            </button>
            <button
              onClick={() => navigate("/community")}
              className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
            >
              {lang === "ar" ? "المجتمع" : "Community"}
            </button>
            <button
              onClick={() => navigate("/people")}
              className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
            >
              {lang === "ar" ? "من هو من" : "Who's Who"}
            </button>
            <button
              onClick={() => navigate("/credits")}
              className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
            >
              {t("common.image_credits")}
            </button>
          </div>
        </section>
      </div>

      {/* Community FAB — sits above the nav bar */}
      <button
        onClick={() => navigate("/community")}
        className="fixed bottom-24 end-4 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-elevated flex items-center justify-center text-2xl"
        aria-label={lang === "ar" ? "المجتمع" : "Community"}
      >
        +
      </button>
    </div>
  );
};

export default Index;
