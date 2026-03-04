import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, PieChart as PieIcon, Activity } from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area,
} from "recharts";

const CHART_COLORS = [
  "hsl(221, 83%, 53%)",
  "hsl(262, 83%, 58%)",
  "hsl(142, 71%, 45%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 84%, 60%)",
  "hsl(199, 89%, 48%)",
];

const Analytics = () => {
  const { data: bookings } = useQuery({
    queryKey: ["analytics-bookings"],
    queryFn: async () => {
      const { data } = await supabase.from("bookings").select("*, resources(name, type)");
      return data ?? [];
    },
  });

  const { data: complaints } = useQuery({
    queryKey: ["analytics-complaints"],
    queryFn: async () => {
      const { data } = await supabase.from("complaints").select("*");
      return data ?? [];
    },
  });

  const { data: resources } = useQuery({
    queryKey: ["analytics-resources"],
    queryFn: async () => {
      const { data } = await supabase.from("resources").select("*");
      return data ?? [];
    },
  });

  // Status distribution
  const statusData = ["pending", "approved", "rejected", "cancelled"].map((status) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: bookings?.filter((b) => b.status === status).length ?? 0,
  }));

  // Resource type distribution
  const typeLabels: Record<string, string> = {
    lab: "Lab", projector: "Projector", seminar_hall: "Seminar Hall",
    sports_equipment: "Sports", study_room: "Study Room",
  };
  const resourceTypeData = Object.entries(typeLabels).map(([key, label]) => ({
    name: label,
    bookings: bookings?.filter((b) => (b as any).resources?.type === key).length ?? 0,
    available: resources?.filter((r) => r.type === key).length ?? 0,
  }));

  // Weekly trend (last 7 days)
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split("T")[0];
    const dayLabel = date.toLocaleDateString("en", { weekday: "short" });
    return {
      day: dayLabel,
      bookings: bookings?.filter((b) => b.booking_date === dateStr).length ?? 0,
      complaints: complaints?.filter((c) => c.created_at.startsWith(dateStr)).length ?? 0,
    };
  });

  // Complaint status
  const complaintStatusData = ["open", "in_progress", "resolved", "closed"].map((s) => ({
    name: s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    value: complaints?.filter((c) => c.status === s).length ?? 0,
  }));

  const totalBookings = bookings?.length ?? 0;
  const approvalRate = totalBookings > 0
    ? Math.round((bookings?.filter((b) => b.status === "approved").length ?? 0) / totalBookings * 100)
    : 0;
  const checkedIn = bookings?.filter((b: any) => b.checked_in).length ?? 0;

  const summaryStats = [
    { label: "Total Bookings", value: totalBookings, icon: BarChart3, color: "text-primary" },
    { label: "Approval Rate", value: `${approvalRate}%`, icon: TrendingUp, color: "text-success" },
    { label: "Checked In", value: checkedIn, icon: Activity, color: "text-secondary" },
    { label: "Total Complaints", value: complaints?.length ?? 0, icon: PieIcon, color: "text-warning" },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-heading font-extrabold tracking-tight">Analytics Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Insights into campus resource usage and trends</p>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-3">
                <s.icon className={`w-8 h-8 ${s.color} opacity-70`} />
                <div>
                  <p className="text-2xl font-heading font-extrabold">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-heading font-bold">Weekly Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="bookings" stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} fillOpacity={0.15} strokeWidth={2} name="Bookings" />
                  <Area type="monotone" dataKey="complaints" stroke={CHART_COLORS[3]} fill={CHART_COLORS[3]} fillOpacity={0.1} strokeWidth={2} name="Complaints" />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Booking Status Pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-heading font-bold">Booking Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} style={{ fontSize: 11 }}>
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Resource Type Bookings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-heading font-bold">Bookings by Resource Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={resourceTypeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="bookings" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} name="Bookings" />
                  <Bar dataKey="available" fill={CHART_COLORS[2]} radius={[4, 4, 0, 0]} name="Resources" />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Complaint Status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-heading font-bold">Complaint Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={complaintStatusData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={80} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="value" fill={CHART_COLORS[1]} radius={[0, 4, 4, 0]} name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
