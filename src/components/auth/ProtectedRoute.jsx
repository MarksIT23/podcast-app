import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * ProtectedRoute — redirects to /auth if user is not authenticated.
 * Use as a wrapper or with nested routes via <Outlet />.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-black-deep)]" role="status" aria-label="Checking authentication">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--color-accent-purple)] border-t-transparent animate-spin" aria-hidden="true" />
          <p className="text-small text-[var(--text-tertiary)]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return children || <Outlet />;
}
