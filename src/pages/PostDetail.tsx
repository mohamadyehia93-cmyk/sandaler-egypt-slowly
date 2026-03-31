import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Bookmark, Share2, User, MapPin } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { latestPosts, cultureActors, cityData } from "@/lib/sampleData";
import WishlistButton from "@/components/WishlistButton";

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useI18n();

  

  const post = latestPosts.find((p) => p.id === id);
  if (!post) return <div className="p-8 text-center text-muted-foreground">Post not found</div>;

  const relatedPosts = latestPosts.filter((p) => p.id !== id && p.regionId === post.regionId).slice(0, 3);
  const formattedDate = new Date(post.date).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  const paragraphs = post.body[lang].split("\n\n");

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
          <button
            onClick={() => {
              setSaved(!saved);
              toast(saved
                ? (lang === "ar" ? "تمت الإزالة من المفضلة" : "Removed from wishlist")
                : (lang === "ar" ? "تمت الإضافة للمفضلة" : "Added to wishlist"));
            }}
            className="p-2 rounded-full bg-background/80 backdrop-blur-sm"
          >
            <Bookmark className={`w-5 h-5 ${saved ? "fill-primary text-primary" : "text-foreground"}`} />
          </button>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full">
              {post.category[lang]}
            </span>
            {(post as any).cityId && cityData[(post as any).cityId] && (
              <span
                onClick={(e) => { e.stopPropagation(); navigate(`/city/${(post as any).cityId}`); }}
                className="inline-flex items-center gap-1 bg-background/80 backdrop-blur-sm text-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full cursor-pointer hover:bg-background/90 transition-colors"
              >
                <MapPin className="w-3 h-3" />
                {cityData[(post as any).cityId].name[lang]}
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold text-white leading-tight">{post.title[lang]}</h1>
        </div>
      </div>

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
          <Clock className="w-3.5 h-3.5" />
          <span className="text-xs">{post.readTime} {lang === "ar" ? "دقائق قراءة" : "min read"}</span>
        </div>
      </div>

      {/* Body */}
      <article className="px-4 pt-5 space-y-4">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-sm text-foreground leading-relaxed">{p}</p>
        ))}
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="mt-8 px-4">
          <h2 className="text-base font-bold text-foreground mb-3">
            {lang === "ar" ? "مقالات ذات صلة" : "Related Posts"}
          </h2>
          <div className="space-y-3">
            {relatedPosts.map((rp) => (
              <div
                key={rp.id}
                onClick={() => navigate(`/post/${rp.id}`)}
                className="flex gap-3 rounded-lg bg-card shadow-card border border-border overflow-hidden cursor-pointer"
              >
                <img src={rp.image} alt={rp.title[lang]} className="w-24 h-20 object-cover flex-shrink-0" />
                <div className="py-2.5 pe-3 flex flex-col justify-center">
                  <span className="text-[10px] font-medium text-primary mb-0.5">{rp.category[lang]}</span>
                  <h3 className="text-xs font-semibold text-foreground line-clamp-2">{rp.title[lang]}</h3>
                  <span className="text-[10px] text-muted-foreground mt-1">{rp.readTime} {lang === "ar" ? "د" : "min"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetail;
