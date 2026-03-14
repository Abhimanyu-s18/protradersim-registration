import { Navigate, useLocation } from 'react-router-dom';
import { getAccountState, AccountState } from '@/lib/auth-store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredState?: AccountState | AccountState[];
  redirectTo?: string;
  fallback?: React.ReactNode;
}

/**
 * ProtectedRoute component for client-side authentication and authorization.
 *
 * This provides the client-side equivalent of server-side authentication middleware.
 * Routes protected by this component will redirect unauthenticated/unauthorized users
 * to the sign-in page or an appropriate fallback route.
 *
 * @param children - The component(s) to render if authenticated
 * @param requiredState - Required account state(s) to access this route
 * @param redirectTo - Where to redirect if not authenticated (default: /sign-in)
 * @param fallback - Optional fallback UI to show for unregistered users
 */
export function ProtectedRoute({
  children,
  requiredState = 'active',
  redirectTo = '/sign-in',
  fallback,
}: ProtectedRouteProps) {
  const location = useLocation();
  const currentState = getAccountState();

  // Normalize requiredState to array for consistent checking
  const requiredStates = Array.isArray(requiredState)
    ? requiredState
    : [requiredState];

  // Check if current state matches any of the required states
  const isAuthorized = requiredStates.includes(currentState);

  // Show fallback UI for unregistered users
  if (fallback && !isAuthorized && currentState === 'unregistered') {
    return <>{fallback}</>;
  }

  // Redirect if not authorized
  if (!isAuthorized) {
    // Redirect to sign-in with return URL for post-login navigation
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location.pathname, requiredState: requiredStates }}
        replace
      />
    );
  }

  // Render the protected content
  return <>{children}</>;
}

export default ProtectedRoute;
