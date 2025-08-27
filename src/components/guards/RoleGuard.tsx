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
    if (isAdmin) return <Navigate to="/admin" replace />;
    if (user?.role === 'teacher') return <Navigate to="/teacher" replace />;
    if (user?.role === 'learner') return <Navigate to="/dashboard" replace />;

  }

  return <>{children}</>;
};

export default RoleGuard;