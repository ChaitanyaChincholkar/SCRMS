import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import NotificationBell from "@/components/NotificationBell";
import {
  LayoutDashboard, BookOpen, Calendar, MessageSquare, Shield, LogOut, Zap, Menu, X,
  BarChart3, QrCode, Users,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/resources", label: "Resources", icon: BookOpen },
  { to: "/bookings", label: "My Bookings", icon: Calendar },
  { to: "/complaints", label: "Complaints", icon: MessageSquare },
];

const adminItems = [
  { to: "/admin/approvals", label: "Approvals", icon: Shield },
  { to: "/admin/complaints", label: "Manage Complaints", icon: MessageSquare },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/checkin", label: "QR Check-in", icon: QrCode },
];

const superAdminItems = [
  { to: "/admin/users", label: "User Management", icon: Users },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, role, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  let allItems = [...navItems];
  if (isAdmin) allItems = [...allItems, ...adminItems];
  if (role === "super_admin") allItems = [...allItems, ...superAdminItems];

  const roleLabel: Record<string, string> = {
    student: "Student",
    faculty: "Faculty",
    admin: "Admin",
    super_admin: "Super Admin",
  };

  const roleBadgeColor: Record<string, string> = {
    student: "bg-primary/10 text-primary",
    faculty: "bg-secondary/10 text-secondary",
    admin: "bg-accent/10 text-accent",
    super_admin: "bg-destructive/10 text-destructive",
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-heading font-bold text-lg">CampusFlow</span>
        </div>
        <div className="flex items-center gap-1">
          <NotificationBell />
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(mobileOpen || true) && (
          <aside className={`${mobileOpen ? "block" : "hidden"} lg:block w-full lg:w-[260px] bg-sidebar flex-shrink-0 lg:sticky lg:top-0 lg:h-screen overflow-y-auto z-40`}>
            <div className="hidden lg:flex items-center gap-3 px-5 py-6">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-sidebar-foreground text-[15px] tracking-tight">CampusFlow</h2>
                <p className="text-[11px] text-sidebar-foreground/50 font-medium">Smart Resource Manager</p>
              </div>
            </div>

            <nav className="px-3 py-2 space-y-0.5">
              <p className="px-3 py-2 text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-wider">Menu</p>
              {navItems.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                      active
                        ? "bg-sidebar-primary/15 text-sidebar-primary shadow-sm"
                        : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                    }`}
                  >
                    <item.icon className={`w-[18px] h-[18px] ${active ? "text-sidebar-primary" : ""}`} />
                    {item.label}
                    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary" />}
                  </Link>
                );
              })}

              {isAdmin && (
                <>
                  <p className="px-3 pt-4 pb-2 text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-wider">Administration</p>
                  {adminItems.map((item) => {
                    const active = location.pathname === item.to;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                          active
                            ? "bg-sidebar-primary/15 text-sidebar-primary shadow-sm"
                            : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                        }`}
                      >
                        <item.icon className={`w-[18px] h-[18px] ${active ? "text-sidebar-primary" : ""}`} />
                        {item.label}
                        {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary" />}
                      </Link>
                    );
                  })}
                </>
              )}

              {role === "super_admin" && (
                <>
                  <p className="px-3 pt-4 pb-2 text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-wider">Super Admin</p>
                  {superAdminItems.map((item) => {
                    const active = location.pathname === item.to;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                          active
                            ? "bg-sidebar-primary/15 text-sidebar-primary shadow-sm"
                            : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                        }`}
                      >
                        <item.icon className={`w-[18px] h-[18px] ${active ? "text-sidebar-primary" : ""}`} />
                        {item.label}
                        {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary" />}
                      </Link>
                    );
                  })}
                </>
              )}
            </nav>

            <div className="px-3 py-4 mt-auto border-t border-sidebar-border mx-3">
              <div className="flex items-center gap-3 px-2 py-2 mb-2">
                <div className="w-9 h-9 rounded-full gradient-bg flex items-center justify-center text-xs font-bold text-primary-foreground">
                  {user?.email?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-sidebar-foreground truncate">{user?.user_metadata?.full_name || user?.email}</p>
                  <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full mt-0.5 ${roleBadgeColor[role || "student"]}`}>
                    {roleLabel[role || "student"]}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sidebar-foreground/50 hover:text-sidebar-foreground text-[13px]"
                onClick={signOut}
              >
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </Button>
            </div>
          </aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="hidden lg:flex items-center justify-end gap-2 px-8 py-4 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-30">
          <NotificationBell />
        </div>
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
