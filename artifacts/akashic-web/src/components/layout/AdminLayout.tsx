import { Link, useLocation } from "wouter";
import { Book, MessageSquare, Users, LogOut, LayoutDashboard } from "lucide-react";
import { useAdminLogout } from "@workspace/api-client-react";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const logout = useAdminLogout();

  const handleLogout = () => {
    logout.mutate({}, {
      onSettled: () => {
        localStorage.removeItem("akashic_admin_token");
        setLocation("/admin");
      }
    });
  };

  const navItems = [
    { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/tomes", label: "Tomes", icon: Book },
    { href: "/admin/oracle-logs", label: "Oracle Logs", icon: MessageSquare },
    { href: "/admin/users", label: "Users", icon: Users },
  ];

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 border-r border-primary/20 bg-card/30 flex-shrink-0 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-primary/20">
          <Link href="/" className="font-serif text-lg text-primary tracking-widest uppercase">
            Akashic Admin
          </Link>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-sm font-serif text-sm transition-colors ${
                  active 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "text-muted-foreground hover:bg-card hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="uppercase tracking-widest">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-primary/20">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-muted-foreground hover:text-destructive transition-colors font-serif text-sm rounded-sm hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4" />
            <span className="uppercase tracking-widest">Depart</span>
          </button>
        </div>
      </aside>

      {/* Admin Main */}
      <main className="flex-1 flex flex-col min-w-0 bg-background/50">
        <div className="flex-1 p-6 md:p-10 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}