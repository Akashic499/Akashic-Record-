import { useState } from "react";
import { Link } from "wouter";
import { useListTomes, useListCategories } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Library() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data: tomesData, isLoading } = useListTomes({
    search: search || undefined,
    category: selectedCategory || undefined,
    limit,
    offset: (page - 1) * limit
  }, { query: { queryKey: ["/api/tomes", search, selectedCategory, page, limit] }});

  const { data: categories } = useListCategories();

  return (
    <div className="container mx-auto px-6 py-12 max-w-7xl min-h-screen">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-24">
            <h2 className="text-2xl font-serif text-primary mb-6 border-b border-primary/10 pb-4">Filters</h2>
            
            <div className="relative mb-8">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
              <Input 
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search inscriptions..."
                className="w-full pl-9 bg-card/50 border-primary/20 text-foreground font-serif placeholder:text-muted-foreground focus-visible:ring-primary/30"
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-serif mb-4">Schools of Thought</h3>
              <button
                onClick={() => { setSelectedCategory(""); setPage(1); }}
                className={`w-full text-left px-3 py-2 font-serif text-sm transition-colors border-l-2 ${
                  !selectedCategory ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                All Knowledge
              </button>
              {categories?.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => { setSelectedCategory(cat.name); setPage(1); }}
                  className={`w-full text-left px-3 py-2 font-serif text-sm flex justify-between items-center transition-colors border-l-2 ${
                    selectedCategory === cat.name ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-xs opacity-50">{cat.count}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">The Grand Library</h1>
            <p className="text-muted-foreground font-serif">
              {tomesData ? `${tomesData.total} tomes found in the archive.` : "Consulting the archive..."}
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 border border-primary/10 bg-card/20 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tomesData?.tomes.map((tome, i) => (
                  <motion.div
                    key={tome.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link href={`/tomes/${tome.id}`} className="block h-full border border-primary/10 bg-card/30 hover:bg-card/80 hover:border-primary/30 transition-all p-6 group flex flex-col relative overflow-hidden">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] uppercase tracking-widest text-primary font-serif border border-primary/20 px-2 py-1 bg-primary/5">
                          {tome.category}
                        </span>
                        {tome.featured && (
                          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_5px_rgba(201,168,76,0.8)]" />
                        )}
                      </div>
                      
                      <h3 className="text-xl font-serif text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {tome.title}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground font-serif leading-relaxed line-clamp-3 mb-6 flex-1">
                        {tome.excerpt || "No excerpt..."}
                      </p>
                      
                      <div className="flex justify-between items-center text-xs font-serif border-t border-primary/10 pt-4 mt-auto">
                        <span className="text-muted-foreground/60">{format(new Date(tome.createdAt), "MMM d, yyyy")}</span>
                        <span className="text-primary/70">{tome.viewCount} views</span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {tomesData?.tomes.length === 0 && (
                <div className="text-center py-24 border border-primary/10 bg-card/20">
                  <div className="text-primary text-4xl mb-4 font-serif">✧</div>
                  <h3 className="text-xl font-serif text-foreground mb-2">No records found</h3>
                  <p className="text-muted-foreground font-serif">The archive does not contain knowledge matching these parameters.</p>
                </div>
              )}

              {/* Pagination */}
              {tomesData && tomesData.total > limit && (
                <div className="flex justify-center gap-2 mt-12">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="px-4 py-2 border border-primary/20 text-primary font-serif disabled:opacity-30 hover:bg-primary/10 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page * limit >= tomesData.total}
                    onClick={() => setPage(p => p + 1)}
                    className="px-4 py-2 border border-primary/20 text-primary font-serif disabled:opacity-30 hover:bg-primary/10 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}