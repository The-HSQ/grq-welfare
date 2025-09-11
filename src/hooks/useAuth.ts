import { useAppSelector } from '../store/hooks';
import { isAuthenticated } from '../lib/cookies';

export const useAuth = () => {
  const { user, accessToken } = useAppSelector((state) => state.auth);

  const isLoggedIn = isAuthenticated() && user && accessToken;

  const hasRole = (requiredRole: string) => {
    return isLoggedIn && user?.role === requiredRole;
  };

  const hasAnyRole = (roles: string[]) => {
    return isLoggedIn && user && roles.includes(user.role);
  };

  const isAdmin = () => hasRole('admin');
  const isMedicalAdmin = () => hasRole('medical_admin');
  const isAccountantMedical = () => hasRole('accountant_medical');
  const isOfficeAdmin = () => hasRole('office_admin');
  const isDriver = () => hasRole('vehicle_user');
  const isLabAccountant = () => hasRole('lab_accountant');

  return {
    user,
    isLoggedIn,
    hasRole,
    hasAnyRole,
    isAdmin,
    isMedicalAdmin,
    isAccountantMedical,
    isOfficeAdmin,
    isDriver,
    isLabAccountant,
  };
};
