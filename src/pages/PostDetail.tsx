import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Share2, User, MapPin, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize, Camera, ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { latestPosts, cultureActors, cityData } from "@/lib/sampleData";
import WishlistButton from "@/components/WishlistButton";
import { contentTypeConfig } from "@/components/LatestPosts";

/* ─── Audio Player ─── */
const AudioPlayer = ({ title, author, image, lang }: { title: string; author: string; image: string; lang: string }) => {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [muted, setMuted] = useState(false);
  const duration = 1500; // 25 min simulated
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((t) => {
          if (t >= duration) { setPlaying(false); return 0; }
          setProgress(((t + 1) / duration) * 100);
          return t + 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="mx-4 mt-4 rounded-xl bg-card border border-border overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 p-3">
        <img src={image} alt={title} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-foreground truncate">{title}</p>
          <p className="text-[10px] text-muted-foreground">{author}</p>
        </div>
      </div>
      {/* Progress */}
      <div className="px-3 pb-1">
        <div
          className="w-full h-1.5 bg-muted rounded-full cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            setCurrentTime(Math.floor(pct * duration));
            setProgress(pct * 100);
          }}
        >
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-muted-foreground">{fmt(currentTime)}</span>
          <span className="text-[9px] text-muted-foreground">{fmt(duration)}</span>
        </div>
      </div>
      {/* Controls */}
      <div className="flex items-center justify-center gap-5 pb-3">
        <button onClick={() => setCurrentTime((t) => Math.max(0, t - 15))} className="p-1.5 text-muted-foreground hover:text-foreground">
          <SkipBack className="w-4 h-4" />
        </button>
        <button
          onClick={() => setPlaying(!playing)}
          className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-md hover:opacity-90 transition"
        >
          {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>
        <button onClick={() => setCurrentTime((t) => Math.min(duration, t + 15))} className="p-1.5 text-muted-foreground hover:text-foreground">
          <SkipForward className="w-4 h-4" />
        </button>
        <button onClick={() => setMuted(!muted)} className="p-1.5 text-muted-foreground hover:text-foreground">
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

/* ─── Video Player ─── */
const VideoPlayer = ({ image, label, lang }: { image: string; label: string; lang: string }) => {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) { setPlaying(false); return 0; }
          return p + 0.15;
        });
      }, 100);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing]);

  return (
    <div className="mx-4 mt-4 rounded-xl overflow-hidden border border-border shadow-sm relative">
      <div className="relative aspect-video bg-black">
        <img src={image} alt={label} className={`w-full h-full object-cover ${playing ? "opacity-30" : "opacity-70"} transition-opacity`} />
        {/* Overlay controls */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={() => setPlaying(!playing)}
            className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center text-primary-foreground shadow-lg hover:bg-primary transition"
          >
            {playing ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
          </button>
        </div>
        {/* Top label */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded">
          {label}
        </div>
        {/* Fullscreen */}
        <button className="absolute top-3 right-3 p-1.5 bg-black/60 backdrop-blur-sm rounded text-white hover:bg-black/80">
          <Maximize className="w-3.5 h-3.5" />
        </button>
        {/* Bottom progress */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
};

/* ─── Photo Gallery ─── */
const PhotoGallery = ({ image, lang }: { image: string; lang: string }) => {
  const [current, setCurrent] = useState(0);
  // Simulate multiple photos using the same image with different crops
  const photos = [
    image,
    image.replace("w=400", "w=600"),
    image.replace("w=400", "w=500"),
    image.replace("w=400", "w=450"),
  ];
  const total = photos.length;

  return (
    <div className="mx-4 mt-4 rounded-xl overflow-hidden border border-border shadow-sm relative">
      <div className="relative aspect-[4/3] bg-muted">
        <img src={photos[current]} alt={`Photo ${current + 1}`} className="w-full h-full object-cover" />
        {/* Nav arrows */}
        <button
          onClick={() => setCurrent((c) => (c - 1 + total) % total)}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow"
        >
          <ChevronLeft className="w-4 h-4 text-foreground" />
        </button>
        <button
          onClick={() => setCurrent((c) => (c + 1) % total)}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow"
        >
          <ChevronRight className="w-4 h-4 text-foreground" />
        </button>
        {/* Counter */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <Camera className="w-3 h-3" />
          {current + 1} / {total}
        </div>
        {/* Dots */}
        <div className="absolute bottom-3 right-3 flex gap-1">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-1.5 h-1.5 rounded-full transition ${i === current ? "bg-white" : "bg-white/40"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── Main Page ─── */
const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useI18n();

  const post = latestPosts.find((p) => p?.id === id);
  if (!post) return <div className="p-8 text-center text-muted-foreground">Post not found</div>;

  const postMeta = post as { contentType?: string; cityId?: string };
  const ct = postMeta.contentType ? contentTypeConfig[postMeta.contentType] : null;
  const CtIcon = ct?.icon;
  const contentType = postMeta.contentType;

  const relatedPosts = latestPosts.filter((p) => p && p.id !== id && p.regionId === post.regionId).slice(0, 3);
  const formattedDate = new Date(post.date).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  const paragraphs = post.body[lang].split("\n\n");

  const timeLabel = ct
    ? (ct === contentTypeConfig.podcast || ct === contentTypeConfig.documentary || ct === contentTypeConfig["recipe-video"])
      ? (lang === "ar" ? "دقيقة" : "min")
      : (lang === "ar" ? "دقائق قراءة" : "min read")
    : (lang === "ar" ? "دقائق قراءة" : "min read");

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero */}
      <div className="relative h-64">
        <img src={post.image} alt={post.title[lang]} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 rounded-full bg-background/80 backdrop-blur-sm">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="p-2 rounded-full bg-background/80 backdrop-blur-sm">
            <Share2 className="w-5 h-5 text-foreground" />
          </button>
          <WishlistButton variant="bookmark" />
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {ct && CtIcon && (
              <span className={`inline-flex items-center gap-1 ${ct.color} text-white text-[10px] font-semibold px-2 py-0.5 rounded-full`}>
                <CtIcon className="w-3 h-3" />
                {ct.label[lang]}
              </span>
            )}
            <span className="inline-block bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full">
              {post.category[lang]}
            </span>
            {postMeta.cityId && cityData[postMeta.cityId] && (
              <span
                onClick={(e) => { e.stopPropagation(); navigate(`/city/${postMeta.cityId}`); }}
                className="inline-flex items-center gap-1 bg-background/80 backdrop-blur-sm text-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full cursor-pointer hover:bg-background/90 transition-colors"
              >
                <MapPin className="w-3 h-3" />
                {cityData[postMeta.cityId!].name[lang]}
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold text-white leading-tight">{post.title[lang]}</h1>
        </div>
      </div>

      {/* Media Player - contextual by content type */}
      {contentType === "podcast" && (
        <AudioPlayer title={post.title[lang]} author={post.author[lang]} image={post.image} lang={lang} />
      )}
      {(contentType === "documentary" || contentType === "recipe-video") && (
        <VideoPlayer image={post.image} label={ct?.label[lang] || ""} lang={lang} />
      )}
      {contentType === "photo-series" && (
        <PhotoGallery image={post.image} lang={lang} />
      )}

      {/* Meta */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-4 border-b border-border">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => {
            const actor = cultureActors.find((a) => a.id === post.authorId);
            if (actor) navigate(`/culture-actor/${actor.id}`);
          }}
        >
          {(() => {
            const actor = cultureActors.find((a) => a.id === post.authorId);
            return actor ? (
              <img src={actor.image} alt={actor.name[lang]} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
            );
          })()}
          <div>
            <p className="text-xs font-semibold text-primary">{post.author[lang]}</p>
            <p className="text-[10px] text-muted-foreground">{formattedDate}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground ms-auto">
          {ct && CtIcon ? <CtIcon className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
          <span className="text-xs">{post.readTime} {timeLabel}</span>
        </div>
      </div>

      {/* Body */}
      <article className="px-4 pt-5 space-y-4">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-sm text-foreground leading-relaxed whitespace-pre-line">{p}</p>
        ))}
      </article>

      {/* Author Bio Section */}
      {(() => {
        const actor = cultureActors.find((a) => a.id === post.authorId);
        if (!actor) return null;
        return (
          <div className="mx-4 mt-6 rounded-xl bg-card border border-border p-4 shadow-sm">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
              {lang === "ar" ? "عن الكاتب" : "About the Author"}
            </h2>
            <div className="flex items-start gap-3">
              <img
                src={actor.image}
                alt={actor.name[lang]}
                className="w-14 h-14 rounded-full object-cover flex-shrink-0 border-2 border-primary/20 cursor-pointer"
                onClick={() => navigate(`/culture-actor/${actor.id}`)}
              />
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-bold text-foreground cursor-pointer hover:text-primary transition-colors"
                  onClick={() => navigate(`/culture-actor/${actor.id}`)}
                >
                  {actor.name[lang]}
                </p>
                <p className="text-[11px] text-primary font-medium">{actor.title[lang]}</p>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-3">{actor.bio[lang]}</p>
                {actor.expertise && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {actor.expertise[lang].slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-[9px] bg-primary/10 text-primary font-medium px-1.5 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                )}
                {actor.quote && (
                  <p className="text-[11px] italic text-muted-foreground mt-2 border-s-2 border-primary/30 ps-2">
                    "{actor.quote[lang]}"
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => navigate(`/culture-actor/${actor.id}`)}
              className="w-full mt-3 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/15 rounded-lg py-2 transition-colors"
            >
              {lang === "ar" ? "عرض الملف الشخصي" : "View Full Profile"}
            </button>
          </div>
        );
      })()}

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="mt-8 px-4">
          <h2 className="text-base font-bold text-foreground mb-3">
            {lang === "ar" ? "محتوى ذو صلة" : "Related Content"}
          </h2>
          <div className="space-y-3">
            {relatedPosts.map((rp) => {
              const rpMeta = rp as { contentType?: string };
              const rpCt = rpMeta.contentType ? contentTypeConfig[rpMeta.contentType] : null;
              const RpIcon = rpCt?.icon;
              return (
                <div
                  key={rp.id}
                  onClick={() => navigate(`/post/${rp.id}`)}
                  className="flex gap-3 rounded-lg bg-card shadow-card border border-border overflow-hidden cursor-pointer"
                >
                  <div className="relative w-24 h-20 flex-shrink-0">
                    <img src={rp.image} alt={rp.title[lang]} className="w-full h-full object-cover" />
                    {rpCt && RpIcon && (
                      <span className={`absolute top-1 left-1 p-0.5 rounded ${rpCt.color}`}>
                        <RpIcon className="w-2.5 h-2.5 text-white" />
                      </span>
                    )}
                  </div>
                  <div className="py-2.5 pe-3 flex flex-col justify-center">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="text-[10px] font-medium text-primary">{rp.category[lang]}</span>
                      {rpCt && <span className="text-[9px] text-muted-foreground">• {rpCt.label[lang]}</span>}
                    </div>
                    <h3 className="text-xs font-semibold text-foreground line-clamp-2">{rp.title[lang]}</h3>
                    <span className="text-[10px] text-muted-foreground mt-1">{rp.readTime} {lang === "ar" ? "د" : "min"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetail;