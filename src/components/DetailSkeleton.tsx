import { Skeleton } from "@/components/ui/skeleton";

const Row = ({ width = "w-[220px]", height = "h-32", count = 4 }: { width?: string; height?: string; count?: number }) => (
  <div className="flex gap-3 px-4 overflow-hidden">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={`shrink-0 ${width} rounded-xl overflow-hidden bg-card shadow-card`}>
        <Skeleton className={`${height} w-full rounded-none`} />
        <div className="p-3 space-y-2">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

const SectionSkeleton = ({ title = true }: { title?: boolean }) => (
  <div className="space-y-3">
    {title && (
      <div className="px-4 flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-12" />
      </div>
    )}
    <Row />
  </div>
);

export const DetailSkeleton = ({ variant }: { variant: "region" | "city" }) => {
  return (
    <div className="min-h-screen bg-surface pb-20" aria-busy="true" aria-live="polite">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 bg-background sticky top-0 z-40">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-5 w-40" />
      </header>

      {/* Hero */}
      <Skeleton className="mx-4 mt-2 mb-3 h-36 rounded-xl" />

      {/* Filter / sub-bar */}
      <div className="px-4 mb-4">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>

      {/* About */}
      <div className="px-4 mb-4 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/6" />
      </div>

      {/* Map */}
      <div className="px-4 mb-6 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>

      {/* Sections */}
      <div className="space-y-6">
        <SectionSkeleton />
        <SectionSkeleton />
        {variant === "city" && <SectionSkeleton />}
        <SectionSkeleton />
      </div>
    </div>
  );
};

export default DetailSkeleton;
