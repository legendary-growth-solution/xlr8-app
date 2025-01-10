import { lazy } from 'react';
import SessionDetailPage from 'src/pages/session-detail';
import SessionHistoryPage from 'src/pages/session-history';
import UserCreatePage from 'src/pages/user-create';
import UserManagementPage from 'src/pages/user-management';

export const sessionRoutes = [
  {
    path: 'sessions',
    children: [
      // { element: <SessionManagementPage />, index: true },
      { path: 'history', element: <SessionHistoryPage /> },
      { path: ':id', element: <SessionDetailPage /> },
    ],
  },
];

export const userRoutes = [
  {
    path: 'users',
    children: [
      { element: <UserManagementPage />, index: true },
      { path: 'create', element: <UserCreatePage /> },
    ],
  },
];