import { Iconify } from 'src/components/iconify';

const navConfig = [
  {
    title: 'Dashboard',
    path: '/',
    icon: <Iconify icon="solar:home-2-bold-duotone" />,
  },
  {
    title: 'User Management',
    path: '/users',
    icon: <Iconify icon="solar:users-group-rounded-bold-duotone" />,
  },
  {
    title: 'Session Management',
    path: '/sessions',
    icon: <Iconify icon="solar:clock-circle-bold-duotone" />,
    children: [
      {
        title: 'Active Sessions',
        path: '/sessions',
      },
      {
        title: 'Session History',
        path: '/sessions/history',
      },
    ],
  },
  {
    title: 'Cart Management',
    path: '/carts',
    icon: <Iconify icon="solar:cart-3-bold-duotone" />,
    children: [
      {
        title: 'All Carts',
        path: '/carts',
      },
      {
        title: 'Fuel Logs',
        path: '/carts/fuel-logs',
      },
      {
        title: 'Lap Logs',
        path: '/carts/lap-logs',
      },
    ],
  },
];

export default navConfig;
