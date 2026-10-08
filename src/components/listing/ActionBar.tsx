import { MessageCircle } from "lucide-react";

interface Props {
  price: string;
  note?: string;
  buttonLabel: string;
  onPrimary: () => void;
  onMessage?: () => void;
  ar: boolean;
}

/** Mobile-only fixed bar above the app bottom navigation. Desktop renders a sticky card instead. */
const ActionBar = ({ price, note, buttonLabel, onPrimary, onMessage, ar }: Props) => (
  <div
    className="lg:hidden fixed inset-x-0 z-40 bg-card border-t border-border shadow-elevated"
    style={{ bottom: "calc(68px + env(safe-area-inset-bottom, 0px))" }}
  >
    <div className="max-w-[680px] mx-auto px-4 py-2.5 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-xl font-bold text-foreground leading-tight">{price}</p>
        {note && <p className="text-[13px] text-muted-foreground">{note}</p>}
      </div>
      {onMessage && (
        <button type="button" onClick={onMessage} aria-label={ar ? "راسل المضيف" : "Message the host"}
          className="tap-target rounded-full border border-border text-primary-dark">
          <MessageCircle className="w-5 h-5" />
        </button>
      )}
      <button type="button" onClick={onPrimary} className="h-12 px-6 rounded-xl bg-primary text-primary-foreground text-[15px] font-bold">
        {buttonLabel}
      </button>
    </div>
  </div>
);

export default ActionBar;
