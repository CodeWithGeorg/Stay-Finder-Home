import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { RegionProvider } from "@/contexts/RegionContext";
import { AIChatWidget } from "@/components/chat/AIChatWidget";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Apartments from "./pages/Apartments";
import ApartmentDetail from "./pages/ApartmentDetail";
import Bookings from "./pages/Bookings";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminApartments from "./pages/admin/AdminApartments";
import AdminBookings from "./pages/admin/AdminBookings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <RegionProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/apartments" element={<Apartments />} />
              <Route path="/apartments/:id" element={<ApartmentDetail />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<AdminDashboard />}>
                <Route path="apartments" element={<AdminApartments />} />
                <Route path="bookings" element={<AdminBookings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
            <AIChatWidget />
          </BrowserRouter>
        </TooltipProvider>
      </RegionProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
