import { Eye, ArrowRightLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useUserRole } from "@/hooks/useUserRole";

/** Small toggle for dashboard headers */
export const VisitorModeHeaderToggle = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { enterVisitorMode, isProvider } = useUserRole();

  if (!isProvider) return null;

  return (
    <button
      onClick={() => {
        enterVisitorMode();
        navigate("/");
      }}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white text-[10px] font-semibold"
    >
      <Eye className="w-3 h-3" />
      {lang === "ar" ? "وضع الزائر" : "Visitor Mode"}
    </button>
  );
};

/** Full-width toggle for Profile page */
export const VisitorModeProfileToggle = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { isProvider, isVisitorMode, dashboardPath, enterVisitorMode, exitVisitorMode } = useUserRole();

  if (!isProvider) return null;

  return (
    <div className="flex gap-2 mb-6">
      {isVisitorMode ? (
        <button
          onClick={() => {
            exitVisitorMode();
            if (dashboardPath) navigate(dashboardPath);
          }}
          className="flex-1 bg-primary text-primary-foreground rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2"
        >
          <ArrowRightLeft className="w-4 h-4" />
          {lang === "ar" ? "العودة للوحة التحكم" : "Back to Dashboard"}
        </button>
      ) : (
        <>
          <button
            onClick={() => {
              if (dashboardPath) navigate(dashboardPath);
            }}
            className="flex-1 bg-primary text-primary-foreground rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2"
          >
            <ArrowRightLeft className="w-4 h-4" />
            {lang === "ar" ? "لوحة التحكم" : "Dashboard"}
          </button>
          <button
            onClick={() => {
              enterVisitorMode();
              navigate("/");
            }}
            className="flex-1 border-2 border-primary text-primary rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {lang === "ar" ? "استكشف كزائر" : "Explore as Visitor"}
          </button>
        </>
      )}
    </div>
  );
};

export default VisitorModeProfileToggle;