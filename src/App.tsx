import { AnimatePresence } from 'framer-motion';
import { lazy, Suspense } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { useHydratedSession } from '@/hooks/useHydratedSession';
import { ToastStack } from '@/components/shared/toast-stack';
import { AuthRoute } from '@/components/guards/auth-route';
import { ProtectedRoute } from '@/components/guards/protected-route';
import { NotFoundPage } from '@/pages/not-found-page';
import { useAuthStore } from '@/store/authStore';
import { roleRoutes } from '@/utils/roles';
import { PageTransition } from '@/components/layout/page-transition';

const LoginPage = lazy(() => import('@/pages/auth/login-page').then((module) => ({ default: module.LoginPage })));
const SignupPage = lazy(() => import('@/pages/auth/signup-page').then((module) => ({ default: module.SignupPage })));
const StudentDashboardPage = lazy(() => import('@/pages/dashboard/student-dashboard-page').then((module) => ({ default: module.StudentDashboardPage })));
const FacultyDashboardPage = lazy(() => import('@/pages/dashboard/faculty-dashboard-page').then((module) => ({ default: module.FacultyDashboardPage })));
const AdminDashboardPage = lazy(() => import('@/pages/dashboard/admin-dashboard-page').then((module) => ({ default: module.AdminDashboardPage })));

export default function App() {
  useHydratedSession();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  return (
    <>
      <Suspense fallback={<RouteFallback />}>
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Navigate to={user ? roleRoutes[user.role] : '/login'} replace />} />
            <Route
              path="/login"
              element={
                <AuthRoute>
                  <PageTransition>
                    <LoginPage />
                  </PageTransition>
                </AuthRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <AuthRoute>
                  <PageTransition>
                    <SignupPage />
                  </PageTransition>
                </AuthRoute>
              }
            />
            <Route
              path="/dashboard/student"
              element={
                <ProtectedRoute role="student">
                  <PageTransition>
                    <StudentDashboardPage />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/faculty"
              element={
                <ProtectedRoute role="faculty">
                  <PageTransition>
                    <FacultyDashboardPage />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute role="admin">
                  <PageTransition>
                    <AdminDashboardPage />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
      <ToastStack />
    </>
  );
}

function RouteFallback() {
  return <div className="min-h-screen bg-slate-950" />;
}
