import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Calendar } from "lucide-react";
import { useI18n } from "@/lib/i18n";
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
  const navigate = useNavigate();

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
          <button className="relative p-1.5">
            <Bell className="w-5 h-5 text-foreground" />
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-destructive rounded-full" />
          </button>
        </div>
      </header>

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
