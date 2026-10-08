import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

interface ShareButtonProps {
  title: string;
  className?: string;
  iconClassName?: string;
  /** Show a visible text label next to the icon. */
  showLabel?: boolean;
}

/**
 * Single share control used by every detail page. Previously several pages
 * rendered a decorative Share2 icon with no handler.
 */
const ShareButton = ({ title, className, iconClassName, showLabel }: ShareButtonProps) => {
  const { lang } = useI18n();

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast(lang === "ar" ? "تم نسخ الرابط" : "Link copied");
      }
    } catch {
      /* user dismissed the share sheet */
    }
  };

  return (
    <button
      type="button"
      onClick={share}
      aria-label={lang === "ar" ? "مشاركة" : "Share"}
      className={className ?? "p-2 rounded-full bg-background/80 backdrop-blur-sm"}
    >
      <Share2 className={iconClassName ?? "w-5 h-5 text-foreground"} />
      {showLabel && <span>{lang === "ar" ? "مشاركة" : "Share"}</span>}
    </button>
  );
};

export default ShareButton;
