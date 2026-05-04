import { ArrowLeft, Share2, Headphones, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, MapPin, Clock, Navigation, Loader2, Download, CheckCircle2, Trash2, WifiOff, AlertCircle, ChevronRight, Feather } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import WishlistButton from "@/components/WishlistButton";
import { useNavigate, useParams } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { fetchByIdOrSlug } from "@/lib/fetchByIdOrSlug";
import DetailTestimonials from "@/components/DetailTestimonials";
import TourStopsMap from "@/components/TourStopsMap";
import TurnByTurnGuidance from "@/components/TurnByTurnGuidance";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserLocation, distanceMeters, formatDistance } from "@/hooks/useUserLocation";
import { useOfflineTour, useOnlineStatus } from "@/hooks/useOfflineTour";
import { toast } from "sonner";

const NEAR_THRESHOLD_M = 50; // when within 50m, mark stop as "near you"

const SAMPLE_AUDIO_URL = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const AudioTourDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang, t } = useI18n();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeStopIndex, setActiveStopIndex] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [geoEnabled, setGeoEnabled] = useState(false);
  const [followGeo, setFollowGeo] = useState(true);
  const userLoc = useUserLocation(geoEnabled);
  const isOnline = useOnlineStatus();
  const offline = useOfflineTour(id);
  const geoUnavailable = geoEnabled && !userLoc.loading && !userLoc.coords && !!userLoc.error;

  const { data: tour, isLoading } = useQuery({
    queryKey: ["audio_tour", id],
    queryFn: () => fetchByIdOrSlug("audio_tours", id!),
    enabled: !!id,
  });

  const narratorActorId = (tour as any)?.narrator_culture_actor_id as string | null | undefined;
  const { data: narratorActor } = useQuery({
    queryKey: ["audio_tour_narrator_actor", narratorActorId],
    enabled: !!narratorActorId,
    queryFn: async () => {
      const { data } = await supabase
        .from("culture_actors")
        .select("id, slug, name_en, name_ar, title_en, title_ar, image, expertise_en, expertise_ar")
        .eq("id", narratorActorId!)
        .maybeSingle();
      return data;
    },
  });

  const dbStops = (tour?.stops as Array<{ label_en: string; label_ar: string; lat: number; lng: number; desc_en?: string; desc_ar?: string }> | undefined) || [];
  const stopsCount = dbStops.length || tour?.stops_count || 5;
  const mapStops = dbStops.map((s) => ({
    label: { en: s.label_en, ar: s.label_ar },
    lat: s.lat,
    lng: s.lng,
  }));

  useEffect(() => {
    const audio = new Audio(SAMPLE_AUDIO_URL);
    audio.preload = "metadata";
    audioRef.current = audio;

    const onLoaded = () => { setDuration(audio.duration); setIsLoaded(true); };
    const onTimeUpdate = () => setCurrentTime(audio.duration ? audio.currentTime : 0);
    const onEnded = () => { setIsPlaying(false); setCurrentTime(0); setActiveStopIndex(0); };

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.src = "";
    };
  }, [tour?.id]);

  // Distances from user to each stop (with valid lat/lng)
  const stopDistances = useMemo(() => {
    if (!userLoc.coords) return [] as (number | null)[];
    return dbStops.map((s) =>
      typeof s.lat === "number" && typeof s.lng === "number"
        ? distanceMeters(userLoc.coords!, { lat: s.lat, lng: s.lng })
        : null
    );
  }, [userLoc.coords, dbStops]);

  const nearestStopIndex = useMemo(() => {
    if (stopDistances.length === 0) return -1;
    let best = -1;
    let bestD = Infinity;
    stopDistances.forEach((d, i) => {
      if (d != null && d < bestD) { bestD = d; best = i; }
    });
    return best;
  }, [stopDistances]);

  // Sync active stop with audio progress, OR with nearest stop when geo-following
  useEffect(() => {
    if (followGeo && geoEnabled && nearestStopIndex >= 0) {
      setActiveStopIndex(nearestStopIndex);
      return;
    }
    if (duration > 0) {
      const progress = currentTime / duration;
      setActiveStopIndex(Math.min(Math.floor(progress * stopsCount), stopsCount - 1));
    }
  }, [currentTime, duration, stopsCount, followGeo, geoEnabled, nearestStopIndex]);

  const enableGeo = useCallback(() => {
    setGeoEnabled(true);
    setFollowGeo(true);
    toast.success(lang === "ar" ? "تم تفعيل الموقع - الجولة ستتبع تحركك" : "Location on — the tour will follow your steps");
  }, [lang]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.pause(); else audio.play().catch(() => {});
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleSeek = useCallback((value: number[]) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    audio.currentTime = (value[0] / 100) * duration;
    setCurrentTime(audio.currentTime);
  }, [duration]);

  const skipForward = useCallback(() => {
    if (audioRef.current) audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 15, duration);
  }, [duration]);

  const skipBackward = useCallback(() => {
    if (audioRef.current) audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 15, 0);
  }, []);

  const cycleSpeed = useCallback(() => {
    const speeds = [0.75, 1, 1.25, 1.5, 2];
    const newRate = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
    setPlaybackRate(newRate);
    if (audioRef.current) audioRef.current.playbackRate = newRate;
  }, [playbackRate]);

  const toggleMute = useCallback(() => {
    if (audioRef.current) audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 space-y-4">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!tour) return <div className="p-8 text-center text-muted-foreground">Not found</div>;

  const title = lang === "ar" ? tour.title_ar : tour.title_en;
  const description = lang === "ar" ? tour.description_ar : tour.description_en;
  const narratorName = lang === "ar" ? tour.narrator_name_ar : tour.narrator_name_en;

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Hero */}
      <div className="relative">
        <img src={tour.image || "/placeholder.svg"} alt={title} className="w-full h-64 object-cover" />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 rounded-full bg-background/80 backdrop-blur-sm">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="p-2 rounded-full bg-background/80 backdrop-blur-sm">
            <Share2 className="w-5 h-5 text-foreground" />
          </button>
          <WishlistButton />
        </div>
        <div className="absolute bottom-3 left-4 flex gap-2">
          <span className="bg-primary/90 text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Headphones className="w-3 h-3" /> {lang === "ar" ? "جولة صوتية" : "Audio Tour"}
          </span>
        </div>
      </div>

      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-foreground mb-1">{title}</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {tour.duration_minutes} {lang === "ar" ? "دقيقة" : "min"}</span>
          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {stopsCount} {lang === "ar" ? "محطات" : "stops"}</span>
        </div>

        {/* Offline banner */}
        {!isOnline && (
          <div className="mb-3 flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-amber-900">
            <WifiOff className="w-4 h-4 mt-0.5 shrink-0" />
            <p className="text-xs leading-snug">
              {lang === "ar"
                ? offline.downloaded
                  ? "أنت غير متصل بالإنترنت — يتم تشغيل النسخة المحفوظة من الجولة."
                  : "أنت غير متصل بالإنترنت. حمّل الجولة مسبقاً لتشغيلها بدون إنترنت."
                : offline.downloaded
                ? "You're offline — playing the saved copy of this tour."
                : "You're offline. Download the tour ahead of time to use it without internet."}
            </p>
          </div>
        )}

        {/* GPS unavailable banner */}
        {geoUnavailable && (
          <div className="mb-3 flex items-start gap-2 rounded-xl bg-destructive/10 border border-destructive/30 px-3 py-2 text-destructive">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p className="text-xs leading-snug">
              {lang === "ar"
                ? "GPS غير متاح. ستعمل الجولة بترتيب المحطات بدون التتبع التلقائي."
                : "GPS unavailable. The tour will play in stop order without auto-following your location."}
            </p>
          </div>
        )}

        {/* Download for offline */}
        {mapStops.length > 0 && (
          <div className="mb-4">
            {offline.downloaded ? (
              <div className="flex items-center justify-between gap-2 rounded-xl bg-success/10 border border-success/30 px-3 py-2">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs font-semibold">
                    {lang === "ar" ? "متاحة بدون إنترنت" : "Available offline"}
                  </span>
                </div>
                <button
                  onClick={async () => {
                    await offline.remove();
                    toast.success(lang === "ar" ? "تم حذف النسخة المحفوظة" : "Offline copy removed");
                  }}
                  className="text-xs text-muted-foreground flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {lang === "ar" ? "حذف" : "Remove"}
                </button>
              </div>
            ) : offline.downloading ? (
              <div className="rounded-xl bg-primary/10 border border-primary/30 px-3 py-2">
                <div className="flex items-center gap-2 text-primary mb-1">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs font-semibold">
                    {lang === "ar" ? `جارٍ التحميل... ${offline.progress}%` : `Downloading... ${offline.progress}%`}
                  </span>
                </div>
                <div className="h-1.5 bg-primary/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${offline.progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <button
                onClick={async () => {
                  toast.info(lang === "ar" ? "بدء تحميل الجولة..." : "Starting download...");
                  await offline.download(SAMPLE_AUDIO_URL, mapStops.map((s) => ({ lat: s.lat, lng: s.lng })));
                  toast.success(lang === "ar" ? "الجولة متاحة الآن بدون إنترنت" : "Tour saved for offline use");
                }}
                disabled={!isOnline}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                {lang === "ar" ? "تحميل للاستخدام بدون إنترنت" : "Download for offline use"}
              </button>
            )}
          </div>
        )}

        {/* Narrator */}
        {narratorName && (() => {
          const actor = narratorActor as any;
          const displayName = actor ? (lang === "ar" ? actor.name_ar : actor.name_en) : narratorName;
          const displayTitle = actor ? (lang === "ar" ? actor.title_ar : actor.title_en) : null;
          const displayImage = actor?.image || tour.narrator_image;
          const expertise = actor ? ((lang === "ar" ? actor.expertise_ar : actor.expertise_en) ?? []) as string[] : [];
          const target = actor ? `/culture-actor/${actor.slug ?? actor.id}` : null;
          const Wrapper: any = target ? "button" : "div";
          return (
            <Wrapper
              {...(target ? { onClick: () => navigate(target), type: "button" } : {})}
              className={`w-full text-start flex items-center gap-3 p-3 rounded-xl bg-surface mb-6 ${target ? "hover:bg-secondary transition-colors cursor-pointer" : ""}`}
            >
              {displayImage ? (
                <img src={displayImage} alt={displayName} className="w-14 h-14 rounded-full object-cover border-2 border-primary/20 flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-lg flex-shrink-0">🎙️</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-primary uppercase tracking-wide flex items-center gap-1">
                  <Feather className="w-3 h-3" />
                  {lang === "ar" ? "الراوي" : "Narrator"}
                </p>
                <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
                {displayTitle ? (
                  <p className="text-xs text-muted-foreground truncate">{displayTitle}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">{(tour.languages || ["en"]).join(", ")}</p>
                )}
                {expertise.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {expertise.slice(0, 2).map((s, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{s}</span>
                    ))}
                  </div>
                )}
              </div>
              {target && <ChevronRight className={`w-4 h-4 text-muted-foreground flex-shrink-0 ${lang === "ar" ? "rotate-180" : ""}`} />}
            </Wrapper>
          );
        })()}

        {/* Description */}
        {description && (
          <>
            <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "عن الجولة" : "About This Tour"}</h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{description}</p>
          </>
        )}

        {/* Geo CTA / status */}
        {mapStops.length > 0 && (
          <div className="mb-3">
            {!geoEnabled ? (
              <button
                onClick={enableGeo}
                className="w-full flex items-center justify-center gap-2 bg-primary/10 text-primary border border-primary/30 rounded-xl py-2.5 text-sm font-semibold"
              >
                <Navigation className="w-4 h-4" /> {lang === "ar" ? "ابدأ الجولة بالموقع" : "Start tour with my location"}
              </button>
            ) : userLoc.loading && !userLoc.coords ? (
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> {lang === "ar" ? "جارٍ تحديد موقعك..." : "Locating you..."}
              </div>
            ) : userLoc.error ? (
              <div className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                {lang === "ar" ? "تعذّر الوصول للموقع. فعّل الإذن في المتصفح." : "Couldn't access location. Enable permission in your browser."}
              </div>
            ) : (
              <button
                onClick={() => setFollowGeo((v) => !v)}
                className={`w-full flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold ${
                  followGeo ? "bg-primary text-primary-foreground" : "bg-surface text-foreground border border-border"
                }`}
              >
                <Navigation className="w-3.5 h-3.5" />
                {followGeo
                  ? (lang === "ar" ? "يتبع موقعك ✓" : "Following your location ✓")
                  : (lang === "ar" ? "تشغيل تتبع الموقع" : "Resume location tracking")}
              </button>
            )}
          </div>
        )}

        {/* Turn-by-turn guidance to the next stop */}
        {dbStops.length > 0 && (
          <TurnByTurnGuidance
            stops={dbStops}
            activeStopIndex={activeStopIndex}
            userCoords={userLoc.coords ? { lat: userLoc.coords.lat, lng: userLoc.coords.lng } : null}
          />
        )}

        {/* Route Map */}
        {mapStops.length > 0 && (
          <>
            <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "خريطة المسار" : "Route Map"}</h2>
            <TourStopsMap
              stops={mapStops}
              userLocation={userLoc.coords ? { lat: userLoc.coords.lat, lng: userLoc.coords.lng } : null}
              activeStopIndex={activeStopIndex}
            />
          </>
        )}

        {/* Stops */}
        <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "المحطات" : "Tour Stops"}</h2>
        <div className="mb-6">
          {Array.from({ length: stopsCount }).map((_, i) => {
            const stop = dbStops[i];
            const stopLabel = stop ? (lang === "ar" ? stop.label_ar : stop.label_en) : (lang === "ar" ? `المحطة ${i + 1}` : `Stop ${i + 1}`);
            const stopDesc = stop ? (lang === "ar" ? stop.desc_ar : stop.desc_en) : "";
            const dist = stopDistances[i];
            const isNear = dist != null && dist <= NEAR_THRESHOLD_M;
            return (
              <div key={i} className="flex gap-3 pb-4">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                    i === activeStopIndex ? "bg-primary text-primary-foreground" : i < activeStopIndex ? "bg-primary/30 text-primary" : "bg-muted text-muted-foreground"
                  }`}>{i + 1}</div>
                  {i < stopsCount - 1 && <div className="w-0.5 flex-1 bg-primary/20 mt-1" />}
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-sm font-semibold text-foreground">{stopLabel}</p>
                  {stopDesc && (
                    <p dir="auto" className="text-[12px] text-muted-foreground leading-relaxed mt-1 text-start">
                      {stopDesc}
                    </p>
                  )}
                  {dist != null && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                        <Navigation className="w-3 h-3" /> {formatDistance(dist, lang)}
                      </span>
                      {isNear && (
                        <span className="text-[10px] font-semibold text-success bg-success/10 px-1.5 py-0.5 rounded-full">
                          {lang === "ar" ? "بجوارك" : "Near you"}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <DetailTestimonials />
      </div>

      {/* Audio Player */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-3 z-50">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] text-muted-foreground w-10 text-right">{formatTime(currentTime)}</span>
          <Slider value={[progressPercent]} max={100} step={0.1} onValueChange={handleSeek} className="flex-1" />
          <span className="text-[10px] text-muted-foreground w-10">{formatTime(duration)}</span>
        </div>
        <div className="flex items-center justify-between">
          <button onClick={cycleSpeed} className="text-[10px] font-bold text-muted-foreground w-10">{playbackRate}x</button>
          <div className="flex items-center gap-4">
            <button onClick={skipBackward}><SkipBack className="w-5 h-5 text-foreground" /></button>
            <button onClick={togglePlay} className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <button onClick={skipForward}><SkipForward className="w-5 h-5 text-foreground" /></button>
          </div>
          <button onClick={toggleMute}>{isMuted ? <VolumeX className="w-5 h-5 text-muted-foreground" /> : <Volume2 className="w-5 h-5 text-foreground" />}</button>
        </div>
      </div>
    </div>
  );
};

export default AudioTourDetail;
