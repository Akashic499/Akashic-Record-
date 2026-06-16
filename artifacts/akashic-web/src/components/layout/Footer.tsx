import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="w-full border-t border-primary/10 bg-background mt-20 py-12">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border border-primary/30 flex items-center justify-center">
            <div className="w-1 h-1 bg-primary/50 rounded-full" />
          </div>
          <span className="font-serif text-sm tracking-widest uppercase text-muted-foreground">The Akashic Record</span>
        </div>
        
        <div className="flex gap-6 text-sm text-muted-foreground/60 font-serif">
          <span>&copy; {new Date().getFullYear()}</span>
          <span className="text-primary/20">|</span>
          <Link href="/admin" className="hover:text-primary transition-colors">Sanctum</Link>
        </div>
      </div>
    </footer>
  );
}