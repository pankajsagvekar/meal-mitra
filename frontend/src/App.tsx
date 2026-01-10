import AdminLayout from "@/components/layout/AdminLayout";
import MainLayout from "@/components/layout/MainLayout";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminDonationDetail from "@/pages/admin/AdminDonationDetail";
import AdminDonations from "@/pages/admin/AdminDonations";
import AdminUsers from "@/pages/admin/AdminUsers";
import ForgotPassword from "@/pages/ForgotPassword";
import Home from "@/pages/Home";
import Impact from "@/pages/Impact";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ResetPassword from "@/pages/ResetPassword";
import Donate from "@/pages/user/Donate";
import MyDonation from "@/pages/user/MyDonation";
import UserDashboard from "@/pages/user/UserDashboard";
import UserProfile from "@/pages/user/UserProfile";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes with No Sidebar */}
          <Route path="/" element={<Home />} />
          {/* <Route path="/login" element={<Login />} /> */}
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected/Main Layout Routes */}
          <Route element={<MainLayout />}>
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/impact" element={<Impact />} />
            <Route path="/my-donations" element={<MyDonation />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminLayout />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin/donations" element={<AdminDonations />} />
            <Route path="/admin/donations/:donationId" element={<AdminDonationDetail />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
