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
        title: 'Active Session',
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
      // {
      //   title: 'Lap Logs',
      //   path: '/carts/lap-logs',
      // },
      {
        title: 'Maintenance Logs',
        path: '/carts/maintenance-logs',
      },
    ],
  },
  {
    title: 'Leaderboard',
    path: '/leaderboard',
    icon: <Iconify icon="mdi:trophy-outline" />,
  },
  {
    title: 'Plans',
    path: '/plans',
    icon: <Iconify icon="mdi:clock-time-four-outline" />,
  },
  {
    title: 'Discount Codes',
    path: '/discounts',
    icon: <Iconify icon="mdi:ticket-percent-outline" />,
  },
  {
    title: 'Time Slots',
    path: '/timeslots',
    icon: <Iconify icon="solar:clock-circle-bold" />,
  },
  {
    title: 'Billings',
    path: '/billings',
    icon: <Iconify icon="solar:bill-list-bold-duotone" />,
  },
  {
    title: 'Logout',
    path: '/logout',
    icon: <Iconify icon="solar:logout-2-bold-duotone" />,
  },
];

export default navConfig;
