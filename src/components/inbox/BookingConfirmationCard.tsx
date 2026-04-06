import { CalendarCheck, CheckCircle2 } from "lucide-react";

interface BookingConfirmationCardProps {
  meta: Record<string, string>;
  time: string;
  isMe: boolean;
}

const BookingConfirmationCard = ({ meta, time, isMe }: BookingConfirmationCardProps) => {
  const status = meta.status || "confirmed";

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[85%] rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-accent/50 border-b border-border">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">
            {status === "confirmed" ? "Booking Confirmed" : "Booking Request"}
          </span>
        </div>
        <div className="px-4 py-3 space-y-2">
          {meta.itemName && (
            <p className="text-sm font-medium text-foreground">{meta.itemName}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {meta.date && (
              <span className="flex items-center gap-1">
                <CalendarCheck className="w-3.5 h-3.5" />
                {meta.date}
              </span>
            )}
            {meta.price && <span className="font-medium text-foreground">{meta.price}</span>}
          </div>
          {meta.guests && (
            <p className="text-xs text-muted-foreground">{meta.guests} guests</p>
          )}
        </div>
        <div className="px-4 py-2 border-t border-border">
          <span className="text-[10px] text-muted-foreground">{time}</span>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationCard;
