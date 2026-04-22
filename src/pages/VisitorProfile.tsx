
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, MapPin, Calendar, Heart, MessageCircle,
  Share2, Globe, Award, Camera, Compass, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import BottomNav from "@/components/BottomNav";
import FollowButton from "@/components/FollowButton";
import { useFollowerCount } from "@/hooks/useFollows";

const visitorData: Record<string, {
  name: { en: string; ar: string };
  avatar: string;
  cover: string;
  location: { en: string; ar: string };
  bio: { en: string; ar: string };
  joinDate: string;
  stats: { trips: number; reviews: number; followers: number; following: number };
  interests: { en: string; ar: string; emoji: string }[];
  placesVisited: { name: { en: string; ar: string }; image: string; cityId: string }[];
  badges: { name: { en: string; ar: string }; icon: string; earned: boolean }[];
  recentPosts: { id: string; content: string; image?: string; likes: number; timeAgo: string }[];
  languages: string[];
  travelStyle: { en: string; ar: string }[];
}> = {
  "sarah-m": {
    name: { en: "Sarah Mitchell", ar: "سارة ميتشل" },
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300",
    cover: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=800",
    location: { en: "London, UK", ar: "لندن، المملكة المتحدة" },
    bio: {
      en: "Slow travel enthusiast exploring Egypt's hidden gems. Passionate about sustainable tourism, local crafts, and authentic cultural exchanges. On a mission to visit every oasis! 🌴",
      ar: "متحمسة للسفر البطيء واستكشاف جواهر مصر المخفية. شغوفة بالسياحة المستدامة والحرف المحلية والتبادل الثقافي الأصيل. في مهمة لزيارة كل واحة! 🌴",
    },
    joinDate: "2024",
    stats: { trips: 8, reviews: 23, followers: 156, following: 89 },
    interests: [
      { en: "Slow Travel", ar: "سفر بطيء", emoji: "🐪" },
      { en: "Photography", ar: "تصوير", emoji: "📸" },
      { en: "Local Cuisine", ar: "مأكولات محلية", emoji: "🍽️" },
      { en: "Heritage", ar: "تراث", emoji: "🏛️" },
      { en: "Handicrafts", ar: "حرف يدوية", emoji: "🧶" },
      { en: "Nature", ar: "طبيعة", emoji: "🌿" },
    ],
    placesVisited: [
      { name: { en: "Siwa Oasis", ar: "واحة سيوة" }, image: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=400", cityId: "siwa" },
      { name: { en: "Aswan", ar: "أسوان" }, image: "https://images.unsplash.com/photo-1568322445389-f64e0a1d44a4?w=400", cityId: "aswan" },
      { name: { en: "Rosetta", ar: "رشيد" }, image: "https://images.unsplash.com/photo-1553913861-c0a832dfab58?w=400", cityId: "rosetta" },
      { name: { en: "Fayoum", ar: "الفيوم" }, image: "https://images.unsplash.com/photo-1590846083693-f23fdede3a7e?w=400", cityId: "fayoum" },
      { name: { en: "Luxor", ar: "الأقصر" }, image: "https://images.unsplash.com/photo-1568322445389-f64e0a1d44a4?w=400", cityId: "luxor" },
    ],
    badges: [
      { name: { en: "Explorer", ar: "مستكشف" }, icon: "🧭", earned: true },
      { name: { en: "Eco Traveler", ar: "مسافر صديق للبيئة" }, icon: "🌱", earned: true },
      { name: { en: "Culture Seeker", ar: "باحث عن الثقافة" }, icon: "🎭", earned: true },
      { name: { en: "Story Teller", ar: "راوي قصص" }, icon: "📖", earned: true },
      { name: { en: "Local Hero", ar: "بطل محلي" }, icon: "🦸", earned: false },
      { name: { en: "Desert Fox", ar: "ثعلب الصحراء" }, icon: "🦊", earned: false },
    ],
    recentPosts: [
      {
        id: "1",
        content: "Just had the most magical sunset felucca ride in Aswan! The colors reflecting off the Nile were absolutely breathtaking 🌅",
        image: "https://images.unsplash.com/photo-1568322445389-f64e0a1d44a4?w=600",
        likes: 42,
        timeAgo: "2h ago",
      },
      {
        id: "2",
        content: "Discovered an incredible pottery workshop in Fayoum. The artisan family has been crafting for 5 generations! 🏺",
        likes: 31,
        timeAgo: "3d ago",
      },
    ],
    languages: ["English", "French", "العربية (basic)"],
    travelStyle: [
      { en: "Off the beaten path", ar: "بعيداً عن المألوف" },
      { en: "Community-driven", ar: "مدفوع بالمجتمع" },
      { en: "Eco-conscious", ar: "واعي بيئياً" },
    ],
  },
};

const defaultVisitor = visitorData["sarah-m"];

const VisitorProfile = () => {
  const { id } = useParams();
  const { lang } = useI18n();
  const navigate = useNavigate();

  const visitor = visitorData[id || ""] || defaultVisitor;
  const { data: extraFollowers = 0 } = useFollowerCount("visitor", id || "sarah-m");

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Cover Photo */}
      <div className="relative h-44">
        <img src={visitor.cover} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <Share2 className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Avatar & Info */}
      <div className="relative px-4 -mt-12">
        <div className="flex items-end gap-3">
          <img
            src={visitor.avatar}
            alt={visitor.name[lang]}
            className="w-24 h-24 rounded-full border-4 border-background object-cover shadow-md"
          />
          <div className="flex-1 pb-1">
            <h1 className="text-xl font-bold text-foreground">{visitor.name[lang]}</h1>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{visitor.location[lang]}</span>
            </div>
          </div>
        </div>

        {/* Follow & Message */}
        <div className="flex gap-2 mt-3">
          <FollowButton
            targetType="visitor"
            targetId={id || "sarah-m"}
            variant="primary"
            className="flex-1 !py-0 !h-9 !rounded-md"
          />
          <Button variant="outline" className="h-9 text-sm font-semibold gap-1.5" onClick={() => navigate("/inbox")}>
            <MessageCircle className="w-4 h-4" />
            {lang === "ar" ? "رسالة" : "Message"}
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex bg-card rounded-xl shadow-card mx-4 mt-4">
        {[
          { value: visitor.stats.trips, label: lang === "ar" ? "رحلات" : "Trips" },
          { value: visitor.stats.reviews, label: lang === "ar" ? "تقييمات" : "Reviews" },
          { value: following ? visitor.stats.followers + 1 : visitor.stats.followers, label: lang === "ar" ? "متابعون" : "Followers" },
          { value: visitor.stats.following, label: lang === "ar" ? "يتابع" : "Following" },
        ].map((s, i) => (
          <div key={i} className={`flex-1 py-3 text-center ${i < 3 ? "border-r border-border" : ""}`}>
            <span className="text-lg font-bold text-primary-dark block">{s.value}</span>
            <span className="text-[10px] text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Bio */}
      <section className="mx-4 mt-4 p-4 bg-card rounded-xl shadow-card">
        <h2 className="text-sm font-bold text-foreground mb-2">
          {lang === "ar" ? "نبذة" : "About"}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{visitor.bio[lang]}</p>
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            {lang === "ar" ? `انضم في ${visitor.joinDate}` : `Joined ${visitor.joinDate}`}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Globe className="w-3.5 h-3.5" />
            {visitor.languages.join(", ")}
          </div>
        </div>
      </section>

      {/* Interests */}
      <section className="mx-4 mt-4 p-4 bg-card rounded-xl shadow-card">
        <h2 className="text-sm font-bold text-foreground mb-3">
          {lang === "ar" ? "الاهتمامات" : "Interests"}
        </h2>
        <div className="flex flex-wrap gap-2">
          {visitor.interests.map((interest, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium"
            >
              <span>{interest.emoji}</span>
              {interest[lang]}
            </span>
          ))}
        </div>
      </section>

      {/* Travel Style */}
      <section className="mx-4 mt-4 p-4 bg-card rounded-xl shadow-card">
        <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-primary" />
          {lang === "ar" ? "أسلوب السفر" : "Travel Style"}
        </h2>
        <div className="flex flex-wrap gap-2">
          {visitor.travelStyle.map((style, i) => (
            <span
              key={i}
              className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium"
            >
              {style[lang]}
            </span>
          ))}
        </div>
      </section>

      {/* Places Visited */}
      <section className="mt-4">
        <h2 className="text-sm font-bold text-foreground mb-3 px-4 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-primary" />
          {lang === "ar" ? "أماكن تمت زيارتها" : "Places Visited"}
          <span className="text-xs font-normal text-muted-foreground ml-1">({visitor.placesVisited.length})</span>
        </h2>
        <div className="flex gap-3 px-4 overflow-x-auto hide-scrollbar">
          {visitor.placesVisited.map((place, i) => (
            <button
              key={i}
              onClick={() => navigate(`/city/${place.cityId}`)}
              className="shrink-0 w-28 group"
            >
              <div className="w-28 h-28 rounded-xl overflow-hidden mb-1.5">
                <img src={place.image} alt={place.name[lang]} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <span className="text-xs font-medium text-foreground">{place.name[lang]}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Badges */}
      <section className="mx-4 mt-4 p-4 bg-card rounded-xl shadow-card">
        <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-primary" />
          {lang === "ar" ? "الشارات" : "Badges"}
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {visitor.badges.map((badge, i) => (
            <div
              key={i}
              className={`flex flex-col items-center p-3 rounded-lg ${
                badge.earned ? "bg-primary/5" : "bg-muted opacity-50"
              }`}
            >
              <span className="text-2xl mb-1">{badge.icon}</span>
              <span className="text-[10px] font-medium text-foreground text-center">{badge.name[lang]}</span>
              {!badge.earned && (
                <span className="text-[9px] text-muted-foreground mt-0.5">
                  {lang === "ar" ? "مقفل" : "Locked"}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Recent Posts */}
      <section className="mx-4 mt-4 mb-4">
        <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
          <Camera className="w-4 h-4 text-primary" />
          {lang === "ar" ? "أحدث المنشورات" : "Recent Posts"}
        </h2>
        <div className="space-y-3">
          {visitor.recentPosts.map((post) => (
            <div key={post.id} className="bg-card rounded-xl border border-border overflow-hidden">
              {post.image && (
                <img src={post.image} alt="" className="w-full h-40 object-cover" />
              )}
              <div className="p-3">
                <p className="text-sm text-foreground leading-relaxed">{post.content}</p>
                <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Heart className="w-3.5 h-3.5" /> {post.likes}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">{post.timeAgo}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <BottomNav />
    </div>
  );
};

export default VisitorProfile;
