import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import ForgotPassword from './pages/ForgotPassword';
import AccountPending from './pages/AccountPending';
import Dashboard from './pages/Dashboard';
import DashboardMarkets from './pages/DashboardMarkets';
import DashboardOrders from './pages/DashboardOrders';
import DashboardPositions from './pages/DashboardPositions';
import DashboardRisk from './pages/DashboardRisk';
import DashboardPerformance from './pages/DashboardPerformance';
import DashboardChallenge from './pages/DashboardChallenge';
import DashboardProfile from './pages/DashboardProfile';
import DashboardVerification from './pages/DashboardVerification';
import DashboardCompliance from './pages/DashboardCompliance';
import DashboardSettings from './pages/DashboardSettings';
import Markets from './pages/Markets';
import Platform from './pages/Platform';
import RegisterStep1 from './pages/RegisterStep1';
import RegisterStep2 from './pages/RegisterStep2';
import RegisterStep3 from './pages/RegisterStep3';
import RegisterStep4 from './pages/RegisterStep4';
import RegisterSuccess from './pages/RegisterSuccess';
import RegisterReview from './pages/RegisterReview';
import NotFound from './pages/NotFound';
import DemoStateSwitcher from './components/DemoStateSwitcher';
import { ProtectedRoute } from './components/ProtectedRoute';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/markets" element={<Markets />} />
          <Route path="/platform" element={<Platform />} />

          {/* Registration flow - public for new signups */}
          <Route path="/register" element={<RegisterStep1 />} />
          <Route path="/register/step-2" element={<RegisterStep2 />} />
          <Route path="/register/step-3" element={<RegisterStep3 />} />
          <Route path="/register/step-4" element={<RegisterStep4 />} />
          <Route path="/register/success" element={<RegisterSuccess />} />
          <Route path="/register/review" element={<RegisterReview />} />

          {/* Protected: Account pending - requires pending verification or review */}
          <Route
            path="/account-pending"
            element={
              <ProtectedRoute
                requiredState={['pending_verification', 'pending_review']}
                redirectTo="/sign-in"
              >
                <AccountPending />
              </ProtectedRoute>
            }
          />

          {/* Protected: Dashboard routes - requires active account */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredState="active" redirectTo="/sign-in">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/markets"
            element={
              <ProtectedRoute requiredState="active" redirectTo="/sign-in">
                <DashboardMarkets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/orders"
            element={
              <ProtectedRoute requiredState="active" redirectTo="/sign-in">
                <DashboardOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/positions"
            element={
              <ProtectedRoute requiredState="active" redirectTo="/sign-in">
                <DashboardPositions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/risk"
            element={
              <ProtectedRoute requiredState="active" redirectTo="/sign-in">
                <DashboardRisk />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/performance"
            element={
              <ProtectedRoute requiredState="active" redirectTo="/sign-in">
                <DashboardPerformance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/challenge"
            element={
              <ProtectedRoute requiredState="active" redirectTo="/sign-in">
                <DashboardChallenge />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/profile"
            element={
              <ProtectedRoute requiredState="active" redirectTo="/sign-in">
                <DashboardProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/verification"
            element={
              <ProtectedRoute requiredState="active" redirectTo="/sign-in">
                <DashboardVerification />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/compliance"
            element={
              <ProtectedRoute requiredState="active" redirectTo="/sign-in">
                <DashboardCompliance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/settings"
            element={
              <ProtectedRoute requiredState="active" redirectTo="/sign-in">
                <DashboardSettings />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
        <DemoStateSwitcher />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
