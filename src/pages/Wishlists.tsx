import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Heart, Trash2, Compass, Route, CalendarDays, FileText, Headphones,
  ShoppingBag, BedDouble, Bus, HandHeart, LogIn,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { useMyWishlist, useWishlist, WishlistItemType } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type SavedItem = {
  id: string;
  title: string;
  image: string | null;
  subtitle: string | null;
  href: string;
};

type TypeConfig = {
  table: string;
  columns: string;
  icon: typeof Heart;
  label: { en: string; ar: string };
  route: string;
  titleEn: string;
  titleAr: string;
};

/** One entry per wishlists.item_type value. */
const TYPE_CONFIG: Record<WishlistItemType, TypeConfig> = {
  experience: {
    table: "experiences", columns: "id, slug, image, title_en, title_ar, city_id, price",
    icon: Compass, label: { en: "Experiences", ar: "التجارب" }, route: "/experience",
    titleEn: "title_en", titleAr: "title_ar",
  },
  trip: {
    table: "trips", columns: "id, slug, image, title_en, title_ar, city_id, price",
    icon: Route, label: { en: "Trips", ar: "الرحلات" }, route: "/trip",
    titleEn: "title_en", titleAr: "title_ar",
  },
  event: {
    table: "events", columns: "id, slug, image, title_en, title_ar, city_id, start_date",
    icon: CalendarDays, label: { en: "Events", ar: "الفعاليات" }, route: "/event",
    titleEn: "title_en", titleAr: "title_ar",
  },
  post: {
    table: "posts", columns: "id, slug, image, title_en, title_ar, category",
    icon: FileText, label: { en: "Articles", ar: "المقالات" }, route: "/post",
    titleEn: "title_en", titleAr: "title_ar",
  },
  audio_tour: {
    table: "audio_tours", columns: "id, slug, image, title_en, title_ar, city_id, duration_minutes",
    icon: Headphones, label: { en: "Audio tours", ar: "الجولات الصوتية" }, route: "/audio-tour",
    titleEn: "title_en", titleAr: "title_ar",
  },
  product: {
    table: "products", columns: "id, slug, image, name_en, name_ar, city_id, price",
    icon: ShoppingBag, label: { en: "Products", ar: "المنتجات" }, route: "/product",
    titleEn: "name_en", titleAr: "name_ar",
  },
  accommodation: {
    table: "accommodations", columns: "id, slug, image, name_en, name_ar, city_id, price_per_night",
    icon: BedDouble, label: { en: "Stays", ar: "أماكن الإقامة" }, route: "/stay",
    titleEn: "name_en", titleAr: "name_ar",
  },
  transport: {
    table: "transport", columns: "id, slug, image, name_en, name_ar, city_id, price",
    icon: Bus, label: { en: "Transport", ar: "المواصلات" }, route: "/transport",
    titleEn: "name_en", titleAr: "name_ar",
  },
  cause: {
    table: "causes", columns: "id, slug, image, title_en, title_ar, city_id, category_en, category_ar",
    icon: HandHeart, label: { en: "Causes", ar: "القضايا" }, route: "/cause",
    titleEn: "title_en", titleAr: "title_ar",
  },
};

const ORDER: WishlistItemType[] = [
  "experience", "trip", "event", "audio_tour", "accommodation",
  "transport", "product", "cause", "post",
];

const Wishlists = () => {
  const { t, lang } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const isAr = lang === "ar";
  const { data: rows = [], isLoading: rowsLoading } = useMyWishlist();
  const { remove } = useWishlist();

  // Group the saved rows by item_type so each table is queried once (no N+1).
  const grouped = useMemo(() => {
    const map = new Map<WishlistItemType, string[]>();
    for (const r of rows) {
      if (!TYPE_CONFIG[r.item_type]) continue;
      const list = map.get(r.item_type) ?? [];
      list.push(r.item_id);
      map.set(r.item_type, list);
    }
    return map;
  }, [rows]);

  const groupKey = useMemo(
    () =>
      ORDER.filter((t) => grouped.has(t))
        .map((t) => `${t}:${(grouped.get(t) ?? []).join(",")}`)
        .join("|"),
    [grouped]
  );

  const { data: items = {}, isLoading: itemsLoading } = useQuery({
    queryKey: ["wishlist-items", groupKey, lang],
    enabled: !!user && grouped.size > 0,
    queryFn: async () => {
      const out: Partial<Record<WishlistItemType, SavedItem[]>> = {};
      // One batched `in` query per item_type.
      await Promise.all(
        [...grouped.entries()].map(async ([type, ids]) => {
          const cfg = TYPE_CONFIG[type];
          const { data, error } = await supabase
            .from(cfg.table as never)
            .select(cfg.columns)
            .in("id", ids);
          if (error) {
            console.error(`wishlist: failed to load ${cfg.table}`, error.message);
            return;
          }
          const byId = new Map<string, Record<string, unknown>>(
            ((data ?? []) as unknown as Record<string, unknown>[]).map((r) => [
              String(r.id),
              r,
            ])
          );
          out[type] = ids
            .map((id) => byId.get(id))
            .filter(Boolean)
            .map((r) => {
              const row = r as Record<string, unknown>;
              const title =
                (isAr ? row[cfg.titleAr] : row[cfg.titleEn]) ||
                row[cfg.titleEn] ||
                "";
              const price = row.price ?? row.price_per_night;
              const subtitle =
                typeof price === "number" && price > 0
                  ? isAr
                    ? `${price} ج.م`
                    : `EGP ${price}`
                  : (row.category_en as string) || (row.category as string) || null;
              return {
                id: String(row.id),
                title: String(title),
                image: (row.image as string) || null,
                subtitle: subtitle ? String(subtitle) : null,
                href: `${cfg.route}/${row.slug || row.id}`,
              } satisfies SavedItem;
            });
        })
      );
      return out;
    },
  });

  const handleRemove = async (type: WishlistItemType, id: string) => {
    try {
      await remove(type, id);
      toast(isAr ? "تمت الإزالة من المفضلة" : "Removed from wishlist");
    } catch {
      toast.error(isAr ? "تعذّر تحديث المفضلة" : "Could not update your wishlist");
    }
  };

  const header = (
    <header className="px-4 py-4 bg-background">
      <h1 className="text-xl font-bold text-primary-dark">{t("nav.wishlists")}</h1>
      {!!user && rows.length > 0 && (
        <p className="text-xs text-muted-foreground mt-0.5">
          {isAr ? `${rows.length} عنصر محفوظ` : `${rows.length} saved item${rows.length === 1 ? "" : "s"}`}
        </p>
      )}
    </header>
  );

  // Signed out — prompt sign-in, never a spinner.
  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-surface pb-20" dir={isAr ? "rtl" : "ltr"}>
        {header}
        <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
          <Heart className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-1">
            {isAr ? "سجّل الدخول لعرض المفضلة" : "Sign in to see your wishlist"}
          </h2>
          <p className="text-sm text-muted-foreground mb-5 max-w-xs">
            {isAr
              ? "احفظ التجارب والرحلات والأماكن التي تحبها وستكون في انتظارك."
              : "Save the experiences, trips and places you love and they will be waiting for you."}
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-xl px-5 py-2.5 text-sm font-semibold"
          >
            <LogIn className="w-4 h-4" />
            {isAr ? "تسجيل الدخول" : "Sign in"}
          </Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  const loading = authLoading || rowsLoading || (grouped.size > 0 && itemsLoading);

  return (
    <div className="min-h-screen bg-surface pb-20" dir={isAr ? "rtl" : "ltr"}>
      {header}

      {loading && (
        <div className="px-4 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {!loading && rows.length === 0 && (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
          <Heart className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-1">
            {isAr ? "مفضلتك فارغة" : "Your wishlist is empty"}
          </h2>
          <p className="text-sm text-muted-foreground mb-5 max-w-xs">
            {isAr
              ? "اضغط على القلب في أي تجربة أو رحلة أو مكان لحفظه هنا."
              : "Tap the heart on any experience, trip or place to save it here."}
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-xl px-5 py-2.5 text-sm font-semibold"
          >
            <Compass className="w-4 h-4" />
            {isAr ? "ابدأ الاستكشاف" : "Start exploring"}
          </Link>
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div className="px-4 pb-4 space-y-6">
          {ORDER.filter((type) => (items[type]?.length ?? 0) > 0).map((type) => {
            const cfg = TYPE_CONFIG[type];
            const Icon = cfg.icon;
            const list = items[type] ?? [];
            return (
              <section key={type}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">
                    {isAr ? cfg.label.ar : cfg.label.en}
                  </h2>
                  <span className="text-xs text-muted-foreground">({list.length})</span>
                </div>
                <div className="space-y-2.5">
                  {list.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 bg-card rounded-xl border border-border p-2.5"
                    >
                      <Link to={item.href} className="shrink-0">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.title}
                          loading="lazy"
                          className="w-16 h-16 rounded-lg object-cover bg-muted"
                        />
                      </Link>
                      <Link to={item.href} className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground line-clamp-2">
                          {item.title}
                        </p>
                        {item.subtitle && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.subtitle}
                          </p>
                        )}
                      </Link>
                      <button
                        onClick={() => handleRemove(type, item.id)}
                        aria-label={isAr ? "إزالة من المفضلة" : "Remove from wishlist"}
                        className="p-2 rounded-full hover:bg-secondary shrink-0"
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Wishlists;
