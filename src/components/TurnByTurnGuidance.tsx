import { useMemo } from "react";
import { Navigation, MapPin, Footprints, CheckCircle2, Compass } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import {
  bearingDegrees,
  bearingToCompass,
  distanceMeters,
  formatDistance,
  formatWalkTime,
} from "@/hooks/useUserLocation";

interface Stop {
  label_en: string;
  label_ar: string;
  lat: number;
  lng: number;
}

interface Props {
  stops: Stop[];
  /** Index of the stop the user is currently visiting / being directed from. */
  activeStopIndex: number;
  userCoords: { lat: number; lng: number } | null;
  /** Distance under which we consider the user "arrived" at the next stop. */
  arrivalThresholdM?: number;
}

/**
 * Compact, mobile-first turn-by-turn guidance card. Shows the next stop,
 * compass direction with arrow, walking distance and ETA based on live GPS.
 */
const TurnByTurnGuidance = ({
  stops,
  activeStopIndex,
  userCoords,
  arrivalThresholdM = 25,
}: Props) => {
  const { lang } = useI18n();
  const isAr = lang === "ar";

  const nextStopIndex = useMemo(() => {
    if (!stops.length) return -1;
    // Prefer the next un-reached stop after the active one
    return Math.min(activeStopIndex + 1, stops.length - 1);
  }, [stops.length, activeStopIndex]);

  const next = nextStopIndex >= 0 ? stops[nextStopIndex] : null;
  const isFinalStop = nextStopIndex === stops.length - 1 && activeStopIndex === stops.length - 1;

  if (!next || !Number.isFinite(next.lat) || !Number.isFinite(next.lng)) return null;

  const distM = userCoords ? distanceMeters(userCoords, { lat: next.lat, lng: next.lng }) : null;
  const bearing = userCoords ? bearingDegrees(userCoords, { lat: next.lat, lng: next.lng }) : null;
  const compass = bearing != null ? bearingToCompass(bearing, lang) : null;

  const arrived = distM != null && distM <= arrivalThresholdM;
  const stopLabel = isAr ? next.label_ar : next.label_en;
  const stopNum = nextStopIndex + 1;

  // Localized headline ("Walk to Stop 2" / "اتجه إلى المحطة ٢")
  const headline = isFinalStop
    ? isAr
      ? "وصلت إلى نهاية الجولة"
      : "You've reached the final stop"
    : arrived
      ? isAr
        ? `وصلت إلى المحطة ${stopNum}`
        : `Arrived at Stop ${stopNum}`
      : isAr
        ? `اتّجه إلى المحطة ${stopNum}`
        : `Walk to Stop ${stopNum}`;

  // Direction sentence ("Head north for 120 m (~2 min)")
  const directionSentence = (() => {
    if (!userCoords) {
      return isAr
        ? "شغّل الموقع لرؤية الاتجاهات الحيّة."
        : "Turn on location to see live directions.";
    }
    if (arrived) {
      return isAr
        ? "ابدأ التشغيل للاستماع إلى السرد الخاص بهذه المحطة."
        : "Start playback to hear this stop's narration.";
    }
    if (compass && distM != null) {
      const dist = formatDistance(distM, lang);
      const eta = formatWalkTime(distM, lang);
      return isAr
        ? `اتّجه ${compass.label} مسافة ${dist} (≈ ${eta} مشياً).`
        : `Head ${compass.label} for ${dist} (~${eta} walk).`;
    }
    return "";
  })();

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="mb-4 bg-card border border-border rounded-xl shadow-card overflow-hidden text-start"
      role="region"
      aria-label={isAr ? "إرشادات المسار" : "Turn-by-turn guidance"}
    >
      {/* Top row: arrow + status + ETA */}
      <div
        className={`flex items-center gap-3 px-4 py-3 ${
          arrived ? "bg-success/10" : "bg-primary/5"
        }`}
      >
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
            arrived ? "bg-success text-success-foreground" : "bg-primary text-primary-foreground"
          }`}
          aria-hidden="true"
        >
          {arrived ? (
            <CheckCircle2 className="w-6 h-6" />
          ) : compass ? (
            <span className="text-2xl leading-none font-bold">{compass.arrow}</span>
          ) : (
            <Navigation className="w-5 h-5" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {arrived
              ? isAr
                ? "وصلت"
                : "Arrived"
              : isAr
                ? "التالي"
                : "Next up"}
          </p>
          <p className="text-sm font-bold text-foreground truncate">{headline}</p>
        </div>
        {distM != null && !arrived && (
          <div className="text-end shrink-0">
            <p className="text-base font-bold text-primary leading-tight">
              {formatDistance(distM, lang)}
            </p>
            <p className="text-[10px] text-muted-foreground">{formatWalkTime(distM, lang)}</p>
          </div>
        )}
      </div>

      {/* Bottom row: target name + direction sentence */}
      <div className="px-4 py-3 space-y-1.5">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <p className="text-sm font-semibold text-foreground line-clamp-2">{stopLabel}</p>
        </div>
        <div className="flex items-start gap-2">
          {arrived ? (
            <Footprints className="w-4 h-4 text-success mt-0.5 shrink-0" />
          ) : (
            <Compass className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          )}
          <p className="text-xs text-muted-foreground leading-relaxed">{directionSentence}</p>
        </div>
      </div>
    </div>
  );
};

export default TurnByTurnGuidance;
