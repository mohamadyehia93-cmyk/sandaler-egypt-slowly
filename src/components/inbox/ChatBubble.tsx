import { format } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";
import BookingConfirmationCard from "./BookingConfirmationCard";

interface ChatBubbleProps {
  message: Tables<"messages">;
  isMe: boolean;
}

const ChatBubble = ({ message, isMe }: ChatBubbleProps) => {
  const time = format(new Date(message.created_at), "HH:mm");

  if (message.message_type === "booking-confirmation" && message.booking_meta) {
    return <BookingConfirmationCard meta={message.booking_meta as Record<string, string>} time={time} isMe={isMe} />;
  }

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
          isMe
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-card border border-border text-foreground rounded-bl-md"
        }`}
      >
        <p className="text-sm leading-relaxed">{message.text}</p>
        <span className={`text-[10px] mt-1 block ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
          {time}
        </span>
      </div>
    </div>
  );
};

export default ChatBubble;
