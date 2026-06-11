import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';

/**
 * AdminRoute — requires authentication AND admin role.
 * Non-admin users are redirected to /dashboard.
 */
export default function AdminRoute({ children }) {
  const { isStaff } = useAuth();

  return (
    <ProtectedRoute>
      {!isStaff ? <Navigate to="/dashboard" replace /> : (children || <Outlet />)}
    </ProtectedRoute>
  );
}
