import { useRoute } from "wouter";
import { useGetTome } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ExternalLink, Eye, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function TomeView() {
  const [, params] = useRoute("/tomes/:id");
  const id = params?.id ? parseInt(params.id, 10) : 0;
  
  const { data: tome, isLoading } = useGetTome(id, { 
    query: { enabled: !!id, queryKey: ["/api/tomes", id] }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-24 max-w-4xl min-h-screen">
        <div className="h-8 w-32 bg-card/50 animate-pulse mb-8" />
        <div className="h-16 w-3/4 bg-card/50 animate-pulse mb-6" />
        <div className="h-4 w-1/4 bg-card/50 animate-pulse mb-16" />
        <div className="space-y-4">
          <div className="h-4 bg-card/50 animate-pulse" />
          <div className="h-4 bg-card/50 animate-pulse" />
          <div className="h-4 w-5/6 bg-card/50 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!tome) {
    return (
      <div className="container mx-auto px-6 py-24 text-center min-h-screen">
        <h1 className="text-3xl font-serif text-primary">Tome Not Found</h1>
        <p className="text-muted-foreground mt-4 font-serif">This knowledge has been lost to the cosmos.</p>
        <Link href="/library" className="inline-block mt-8 text-primary hover:underline font-serif tracking-widest uppercase text-sm">
          Return to Library
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl min-h-screen">
      <Link href="/library" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-serif tracking-widest uppercase text-sm mb-12">
        <ArrowLeft className="w-4 h-4" />
        <span>Return</span>
      </Link>

      <motion.article 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-card/20 border border-primary/10 p-8 md:p-16 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-[100%] pointer-events-none" />
        
        <header className="mb-16 relative z-10">
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <span className="text-xs uppercase tracking-widest text-primary font-serif border border-primary/20 px-3 py-1.5 bg-primary/5">
              {tome.category}
            </span>
            <span className="text-sm text-muted-foreground font-serif">
              Inscribed {format(new Date(tome.createdAt), "MMMM do, yyyy")}
            </span>
            <div className="flex items-center gap-1 text-sm text-muted-foreground/60 font-serif ml-auto">
              <Eye className="w-4 h-4" />
              <span>{tome.viewCount} views</span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-serif text-foreground leading-tight mb-8 drop-shadow-[0_0_15px_rgba(201,168,76,0.1)]">
            {tome.title}
          </h1>
          
          {tome.excerpt && (
            <p className="text-xl md:text-2xl text-muted-foreground font-serif leading-relaxed italic border-l-2 border-primary/30 pl-6 py-2">
              {tome.excerpt}
            </p>
          )}
        </header>

        <div className="prose prose-invert prose-headings:font-serif prose-headings:text-primary prose-headings:font-normal prose-p:font-serif prose-p:leading-loose prose-p:text-muted-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-strong:text-foreground prose-strong:font-normal max-w-none relative z-10 mb-16" 
          dangerouslySetInnerHTML={{ __html: tome.content }}
        />

        <footer className="border-t border-primary/10 pt-8 relative z-10 flex flex-wrap justify-between items-center gap-6">
          <div className="flex flex-wrap gap-2">
            {tome.tags?.map(tag => (
              <span key={tag} className="text-xs text-muted-foreground font-serif bg-card/50 border border-primary/5 px-2 py-1">
                #{tag}
              </span>
            ))}
          </div>
          
          {tome.sourceUrl && (
            <a 
              href={tome.sourceUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/70 font-serif tracking-wider transition-colors"
            >
              <span>Original Source</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </footer>
      </motion.article>
    </div>
  );
}