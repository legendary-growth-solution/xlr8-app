import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';
import { useAuth } from 'src/hooks/use-auth';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { varAlpha } from 'src/theme/styles';
import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';
import AuthGuard from 'src/guards/AuthGuard';
import GuestGuard from 'src/guards/GuestGuard';
import CartLapLogsPage from 'src/pages/cart-lap-logs';
import PasswordHashPage from 'src/pages/password-hash';
import AuthPage from 'src/pages/auth';
import { DataProvider } from 'src/contexts/DataContext';
import CartMaintenanceLogsPage from 'src/pages/cart-maintenance-logs';
import LiveLeaderboard from 'src/pages/live-leaderboard';

// ----------------------------------------------------------------------

export const HomePage = lazy(() => import('src/pages/home'));
export const BlogPage = lazy(() => import('src/pages/blog'));
export const UserPage = lazy(() => import('src/pages/user'));
export const SignInPage = lazy(() => import('src/pages/sign-in'));
export const ProductsPage = lazy(() => import('src/pages/products'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));
export const UserManagement = lazy(() => import('src/pages/user-management'));
export const UserCreate = lazy(() => import('src/pages/user-create'));
export const SessionManagementPage = lazy(() => import('src/pages/session-management'));
export const SessionCreatePage = lazy(() => import('src/pages/session-create'));
export const SessionHistoryPage = lazy(() => import('src/pages/session-history'));
export const SessionDetailPage = lazy(() => import('src/pages/session-detail'));
export const CartManagementPage = lazy(() => import('src/pages/cart-management'));
export const CartFuelLogsPage = lazy(() => import('src/pages/cart-fuel-logs'));

// ----------------------------------------------------------------------

const renderFallback = (
  <Box display="flex" alignItems="center" justifyContent="center" flex="1 1 auto">
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

const LogoutRoute = () => {
  const { logout } = useAuth();
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(error);
    }
  };
  handleLogout();
  return <Navigate to="/auth" replace />;
};

export function Router() {
  return useRoutes([
    {
      path: 'auth',
      element: (
        <GuestGuard>
          <AuthLayout>
            <AuthPage />
          </AuthLayout>
        </GuestGuard>
      ),
    },

    // Dashboard Routes
    {
      element: (
        <AuthGuard>
          <DashboardLayout>
            <Suspense fallback={renderFallback}>
              <Outlet />
            </Suspense>
          </DashboardLayout>
        </AuthGuard>
      ),
      children: [
        { element: <HomePage />, index: true },
        { path: 'user', element: <UserPage /> },
        { path: 'products', element: <ProductsPage /> },
        { path: 'blog', element: <BlogPage /> },
        
        { path: 'users', element: <UserManagement /> },
        { path: 'users/create', element: <UserCreate /> },
        
        { path: 'sessions', element: <SessionManagementPage /> },
        { path: 'sessions/create', element: <SessionCreatePage /> },
        { path: 'sessions/history', element: <SessionHistoryPage /> },
        { path: 'sessions/:id', element: <DataProvider><SessionDetailPage /></DataProvider> },
        { path: 'sessions/:id/live-leaderboard', element: <DataProvider><LiveLeaderboard /></DataProvider> },
        { path: 'carts', element: <CartManagementPage /> },
        { path: 'carts/fuel-logs', element: <CartFuelLogsPage /> },
        { path: 'carts/lap-logs', element: <CartLapLogsPage /> },
        { path: 'carts/maintenance-logs', element: <CartMaintenanceLogsPage /> },
        { path: 'password-hash', element: <PasswordHashPage /> },
      ],
    },

    // Error Routes
    {
      path: '404',
      element: <Page404 />,
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);
}
