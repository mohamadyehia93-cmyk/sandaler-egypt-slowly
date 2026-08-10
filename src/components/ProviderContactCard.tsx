import { useEffect, useState } from "react";
import { Mail, Phone, MessageCircle, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import type { ProviderContact } from "@/lib/providerColumns";

/**
 * Private contact details for a provider.
 *
 * The columns are not readable through the `providers` table any more; the
 * guarded `get_provider_contact` RPC returns them only to the provider itself
 * or to a signed-in user with a confirmed transaction. Anyone else sees a short
 * note explaining that contact details unlock after a confirmed booking.
 */
const ProviderContactCard = ({ providerId }: { providerId?: string }) => {
  const { lang } = useI18n();
  const ar = lang === "ar";
  const [contact, setContact] = useState<ProviderContact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!providerId) return;
    let active = true;
    (async () => {
      // The RPC is only executable by signed-in users; skip it for guests.
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        if (active) setLoading(false);
        return;
      }
      const { data } = await supabase.rpc("get_provider_contact", { _provider_id: providerId });
      if (!active) return;
      const row = (Array.isArray(data) ? data[0] : data) as ProviderContact | undefined;
      setContact(row ?? null);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [providerId]);

  if (!providerId || loading) return null;

  const items = [
    { icon: Mail, value: contact?.contact_email, href: (v: string) => `mailto:${v}` },
    { icon: Phone, value: contact?.contact_phone, href: (v: string) => `tel:${v}` },
    { icon: MessageCircle, value: contact?.whatsapp, href: (v: string) => `https://wa.me/${v.replace(/[^\d]/g, "")}` },
  ].filter((i) => !!i.value);

  return (
    <div className="mx-4 mt-4 rounded-xl bg-card shadow-card p-4" dir={ar ? "rtl" : "ltr"}>
      <h2 className="text-sm font-semibold text-foreground mb-2">
        {ar ? "بيانات التواصل" : "Contact details"}
      </h2>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground flex items-start gap-2">
          <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          {ar
            ? "تظهر بيانات التواصل بعد تأكيد حجز أو طلب مع هذا المضيف."
            : "Contact details unlock after a confirmed booking or order with this host."}
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map(({ icon: Icon, value, href }) => (
            <li key={value as string}>
              <a
                href={href(value as string)}
                className="flex items-center gap-2 text-sm text-foreground"
                dir="ltr"
              >
                <Icon className="w-4 h-4 text-primary shrink-0" />
                {value}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProviderContactCard;
