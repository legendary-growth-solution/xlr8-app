import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { varAlpha } from 'src/theme/styles';
import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';

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
export const CartMaintenancePage = lazy(() => import('src/pages/cart-maintenance'));
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

export function Router() {
  return useRoutes([
    {
      element: (
        <DashboardLayout>
          <Suspense fallback={renderFallback}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
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
        { path: 'sessions/:id', element: <SessionDetailPage /> },
        { path: 'carts', element: <CartManagementPage /> },
        { path: 'carts/maintenance', element: <CartMaintenancePage /> },
        { path: 'carts/fuel-logs', element: <CartFuelLogsPage /> },
      ],
    },
    {
      path: 'sign-in',
      element: (
        <AuthLayout>
          <SignInPage />
        </AuthLayout>
      ),
    },
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
