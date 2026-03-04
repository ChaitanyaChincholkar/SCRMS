import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Resources from "./pages/Resources";
import MyBookings from "./pages/MyBookings";
import Complaints from "./pages/Complaints";
import AdminApprovals from "./pages/AdminApprovals";
import AdminComplaints from "./pages/AdminComplaints";
import Analytics from "./pages/Analytics";
import CheckIn from "./pages/CheckIn";
import UserManagement from "./pages/UserManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/resources" element={<ProtectedRoute><AppLayout><Resources /></AppLayout></ProtectedRoute>} />
            <Route path="/bookings" element={<ProtectedRoute><AppLayout><MyBookings /></AppLayout></ProtectedRoute>} />
            <Route path="/complaints" element={<ProtectedRoute><AppLayout><Complaints /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/approvals" element={<ProtectedRoute><AppLayout><AdminApprovals /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/complaints" element={<ProtectedRoute><AppLayout><AdminComplaints /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute><AppLayout><Analytics /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/checkin" element={<ProtectedRoute><AppLayout><CheckIn /></AppLayout></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute><AppLayout><UserManagement /></AppLayout></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
