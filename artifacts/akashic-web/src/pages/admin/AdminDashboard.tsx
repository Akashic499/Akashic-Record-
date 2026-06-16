import { useGetAdminDashboard } from "@workspace/api-client-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const { data: dashboard, isLoading } = useGetAdminDashboard();

  if (isLoading) {
    return <div className="text-primary font-serif animate-pulse">Consulting the records...</div>;
  }

  if (!dashboard) return null;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-serif text-foreground mb-2">Sanctum Overview</h1>
        <p className="text-muted-foreground font-serif">The current state of the archive.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Tomes", value: dashboard.totalTomes },
          { label: "Cosmic Users", value: dashboard.totalUsers },
          { label: "Oracle Queries", value: dashboard.totalOracleQueries },
          { label: "Total Views", value: dashboard.totalViews || 0 },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card/40 border border-primary/20 p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full pointer-events-none" />
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-serif mb-2">{stat.label}</h3>
            <p className="text-4xl font-serif text-primary">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Recent Activity */}
        <div className="space-y-6">
          <h2 className="text-xl font-serif text-foreground border-b border-primary/20 pb-2">Recent Ripples</h2>
          <div className="space-y-4">
            {dashboard.recentActivity?.map((activity, i) => (
              <div key={i} className="flex gap-4 items-start p-4 border border-primary/10 bg-card/20">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-primary/50" />
                <div>
                  <p className="font-serif text-foreground mb-1">{activity.description}</p>
                  <p className="text-xs text-muted-foreground font-serif">
                    {format(new Date(activity.createdAt), "MMM d, HH:mm")} · {activity.type}
                  </p>
                </div>
              </div>
            ))}
            {(!dashboard.recentActivity || dashboard.recentActivity.length === 0) && (
              <p className="text-muted-foreground font-serif italic p-4">The cosmic sea is still.</p>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-6">
          <h2 className="text-xl font-serif text-foreground border-b border-primary/20 pb-2">Schools of Thought</h2>
          <div className="space-y-3">
            {dashboard.categoryBreakdown?.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between p-3 border border-primary/5 bg-card/10">
                <span className="font-serif text-muted-foreground">{cat.name}</span>
                <span className="font-serif text-primary border border-primary/20 px-2 py-0.5 text-sm bg-primary/5">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}