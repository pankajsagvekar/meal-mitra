import AdminLayout from "@/components/layout/AdminLayout";
import MainLayout from "@/components/layout/MainLayout";
import NgoLayout from "@/components/layout/NgoLayout";
import PublicLayout from "@/components/layout/PublicLayout";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminDeleteDonations from "@/pages/admin/AdminDeleteDonations";
import AdminDonationDetail from "@/pages/admin/AdminDonationDetail";
import AdminDonations from "@/pages/admin/AdminDonations";
import AdminUsers from "@/pages/admin/AdminUsers";
import VerifyNgo from "@/pages/admin/VerifyNgo";
import VerifyOrganization from "@/pages/admin/VerifyOrganization";
import ForgotPassword from "@/pages/ForgotPassword";
import Home from "@/pages/Home";
import Impact from "@/pages/Impact";
import Register from "@/pages/Register";
import ResetPassword from "@/pages/ResetPassword";
import Donate from "@/pages/user/Donate";
import MyDonation from "@/pages/user/MyDonation";
import UserDashboard from "@/pages/user/UserDashboard";
import UserProfile from "@/pages/user/UserProfile";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import OrgLayout from "./components/layout/OrgLayout";
import AdminProfile from "./pages/admin/AdminProfile";
import NgoDashboard from "./pages/ngo/NgoDashboard";
import NgoLogin from "./pages/ngo/NgoLogin";
import NgoProfile from "./pages/ngo/NgoProfile";
import NgoRegister from "./pages/ngo/NgoRegister";
import NotFound from "./pages/NotFound";
import OrgDashboard from "./pages/organisation/OrgDashboard";
import OrgRegister from "./pages/organisation/OrgRegister";
import About from "./pages/other/About";
import HelpSupport from "./pages/other/HelpSupport";
import HowItWorks from "./pages/other/HowItWorks";
import ClaimFood from "./pages/user/ClaimFood";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes with Navbar and Footer */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/about" element={<About />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/impact" element={<Impact />} />
            <Route path="/help-support" element={<HelpSupport />} />
            <Route path="/claim-food" element={<ClaimFood />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* NGO Auth Routes (Stand-alone pages) */}
          <Route path="/ngo/login" element={<NgoLogin />} />
          <Route path="/ngo/register" element={<NgoRegister />} />
          <Route path="/organisation/register" element={<OrgRegister />} />

          {/* Protected/Main Layout Routes */}
          <Route element={<MainLayout />}>
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/my-donations" element={<MyDonation />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminLayout />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin-profile" element={<AdminProfile />} />
            <Route path="/admin/donations" element={<AdminDonations />} />
            <Route path="/admin/donations/:donationId" element={<AdminDonationDetail />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/verify-ngo" element={<VerifyNgo />} />
            <Route path="/admin/verify-org" element={<VerifyOrganization />} />
            <Route path="/admin/delete-donations" element={<AdminDeleteDonations />} />
          </Route>

          {/* NGO Routes */}
          <Route element={<NgoLayout />}>
            <Route path="/ngo/dashboard" element={<NgoDashboard />} />
            <Route path="/ngo/profile" element={<NgoProfile />} />
          </Route>

          {/* Org Routes */}
          <Route element={<OrgLayout />}>
            <Route path="/organisation/dashboard" element={<OrgDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
