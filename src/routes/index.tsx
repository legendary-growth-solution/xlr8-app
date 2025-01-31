import { Navigate, useRoutes } from 'react-router-dom';
import AuthPage from 'src/pages/auth';
import GuestGuard from 'src/guards/GuestGuard';
import AuthGuard from '../guards/AuthGuard';
import { HomePage, SessionManagementPage } from './sections';

export default function Router() {
  return useRoutes([
    {
      path: '/auth',
      element: (
        <GuestGuard>
          <AuthPage />
        </GuestGuard>
      ),
    },
    {
      path: '/',
      element: (
        <AuthGuard>
          <HomePage />
        </AuthGuard>
      ),
    },
    {
      path: '/sessions',
      element: (
        <AuthGuard>
          <SessionManagementPage />
        </AuthGuard>
      ),
    },
    {
      path: '*',
      element: <Navigate to="/auth" replace />,
    },
  ]);
} 