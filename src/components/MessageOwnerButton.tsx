import { useQuery } from "@tanstack/react-query";
import { resolveUserIdForMessaging, type MessagingTargetKind } from "@/lib/messagingTarget";
import MessageUserButton from "./MessageUserButton";

/**
 * Detail-page "message the owner" action.
 *
 * Takes the raw owner column of a listing (`providers.id`, `culture_actors.id`
 * or an auth user id) plus its `kind`, resolves it through
 * `resolveUserIdForMessaging` and renders the shared MessageUserButton with the
 * resolved AUTH USER id — so no record id ever reaches `conversations`.
 *
 * - owner column empty            → renders nothing
 * - record exists but unclaimed   → disabled "Hasn't joined yet"
 * - owner is the signed-in viewer → renders nothing (no self-message)
 */
interface MessageOwnerButtonProps {
  ownerId: string | null | undefined;
  kind?: MessagingTargetKind;
  label?: string;
  className?: string;
  variant?: "chip" | "block";
}

const MessageOwnerButton = ({
  ownerId,
  kind = "auto",
  label,
  className = "",
  variant = "block",
}: MessageOwnerButtonProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ["messaging-target", kind, ownerId],
    enabled: !!ownerId,
    queryFn: () => resolveUserIdForMessaging(ownerId!, kind),
  });

  if (!ownerId || isLoading || !data) return null;

  return (
    <MessageUserButton
      userId={data.userId}
      variant={variant}
      showUnavailable
      label={label}
      className={className}
    />
  );
};

export default MessageOwnerButton;
