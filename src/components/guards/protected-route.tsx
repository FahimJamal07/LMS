import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { roleRoutes } from '@/utils/roles';
import type { Role } from '@/types/auth';

type ProtectedRouteProps = {
  children: ReactNode;
  role?: Role;
};

export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);

  if (!hydrated) {
    return <div className="min-h-screen bg-slate-950" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={roleRoutes[user.role]} replace />;
  }

  return <>{children}</>;
}
