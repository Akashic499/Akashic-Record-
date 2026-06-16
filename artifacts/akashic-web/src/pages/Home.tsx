import { Link } from "wouter";
import { useListFeaturedTomes, useListRecentTomes, useGetTomeStats } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function Home() {
  const { data: featuredTomes } = useListFeaturedTomes();
  const { data: recentTomes } = useListRecentTomes({ limit: 4 });
  const { data: stats } = useGetTomeStats();

  return (
    <div className="w-full min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center pt-20 pb-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.05)_0%,transparent_70%)]" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="relative z-10 max-w-4xl mx-auto text-center"
        >
          <div className="mb-6 inline-block px-4 py-1.5 border border-primary/20 rounded-full bg-primary/5 backdrop-blur-sm">
            <span className="text-xs font-serif tracking-widest text-primary/80 uppercase">The Eternal Archive</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-serif text-foreground mb-8 leading-tight drop-shadow-[0_0_25px_rgba(201,168,76,0.15)]">
            Where <i className="text-primary">Knowledge</i><br/> Becomes Eternal
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground font-serif max-w-2xl mx-auto mb-12 leading-relaxed">
            A cosmic repository of wisdom, philosophy, and magical truths inscribed upon the very fabric of the universe.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link 
              href="/library" 
              className="px-8 py-4 bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 hover:shadow-[0_0_20px_rgba(201,168,76,0.2)] transition-all duration-500 font-serif text-lg tracking-wider"
            >
              Explore the Archive
            </Link>
            <Link 
              href="/oracle" 
              className="px-8 py-4 border border-primary/10 text-foreground hover:border-primary/40 hover:text-primary transition-all duration-500 font-serif text-lg tracking-wider"
            >
              Consult the Oracle
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats Divider */}
      <section className="border-y border-primary/10 bg-background/50 backdrop-blur-sm relative z-10 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-primary/10">
            {[
              { label: "Inscribed Tomes", value: stats?.totalTomes || "—" },
              { label: "Schools of Thought", value: stats?.totalCategories || "—" },
              { label: "Cosmic Seekers", value: stats?.totalViews || "—" },
              { label: "Recent Additions", value: stats?.recentCount || "—" }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.8 }}
                className="text-center px-4"
              >
                <div className="text-4xl md:text-5xl font-serif text-primary mb-2 drop-shadow-[0_0_10px_rgba(201,168,76,0.3)]">{stat.value}</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground font-serif">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tomes */}
      {featuredTomes && featuredTomes.length > 0 && (
        <section className="py-24 relative z-10">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="flex items-end justify-between mb-12 border-b border-primary/10 pb-4">
              <h2 className="text-3xl md:text-4xl font-serif text-foreground">Featured Inscriptions</h2>
              <Link href="/library" className="text-sm font-serif text-primary hover:text-primary/70 transition-colors uppercase tracking-widest">View All</Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featuredTomes.slice(0, 2).map((tome, i) => (
                <motion.div
                  key={tome.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2, duration: 0.8 }}
                >
                  <Link href={`/tomes/${tome.id}`} className="block h-full border border-primary/10 bg-card/40 hover:bg-card hover:border-primary/30 transition-all duration-500 p-8 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full translate-x-16 -translate-y-16 group-hover:bg-primary/10 transition-colors duration-700" />
                    
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-xs uppercase tracking-widest text-primary font-serif border border-primary/20 px-2 py-1 bg-primary/5">
                        {tome.category}
                      </span>
                      <span className="text-xs text-muted-foreground font-serif">
                        {format(new Date(tome.createdAt), "MMMM d, yyyy")}
                      </span>
                    </div>
                    
                    <h3 className="text-2xl font-serif text-foreground mb-4 group-hover:text-primary transition-colors duration-300 line-clamp-2">
                      {tome.title}
                    </h3>
                    
                    <p className="text-muted-foreground/80 font-serif leading-relaxed line-clamp-3 mb-8">
                      {tome.excerpt || "No excerpt available..."}
                    </p>
                    
                    <div className="mt-auto flex items-center text-sm font-serif text-primary/70 group-hover:text-primary transition-colors">
                      <span className="tracking-widest uppercase">Read Tome</span>
                      <span className="ml-2 transform group-hover:translate-x-2 transition-transform">→</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Oracle Teaser */}
      <section className="py-24 relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="absolute inset-y-0 left-0 w-full bg-[linear-gradient(to_right,rgba(10,10,26,1)_0%,transparent_50%,rgba(10,10,26,1)_100%)]" />
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="max-w-3xl mx-auto text-center border border-primary/20 bg-background/80 backdrop-blur-md p-12 md:p-16 shadow-[0_0_30px_rgba(201,168,76,0.05)]"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-full border border-primary/30 flex items-center justify-center">
              <div className="w-4 h-4 bg-primary rounded-full shadow-[0_0_15px_rgba(201,168,76,0.8)] animate-pulse" />
            </div>
            
            <h2 className="text-3xl md:text-5xl font-serif text-foreground mb-6">Seek the Oracle</h2>
            <p className="text-lg text-muted-foreground font-serif mb-8 max-w-xl mx-auto">
              Not all questions are answered in books. The Oracle communes directly with the cosmic fabric, offering wisdom to those who ask.
            </p>
            
            <Link 
              href="/oracle" 
              className="inline-block px-8 py-3 bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 hover:shadow-[0_0_20px_rgba(201,168,76,0.2)] transition-all duration-300 font-serif tracking-wider"
            >
              Ask a Question
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}