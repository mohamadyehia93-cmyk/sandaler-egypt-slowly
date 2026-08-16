import MessageOwnerButton from "@/components/MessageOwnerButton";
import ShareButton from "@/components/ShareButton";
import { ArrowLeft, Headphones, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, MapPin, Clock, Navigation, Loader2, Download, CheckCircle2, Trash2, WifiOff, AlertCircle, ChevronRight, Feather, Footprints } from "lucide-react";
import MachineTranslatedNote from "@/components/MachineTranslatedNote";
import { supabase } from "@/integrations/supabase/client";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import WishlistButton from "@/components/WishlistButton";
import { useNavigate, useParams } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { fetchByIdOrSlug } from "@/lib/fetchByIdOrSlug";
import TourStopsMap from "@/components/TourStopsMap";
import TurnByTurnGuidance from "@/components/TurnByTurnGuidance";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserLocation, distanceMeters, formatDistance } from "@/hooks/useUserLocation";
import { useOfflineTour, useOnlineStatus } from "@/hooks/useOfflineTour";
import { toast } from "sonner";
import NotFoundView from "@/components/NotFound";
import { directionsToUrl, routeUrl, hasCoords } from "@/lib/mapsLinks";


const NEAR_THRESHOLD_M = 50; // when within 50m, mark stop as "near you"


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

  const dbStops = ((tour?.stops as Array<{ label_en: string; label_ar: string; lat: number; lng: number; desc_en?: string; desc_ar?: string; directions_en?: string; directions_ar?: string; audio_url?: string | null }> | undefined) || []).filter(Boolean);
  const stopsCount = dbStops.length || tour?.stops_count || 0;
  // Only stops the narrator actually pinned can go on the map.
  const mapStops = dbStops
    .filter((s) => Number.isFinite(Number(s?.lat)) && Number.isFinite(Number(s?.lng)))
    .map((s) => ({
      label: { en: s.label_en, ar: s.label_ar },
      lat: Number(s.lat),
      lng: Number(s.lng),
    }));
  // Google Maps navigation links. Travel mode is always walking: `theme` on
  // audio_tours is a content topic (History, Food, ...), never a transport mode.
  const startPoint = dbStops.find((s) => hasCoords(s));
  const startNavUrl = startPoint ? directionsToUrl(startPoint, "walking") : null;
  const fullRoute = routeUrl(dbStops, "walking");




  // This tour's OWN narration: the tour-level track, else the first stop clip.
  // Never fall back to another tour's audio — when there is none we say so.
  const audioSrc =
    ((tour as any)?.audio_url as string | null | undefined) ||
    dbStops.find((s) => !!s.audio_url)?.audio_url ||
    null;

  // ---- Virtual (podcast) mode -------------------------------------------
  // Plays the tour straight through with no GPS: for listeners who are not
  // physically there. Works with per-stop clips (a playlist that auto-advances)
  // AND with a single full-tour file (skip jumps between stop segments).
  const clipStops = useMemo(
    () => dbStops.map((s, index) => ({ ...s, index })).filter((s) => !!s.audio_url),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tour?.id, stopsCount]
  );
  const [virtualMode, setVirtualMode] = useState(false);
  const [virtualIndex, setVirtualIndex] = useState(0);
  const autoplayNextRef = useRef(false);
  const usesPlaylist = virtualMode && clipStops.length > 1;
  const activeSrc = usesPlaylist
    ? clipStops[Math.min(virtualIndex, clipStops.length - 1)]?.audio_url || audioSrc
    : audioSrc;

  useEffect(() => {
    if (!activeSrc) {
      audioRef.current = null;
      setIsLoaded(false);
      setIsPlaying(false);
      setDuration(0);
      setCurrentTime(0);
      return;
    }
    const audio = new Audio(activeSrc);
    audio.preload = "metadata";
    audio.playbackRate = playbackRate;
    audioRef.current = audio;

    const onLoaded = () => {
      setDuration(audio.duration);
      setIsLoaded(true);
      if (autoplayNextRef.current) {
        autoplayNextRef.current = false;
        audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
    };
    const onTimeUpdate = () => setCurrentTime(audio.duration ? audio.currentTime : 0);
    const onEnded = () => {
      setCurrentTime(0);
      if (usesPlaylist && virtualIndex < clipStops.length - 1) {
        autoplayNextRef.current = true;
        setVirtualIndex((i) => i + 1);
        return;
      }
      setIsPlaying(false);
      if (!virtualMode) setActiveStopIndex(0);
    };

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
  // playbackRate intentionally excluded: cycleSpeed applies it in place.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tour?.id, activeSrc, usesPlaylist, virtualIndex, clipStops.length, virtualMode]);



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

  // Sync active stop: virtual playlist position, else nearest stop when
  // geo-following, else audio progress.
  useEffect(() => {
    if (usesPlaylist) {
      const target = clipStops[Math.min(virtualIndex, clipStops.length - 1)];
      if (target) setActiveStopIndex(target.index);
      return;
    }
    if (!virtualMode && followGeo && geoEnabled && nearestStopIndex >= 0) {
      setActiveStopIndex(nearestStopIndex);
      return;
    }
    if (duration > 0) {
      const progress = currentTime / duration;
      setActiveStopIndex(Math.min(Math.floor(progress * stopsCount), stopsCount - 1));
    }
  }, [currentTime, duration, stopsCount, followGeo, geoEnabled, nearestStopIndex, usesPlaylist, virtualMode, virtualIndex, clipStops]);

  const enableGeo = useCallback(() => {
    setVirtualMode(false);
    setGeoEnabled(true);
    setFollowGeo(true);
    toast.success(lang === "ar" ? "تم تفعيل الموقع - الجولة ستتبع تحركك" : "Location on — the tour will follow your steps");
  }, [lang]);

  /** Move between stops in virtual mode (playlist hop, or seek within one track). */
  const goToVirtualStop = useCallback(
    (delta: 1 | -1) => {
      if (usesPlaylist) {
        const next = Math.min(Math.max(virtualIndex + delta, 0), clipStops.length - 1);
        if (next === virtualIndex) return;
        autoplayNextRef.current = isPlaying;
        setVirtualIndex(next);
        return;
      }
      const audio = audioRef.current;
      if (!audio || !duration || stopsCount === 0) return;
      const target = Math.min(Math.max(activeStopIndex + delta, 0), stopsCount - 1);
      audio.currentTime = (target / stopsCount) * duration;
      setCurrentTime(audio.currentTime);
      setActiveStopIndex(target);
    },
    [usesPlaylist, virtualIndex, clipStops.length, isPlaying, duration, stopsCount, activeStopIndex]
  );

  const toggleVirtualMode = useCallback(() => {
    setVirtualMode((prev) => {
      const next = !prev;
      if (next) {
        setFollowGeo(false);
        setVirtualIndex(0);
        autoplayNextRef.current = false;
      }
      return next;
    });
  }, []);


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

  if (!tour) return <NotFoundView context="audio-tour" />;

  const title = lang === "ar" ? (tour.title_ar || tour.title_en) : tour.title_en;
  const description = lang === "ar" ? (tour.description_ar || tour.description_en) : tour.description_en;
  const narratorName = lang === "ar" ? (tour.narrator_name_ar || tour.narrator_name_en) : tour.narrator_name_en;

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Hero */}
      <div className="relative">
        <img src={tour.image || "/placeholder.svg"} alt={title} className="w-full h-64 object-cover" />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 rounded-full bg-background/80 backdrop-blur-sm">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="absolute top-4 right-4 flex gap-2">
          <ShareButton title={lang === "ar" ? (tour as any).title_ar : (tour as any).title_en} />
          <WishlistButton itemType="audio_tour" itemId={tour?.id} />
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

        {/* Google Maps navigation — small text actions, never competing with Play */}
        {(startNavUrl || fullRoute) && (
          <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1.5">
            {startNavUrl && (
              <a
                href={startNavUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="nav-to-start"
                className="text-xs font-semibold text-primary flex items-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5" />
                {lang === "ar" ? "الاتجاهات إلى نقطة البداية" : "Directions to the start"}
              </a>
            )}
            {fullRoute && (
              <a
                href={fullRoute.url}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="nav-full-route"
                className="text-xs font-semibold text-primary flex items-center gap-1.5"
              >
                <Footprints className="w-3.5 h-3.5" />
                {lang === "ar" ? "المسار كامل في خرائط جوجل" : "Whole route in Google Maps"}
              </a>
            )}
            {fullRoute?.truncatedTo && (
              <span className="text-[11px] text-muted-foreground w-full">
                {lang === "ar"
                  ? `تعرض خرائط جوجل أول ${fullRoute.truncatedTo} محطات فقط (حدّ نقاط الطريق).`
                  : `Google Maps shows the first ${fullRoute.truncatedTo} stops only (waypoint limit).`}
              </span>
            )}
          </div>
        )}



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
        {audioSrc && mapStops.length > 0 && (

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
                  await offline.download(audioSrc, mapStops.map((s) => ({ lat: s.lat, lng: s.lng })));
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
          const displayName = actor ? (lang === "ar" ? (actor.name_ar || actor.name_en) : actor.name_en) : narratorName;
          const displayTitle = actor ? (lang === "ar" ? (actor.title_ar || actor.title_en) : actor.title_en) : null;
          const displayImage = actor?.image || tour.narrator_image;
          const expertise = actor ? ((lang === "ar" ? (actor.expertise_ar || actor.expertise_en) : actor.expertise_en) ?? []) as string[] : [];
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

        {/* Message the narrator: the linked culture actor when set, else the tour creator */}
        {(narratorActorId || (tour as any).creator_id) && (
          <div className="-mt-3 mb-6 flex">
            <MessageOwnerButton
              ownerId={narratorActorId || (tour as any).creator_id}
              kind={narratorActorId ? "culture_actor" : "auto"}
              label={lang === "ar" ? "مراسلة الراوي" : "Message narrator"}
            />
          </div>
        )}


        {/* Description */}
        {description && (
          <>
            <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "عن الجولة" : "About This Tour"}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            <MachineTranslatedNote meta={(tour as any)?.translation_meta} field={lang === "ar" ? "description_ar" : "description_en"} className="mb-6" />
          </>
        )}

        {/* Playback mode: on-location (GPS) vs virtual / podcast mode */}
        {audioSrc && (
          <div className="mb-3 rounded-xl bg-surface border border-border p-1 flex gap-1">
            <button
              onClick={() => { if (virtualMode) toggleVirtualMode(); }}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-colors ${
                !virtualMode ? "bg-primary text-primary-foreground" : "text-foreground"
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              {lang === "ar" ? "أنا في المكان" : "I'm on location"}
            </button>
            <button
              onClick={() => { if (!virtualMode) toggleVirtualMode(); }}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-colors ${
                virtualMode ? "bg-primary text-primary-foreground" : "text-foreground"
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              {lang === "ar" ? "استمع من أي مكان" : "Listen from anywhere"}
            </button>
          </div>
        )}
        {virtualMode && (
          <p className="text-[11px] text-muted-foreground mb-3 leading-snug">
            {lang === "ar"
              ? "التشغيل الافتراضي: تُشغَّل المحطات بالترتيب وتنتقل تلقائياً — بدون موقع أو GPS."
              : "Virtual playback: stops play in order and advance automatically — no location or GPS needed."}
          </p>
        )}

        {/* Geo CTA / status — hidden in virtual mode */}
        {mapStops.length > 0 && !virtualMode && (

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

        {/* Written walking directions — readable without playing any audio */}
        {(() => {
          const dirOf = (i: number) => {
            const s = dbStops[i];
            if (!s) return "";
            return (lang === "ar" ? s.directions_ar || s.directions_en : s.directions_en || s.directions_ar) || "";
          };
          const labelOf = (i: number) => {
            const s = dbStops[i];
            if (!s) return lang === "ar" ? `المحطة ${i + 1}` : `Stop ${i + 1}`;
            return (lang === "ar" ? s.label_ar || s.label_en : s.label_en || s.label_ar) || "";
          };
          const rows = [
            { i: activeStopIndex, text: dirOf(activeStopIndex), current: true },
            { i: activeStopIndex + 1, text: dirOf(activeStopIndex + 1), current: false },
          ].filter((r) => r.i < stopsCount && !!r.text);
          if (rows.length === 0) return null;
          return (
            <div className="mb-4 rounded-xl bg-surface border border-border p-3 space-y-3">
              <p className="text-[11px] font-bold text-primary uppercase tracking-wide flex items-center gap-1.5">
                <Footprints className="w-3.5 h-3.5" />
                {lang === "ar" ? "تعليمات المشي" : "Walking directions"}
              </p>
              {rows.map((r) => (
                <div key={r.i} className="text-start">
                  <p className="text-[10px] font-semibold text-muted-foreground">
                    {r.current
                      ? (lang === "ar" ? `إلى المحطة الحالية: ${labelOf(r.i)}` : `To current stop: ${labelOf(r.i)}`)
                      : (lang === "ar" ? `إلى المحطة التالية: ${labelOf(r.i)}` : `To next stop: ${labelOf(r.i)}`)}
                  </p>
                  <p dir="auto" className="text-[13px] text-foreground leading-relaxed mt-0.5">{r.text}</p>
                </div>
              ))}
              {startNavUrl && (
                <a
                  href={startNavUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="nav-to-start-card"
                  className="text-xs font-semibold text-primary flex items-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  {lang === "ar" ? "الاتجاهات إلى نقطة البداية" : "Directions to the start"}
                </a>
              )}
            </div>

          );
        })()}

        {/* Turn-by-turn guidance to the next stop (GPS mode only) */}
        {dbStops.length > 0 && !virtualMode && (
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
            // Fall back to the other language rather than showing nothing:
            // narrators often author a stop in one language only.
            const stopLabel = stop ? (lang === "ar" ? (stop.label_ar || stop.label_en) : (stop.label_en || stop.label_ar)) : (lang === "ar" ? `المحطة ${i + 1}` : `Stop ${i + 1}`);
            const stopDesc = stop ? (lang === "ar" ? (stop.desc_ar || stop.desc_en) : (stop.desc_en || stop.desc_ar)) : "";
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
                  {(() => {
                    const d = stop ? (lang === "ar" ? stop.directions_ar || stop.directions_en : stop.directions_en || stop.directions_ar) : "";
                    if (!d) return null;
                    return (
                      <p dir="auto" className="text-[12px] text-primary leading-relaxed mt-1 flex items-start gap-1.5 text-start">
                        <Footprints className="w-3 h-3 mt-0.5 shrink-0" />
                        <span>{d}</span>
                      </p>
                    );
                  })()}
                  {stopDesc && (
                    <p dir="auto" className="text-[12px] text-muted-foreground leading-relaxed mt-1 text-start">
                      {stopDesc}
                    </p>
                  )}

                  {stop?.audio_url && (
                    <audio
                      controls
                      preload="none"
                      src={stop.audio_url}
                      className="w-full h-8 mt-2"
                    />
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
                  {/* Per-stop navigation — only when the narrator pinned this stop */}
                  {hasCoords(stop) && (
                    <a
                      href={directionsToUrl(stop, "walking")}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid={`nav-stop-${i}`}
                      className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-primary"
                    >
                      <Navigation className="w-3 h-3" />
                      {lang === "ar" ? "الاتجاهات" : "Directions"}
                    </a>
                  )}

                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Audio Player — only when this tour has its own narration */}
      {audioSrc ? (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-3 z-50">
          {virtualMode && stopsCount > 0 && (
            <p dir="auto" className="text-[10px] text-muted-foreground mb-1 text-start truncate">
              {lang === "ar" ? "الآن" : "Now playing"} · {activeStopIndex + 1}/{stopsCount}
              {" · "}
              {(() => {
                const s = dbStops[activeStopIndex];
                return s ? (lang === "ar" ? s.label_ar || s.label_en : s.label_en || s.label_ar) : "";
              })()}
            </p>
          )}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] text-muted-foreground w-10 text-right">{formatTime(currentTime)}</span>
            <Slider value={[progressPercent]} max={100} step={0.1} onValueChange={handleSeek} className="flex-1" />
            <span className="text-[10px] text-muted-foreground w-10">{formatTime(duration)}</span>
          </div>
          <div className="flex items-center justify-between">
            <button onClick={cycleSpeed} className="text-[10px] font-bold text-muted-foreground w-10">{playbackRate}x</button>
            <div className="flex items-center gap-4">
              <button
                aria-label={virtualMode ? (lang === "ar" ? "المحطة السابقة" : "Previous stop") : (lang === "ar" ? "رجوع ١٥ ثانية" : "Back 15 seconds")}
                onClick={() => (virtualMode ? goToVirtualStop(-1) : skipBackward())}
              >
                <SkipBack className="w-5 h-5 text-foreground" />
              </button>
              <button onClick={togglePlay} className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              <button
                aria-label={virtualMode ? (lang === "ar" ? "المحطة التالية" : "Next stop") : (lang === "ar" ? "تقديم ١٥ ثانية" : "Forward 15 seconds")}
                onClick={() => (virtualMode ? goToVirtualStop(1) : skipForward())}
              >
                <SkipForward className="w-5 h-5 text-foreground" />
              </button>
            </div>
            <button onClick={toggleMute}>{isMuted ? <VolumeX className="w-5 h-5 text-muted-foreground" /> : <Volume2 className="w-5 h-5 text-foreground" />}</button>
          </div>
        </div>

      ) : (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-3 z-50">
          <div className="flex items-start gap-2 text-muted-foreground">
            <Headphones className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                {lang === "ar" ? "الصوت قادم قريباً" : "Audio coming soon"}
              </p>
              <p className="text-[11px] leading-snug">
                {lang === "ar"
                  ? "لم يقم الراوي برفع تسجيل هذه الجولة بعد. يمكنك استعراض المحطات والمسار الآن."
                  : "The narrator hasn't uploaded this tour's recording yet. You can still browse the stops and route."}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AudioTourDetail;
