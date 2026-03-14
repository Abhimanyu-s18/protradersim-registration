import { Component, lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import DemoStateSwitcher from './components/DemoStateSwitcher';
import { ProtectedRoute } from './components/ProtectedRoute';

// Lazy load page components for better bundle splitting
const Landing = lazy(() => import('./pages/Landing'));
const SignIn = lazy(() => import('./pages/SignIn'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const AccountPending = lazy(() => import('./pages/AccountPending'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const DashboardMarkets = lazy(() => import('./pages/DashboardMarkets'));
const DashboardOrders = lazy(() => import('./pages/DashboardOrders'));
const DashboardPositions = lazy(() => import('./pages/DashboardPositions'));
const DashboardRisk = lazy(() => import('./pages/DashboardRisk'));
const DashboardPerformance = lazy(() => import('./pages/DashboardPerformance'));
const DashboardChallenge = lazy(() => import('./pages/DashboardChallenge'));
const DashboardProfile = lazy(() => import('./pages/DashboardProfile'));
const DashboardVerification = lazy(
  () => import('./pages/DashboardVerification')
);
const DashboardCompliance = lazy(() => import('./pages/DashboardCompliance'));
const DashboardSettings = lazy(() => import('./pages/DashboardSettings'));
const Markets = lazy(() => import('./pages/Markets'));
const Platform = lazy(() => import('./pages/Platform'));
const RegisterStep1 = lazy(() => import('./pages/RegisterStep1'));
const RegisterStep2 = lazy(() => import('./pages/RegisterStep2'));
const RegisterStep3 = lazy(() => import('./pages/RegisterStep3'));
const RegisterStep4 = lazy(() => import('./pages/RegisterStep4'));
const RegisterSuccess = lazy(() => import('./pages/RegisterSuccess'));
const RegisterReview = lazy(() => import('./pages/RegisterReview'));
const NotFound = lazy(() => import('./pages/NotFound'));

const PageLoader = () => (
  <div
    className="flex items-center justify-center min-h-screen"
    role="status"
    aria-live="polite"
  >
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    <span className="sr-only">Loading...</span>
  </div>
);

// ErrorBoundary class component to catch lazy-loading failures
interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex flex-col items-center justify-center min-h-screen"
          role="alert"
        >
          <div className="text-center space-y-4 p-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Something went wrong
            </h2>
            <p className="text-gray-600">
              Failed to load the requested page. Please try again.
            </p>
            <button
              onClick={this.handleReload}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
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
          </Suspense>
        </ErrorBoundary>
        <DemoStateSwitcher />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
