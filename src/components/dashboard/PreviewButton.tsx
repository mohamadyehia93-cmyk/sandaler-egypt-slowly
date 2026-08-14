import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";

/**
 * Dashboard "preview" action. Opens the public page in a new tab so the owner
 * never loses their dashboard state (and it works inside the editor iframe,
 * where a normal in-place navigation replaced the dashboard). Falls back to an
 * in-app navigation when the popup is blocked.
 */
const PreviewButton = ({
  path,
  className = "",
}: {
  path: string;
  className?: string;
}) => {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const label = lang === "ar" ? "معاينة" : "Preview";

  const open = () => {
    const target = path.includes("?") ? `${path}&preview=1` : `${path}?preview=1`;
    const url = `${window.location.origin}${target}`;
    let win: Window | null = null;
    try {
      win = window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      win = null;
    }
    // Popups are blocked inside sandboxed iframes (editor preview) — fall back
    // to an in-app navigation so the button always does something.
    if (!win) navigate(target);
  };


  return (
    <button
      type="button"
      onClick={open}
      aria-label={label}
      title={label}
      className={`p-2 rounded-lg ${className}`}
    >
      <Eye className="w-4 h-4" />
    </button>
  );
};

export default PreviewButton;
