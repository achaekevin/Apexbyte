import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore, ADMIN_SESSION_TIMEOUT_MS } from '../store/authStore';
import Forbidden from '../pages/error/Forbidden';
import ErrorBoundary from './ui/ErrorBoundary';

interface AdminRouteProps {
  children: ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isAuthenticated, user, loginTimestamp, logout } = useAuthStore();
  const location = useLocation();

  // 1. Not authenticated: redirect to dedicated admin login and preserve destination
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  // 2. Check for administrative session expiration (e.g. inactive or exceeded window)
  const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
  if (isAdmin && loginTimestamp) {
    const isExpired = Date.now() - loginTimestamp > ADMIN_SESSION_TIMEOUT_MS;
    if (isExpired) {
      logout();
      return (
        <Navigate
          to="/admin/login"
          replace
          state={{
            from: location.pathname + location.search,
            sessionExpired: true,
          }}
        />
      );
    }
  }

  // 3. User is logged in but does not have administrator privileges
  if (!isAdmin) {
    return <Forbidden />;
  }

  return (
    <ErrorBoundary
      key={location.pathname}
      resetKeys={[location.pathname]}
      variant="section"
      title="Admin Control Center Error"
    >
      {children}
    </ErrorBoundary>
  );
};

export default AdminRoute;
