import { Heart, Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { useWishlist, WishlistItemType } from "@/hooks/useWishlist";

interface WishlistButtonProps {
  itemType: WishlistItemType;
  /** The item's UUID (not its slug). Rendered inert while undefined. */
  itemId?: string | null;
  variant?: "heart" | "bookmark";
  className?: string;
}

const WishlistButton = ({
  itemType,
  itemId,
  variant = "heart",
  className = "p-2 rounded-full bg-background/80 backdrop-blur-sm",
}: WishlistButtonProps) => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { saved, toggle, isSignedIn } = useWishlist(itemType, itemId);
  const Icon = variant === "bookmark" ? Bookmark : Heart;

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!itemId) return;

    if (!isSignedIn) {
      toast(
        lang === "ar"
          ? "سجّل الدخول لحفظ العناصر في المفضلة"
          : "Sign in to save items to your wishlist",
        {
          action: {
            label: lang === "ar" ? "تسجيل الدخول" : "Sign in",
            onClick: () => navigate("/login"),
          },
        }
      );
      return;
    }

    const wasSaved = saved;
    try {
      await toggle();
      toast(
        wasSaved
          ? lang === "ar"
            ? "تمت الإزالة من المفضلة"
            : "Removed from wishlist"
          : lang === "ar"
            ? "تمت الإضافة للمفضلة"
            : "Added to wishlist"
      );
    } catch {
      toast.error(
        lang === "ar" ? "تعذّر تحديث المفضلة" : "Could not update your wishlist"
      );
    }
  };

  return (
    <button
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={
        saved
          ? lang === "ar"
            ? "إزالة من المفضلة"
            : "Remove from wishlist"
          : lang === "ar"
            ? "إضافة للمفضلة"
            : "Add to wishlist"
      }
      className={className}
    >
      <Icon
        className={`w-5 h-5 ${saved ? (variant === "bookmark" ? "fill-primary text-primary" : "fill-destructive text-destructive") : "text-foreground"}`}
      />
    </button>
  );
};

export default WishlistButton;
