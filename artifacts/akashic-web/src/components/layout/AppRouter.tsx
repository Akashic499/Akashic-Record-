import { Switch, Route } from "wouter";
import { StarField } from "@/components/ui/StarField";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AdminLayout } from "@/components/layout/AdminLayout";

import Home from "@/pages/Home";
import Library from "@/pages/Library";
import TomeView from "@/pages/TomeView";
import Oracle from "@/pages/Oracle";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminTomes from "@/pages/admin/AdminTomes";
import AdminOracleLogs from "@/pages/admin/AdminOracleLogs";
import AdminUsers from "@/pages/admin/AdminUsers";
import NotFound from "@/pages/not-found";

export function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/library" component={Library} />
      <Route path="/tomes/:id" component={TomeView} />
      <Route path="/oracle" component={Oracle} />
      
      <Route path="/admin" component={AdminLogin} />
      
      {/* Protected Admin Routes */}
      <Route path="/admin/:rest*">
        <AdminLayout>
          <Switch>
            <Route path="/admin/dashboard" component={AdminDashboard} />
            <Route path="/admin/tomes" component={AdminTomes} />
            <Route path="/admin/oracle-logs" component={AdminOracleLogs} />
            <Route path="/admin/users" component={AdminUsers} />
            <Route component={NotFound} />
          </Switch>
        </AdminLayout>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  // Check if we are in admin to hide navbar/footer
  const isAdmin = window.location.pathname.startsWith("/admin");
  
  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <StarField />
      <div className="flex flex-col min-h-screen relative z-10">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}