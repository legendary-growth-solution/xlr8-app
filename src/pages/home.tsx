import { Helmet } from 'react-helmet-async';
import { Box, Grid, Typography, Card, CardContent } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { CONFIG } from 'src/config-global';
import { useNavigate } from 'react-router-dom';
import { Iconify } from 'src/components/iconify';

const DASHBOARD_CARDS = [
  {
    title: 'Active Sessions',
    description: 'Manage ongoing racing sessions and track times',
    icon: 'carbon:mobile-session',
    path: '/sessions',
    color: 'primary',
  },
  {
    title: 'Session History',
    description: 'View past racing sessions and analytics',
    icon: 'carbon:data-vis-4',
    path: '/sessions/history',
    color: 'success',
  },
  {
    title: 'User Management',
    description: 'Manage racers, staff, and user permissions',
    icon: 'solar:users-group-rounded-bold',
    path: '/users',
    color: 'info',
  },
  {
    title: 'Cart Management',
    description: 'Manage carts, fuel levels, and refueling',
    icon: 'mdi:go-kart',
    path: '/carts',
    color: 'warning',
  },
] as const;

export default function Page() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>{`Dashboard - ${CONFIG.appName}`}</title>
        <meta
          name="description"
          content="Go Kart Racing Management Dashboard - Manage sessions, users, and live racing events"
        />
      </Helmet>

      <Box sx={{ py: 5, px: 3 }}>
        <Typography variant="h4" sx={{ mb: 5 }}>
          Go Kart Racing Dashboard
        </Typography>

        <Grid container spacing={3}>
          {DASHBOARD_CARDS.map((card) => (
            <Grid key={card.path} item xs={12} md={6}>
              <Card
                sx={{
                  cursor: 'pointer',
                  boxShadow: (theme) => theme.customShadows.z8,
                  '&:hover': {
                    bgcolor: 'background.neutral',
                  },
                }}
                onClick={() => navigate(card.path)}
              >
                <CardContent
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    pb: '16px !important',
                  }}
                >
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      display: 'flex',
                      borderRadius: 1.5,
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: (theme) => alpha(theme.palette[card.color].main, 0.08),
                    }}
                  >
                    <Iconify icon={card.icon} width={36} />
                  </Box>

                  <Box>
                    <Typography variant="h5" gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {card.description}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
}
