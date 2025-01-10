import { lazy, Suspense } from 'react';
import { Navigate, Outlet, useRoutes } from 'react-router-dom';
import { useAuth } from 'src/hooks/use-auth';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import AuthGuard from 'src/guards/AuthGuard';
import GuestGuard from 'src/guards/GuestGuard';
import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';
import AuthPage from 'src/pages/auth';
import CartLapLogsPage from 'src/pages/cart-lap-logs';
import DiscountManagementPage from 'src/pages/discount-management';
import PasswordHashPage from 'src/pages/password-hash';
import RegisterUserPage from 'src/pages/register-user';
import { varAlpha } from 'src/theme/styles';

// ----------------------------------------------------------------------

export const HomePage = lazy(() => import('src/pages/home'));
export const BlogPage = lazy(() => import('src/pages/blog'));
export const UserPage = lazy(() => import('src/pages/user'));
export const SignInPage = lazy(() => import('src/pages/sign-in'));
export const ProductsPage = lazy(() => import('src/pages/products'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));
export const UserManagement = lazy(() => import('src/pages/user-management'));
export const UserCreate = lazy(() => import('src/pages/user-create'));
// export const SessionManagementPage = lazy(() => import('src/pages/session-management'));
export const SessionUserLaps = lazy(() => import('src/pages/session-user-laps'));
export const SessionLaps = lazy(() => import('src/pages/session-laps'));
export const SessionHistoryPage = lazy(() => import('src/pages/session-history'));
export const SessionDetailPage = lazy(() => import('src/pages/session-detail'));
export const SessionActivePage = lazy(() => import('src/pages/session-active'));
export const CartManagementPage = lazy(() => import('src/pages/cart-management'));
// export const CartFuelLogsPage = lazy(() => import('src/pages/cart-fuel-logs'));
export const CartFuelLogsPage = lazy(() => import('src/pages/fuel-logs'));
export const TimeSlots = lazy(() => import('src/pages/timeslots'));
export const TimeManagementPage = lazy(() => import('src/pages/time-management'));
export const LiveLeaderboard = lazy(() => import('src/pages/live-leaderboard'));
// export const CartMaintenanceLogsPage = lazy(() => import('src/pages/cart-maintenance-logs'));
export const CartMaintenanceLogsPage = lazy(() => import('src/pages/maintenance-logs'));
export const BillingsPage = lazy(() => import('src/pages/billings'));
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

        { path: 'active-session', element: <SessionActivePage /> },
        // { path: 'sessions', element: <SessionManagementPage /> },
        { path: 'sessions/:id/:user/:groupId', element: <SessionUserLaps /> },
        { path: 'sessions/:id/lap-data', element: <SessionLaps /> },
        { path: 'sessions/history', element: <SessionHistoryPage /> },
        { path: 'sessions/:id', element: <SessionDetailPage /> },
        { path: 'carts', element: <CartManagementPage /> },
        { path: 'carts/fuel-logs', element: <CartFuelLogsPage /> },
        { path: 'timeslots', element: <TimeSlots /> },
        { path: 'carts/lap-logs', element: <CartLapLogsPage /> },
        { path: 'carts/maintenance-logs', element: <CartMaintenanceLogsPage /> },
        { path: 'password-hash', element: <PasswordHashPage /> },
        { path: 'plans', element: <TimeManagementPage /> },
        { path: 'discounts', element: <DiscountManagementPage /> },
        { path: 'billings', element: <BillingsPage /> },
        { path: '/logout', element: <LogoutRoute /> }
      ],
    },

    // public routes
    { path: 'register-user', element: <RegisterUserPage /> },

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
