import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";

type Props = {
  /** Bilingual "no X here yet" line, already including the place name. */
  messageEn: string;
  messageAr: string;
  /** Optional single secondary link. */
  actionEn?: string;
  actionAr?: string;
  actionHref?: string;
  className?: string;
};

/**
 * One calm line for a section that has no rows yet.
 *
 * WHY: city and region pages used to hide a whole section when it was empty,
 * so a real city with no stays read as thin or broken. Saying "nothing here
 * yet" is honest and keeps the page's shape predictable.
 */
const EmptySection = ({
  messageEn,
  messageAr,
  actionEn,
  actionAr,
  actionHref,
  className = "",
}: Props) => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const ar = lang === "ar";

  return (
    <div className={`px-4 ${className}`}>
      <p className="text-[13px] text-muted-foreground">
        {ar ? messageAr : messageEn}
        {actionHref && (actionEn || actionAr) && (
          <>
            {" "}
            <button
              type="button"
              onClick={() => navigate(actionHref)}
              className="font-semibold text-primary underline underline-offset-4 rounded focus-ring"
            >
              {ar ? actionAr || actionEn : actionEn || actionAr}
            </button>
          </>
        )}
      </p>
    </div>
  );
};

export default EmptySection;
