import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Forbidden from '../pages/error/Forbidden';
import ErrorBoundary from './ui/ErrorBoundary';

interface AdminRouteProps {
  children: ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
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
