import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

export type CategoryNavItem = { id: string; label: { en: string; ar: string } };

/** The homepage spine: the real content types, in feed order. */
export const HOME_CATEGORIES: CategoryNavItem[] = [
  { id: "events", label: { en: "Events", ar: "فعاليات" } },
  { id: "audio-tours", label: { en: "Audio Tours", ar: "جولات صوتية" } },
  { id: "experiences", label: { en: "Experiences", ar: "تجارب" } },
  { id: "trips", label: { en: "Trips", ar: "رحلات" } },
  { id: "stays", label: { en: "Stays", ar: "إقامات" } },
  { id: "rides", label: { en: "Rides", ar: "تنقّل" } },
  { id: "products", label: { en: "Products", ar: "منتجات" } },
  { id: "stories", label: { en: "Stories", ar: "حكايات" } },
];

/**
 * Persistent category bar pinned under the header. Horizontal chip rail on
 * mobile, centered row on desktop. Tapping scrolls to that section.
 */
const CategoryNav = ({ items = HOME_CATEGORIES }: { items?: CategoryNavItem[] }) => {
  const { lang } = useI18n();
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const sections = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: 0 }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [items]);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 108;
    window.scrollTo({ top, behavior: "smooth" });
    setActive(id);
  };

  return (
    <nav
      aria-label={lang === "ar" ? "أقسام الصفحة" : "Page sections"}
      className="sticky top-[56px] z-40 border-b border-border bg-background/95 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto px-4 py-2.5 hide-scrollbar md:justify-center">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => go(item.id)}
            aria-current={active === item.id ? "true" : undefined}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
              active === item.id
                ? "bg-primary-dark text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            {item.label[lang]}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default CategoryNav;
