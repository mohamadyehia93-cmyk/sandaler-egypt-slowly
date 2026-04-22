import { UserPlus, UserCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useIsFollowing, useToggleFollow } from "@/hooks/useFollows";
import { toast } from "sonner";

export type FollowTargetType =
  | "organization"
  | "provider"
  | "culture_actor"
  | "person"
  | "visitor";

interface Props {
  targetType: FollowTargetType;
  targetId: string;
  /** Visual style. */
  variant?: "primary" | "outline" | "compact";
  className?: string;
}

const FollowButton = ({
  targetType,
  targetId,
  variant = "primary",
  className = "",
}: Props) => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const following = useIsFollowing(targetType, targetId);
  const toggle = useToggleFollow();

  const handleClick = () => {
    if (!user) {
      toast(lang === "ar" ? "سجّل الدخول للمتابعة" : "Sign in to follow");
      navigate("/login");
      return;
    }
    toggle.mutate(
      { targetType, targetId, currentlyFollowing: following },
      {
        onSuccess: ({ followed }) =>
          toast.success(
            followed
              ? lang === "ar" ? "تتم المتابعة الآن" : "Now following"
              : lang === "ar" ? "تم إلغاء المتابعة" : "Unfollowed"
          ),
        onError: () =>
          toast.error(
            lang === "ar" ? "تعذّر تحديث المتابعة" : "Couldn't update follow"
          ),
      }
    );
  };

  const Icon = following ? UserCheck : UserPlus;
  const label = following
    ? lang === "ar" ? "متابَع" : "Following"
    : lang === "ar" ? "متابعة" : "Follow";

  if (variant === "compact") {
    return (
      <button
        onClick={handleClick}
        disabled={toggle.isPending}
        className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors ${
          following
            ? "bg-primary/10 text-primary border border-primary/30"
            : "bg-primary text-primary-foreground"
        } ${className}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {label}
      </button>
    );
  }

  if (variant === "outline") {
    return (
      <button
        onClick={handleClick}
        disabled={toggle.isPending}
        className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-semibold text-sm border-2 transition-colors ${
          following
            ? "bg-primary/10 border-primary text-primary"
            : "border-border bg-card text-foreground"
        } ${className}`}
      >
        <Icon className="w-4 h-4" />
        {label}
      </button>
    );
  }

  // primary
  return (
    <button
      onClick={handleClick}
      disabled={toggle.isPending}
      className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
        following
          ? "bg-primary/10 border-2 border-primary text-primary"
          : "bg-primary text-primary-foreground"
      } ${className}`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
};

export default FollowButton;
