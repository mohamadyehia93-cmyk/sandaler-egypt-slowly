import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Quote, Feather, BookOpen, Share2, Instagram, Twitter, UserPlus, UserCheck, MessageCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cultureActors, latestPosts, regions } from "@/lib/sampleData";

const FollowButton = ({ lang, following, onToggle }: { lang: string; following: boolean; onToggle: () => void }) => (
  <button
    onClick={onToggle}
    className={`mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
      following
        ? "bg-secondary text-foreground border border-border"
        : "bg-primary text-primary-foreground"
    }`}
  >
    {following ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
    {following ? (lang === "ar" ? "متابَع" : "Following") : (lang === "ar" ? "متابعة" : "Follow")}
  </button>
);

const CultureActorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useI18n();
  const [following, setFollowing] = useState(false);

  const actor = cultureActors.find((a) => a.id === id);
  if (!actor) return <div className="p-8 text-center text-muted-foreground">Culture Actor not found</div>;

  const region = regions.find((r) => r.id === actor.regionId);
  const authorPosts = latestPosts.filter((p) => p.authorId === actor.id);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero */}
      <div className="relative h-52">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${region?.color || "hsl(var(--primary))"}90, ${region?.color || "hsl(var(--primary))"}30)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 rounded-full bg-background/80 backdrop-blur-sm z-10"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <button className="absolute top-4 right-4 p-2 rounded-full bg-background/80 backdrop-blur-sm z-10">
          <Share2 className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Avatar & Name */}
      <div className="px-4 -mt-20 relative z-10">
        <img
          src={actor.image}
          alt={actor.name[lang]}
          className="w-28 h-28 rounded-2xl object-cover border-4 border-background shadow-elevated"
        />
        <div className="mt-3">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary mb-2">
            <Feather className="w-3 h-3" />
            {lang === "ar" ? "فاعل ثقافي" : "Culture Actor"}
          </span>
          <h1 className="text-xl font-bold text-foreground">{actor.name[lang]}</h1>
          <p className="text-sm font-medium text-primary mt-0.5">{actor.title[lang]}</p>
          {region && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span>{region.emoji} {lang === "ar" ? "" : ""}{lang === "ar" ? (region.nameKey === "region.nileDelta" ? "دلتا النيل" : region.nameKey === "region.suezCanal" ? "قناة السويس" : region.nameKey === "region.upperEgypt" ? "صعيد مصر" : "الحدود") : region.nameKey.replace("region.", "").replace(/([A-Z])/g, " $1").trim()}</span>
            </div>
          )}
        </div>

        {/* Follow & Message Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setFollowing(!following)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              following
                ? "bg-secondary text-foreground border border-border"
                : "bg-primary text-primary-foreground"
            }`}
          >
            {following ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {following ? (lang === "ar" ? "متابَع" : "Following") : (lang === "ar" ? "متابعة" : "Follow")}
          </button>
          <button
            onClick={() => navigate(`/inbox?personId=${actor.id}&name=${encodeURIComponent(actor.name.en)}&nameAr=${encodeURIComponent(actor.name.ar)}&image=${encodeURIComponent(actor.image)}`)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-card border border-border text-foreground hover:bg-secondary transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-primary" />
            {lang === "ar" ? "رسالة" : "Message"}
          </button>
        </div>
      </div>

      {/* Quote */}
      <div className="px-4 mt-5">
        <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
          <Quote className="w-5 h-5 text-primary mb-2" />
          <p className="text-sm italic text-foreground leading-relaxed">"{actor.quote[lang]}"</p>
        </div>
      </div>

      {/* Bio */}
      <div className="px-4 mt-5">
        <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          {lang === "ar" ? "نبذة" : "About"}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{actor.bio[lang]}</p>
      </div>

      {/* Expertise */}
      <div className="px-4 mt-5">
        <h2 className="text-sm font-semibold text-foreground mb-3">
          {lang === "ar" ? "مجالات الخبرة" : "Areas of Expertise"}
        </h2>
        <div className="flex flex-wrap gap-2">
          {actor.expertise[lang].map((skill, i) => (
            <span
              key={i}
              className="text-xs px-3 py-1.5 rounded-full bg-secondary text-foreground font-medium"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Social Links */}
      <div className="px-4 mt-5">
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-card border border-border shadow-card text-sm font-medium text-foreground">
            <Instagram className="w-4 h-4 text-primary" />
            Instagram
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-card border border-border shadow-card text-sm font-medium text-foreground">
            <Twitter className="w-4 h-4 text-primary" />
            Twitter
          </button>
        </div>
      </div>

      {/* Articles by this actor */}
      {authorPosts.length > 0 && (
        <div className="px-4 mt-6">
          <h2 className="text-sm font-semibold text-foreground mb-3">
            {lang === "ar" ? "مقالات بقلمه" : "Articles by this Author"}
          </h2>
          <div className="space-y-3">
            {authorPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => navigate(`/post/${post.id}`)}
                className="flex gap-3 rounded-lg bg-card shadow-card border border-border overflow-hidden cursor-pointer"
              >
                <img
                  src={post.image}
                  alt={post.title[lang]}
                  className="w-24 h-20 object-cover flex-shrink-0"
                />
                <div className="py-2.5 pe-3 flex flex-col justify-center">
                  <span className="text-[10px] font-medium text-primary mb-0.5">
                    {post.category[lang]}
                  </span>
                  <h3 className="text-xs font-semibold text-foreground line-clamp-2">
                    {post.title[lang]}
                  </h3>
                  <span className="text-[10px] text-muted-foreground mt-1">
                    {post.readTime} {lang === "ar" ? "د" : "min"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CultureActorDetail;
