import { useEffect, useState } from "react";
import { Mail, Phone, MessageCircle, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { waLink } from "@/lib/whatsapp";
import type { ProviderContact } from "@/lib/providerColumns";

/**
 * Private contact details for a provider, with WhatsApp as the primary action.
 *
 * The columns are not readable through the `providers` table; the guarded
 * `get_provider_contact` RPC returns them only to the provider itself or to a
 * signed-in user with a confirmed transaction. That gate is deliberate and
 * unchanged — before a confirmed booking the in-app Message button is the
 * channel, and this card explains why the number is not shown yet.
 */
const ProviderContactCard = ({
  providerId,
  compact = false,
}: {
  providerId?: string;
  compact?: boolean;
}) => {
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

  const whatsapp = contact?.whatsapp?.trim() || null;
  const rest = [
    { icon: Mail, value: contact?.contact_email, href: (v: string) => `mailto:${v}` },
    { icon: Phone, value: contact?.contact_phone, href: (v: string) => `tel:${v}` },
  ].filter((i) => !!i.value);

  // Compact mode sits inside another card (listing pages), so it draws no box.
  if (compact && !whatsapp && rest.length === 0) return null;

  const body = (
    <>
      {whatsapp && (
        <a
          href={waLink(whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full min-h-[44px] rounded-xl bg-success text-success-foreground font-bold text-sm px-4"
        >
          <MessageCircle className="w-4 h-4 shrink-0" />
          {ar ? "تواصل على واتساب" : "Chat on WhatsApp"}
        </a>
      )}
      {rest.length > 0 && (
        <ul className="space-y-2 mt-2">
          {rest.map(({ icon: Icon, value, href }) => (
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
      {!whatsapp && rest.length === 0 && (
        <p className="text-xs text-muted-foreground flex items-start gap-2">
          <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          {ar
            ? "رقم واتساب وبيانات التواصل تظهر بعد تأكيد حجز أو طلب. لحد ساعتها استخدم المراسلة داخل التطبيق."
            : "WhatsApp and contact details unlock after a confirmed booking or order. Until then, use the in-app message."}
        </p>
      )}
    </>
  );

  if (compact) return <div className="mt-3">{body}</div>;

  return (
    <div className="mx-4 mt-4 rounded-xl bg-card shadow-card p-4" dir={ar ? "rtl" : "ltr"}>
      <h2 className="text-sm font-semibold text-foreground mb-2">
        {ar ? "بيانات التواصل" : "Contact details"}
      </h2>
      {body}
    </div>
  );
};

export default ProviderContactCard;
