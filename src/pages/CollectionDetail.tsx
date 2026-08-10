import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, Layers, MapPin, Scale, User, ChevronRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { fetchByIdOrSlug } from "@/lib/fetchByIdOrSlug";
import NotFoundView from "@/components/NotFound";
import { SEO } from "@/components/SEO";
import {
  fetchCollectionExperts,
  collectionEntries,
  collectionRefs,
  type CollectionExpert,
} from "@/lib/collectionExpert";

const CollectionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["collection", id],
    enabled: !!id,
    retry: false,
    queryFn: async () => {
      const row = await fetchByIdOrSlug("collections", id!);
      if (!row) return { row: null, expert: null as CollectionExpert | null };
      const experts = await fetchCollectionExperts([row.expert_id]);
      return { row, expert: experts[row.expert_id] ?? null };
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="h-48 bg-secondary animate-pulse" />
        <div className="px-4 py-5 space-y-3">
          <div className="h-5 w-2/3 bg-secondary rounded animate-pulse" />
          <div className="h-3 w-full bg-secondary rounded animate-pulse" />
          <div className="h-3 w-5/6 bg-secondary rounded animate-pulse" />
        </div>
      </div>
    );
  }

  const collection = data?.row;
  // RLS already hides other people's drafts; this is a belt-and-braces guard.
  const isOwner = !!user && !!collection && collection.expert_id === user.id;
  if (isError || !collection || (collection.status !== "published" && !isOwner)) {
    return <NotFoundView context="collection" />;
  }

  const expert = data?.expert ?? null;
  const title = (lang === "ar" ? collection.title_ar : collection.title_en) || collection.title_en;
  const abstract =
    (lang === "ar" ? collection.abstract_ar : collection.abstract_en) || collection.abstract_en || "";
  const entries = collectionEntries(collection.entries);
  const refs = collectionRefs(collection.refs);

  return (
    <div className="min-h-screen bg-surface pb-12">
      <SEO
        title={`${title} | Sandal`}
        description={(abstract || title).slice(0, 155)}
        url={`/collection/${collection.slug || collection.id}`}
      />

      {/* Cover */}
      <div className="relative h-48 bg-secondary">
        {collection.cover_image ? (
          <img src={collection.cover_image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 start-4 w-8 h-8 rounded-full bg-black/30 backdrop-blur flex items-center justify-center"
          aria-label={lang === "ar" ? "رجوع" : "Back"}
        >
          <ArrowLeft className="w-4 h-4 text-primary-foreground rtl:rotate-180" />
        </button>
      </div>

      <div className="px-4 -mt-6 relative z-10">
        <div className="bg-card rounded-xl shadow-card p-4">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {collection.discipline && (
              <span className="text-[10px] font-semibold bg-role-subject-expert text-white px-2 py-0.5 rounded-full">
                {collection.discipline}
              </span>
            )}
            {collection.status !== "published" && (
              <span className="text-[10px] font-semibold bg-amber-600 text-white px-2 py-0.5 rounded-full">
                {lang === "ar" ? "مسودة" : "Draft"}
              </span>
            )}
          </div>
          <h1 className="text-lg font-bold text-foreground">{title}</h1>

          {/* Byline */}
          {expert && (
            expert.href ? (
              <button
                onClick={() => navigate(expert.href!)}
                className="mt-2 flex items-center gap-2 text-start"
              >
                {expert.avatar ? (
                  <img src={expert.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <span className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </span>
                )}
                <span className="text-xs font-semibold text-foreground">
                  {lang === "ar" ? expert.nameAr : expert.nameEn}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground rtl:rotate-180" />
              </button>
            ) : (
              <div className="mt-2 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <User className="w-4 h-4 text-muted-foreground" />
                </span>
                <span className="text-xs font-semibold text-foreground">
                  {lang === "ar" ? expert.nameAr : expert.nameEn}
                </span>
              </div>
            )
          )}

          <div className="flex items-center gap-3 mt-3 flex-wrap text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              {entries.length} {lang === "ar" ? "عنصر" : entries.length === 1 ? "entry" : "entries"}
            </span>
            {collection.region_id && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {collection.region_id}
              </span>
            )}
            {collection.license && (
              <span className="flex items-center gap-1">
                <Scale className="w-3.5 h-3.5" />
                {collection.license.toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Abstract */}
      {abstract && (
        <section className="px-4 mt-4">
          <div className="bg-card rounded-xl shadow-card p-4">
            <h2 className="text-sm font-bold text-foreground mb-2">
              {lang === "ar" ? "الملخص" : "Abstract"}
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
              {abstract}
            </p>
          </div>
        </section>
      )}

      {/* Entries — self-contained notes written by the expert, not links to other listings */}
      {entries.length > 0 && (
        <section className="px-4 mt-4">
          <h2 className="text-sm font-bold text-foreground mb-2">
            {lang === "ar" ? "عناصر المجموعة" : "Collection Entries"}
          </h2>
          <ol className="space-y-3">
            {entries.map((e, i) => (
              <li key={i} className="bg-card rounded-xl shadow-card p-4">
                <div className="flex items-start gap-2">
                  <span className="text-[10px] font-bold text-role-subject-expert mt-0.5 shrink-0">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-xs font-semibold text-foreground">{e.title}</h3>
                    {e.summary && (
                      <p className="text-xs text-muted-foreground leading-relaxed mt-1 whitespace-pre-line">
                        {e.summary}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* References */}
      {refs.length > 0 && (
        <section className="px-4 mt-4">
          <div className="bg-card rounded-xl shadow-card p-4">
            <h2 className="text-sm font-bold text-foreground mb-2">
              {lang === "ar" ? "المراجع" : "References"}
            </h2>
            <ul className="space-y-2">
              {refs.map((r, i) => (
                <li key={i} className="text-xs text-muted-foreground leading-relaxed break-words">
                  {/^https?:\/\//i.test(r) ? (
                    <a
                      href={r}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="text-primary underline underline-offset-2"
                    >
                      {r}
                    </a>
                  ) : (
                    r
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <div className="px-4 mt-6">
        <button
          onClick={() => navigate("/collections")}
          className="w-full py-2.5 rounded-xl border-2 border-border bg-card text-sm font-semibold text-foreground"
        >
          {lang === "ar" ? "كل المجموعات" : "All collections"}
        </button>
      </div>
    </div>
  );
};

export default CollectionDetail;
