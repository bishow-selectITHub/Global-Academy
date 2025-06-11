import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser, UserRole } from '../../contexts/UserContext';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
  const { user, isAdmin } = useUser();

  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;