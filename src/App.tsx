import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing";
import SignIn from "./pages/SignIn";
import ForgotPassword from "./pages/ForgotPassword";
import AccountPending from "./pages/AccountPending";
import Dashboard from "./pages/Dashboard";
import DashboardMarkets from "./pages/DashboardMarkets";
import DashboardOrders from "./pages/DashboardOrders";
import DashboardPositions from "./pages/DashboardPositions";
import DashboardRisk from "./pages/DashboardRisk";
import DashboardPerformance from "./pages/DashboardPerformance";
import DashboardChallenge from "./pages/DashboardChallenge";
import Markets from "./pages/Markets";
import Platform from "./pages/Platform";
import RegisterStep1 from "./pages/RegisterStep1";
import RegisterStep2 from "./pages/RegisterStep2";
import RegisterStep3 from "./pages/RegisterStep3";
import RegisterStep4 from "./pages/RegisterStep4";
import RegisterSuccess from "./pages/RegisterSuccess";
import RegisterReview from "./pages/RegisterReview";
import NotFound from "./pages/NotFound";
import DemoStateSwitcher from "./components/DemoStateSwitcher";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/account-pending" element={<AccountPending />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/markets" element={<DashboardMarkets />} />
          <Route path="/dashboard/orders" element={<DashboardOrders />} />
          <Route path="/dashboard/positions" element={<DashboardPositions />} />
          <Route path="/dashboard/risk" element={<DashboardRisk />} />
          <Route path="/dashboard/performance" element={<DashboardPerformance />} />
          <Route path="/dashboard/challenge" element={<DashboardChallenge />} />
          <Route path="/markets" element={<Markets />} />
          <Route path="/platform" element={<Platform />} />
          <Route path="/register" element={<RegisterStep1 />} />
          <Route path="/register/step-2" element={<RegisterStep2 />} />
          <Route path="/register/step-3" element={<RegisterStep3 />} />
          <Route path="/register/step-4" element={<RegisterStep4 />} />
          <Route path="/register/success" element={<RegisterSuccess />} />
          <Route path="/register/review" element={<RegisterReview />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <DemoStateSwitcher />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
