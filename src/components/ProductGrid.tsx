import { useI18n } from "@/lib/i18n";
import { useProducts } from "@/hooks/useListings";
import SectionHeader from "./SectionHeader";
import CardCarousel from "./CardCarousel";
import ContentCard from "./ContentCard";
import { Skeleton } from "./ui/skeleton";

const ProductGrid = () => {
  const { lang } = useI18n();
  const { data: products, isLoading } = useProducts();

  return (
    <SectionHeader id="products" titleKey="section.products">
      {isLoading ? (
        <div className="px-4">
          <Skeleton className="aspect-[3/2] w-full rounded-xl" />
        </div>
      ) : (
        <CardCarousel>
          {(products ?? []).slice(0, 6).map((p) => (
            <ContentCard
              key={p.id}
              type="product"
              title={(lang === "ar" ? p.name_ar || p.name_en : p.name_en) || ""}
              image={p.image}
              href={`/product/${p.slug || p.id}`}
              price={p.price}
              wishlist={{ itemType: "product", itemId: p.id }}
            />
          ))}
        </CardCarousel>
      )}
    </SectionHeader>
  );
};

export default ProductGrid;
