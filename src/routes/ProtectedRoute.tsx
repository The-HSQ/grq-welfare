import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { isAuthenticated } from '../lib/cookies';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { user, accessToken } = useAppSelector((state) => state.auth);

  // Function to determine the appropriate dashboard route based on user role
  const getDashboardRoute = (userRole: string) => {
    switch (userRole) {
      case 'admin':
        return '/'; // Main Admin Dashboard
      case 'medical_admin':
        return '/dialysis-center'; // Dialysis Center Dashboard
      case 'accountant_medical':
        return '/dialysis-center'; // Dialysis Center Dashboard (accountant view)
      case 'office_admin':
        return '/office-management'; // Office Management Dashboard
      case 'lab_accountant':
        return '/office-management/inventory/tracking-items'; // Lab Accountant Dashboard
      case 'vehicle_user':
        return '/office-management/vehicles-usage'; // Vehicles Usage
      default:
        return '/'; // Default to main dashboard
    }
  };

  // Function to check if user has required role(s)
  const hasRequiredRole = (userRole: string, requiredRoles: string | string[]) => {
    if (!requiredRoles) return true;
    
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(userRole);
    }
    
    return userRole === requiredRoles;
  };

  useEffect(() => {
    // Check if user is authenticated using both Redux state and cookies
    const authenticated = isAuthenticated() && user && accessToken;
    
    if (!authenticated) {
      navigate('/login', { replace: true });
      return;
    }

    // Check if user has the required role(s)
    if (requiredRole && !hasRequiredRole(user.role, requiredRole)) {
      // Redirect to user's appropriate dashboard instead of main dashboard
      const userDashboardRoute = getDashboardRoute(user.role);
      console.log(`User role ${user.role} doesn't have access to ${requiredRole}. Redirecting to ${userDashboardRoute}`);
      navigate(userDashboardRoute, { replace: true });
      return;
    }
  }, [user, accessToken, navigate, requiredRole]);

  // Don't render children until we've checked authentication and role
  if (!isAuthenticated() || !user || !accessToken) {
    return null;
  }

  // Don't render if user doesn't have required role(s)
  if (requiredRole && !hasRequiredRole(user.role, requiredRole)) {
    return null;
  }

  return <>{children}</>;
}
