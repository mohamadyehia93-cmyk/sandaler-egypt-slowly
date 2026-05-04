import { ArrowLeft, MessageCircle, Search, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useWhosWho } from "@/hooks/useListings";
import { Skeleton } from "@/components/ui/skeleton";

const AllPeople = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const { data: people, isLoading } = useWhosWho();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const list = (people ?? []) as any[];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (p) =>
        (p.name_en || "").toLowerCase().includes(q) ||
        (p.name_ar || "").includes(search) ||
        (p.role_en || "").toLowerCase().includes(q) ||
        (p.role_ar || "").includes(search)
    );
  }, [people, search]);

  return (
    <div className="min-h-screen bg-surface pb-8">
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-secondary">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">
            {lang === "ar" ? "من يكون من" : "Who's Who"}
          </h1>
          <span className="text-xs text-muted-foreground ms-auto">
            {filtered.length} {lang === "ar" ? "شخص" : "people"}
          </span>
        </div>
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === "ar" ? "ابحث بالاسم أو الدور..." : "Search by name or role..."}
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 p-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[220px] rounded-lg" />
            ))
          : filtered.map((person: any) => (
              <div
                key={person.id}
                onClick={() => navigate(`/person/${person.slug || person.id}`)}
                className="rounded-lg shadow-card bg-card p-3 flex flex-col items-center gap-2 cursor-pointer"
              >
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/30">
                  <img
                    src={person.image || "/placeholder.svg"}
                    alt={lang === "ar" ? person.name_ar : person.name_en}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xs font-semibold text-foreground text-center line-clamp-1">
                  {lang === "ar" ? person.name_ar : person.name_en}
                </h3>
                <p className="text-[10px] text-muted-foreground text-center line-clamp-1">
                  {lang === "ar" ? person.role_ar : person.role_en}
                </p>
                <div className="flex flex-wrap justify-center gap-1">
                  {((lang === "ar" ? person.interests_ar : person.interests_en) ?? [])
                    .slice(0, 2)
                    .map((tag: string, i: number) => (
                      <span
                        key={i}
                        className="text-[9px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/inbox");
                  }}
                  className="mt-auto w-full flex items-center justify-center gap-1 text-[10px] font-semibold text-primary-foreground bg-primary rounded-md py-1.5"
                >
                  <MessageCircle className="w-3 h-3" />
                  {lang === "ar" ? "تواصل" : "Contact"}
                </button>
              </div>
            ))}
      </div>

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {lang === "ar" ? "لا توجد نتائج" : "No people found"}
          </p>
        </div>
      )}
    </div>
  );
};

export default AllPeople;
