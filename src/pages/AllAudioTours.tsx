import { ArrowLeft, Headphones, Play, Download, Search, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { audioTours, regions } from "@/lib/sampleData";
import CityBadge from "@/components/CityBadge";
import { useState } from "react";

const AllAudioTours = () => {
  const { lang, t } = useI18n();
  const navigate = useNavigate();
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = audioTours.filter((a) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return a.title.en.toLowerCase().includes(q) || a.title.ar.includes(q);
    }
    return true;
  });

  const regionIds = [...new Set(audioTours.map((a) => a.regionId))];
  const regionList = regionIds.map((rid) => {
    const r = regions.find((reg) => reg.id === rid);
    return { id: rid, name: r ? t(r.nameKey) : rid, emoji: r?.emoji || "📍" };
  });

  const visibleRegions = activeRegion ? [activeRegion] : regionIds;

  return (
    <div className="min-h-screen bg-surface pb-8">
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-secondary">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">
            {lang === "ar" ? "جميع الجولات الصوتية" : "All Audio Tours"}
          </h1>
          <span className="text-xs text-muted-foreground ms-auto">{filtered.length} {lang === "ar" ? "جولة" : "tours"}</span>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === "ar" ? "ابحث في الجولات..." : "Search tours..."}
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Region Tabs */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveRegion(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors ${
              !activeRegion ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"
            }`}
          >
            {lang === "ar" ? "كل المناطق" : "All Regions"}
          </button>
          {regionList.map((r) => {
            const count = filtered.filter((a) => a.regionId === r.id).length;
            if (count === 0) return null;
            return (
              <button
                key={r.id}
                onClick={() => setActiveRegion(activeRegion === r.id ? null : r.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors flex items-center gap-1.5 ${
                  activeRegion === r.id ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"
                }`}
              >
                {r.emoji} {r.name}
                <span className="opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
      </header>

      <div className="px-4 pt-4">
        {visibleRegions.map((regionId) => {
          const tours = filtered.filter((a) => a.regionId === regionId);
          if (tours.length === 0) return null;
          const region = regions.find((r) => r.id === regionId);
          const regionName = region ? t(region.nameKey) : regionId;
          const regionEmoji = region?.emoji || "📍";

          return (
            <div key={regionId} className="mb-8">
              {/* Region Header */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{regionEmoji}</span>
                <h2 className="text-base font-bold text-foreground">{regionName}</h2>
                <span className="text-xs text-muted-foreground">({tours.length})</span>
                <button
                  onClick={() => navigate(`/region/${regionId}`)}
                  className="ms-auto text-[10px] text-primary font-semibold flex items-center gap-0.5"
                >
                  <MapPin className="w-3 h-3" />
                  {lang === "ar" ? "زيارة المنطقة" : "Visit Region"}
                </button>
              </div>

              {/* Tours Grid */}
              <div className="grid grid-cols-2 gap-3">
                {tours.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => navigate(`/audio-tour/${a.id}`)}
                    className="rounded-xl overflow-hidden bg-card shadow-card border border-border cursor-pointer active:scale-[0.97] transition-transform"
                  >
                    <div className="relative h-28">
                      <img src={a.image} alt={a.title[lang]} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-primary/90 text-primary-foreground px-1.5 py-0.5 rounded-full text-[9px] font-medium">
                        <Headphones className="w-2.5 h-2.5" />
                        {a.duration} {t("common.min")}
                      </div>
                      <button
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-primary text-primary-foreground"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Play className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-1.5 left-1.5 right-1.5">
                        <h3 className="text-[11px] font-bold text-white line-clamp-2 leading-tight">{a.title[lang]}</h3>
                      </div>
                    </div>
                    <div className="p-2.5 flex items-center justify-between">
                      <div>
                        <CityBadge cityId={a.cityId} />
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {a.stops} {t("common.stops")}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-primary">
                        {a.price === 0 ? t("common.free") : `${a.price} ${t("common.egp")}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {lang === "ar" ? "لا توجد نتائج" : "No tours found"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllAudioTours;
