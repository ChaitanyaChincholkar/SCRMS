import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, MessageSquare, CheckCircle, Clock, XCircle, TrendingUp, Zap } from "lucide-react";
import { motion } from "framer-motion";

const Dashboard = () => {
  const { user, role, isAdmin } = useAuth();

  const { data: bookings } = useQuery({
    queryKey: ["bookings", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("bookings").select("*, resources(name, type)");
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: complaints } = useQuery({
    queryKey: ["complaints", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("complaints").select("*");
      return data ?? [];
    },
    enabled: !!user,
  });

  const pending = bookings?.filter((b) => b.status === "pending").length ?? 0;
  const approved = bookings?.filter((b) => b.status === "approved").length ?? 0;
  const openComplaints = complaints?.filter((c) => c.status === "open").length ?? 0;

  const stats = [
    { label: "Total Bookings", value: bookings?.length ?? 0, icon: Calendar, gradient: "from-primary to-primary-glow", bgColor: "bg-primary/8" },
    { label: "Pending", value: pending, icon: Clock, gradient: "from-warning to-orange-500", bgColor: "bg-warning/8" },
    { label: "Approved", value: approved, icon: CheckCircle, gradient: "from-success to-emerald-500", bgColor: "bg-success/8" },
    { label: "Open Complaints", value: openComplaints, icon: MessageSquare, gradient: "from-destructive to-rose-500", bgColor: "bg-destructive/8" },
  ];

  const statusColor: Record<string, string> = {
    pending: "bg-warning/10 text-warning border-warning/20",
    approved: "bg-success/10 text-success border-success/20",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
    cancelled: "bg-muted text-muted-foreground border-border",
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-extrabold text-foreground tracking-tight">
              {isAdmin ? "Admin Dashboard" : "Dashboard"}
            </h1>
            <p className="text-sm text-muted-foreground">Welcome back! Here's your campus activity overview.</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <Card className="stat-card glass-card-hover">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                    <p className="text-3xl font-heading font-extrabold mt-2 animate-count-up">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 bg-gradient-to-br ${stat.gradient} bg-clip-text`} style={{ color: 'hsl(var(--primary))' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
      >
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <CardTitle className="font-heading text-lg">Recent Bookings</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {bookings && bookings.length > 0 ? (
              <div className="space-y-2">
                {bookings.slice(0, 5).map((booking, i) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{(booking as any).resources?.name}</p>
                        <p className="text-xs text-muted-foreground">{booking.booking_date} · {booking.start_time} - {booking.end_time}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-[11px] ${statusColor[booking.status]}`}>
                      {booking.status}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No bookings yet. Start by browsing resources!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;
