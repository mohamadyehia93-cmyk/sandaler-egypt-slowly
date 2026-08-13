import { Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";

/**
 * A cause with no owner has nobody who can receive, accept or answer a pledge or
 * a volunteer application (the insert triggers resolve owner_id from
 * causes.owner_id, so a null owner means no notification is ever sent to anyone
 * but the requester). Rather than accept a request into a void, the support
 * actions are blocked and the visitor is told why.
 */
const CauseUnmanagedNotice = ({ causeHref }: { causeHref?: string }) => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const ar = lang === "ar";

  return (
    <div className="px-4 py-8">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-foreground mb-1">
              {ar ? "هذه القضية غير مُدارة حالياً" : "This cause is not currently managed"}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {ar
                ? "لا توجد جهة مسؤولة عن هذه القضية على التطبيق بعد، فلا يمكن استقبال التعهدات أو طلبات التطوع أو الرد عليها. القضية معروضة للتعريف فقط."
                : "No organisation has claimed this cause on Sandal yet, so pledges and volunteer requests cannot be received or answered. It is listed for information only."}
            </p>
          </div>
        </div>
        {causeHref && (
          <button
            onClick={() => navigate(causeHref)}
            className="mt-4 w-full py-3 rounded-xl bg-secondary text-secondary-foreground text-sm font-semibold"
          >
            {ar ? "رجوع إلى القضية" : "Back to the cause"}
          </button>
        )}
      </div>
    </div>
  );
};

export default CauseUnmanagedNotice;
