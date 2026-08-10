import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";

/**
 * Single entry point for "message this person" actions on transaction lists.
 *
 * `userId` MUST be an auth user id (bookings.visitor_id, orders.buyer_id,
 * reservation_requests.requester_id, …). It is passed to /inbox with
 * `kind=user`, so it still travels through `resolveUserIdForMessaging`
 * (see src/lib/messagingTarget.ts) — ids are never written into
 * `conversations` from here.
 *
 * Renders nothing when the id is missing or points at the signed-in user,
 * so no broken or self-message buttons can appear.
 */
interface MessageUserButtonProps {
  userId: string | null | undefined;
  /** `chip` = compact inline action, `block` = full-width row action. */
  variant?: "chip" | "block";
  /** Show a disabled "hasn't joined yet" state instead of hiding when unresolvable. */
  showUnavailable?: boolean;
  label?: string;
  className?: string;
}

const MessageUserButton = ({
  userId,
  variant = "chip",
  showUnavailable = false,
  label,
  className = "",
}: MessageUserButtonProps) => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();
  const ar = lang === "ar";

  const isSelf = !!userId && !!user && userId === user.id;
  const base =
    variant === "block"
      ? "flex-1 text-[11px] font-semibold py-1.5 rounded-lg flex items-center justify-center gap-1"
      : "text-[10px] font-semibold px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1";

  if (!userId || isSelf) {
    if (!showUnavailable || isSelf) return null;
    return (
      <button
        type="button"
        disabled
        className={`${base} bg-secondary text-muted-foreground cursor-not-allowed ${className}`}
      >
        <MessageCircle className="w-3.5 h-3.5 shrink-0" />
        {ar ? "لم ينضم بعد" : "Hasn't joined yet"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        navigate(`/inbox?personId=${userId}&kind=user`);
      }}
      className={`${base} bg-primary/10 text-primary hover:bg-primary/20 transition-colors ${className}`}
    >
      <MessageCircle className="w-3.5 h-3.5 shrink-0" />
      {label ?? (ar ? "رسالة" : "Message")}
    </button>
  );
};

export default MessageUserButton;
