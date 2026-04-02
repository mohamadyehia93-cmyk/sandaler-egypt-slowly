import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Image, MapPin, MessageCircle, Heart, Share2, Plus, HelpCircle, Lightbulb, Camera } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import BottomNav from "@/components/BottomNav";

type PostCategory = "memory" | "tip" | "question";

interface CommunityPost {
  id: string;
  author: string;
  authorId: string;
  avatar: string;
  category: PostCategory;
  content: string;
  location?: string;
  images: string[];
  likes: number;
  comments: number;
  timeAgo: string;
  liked: boolean;
}

const samplePosts: CommunityPost[] = [
  {
    id: "1",
    author: "Sarah M.",
    authorId: "sarah-m",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    category: "memory",
    content: "Just had the most magical sunset felucca ride in Aswan! The colors reflecting off the Nile were absolutely breathtaking. Highly recommend going at golden hour 🌅",
    location: "Aswan",
    images: ["https://images.unsplash.com/photo-1568322445389-f64e0a1d44a4?w=600"],
    likes: 42,
    comments: 8,
    timeAgo: "2h ago",
    liked: false,
  },
  {
    id: "2",
    author: "Ahmed K.",
    authorId: "ahmed-k",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    category: "tip",
    content: "Pro tip: Visit the Siwa Oasis during spring (March-April). The weather is perfect, and you'll catch the date harvest season. Don't miss the salt lakes! 🌴",
    location: "Siwa",
    images: [],
    likes: 67,
    comments: 12,
    timeAgo: "5h ago",
    liked: true,
  },
  {
    id: "3",
    author: "Nour A.",
    authorId: "nour-a",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
    category: "question",
    content: "Has anyone done the White Desert overnight camping trip? Looking for recommendations on local guides. Is it better to go from Cairo or Bahariya?",
    images: [],
    likes: 15,
    comments: 23,
    timeAgo: "1d ago",
    liked: false,
  },
  {
    id: "4",
    author: "Marco R.",
    authorId: "marco-r",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
    category: "memory",
    content: "Discovered this hidden gem in Rashid (Rosetta) — a traditional coffee house where locals gather every evening. The stories, the chai, the hospitality… unforgettable ☕",
    location: "Rosetta",
    images: ["https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600"],
    likes: 31,
    comments: 5,
    timeAgo: "2d ago",
    liked: false,
  },
];

const categoryConfig: Record<PostCategory, { icon: typeof Camera; label: { en: string; ar: string }; color: string }> = {
  memory: { icon: Camera, label: { en: "Memory", ar: "ذكرى" }, color: "bg-primary/10 text-primary" },
  tip: { icon: Lightbulb, label: { en: "Tip", ar: "نصيحة" }, color: "bg-accent/20 text-accent-foreground" },
  question: { icon: HelpCircle, label: { en: "Question", ar: "سؤال" }, color: "bg-secondary text-secondary-foreground" },
};

const Community = () => {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [posts, setPosts] = useState(samplePosts);
  const [showCompose, setShowCompose] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<PostCategory>("memory");
  const [newLocation, setNewLocation] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | PostCategory>("all");

  const filteredPosts = activeFilter === "all" ? posts : posts.filter((p) => p.category === activeFilter);

  const handleLike = (id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
      )
    );
  };

  const handlePost = () => {
    if (!newContent.trim()) return;
    const post: CommunityPost = {
      id: Date.now().toString(),
      author: lang === "ar" ? "أنت" : "You",
      authorId: "me",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
      category: newCategory,
      content: newContent,
      location: newLocation || undefined,
      images: [],
      likes: 0,
      comments: 0,
      timeAgo: lang === "ar" ? "الآن" : "Just now",
      liked: false,
    };
    setPosts((prev) => [post, ...prev]);
    setNewContent("");
    setNewLocation("");
    setShowCompose(false);
  };

  const filters: { key: "all" | PostCategory; label: { en: string; ar: string } }[] = [
    { key: "all", label: { en: "All", ar: "الكل" } },
    { key: "memory", label: { en: "Memories", ar: "ذكريات" } },
    { key: "tip", label: { en: "Tips", ar: "نصائح" } },
    { key: "question", label: { en: "Questions", ar: "أسئلة" } },
  ];

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3 bg-background border-b border-border">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground">
            {lang === "ar" ? "المجتمع" : "Community"}
          </h1>
          <p className="text-xs text-muted-foreground">
            {lang === "ar" ? "شارك ذكرياتك وتجاربك" : "Share memories & experiences"}
          </p>
        </div>
        <Button size="sm" onClick={() => setShowCompose(!showCompose)} className="gap-1">
          <Plus className="w-4 h-4" />
          {lang === "ar" ? "نشر" : "Post"}
        </Button>
      </header>

      {/* Compose */}
      {showCompose && (
        <div className="mx-4 mt-3 p-4 bg-background rounded-xl border border-border shadow-sm">
          <div className="flex gap-2 mb-3">
            {(["memory", "tip", "question"] as PostCategory[]).map((cat) => {
              const cfg = categoryConfig[cat];
              const CatIcon = cfg.icon;
              return (
                <button
                  key={cat}
                  onClick={() => setNewCategory(cat)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    newCategory === cat ? "bg-primary text-primary-foreground" : cfg.color
                  }`}
                >
                  <CatIcon className="w-3.5 h-3.5" />
                  {cfg.label[lang]}
                </button>
              );
            })}
          </div>
          <Textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder={
              lang === "ar"
                ? "شارك تجربتك، نصيحة، أو سؤال..."
                : "Share a memory, tip, or question..."
            }
            className="mb-2 resize-none bg-secondary border-none text-sm"
            rows={3}
          />
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder={lang === "ar" ? "الموقع" : "Location"}
                  className="h-6 border-none bg-transparent text-xs p-0 focus-visible:ring-0"
                />
              </div>
              <button className="p-1.5 rounded-md bg-secondary">
                <Image className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <Button size="sm" onClick={handlePost} disabled={!newContent.trim()}>
              {lang === "ar" ? "نشر" : "Post"}
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto hide-scrollbar">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeFilter === f.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {f.label[lang]}
          </button>
        ))}
      </div>

      {/* Posts Feed */}
      <div className="px-4 space-y-3">
        {filteredPosts.map((post) => {
          const cfg = categoryConfig[post.category];
          const CatIcon = cfg.icon;
          return (
            <article key={post.id} className="bg-background rounded-xl border border-border overflow-hidden">
              {/* Post Header */}
              <div className="flex items-center gap-3 p-3 pb-0">
                <img onClick={() => navigate(`/visitor/${post.authorId}`)} src={post.avatar} alt={post.author} className="w-9 h-9 rounded-full object-cover cursor-pointer" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span onClick={() => navigate(`/visitor/${post.authorId}`)} className="text-sm font-semibold text-foreground cursor-pointer hover:text-primary transition-colors">{post.author}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.color}`}>
                      <CatIcon className="w-3 h-3" />
                      {cfg.label[lang]}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span>{post.timeAgo}</span>
                    {post.location && (
                      <>
                        <span>·</span>
                        <MapPin className="w-3 h-3" />
                        <span>{post.location}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <p className="px-3 py-2 text-sm text-foreground leading-relaxed">{post.content}</p>

              {/* Images */}
              {post.images.length > 0 && (
                <div className="px-3 pb-2">
                  <img
                    src={post.images[0]}
                    alt=""
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-1 px-3 py-2 border-t border-border">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    post.liked ? "text-destructive" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Heart className="w-4 h-4" fill={post.liked ? "currentColor" : "none"} />
                  {post.likes}
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground transition-all">
                  <MessageCircle className="w-4 h-4" />
                  {post.comments}
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground transition-all ml-auto">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
};

export default Community;
