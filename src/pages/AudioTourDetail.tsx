import MessageOwnerButton from "@/components/MessageOwnerButton";
import { Headphones, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, MapPin, Clock, Navigation, Loader2, Download, CheckCircle2, Trash2, WifiOff, AlertCircle, Feather, Footprints, Layers } from "lucide-react";
import MachineTranslatedNote from "@/components/MachineTranslatedNote";
import { supabase } from "@/integrations/supabase/client";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
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
import ListingHero from "@/components/listing/ListingHero";
import KeyFacts, { type KeyFact } from "@/components/listing/KeyFacts";
import Section from "@/components/listing/Section";
import ActionBar from "@/components/listing/ActionBar";
import ReadBeforeYouGo from "@/components/listing/ReadBeforeYouGo";
import Avatar from "@/components/AvatarFallback";
import { fmtNumber, formatDuration, splitStandfirst } from "@/components/listing/format";
import { Languages, Tag, Rewind, FastForward } from "lucide-react";
import { directionsToUrl, routeUrl, hasCoords } from "@/lib/mapsLinks";


const NEAR_THRESHOLD_M = 50; // when within 50m, mark stop as "near you"

/**
 * A nested SEGMENT is heard once the listener has ARRIVED at its stop, so it
 * deliberately carries no coordinates and no walking directions — only the stop
 * has those (and only stops feed the map + Google Maps route).
 */
type TourSegment = { title_en?: string; title_ar?: string; desc_en?: string; desc_ar?: string; audio_url?: string | null };
type TourStop = {
  label_en: string; label_ar: string; lat: number; lng: number;
  desc_en?: string; desc_ar?: string; directions_en?: string; directions_ar?: string;
  audio_url?: string | null;
  /** Optional; absent on every tour authored before segments existed. */
  segments?: TourSegment[];
};

/** One playable unit: either a stop's own clip, or one segment inside a stop. */
type PlayItem = {
  stopIndex: number;
  /** null when the item is the stop's own single clip. */
  segIndex: number | null;
  segCount: number;
  src: string;
  title_en: string;
  title_ar: string;
};


const formatTime = (seconds: number, ar = false) => {
  const sec = Number.isFinite(seconds) ? seconds : 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const txt = `${m}:${s.toString().padStart(2, "0")}`;
  return ar ? txt.replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]) : txt;
};

const AudioTourDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useI18n();

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
        .select("id, slug, name_en, name_ar, title_en, title_ar, image, expertise_en, expertise_ar, bio_en, bio_ar")
        .eq("id", narratorActorId!)
        .maybeSingle();
      return data;
    },
  });

  const { data: tourCity } = useQuery({
    queryKey: ["city-name", (tour as any)?.city_id],
    enabled: !!(tour as any)?.city_id,
    queryFn: async () => (await supabase.from("cities").select("name_en, name_ar").eq("id", (tour as any).city_id).maybeSingle()).data,
  });
  const playerRef = useRef<HTMLDivElement | null>(null);
  const stopsRef = useRef<HTMLElement | null>(null);

  const dbStops = ((tour?.stops as TourStop[] | undefined) || []).filter(Boolean);


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




  // This tour's OWN narration: the tour-level track, else the first stop clip,
  // else the first segment clip (a stop may carry audio only on its segments).
  // Never fall back to another tour's audio — when there is none we say so.
  const audioSrc =
    ((tour as any)?.audio_url as string | null | undefined) ||
    dbStops.find((s) => !!s.audio_url)?.audio_url ||
    dbStops.flatMap((s) => (Array.isArray(s.segments) ? s.segments : [])).find((g) => !!g?.audio_url)?.audio_url ||
    null;

  // ---- Playlist: stops and their nested segments -------------------------
  // A flat list of playable units in tour order. A stop WITH segments yields one
  // item per segment; a stop without segments yields its own single clip, exactly
  // as before. Used by virtual (podcast) mode across the whole tour, and by GPS
  // mode to auto-advance segments once the listener has arrived at a stop.
  const playItems = useMemo<PlayItem[]>(() => {
    const items: PlayItem[] = [];
    dbStops.forEach((s, stopIndex) => {
      const segs = (Array.isArray(s.segments) ? s.segments : []).filter((g) => !!g?.audio_url);
      if (segs.length) {
        segs.forEach((g, segIndex) =>
          items.push({
            stopIndex,
            segIndex,
            segCount: segs.length,
            src: g.audio_url as string,
            title_en: g.title_en || "",
            title_ar: g.title_ar || "",
          })
        );
      } else if (s.audio_url) {
        items.push({
          stopIndex,
          segIndex: null,
          segCount: 0,
          src: s.audio_url,
          title_en: s.label_en || "",
          title_ar: s.label_ar || "",
        });
      }
    });
    return items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tour?.id, stopsCount]);

  const hasSegmentItems = playItems.some((it) => it.segIndex !== null);
  const [virtualMode, setVirtualMode] = useState(false);
  const [playIndex, setPlayIndex] = useState(0);
  const autoplayNextRef = useRef(false);
  // Segmented tours use the playlist in GPS mode too, so segments can advance on
  // their own once the listener arrives. Unsegmented tours keep today's behaviour.
  const usesPlaylist = playItems.length > 1 && (virtualMode || hasSegmentItems);
  const currentItem = usesPlaylist ? playItems[Math.min(playIndex, playItems.length - 1)] : null;
  const activeSrc = currentItem?.src || audioSrc;

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
      // Auto-advance: to the next segment inside this stop, then across the stop
      // boundary to the next stop's first segment.
      if (usesPlaylist && playIndex < playItems.length - 1) {
        autoplayNextRef.current = true;
        setPlayIndex((i) => i + 1);
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
  }, [tour?.id, activeSrc, usesPlaylist, playIndex, playItems.length, virtualMode]);



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

  // Sync active stop: playlist position, else nearest stop when geo-following,
  // else audio progress through a single full-tour track.
  useEffect(() => {
    if (usesPlaylist) {
      const target = playItems[Math.min(playIndex, playItems.length - 1)];
      if (target) setActiveStopIndex(target.stopIndex);
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
  }, [currentTime, duration, stopsCount, followGeo, geoEnabled, nearestStopIndex, usesPlaylist, virtualMode, playIndex, playItems]);

  // GPS mode: arriving at a stop jumps the playlist to that stop's FIRST segment.
  // Once inside a stop we leave the playlist alone so segments advance on their
  // own without needing further GPS fixes.
  useEffect(() => {
    if (!usesPlaylist || virtualMode) return;
    if (!followGeo || !geoEnabled || nearestStopIndex < 0) return;
    const first = playItems.findIndex((it) => it.stopIndex === nearestStopIndex);
    if (first < 0) return;
    const cur = playItems[Math.min(playIndex, playItems.length - 1)];
    if (cur && cur.stopIndex === nearestStopIndex) return;
    autoplayNextRef.current = isPlaying;
    setPlayIndex(first);
    // isPlaying intentionally excluded: it must not re-trigger the jump.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usesPlaylist, virtualMode, followGeo, geoEnabled, nearestStopIndex, playItems, playIndex]);

  const enableGeo = useCallback(() => {
    setVirtualMode(false);
    setGeoEnabled(true);
    setFollowGeo(true);
    toast.success(lang === "ar" ? "تم تفعيل الموقع - الجولة ستتبع تحركك" : "Location on — the tour will follow your steps");
  }, [lang]);

  /**
   * Step through the playlist: between segments inside a stop, then across the
   * boundary into the neighbouring stop. Falls back to seeking within a single
   * full-tour track when there is no playlist.
   */
  const goToVirtualStop = useCallback(
    (delta: 1 | -1) => {
      if (usesPlaylist) {
        const next = Math.min(Math.max(playIndex + delta, 0), playItems.length - 1);
        if (next === playIndex) return;
        autoplayNextRef.current = isPlaying;
        setPlayIndex(next);
        return;
      }
      const audio = audioRef.current;
      if (!audio || !duration || stopsCount === 0) return;
      const target = Math.min(Math.max(activeStopIndex + delta, 0), stopsCount - 1);
      audio.currentTime = (target / stopsCount) * duration;
      setCurrentTime(audio.currentTime);
      setActiveStopIndex(target);
    },
    [usesPlaylist, playIndex, playItems.length, isPlaying, duration, stopsCount, activeStopIndex]
  );

  const toggleVirtualMode = useCallback(() => {
    setVirtualMode((prev) => {
      const next = !prev;
      if (next) {
        setFollowGeo(false);
        setPlayIndex(0);
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
      <div className="min-h-screen bg-background">
        <Skeleton className="h-[56vh] max-h-[460px] w-full rounded-none" />
        <div className="max-w-[680px] mx-auto px-4 py-4 space-y-3">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (!tour) return <NotFoundView context="audio-tour" />;

  const ar = lang === "ar";
  const title = (ar ? (tour.title_ar || tour.title_en) : tour.title_en) || "";
  const description = (ar ? (tour.description_ar || tour.description_en) : tour.description_en) || "";
  const narratorName = ar ? (tour.narrator_name_ar || tour.narrator_name_en) : tour.narrator_name_en;
  const cityName = tourCity ? (ar ? tourCity.name_ar || tourCity.name_en : tourCity.name_en) : null;
  const { first, rest } = splitStandfirst(description);
  const priceLabel = !tour.price ? (ar ? "مجانية" : "Free") : `${fmtNumber(tour.price, ar)} ${ar ? "ج.م" : "EGP"}`;
  const langs: string[] = Array.isArray(tour.languages) ? tour.languages.filter(Boolean) : [];
  const langName = (c: string) => ({ en: ar ? "الإنجليزية" : "English", ar: ar ? "العربية" : "Arabic" } as Record<string, string>)[c.toLowerCase()] || c;

  const facts: KeyFact[] = [];
  const dur = formatDuration(tour.duration_minutes, ar);
  if (dur) facts.push({ icon: Clock, label: dur });
  if (stopsCount) facts.push({ icon: MapPin, label: ar ? `${fmtNumber(stopsCount, ar)} محطات` : `${stopsCount} ${stopsCount === 1 ? "stop" : "stops"}` });
  if (langs.length) facts.push({ icon: Languages, label: langs.map(langName).join(" · ") });
  facts.push({ icon: Tag, label: priceLabel });

  const startTour = () => {
    if (audioSrc) {
      playerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      if (!isPlaying) togglePlay();
    } else {
      stopsRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const playlistMode = virtualMode || usesPlaylist;
  const nowPlaying = (() => {
    if (currentItem) {
      const tt = ar ? currentItem.title_ar || currentItem.title_en : currentItem.title_en || currentItem.title_ar;
      if (tt) return tt;
    }
    const s = dbStops[activeStopIndex];
    return s ? (ar ? s.label_ar || s.label_en : s.label_en || s.label_ar) : "";
  })();

  const pillBtn = "min-h-[44px] px-4 rounded-full border border-border text-sm font-semibold text-foreground inline-flex items-center gap-1.5";

  return (
    <div className="min-h-screen bg-background pb-44 lg:pb-16">
      <ListingHero
        images={[tour.image].filter(Boolean) as string[]}
        title={title}
        eyebrow={[ar ? "جولة صوتية" : "Audio tour", cityName].filter(Boolean).join(" · ")}
        ar={ar}
        onBack={() => navigate(-1)}
        wishlistType="audio_tour"
        wishlistId={tour.id}
        overlap
        placeholder={<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/40 to-accent/40"><Headphones className="w-16 h-16 text-primary-dark/60" /></div>}
      />

      <div className="max-w-[680px] mx-auto px-4">
        {/* PLAYER — wired only to this tour's own audio; otherwise an honest "coming soon" */}
        <div ref={playerRef} className="-mt-6 relative z-10 rounded-2xl border border-border bg-card shadow-card p-4">
          {audioSrc ? (
            <>
              {playlistMode && stopsCount > 0 && (
                <p dir="auto" data-testid="now-playing" className="text-[13px] text-muted-foreground mb-2 text-start truncate">
                  {ar ? `المحطة ${fmtNumber(activeStopIndex + 1, ar)} من ${fmtNumber(stopsCount, ar)}` : `Stop ${activeStopIndex + 1} of ${stopsCount}`}
                  {currentItem?.segIndex != null && <> · {ar ? `المقطع ${fmtNumber(currentItem.segIndex + 1, ar)} من ${fmtNumber(currentItem.segCount, ar)}` : `Segment ${currentItem.segIndex + 1} of ${currentItem.segCount}`}</>}
                  {nowPlaying && <> · {nowPlaying}</>}
                </p>
              )}
              <div className="flex items-center gap-4">
                <button data-testid="play-toggle" type="button" onClick={togglePlay} aria-label={isPlaying ? (ar ? "إيقاف مؤقت" : "Pause") : (ar ? "تشغيل" : "Play")}
                  className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 shadow-elevated">
                  {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ms-1" />}
                </button>
                <div className="flex-1 min-w-0">
                  <Slider value={[progressPercent]} max={100} step={0.1} onValueChange={handleSeek} aria-label={ar ? "موضع التشغيل" : "Playback position"} />
                  <div className="flex justify-between mt-2 text-[13px] text-muted-foreground tabular-nums" dir="ltr">
                    <span>{formatTime(currentTime, ar)}</span>
                    <span>{formatTime(duration, ar)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <button type="button" onClick={cycleSpeed} className="tap-target text-[13px] font-bold text-muted-foreground" aria-label={ar ? "سرعة التشغيل" : "Playback speed"}>{fmtNumber(playbackRate, ar)}×</button>
                <div className="flex items-center gap-1">
                  {playlistMode && (
                    <button data-testid="skip-back" type="button" onClick={() => goToVirtualStop(-1)} aria-label={ar ? "السابق" : "Previous"} className="tap-target rounded-full"><SkipBack className={`w-5 h-5 ${ar ? "rotate-180" : ""}`} /></button>
                  )}
                  <button type="button" onClick={skipBackward} aria-label={ar ? "رجوع ١٥ ثانية" : "Back 15 seconds"} className="tap-target rounded-full flex-col !gap-0">
                    <Rewind className="w-5 h-5" /><span className="text-[10px] font-semibold">{ar ? "١٥" : "15"}</span>
                  </button>
                  <button type="button" onClick={skipForward} aria-label={ar ? "تقديم ١٥ ثانية" : "Forward 15 seconds"} className="tap-target rounded-full flex-col !gap-0">
                    <FastForward className="w-5 h-5" /><span className="text-[10px] font-semibold">{ar ? "١٥" : "15"}</span>
                  </button>
                  {playlistMode && (
                    <button data-testid="skip-forward" type="button" onClick={() => goToVirtualStop(1)} aria-label={ar ? "التالي" : "Next"} className="tap-target rounded-full"><SkipForward className={`w-5 h-5 ${ar ? "rotate-180" : ""}`} /></button>
                  )}
                </div>
                <button type="button" onClick={toggleMute} aria-label={isMuted ? (ar ? "إلغاء الكتم" : "Unmute") : (ar ? "كتم الصوت" : "Mute")} className="tap-target rounded-full">
                  {isMuted ? <VolumeX className="w-5 h-5 text-muted-foreground" /> : <Volume2 className="w-5 h-5" />}
                </button>
              </div>

              {/* Playback mode: on-location (GPS) vs listen-anywhere */}
              <div className="mt-3 rounded-xl bg-muted/50 p-1 flex gap-1">
                <button type="button" onClick={() => { if (virtualMode) toggleVirtualMode(); }}
                  className={`flex-1 min-h-[44px] flex items-center justify-center gap-1.5 rounded-lg text-[13px] font-semibold ${!virtualMode ? "bg-background shadow-card text-foreground" : "text-muted-foreground"}`}>
                  <Navigation className="w-4 h-4" /> {ar ? "أنا في المكان" : "I'm on location"}
                </button>
                <button type="button" onClick={() => { if (!virtualMode) toggleVirtualMode(); }}
                  className={`flex-1 min-h-[44px] flex items-center justify-center gap-1.5 rounded-lg text-[13px] font-semibold ${virtualMode ? "bg-background shadow-card text-foreground" : "text-muted-foreground"}`}>
                  <Headphones className="w-4 h-4" /> {ar ? "استمع من أي مكان" : "Listen from anywhere"}
                </button>
              </div>
              {virtualMode && (
                <p className="text-[13px] text-muted-foreground mt-2 leading-snug">
                  {ar ? "تُشغَّل المحطات بالترتيب وتنتقل تلقائيًا — بدون موقع أو GPS." : "Stops play in order and advance automatically — no location needed."}
                </p>
              )}
            </>
          ) : (
            <div className="flex items-center gap-4" data-testid="audio-coming-soon">
              <div className="w-16 h-16 rounded-full bg-muted text-muted-foreground flex items-center justify-center flex-shrink-0">
                <Headphones className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-foreground">{ar ? "الصوت قادم قريبًا" : "Audio coming soon"}</p>
                <p className="text-[13px] text-muted-foreground leading-snug">
                  {ar ? "لم يرفع الراوي تسجيل هذه الجولة بعد. يمكنك استعراض المحطات والمسار الآن." : "The narrator hasn't uploaded this tour's recording yet. You can still browse the stops and route."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5"><KeyFacts facts={facts} /></div>

      <div className="max-w-[680px] mx-auto px-4">
        {first && <p className={`article-standfirst ${ar ? "lang-ar" : "lang-en"} text-foreground pt-6`}>{first}</p>}

        {/* Banners */}
        {!isOnline && (
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-warning/10 border border-warning px-3 py-2 text-foreground">
            <WifiOff className="w-4 h-4 mt-1 shrink-0" />
            <p className="text-[13px] leading-snug">
              {ar
                ? offline.downloaded ? "أنت غير متصل بالإنترنت — يتم تشغيل النسخة المحفوظة من الجولة." : "أنت غير متصل بالإنترنت. حمّل الجولة مسبقًا لتشغيلها بدون إنترنت."
                : offline.downloaded ? "You're offline — playing the saved copy of this tour." : "You're offline. Download the tour ahead of time to use it without internet."}
            </p>
          </div>
        )}
        {geoUnavailable && (
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-destructive/10 border border-destructive/30 px-3 py-2 text-destructive">
            <AlertCircle className="w-4 h-4 mt-1 shrink-0" />
            <p className="text-[13px] leading-snug">
              {ar ? "GPS غير متاح. ستعمل الجولة بترتيب المحطات بدون التتبع التلقائي." : "GPS unavailable. The tour will play in stop order without following your location."}
            </p>
          </div>
        )}

        {/* Quick actions: directions, whole route, offline copy */}
        {(startNavUrl || fullRoute || (audioSrc && mapStops.length > 0)) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {startNavUrl && (
              <a href={startNavUrl} target="_blank" rel="noopener noreferrer" data-testid="nav-to-start" className={pillBtn}>
                <Navigation className="w-4 h-4" /> {ar ? "إلى نقطة البداية" : "Directions to the start"}
              </a>
            )}
            {fullRoute && (
              <a href={fullRoute.url} target="_blank" rel="noopener noreferrer" data-testid="nav-full-route" className={pillBtn}>
                <Footprints className="w-4 h-4" /> {ar ? "المسار في خرائط جوجل" : "Whole route in Google Maps"}
              </a>
            )}
            {audioSrc && mapStops.length > 0 && (
              offline.downloaded ? (
                <button type="button" className={pillBtn} onClick={async () => { await offline.remove(); toast.success(ar ? "تم حذف النسخة المحفوظة" : "Offline copy removed"); }}>
                  <CheckCircle2 className="w-4 h-4 text-success" /> {ar ? "متاحة بدون إنترنت" : "Available offline"} <Trash2 className="w-4 h-4 text-muted-foreground" />
                </button>
              ) : offline.downloading ? (
                <span className={pillBtn}><Loader2 className="w-4 h-4 animate-spin" /> {ar ? `جارٍ التحميل ${fmtNumber(offline.progress, ar)}٪` : `Downloading ${offline.progress}%`}</span>
              ) : (
                <button type="button" disabled={!isOnline} className={`${pillBtn} disabled:opacity-50`} onClick={async () => {
                  toast.info(ar ? "بدء تحميل الجولة..." : "Starting download...");
                  await offline.download(audioSrc, mapStops.map((s) => ({ lat: s.lat, lng: s.lng })));
                  toast.success(ar ? "الجولة متاحة الآن بدون إنترنت" : "Tour saved for offline use");
                }}>
                  <Download className="w-4 h-4" /> {ar ? "حفظ للاستماع بدون إنترنت" : "Save for offline"}
                </button>
              )
            )}
          </div>
        )}
        {fullRoute?.truncatedTo && (
          <p className="text-[13px] text-muted-foreground mt-2">
            {ar ? `تعرض خرائط جوجل أول ${fmtNumber(fullRoute.truncatedTo, ar)} محطات فقط.` : `Google Maps shows the first ${fullRoute.truncatedTo} stops only (waypoint limit).`}
          </p>
        )}

        {rest && (
          <Section title={ar ? "عن الجولة" : "About this tour"} ar={ar} className="mt-6">
            <p className="whitespace-pre-line">{rest}</p>
            <MachineTranslatedNote meta={(tour as any)?.translation_meta} field={ar ? "description_ar" : "description_en"} />
          </Section>
        )}

        {/* Narrator */}
        {narratorName && (() => {
          const actor = narratorActor as any;
          const displayName = actor ? (ar ? (actor.name_ar || actor.name_en) : actor.name_en) : narratorName;
          const displayTitle = actor ? (ar ? (actor.title_ar || actor.title_en) : actor.title_en) : null;
          const displayImage = actor?.image || tour.narrator_image;
          const bio = actor ? (ar ? actor.bio_ar || actor.bio_en : actor.bio_en || actor.bio_ar) : null;
          const expertise = actor ? ((ar ? (actor.expertise_ar || actor.expertise_en) : actor.expertise_en) ?? []) as string[] : [];
          const target = actor ? `/culture-actor/${actor.slug ?? actor.id}` : null;
          return (
            <Section title={ar ? "الراوي" : "Your narrator"} ar={ar}>
              <div className="flex gap-4 items-start">
                <Avatar src={displayImage} name={displayName} className="w-16 h-16 rounded-full flex-shrink-0" />
                <div className="min-w-0">
                  <p className={`listing-h2 ${ar ? "lang-ar" : "lang-en"} !text-lg text-foreground`}>{displayName}</p>
                  {displayTitle && <p className="text-[13px] text-muted-foreground">{displayTitle}</p>}
                </div>
              </div>
              {bio && <p className="mt-3 line-clamp-4">{bio}</p>}
              {expertise.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {expertise.slice(0, 4).map((x, i) => <span key={i} className="px-2.5 py-1 rounded-full bg-muted text-[13px]">{x}</span>)}
                </div>
              )}
              <div className="flex flex-wrap gap-2 mt-4">
                {target && (
                  <button type="button" onClick={() => navigate(target)} className={pillBtn}>
                    <Feather className="w-4 h-4" /> {ar ? "عرض الملف" : "View profile"}
                  </button>
                )}
                {(narratorActorId || (tour as any).creator_id) && (
                  <MessageOwnerButton ownerId={narratorActorId || (tour as any).creator_id} kind={narratorActorId ? "culture_actor" : "auto"} label={ar ? "راسل الراوي" : "Message narrator"} />
                )}
              </div>
            </Section>
          );
        })()}

        {/* Location following (GPS mode) */}
        {audioSrc && mapStops.length > 0 && !virtualMode && (
          <div className="pb-2">
            {!geoEnabled ? (
              <button type="button" onClick={enableGeo} className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-primary/10 text-primary-dark border border-primary/30 rounded-xl text-sm font-semibold">
                <Navigation className="w-4 h-4" /> {ar ? "ابدأ الجولة بالموقع" : "Start tour with my location"}
              </button>
            ) : userLoc.loading && !userLoc.coords ? (
              <div className="flex items-center justify-center gap-2 text-[13px] text-muted-foreground py-2">
                <Loader2 className="w-4 h-4 animate-spin" /> {ar ? "جارٍ تحديد موقعك..." : "Locating you..."}
              </div>
            ) : userLoc.error ? (
              <div className="text-[13px] text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                {ar ? "تعذّر الوصول للموقع. فعّل الإذن في المتصفح." : "Couldn't access location. Enable permission in your browser."}
              </div>
            ) : (
              <button type="button" onClick={() => setFollowGeo((v) => !v)}
                className={`w-full min-h-[44px] flex items-center justify-center gap-2 rounded-xl text-sm font-semibold ${followGeo ? "bg-primary text-primary-foreground" : "border border-border text-foreground"}`}>
                <Navigation className="w-4 h-4" />
                {followGeo ? (ar ? "يتبع موقعك ✓" : "Following your location ✓") : (ar ? "تشغيل تتبع الموقع" : "Resume location tracking")}
              </button>
            )}
          </div>
        )}

        {/* Written walking directions */}
        {(() => {
          const dirOf = (i: number) => {
            const s = dbStops[i];
            if (!s) return "";
            return (ar ? s.directions_ar || s.directions_en : s.directions_en || s.directions_ar) || "";
          };
          const labelOf = (i: number) => {
            const s = dbStops[i];
            if (!s) return ar ? `المحطة ${fmtNumber(i + 1, ar)}` : `Stop ${i + 1}`;
            return (ar ? s.label_ar || s.label_en : s.label_en || s.label_ar) || "";
          };
          const rows = [
            { i: activeStopIndex, text: dirOf(activeStopIndex), current: true },
            { i: activeStopIndex + 1, text: dirOf(activeStopIndex + 1), current: false },
          ].filter((r) => r.i < stopsCount && !!r.text);
          if (rows.length === 0) return null;
          return (
            <Section title={ar ? "تعليمات المشي" : "Walking directions"} ar={ar}>
              <div className="space-y-3">
                {rows.map((r) => (
                  <div key={r.i}>
                    <p className="text-[13px] font-semibold text-muted-foreground">
                      {r.current ? (ar ? `إلى المحطة الحالية: ${labelOf(r.i)}` : `To current stop: ${labelOf(r.i)}`) : (ar ? `إلى المحطة التالية: ${labelOf(r.i)}` : `To next stop: ${labelOf(r.i)}`)}
                    </p>
                    <p dir="auto">{r.text}</p>
                  </div>
                ))}
              </div>
            </Section>
          );
        })()}

        {dbStops.length > 0 && !virtualMode && (
          <TurnByTurnGuidance
            stops={dbStops}
            activeStopIndex={activeStopIndex}
            userCoords={userLoc.coords ? { lat: userLoc.coords.lat, lng: userLoc.coords.lng } : null}
          />
        )}

        {/* Stops: map above a numbered vertical timeline */}
        {stopsCount > 0 && (
          <Section ref={stopsRef} id="stops" title={ar ? "المحطات" : "The stops"} ar={ar}>
            {mapStops.length > 0 && (
              <div className="mb-5">
                <TourStopsMap
                  stops={mapStops}
                  userLocation={userLoc.coords ? { lat: userLoc.coords.lat, lng: userLoc.coords.lng } : null}
                  activeStopIndex={activeStopIndex}
                />
              </div>
            )}
            <ol>
              {Array.from({ length: stopsCount }).map((_, i) => {
                const stop = dbStops[i];
                const stopLabel = stop ? (ar ? (stop.label_ar || stop.label_en) : (stop.label_en || stop.label_ar)) : (ar ? `المحطة ${fmtNumber(i + 1, ar)}` : `Stop ${i + 1}`);
                const stopDesc = stop ? (ar ? (stop.desc_ar || stop.desc_en) : (stop.desc_en || stop.desc_ar)) : "";
                const d = stop ? (ar ? stop.directions_ar || stop.directions_en : stop.directions_en || stop.directions_ar) : "";
                const dist = stopDistances[i];
                const isNear = dist != null && dist <= NEAR_THRESHOLD_M;
                const segs = (Array.isArray(stop?.segments) ? stop!.segments! : []).filter((g) => (g?.title_en || g?.title_ar || g?.desc_en || g?.desc_ar || g?.audio_url));
                const active = i === activeStopIndex && (isPlaying || geoEnabled);
                return (
                  <li key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className={`w-8 h-8 rounded-full text-[13px] font-bold flex items-center justify-center flex-shrink-0 ${active ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary-dark"}`}>{fmtNumber(i + 1, ar)}</span>
                      {i < stopsCount - 1 && <span className="w-px flex-1 bg-border my-1" />}
                    </div>
                    <div className="flex-1 min-w-0 pb-6">
                      <p className={`listing-h2 ${ar ? "lang-ar" : "lang-en"} !text-lg text-foreground leading-snug pt-0.5`}>{stopLabel}</p>
                      {stopDesc && <p dir="auto" className="mt-1">{stopDesc}</p>}
                      {d && (
                        <p dir="auto" className="text-[13px] text-primary-dark mt-1 flex items-start gap-1.5"><Footprints className="w-4 h-4 mt-0.5 shrink-0" /><span>{d}</span></p>
                      )}
                      {segs.length > 0 && (
                        <div data-testid={`stop-${i}-segments`} className="mt-2 ps-3 border-s-2 border-primary/25 space-y-2">
                          <p className="text-[13px] font-semibold text-primary-dark flex items-center gap-1">
                            <Layers className="w-4 h-4" /> {ar ? `${fmtNumber(segs.length, ar)} مقاطع في هذه المحطة` : `${segs.length} segments at this stop`}
                          </p>
                          {segs.map((g, j) => {
                            const segTitle = (ar ? g.title_ar || g.title_en : g.title_en || g.title_ar) || "";
                            const segDesc = (ar ? g.desc_ar || g.desc_en : g.desc_en || g.desc_ar) || "";
                            return (
                              <div key={j}>
                                {segTitle && <p dir="auto" className="text-sm font-semibold text-foreground">{fmtNumber(j + 1, ar)}. {segTitle}</p>}
                                {segDesc && <p dir="auto" className="text-[13px] text-muted-foreground">{segDesc}</p>}
                                {g.audio_url && <audio controls preload="none" src={g.audio_url} className="w-full h-9 mt-1" />}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {stop?.audio_url && <audio controls preload="none" src={stop.audio_url} className="w-full h-9 mt-2" />}
                      <div className="flex flex-wrap items-center gap-3 mt-1">
                        {dist != null && (
                          <span className="text-[13px] text-muted-foreground flex items-center gap-1"><Navigation className="w-3.5 h-3.5" /> {formatDistance(dist, lang)}</span>
                        )}
                        {isNear && <span className="text-[13px] font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">{ar ? "بجوارك" : "Near you"}</span>}
                        {hasCoords(stop) && (
                          <a href={directionsToUrl(stop, "walking")} target="_blank" rel="noopener noreferrer" data-testid={`nav-stop-${i}`}
                            className="inline-flex items-center gap-1 min-h-[44px] text-[13px] font-semibold text-primary-dark">
                            <Navigation className="w-3.5 h-3.5" /> {ar ? "الاتجاهات" : "Directions"}
                          </a>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </Section>
        )}

        <ReadBeforeYouGo cityId={(tour as any).city_id} regionId={(tour as any).region_id} ar={ar} />
      </div>

      <ActionBar
        ar={ar}
        price={priceLabel}
        note={[dur, stopsCount ? (ar ? `${fmtNumber(stopsCount, ar)} محطات` : `${stopsCount} stops`) : null].filter(Boolean).join(" · ")}
        buttonLabel={audioSrc ? (isPlaying ? (ar ? "إيقاف مؤقت" : "Pause") : (ar ? "ابدأ الجولة" : "Start the tour")) : (ar ? "استعرض المحطات" : "See the stops")}
        onPrimary={audioSrc && isPlaying ? togglePlay : startTour}
      />
    </div>
  );
};

export default AudioTourDetail;
