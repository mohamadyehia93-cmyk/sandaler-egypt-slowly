import { useI18n } from "@/lib/i18n";

export type DiscoverFilterId =
  | "all"
  | "events"
  | "audio-tours"
  | "experiences"
  | "trips"
  | "stories";

export const DISCOVER_FILTERS: { id: DiscoverFilterId; label: { en: string; ar: string } }[] = [
  { id: "all", label: { en: "All", ar: "الكل" } },
  { id: "events", label: { en: "Events", ar: "فعاليات" } },
  { id: "audio-tours", label: { en: "Audio Tours", ar: "جولات صوتية" } },
  { id: "experiences", label: { en: "Experiences", ar: "تجارب" } },
  { id: "trips", label: { en: "Trips", ar: "رحلات" } },
  { id: "stories", label: { en: "Stories", ar: "حكايات" } },
];

/**
 * Content-type chips INSIDE Discover. They filter the feed — they are not a
 * second navigation system (the bottom bar is the only one).
 */
const DiscoverFilters = ({
  active,
  onChange,
}: {
  active: DiscoverFilterId;
  onChange: (id: DiscoverFilterId) => void;
}) => {
  const { lang } = useI18n();
  return (
    <div
      role="group"
      aria-label={lang === "ar" ? "تصفية حسب النوع" : "Filter by type"}
      className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 py-2.5 hide-scrollbar md:justify-center">
        {DISCOVER_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => onChange(f.id)}
            aria-pressed={active === f.id}
            className={`focus-ring shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
              active === f.id
                ? "bg-primary-dark text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            {f.label[lang]}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DiscoverFilters;
