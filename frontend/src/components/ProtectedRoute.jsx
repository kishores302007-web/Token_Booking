import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/Authcontext';

/**
 * Protected Route component that restricts access based on authentication and role
 * @param {Object} props - Component props
 * @param {React.Component} props.element - The component to render if authorized
 * @param {Array<string>} props.requiredRoles - Array of roles that are allowed (optional)
 * @returns {React.Component} The protected element or redirect to login/unauthorized
 */
const ProtectedRoute = ({ element, requiredRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();

  // While loading auth state, show nothing or a loading component
  if (loading) {
    return <div>Loading...</div>;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If specific roles are required, check if user has one of them
  if (requiredRoles && requiredRoles.length > 0) {
    if (!requiredRoles.includes(role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // User is authenticated and has required role (if applicable)
  return element;
};

export default ProtectedRoute;
