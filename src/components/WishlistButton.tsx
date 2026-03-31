import { useState } from "react";
import { Heart, Bookmark } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

interface WishlistButtonProps {
  variant?: "heart" | "bookmark";
  className?: string;
}

const WishlistButton = ({ variant = "heart", className = "p-2 rounded-full bg-background/80 backdrop-blur-sm" }: WishlistButtonProps) => {
  const [saved, setSaved] = useState(false);
  const { lang } = useI18n();
  const Icon = variant === "bookmark" ? Bookmark : Heart;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setSaved(!saved);
        toast(saved
          ? (lang === "ar" ? "تمت الإزالة من المفضلة" : "Removed from wishlist")
          : (lang === "ar" ? "تمت الإضافة للمفضلة" : "Added to wishlist"));
      }}
      className={className}
    >
      <Icon className={`w-5 h-5 ${saved ? (variant === "bookmark" ? "fill-primary text-primary" : "fill-destructive text-destructive") : "text-foreground"}`} />
    </button>
  );
};

export default WishlistButton;
