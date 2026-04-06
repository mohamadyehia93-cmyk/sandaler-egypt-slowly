import { ArrowLeft, Share2, Headphones, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, MapPin, Clock } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import WishlistButton from "@/components/WishlistButton";
import { useNavigate, useParams } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { fetchByIdOrSlug } from "@/lib/fetchByIdOrSlug";
import DetailTestimonials from "@/components/DetailTestimonials";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";

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

  const { data: tour, isLoading } = useQuery({
    queryKey: ["audio_tour", id],
    queryFn: () => fetchByIdOrSlug<any>("audio_tours", id!),
    enabled: !!id,
  });

  const stopsCount = tour?.stops_count || 5;

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

  useEffect(() => {
    if (duration > 0) {
      const progress = currentTime / duration;
      setActiveStopIndex(Math.min(Math.floor(progress * stopsCount), stopsCount - 1));
    }
  }, [currentTime, duration, stopsCount]);

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

        {/* Narrator */}
        {narratorName && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface mb-6">
            {tour.narrator_image ? (
              <img src={tour.narrator_image} alt={narratorName} className="w-12 h-12 rounded-full object-cover border-2 border-primary/20" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-lg">🎙️</div>
            )}
            <div>
              <p className="text-sm font-semibold text-foreground">{lang === "ar" ? "الراوي:" : "Narrator:"} {narratorName}</p>
              <p className="text-xs text-muted-foreground">{(tour.languages || ["en"]).join(", ")}</p>
            </div>
          </div>
        )}

        {/* Description */}
        {description && (
          <>
            <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "عن الجولة" : "About This Tour"}</h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{description}</p>
          </>
        )}

        {/* Stops */}
        <h2 className="text-base font-bold text-primary-dark mb-3">{lang === "ar" ? "المحطات" : "Tour Stops"}</h2>
        <div className="mb-6">
          {Array.from({ length: stopsCount }).map((_, i) => (
            <div key={i} className="flex gap-3 pb-3">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                  i === activeStopIndex ? "bg-primary text-primary-foreground" : i < activeStopIndex ? "bg-primary/30 text-primary" : "bg-muted text-muted-foreground"
                }`}>{i + 1}</div>
                {i < stopsCount - 1 && <div className="w-0.5 flex-1 bg-primary/20 mt-1" />}
              </div>
              <p className="text-sm text-foreground pt-1">{lang === "ar" ? `المحطة ${i + 1}` : `Stop ${i + 1}`}</p>
            </div>
          ))}
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
