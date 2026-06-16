import { Link } from "wouter";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-primary/10 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-6 h-6 rounded-full border border-primary/50 flex items-center justify-center group-hover:shadow-[0_0_10px_rgba(201,168,76,0.3)] transition-all">
            <div className="w-2 h-2 bg-primary rounded-full" />
          </div>
          <span className="font-serif text-xl tracking-widest uppercase text-primary font-medium">Akashic</span>
        </Link>
        <div className="flex gap-8 items-center font-serif text-muted-foreground tracking-wide">
          <Link href="/library" className="hover:text-primary transition-colors hover:shadow-[0_0_10px_rgba(201,168,76,0.2)]">Library</Link>
          <Link href="/oracle" className="hover:text-primary transition-colors hover:shadow-[0_0_10px_rgba(201,168,76,0.2)]">Oracle</Link>
        </div>
      </div>
    </nav>
  );
}