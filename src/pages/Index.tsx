import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Zap, BookOpen, Calendar, Shield, MessageSquare, ArrowRight, BarChart3, QrCode,
  Bell, CheckCircle, Users, Sparkles,
} from "lucide-react";

const features = [
  { icon: BookOpen, title: "Resource Catalog", desc: "Browse and discover labs, projectors, seminar halls, sports equipment & study rooms with rich filtering." },
  { icon: Calendar, title: "Smart Booking", desc: "Book resources with intelligent time-slot selection and real-time availability checking." },
  { icon: Shield, title: "Approval Workflow", desc: "Multi-level admin approval system with notes, notifications, and audit trails." },
  { icon: BarChart3, title: "Analytics Dashboard", desc: "Visual insights into resource utilization, booking trends, and campus activity metrics." },
  { icon: QrCode, title: "QR Check-in", desc: "Scan QR codes to verify bookings and track actual resource usage in real-time." },
  { icon: Bell, title: "Real-time Notifications", desc: "Instant alerts for booking approvals, rejections, and complaint updates." },
];

const roles = [
  { name: "Student", desc: "Book resources, track bookings, file complaints", color: "from-primary to-primary-glow" },
  { name: "Faculty", desc: "Priority booking, department-level access", color: "from-secondary to-purple-500" },
  { name: "Admin", desc: "Manage approvals, complaints, analytics", color: "from-accent to-orange-500" },
  { name: "Super Admin", desc: "Full system control and user management", color: "from-destructive to-rose-500" },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-xl border-b">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-heading font-extrabold text-xl tracking-tight">CampusFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate("/auth")} className="font-medium">Sign In</Button>
            <Button onClick={() => navigate("/auth")} className="gradient-bg border-0 font-semibold shadow-lg hover:shadow-xl transition-shadow">
              Get Started <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 border border-primary/20">
              <Sparkles className="w-4 h-4" />
              Smart Campus Resource Management
            </div>
            <h1 className="text-5xl md:text-7xl font-heading font-black text-foreground leading-[1.05] tracking-tight">
              Manage Campus
              <br />
              Resources with
              <br />
              <span className="gradient-text">CampusFlow</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mt-6 max-w-2xl mx-auto leading-relaxed">
              A production-ready SaaS platform for colleges to manage resource bookings, approvals, analytics, and complaints — all in one beautiful dashboard.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3 justify-center mt-10"
          >
            <Button size="lg" onClick={() => navigate("/auth")} className="gradient-bg border-0 text-base font-semibold h-12 px-8 shadow-lg hover:shadow-xl transition-all">
              Start Free <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth")} className="text-base h-12 px-8 font-medium">
              View Demo
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-3 gap-8 mt-16 max-w-lg mx-auto"
          >
            {[
              { value: "10K+", label: "Bookings" },
              { value: "50+", label: "Campuses" },
              { value: "99.9%", label: "Uptime" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl md:text-3xl font-heading font-extrabold gradient-text">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold">Everything you need</h2>
            <p className="text-muted-foreground mt-3 text-lg">Powerful features built for modern campus management</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card-hover p-6 group"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-lg">{f.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-extrabold mb-4">Role-Based Access</h2>
          <p className="text-muted-foreground text-lg mb-12">Four distinct roles with granular permissions</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {roles.map((r, i) => (
              <motion.div
                key={r.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-5 text-center"
              >
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${r.color} mx-auto mb-3 flex items-center justify-center`}>
                  <Users className="w-5 h-5 text-primary-foreground" />
                </div>
                <h4 className="font-heading font-bold text-sm">{r.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">{r.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 mesh-gradient" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative max-w-2xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-5xl font-heading font-extrabold mb-4">Ready to modernize your campus?</h2>
          <p className="text-muted-foreground text-lg mb-8">Join colleges already using CampusFlow to streamline operations.</p>
          <Button size="lg" onClick={() => navigate("/auth")} className="gradient-bg border-0 text-base font-semibold h-12 px-10 shadow-lg">
            Get Started Now <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="font-heading font-bold">CampusFlow</span>
        </div>
        © {new Date().getFullYear()} CampusFlow — Smart Campus Resource Management System
      </footer>
    </div>
  );
};

export default Index;
